// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';
import SettingsModal from '../../components/SettingsModal';
import ReviewModal from '../../components/ReviewModal';
import Chatbot from '../../components/Chatbot';

const allDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const typeColors = {
  Lecture: { bg: '#e8f5e8', border: '#c8e6c9', text: '#1a431e', sub: '#2d6a2d' },
  Section: { bg: '#e8f0ff', border: '#b3ccff', text: '#1a3f7a', sub: '#4a6abf' },
};

const GLOBAL_MIN_H = 8;
const GLOBAL_MAX_H = 20;

const buildHourlySlots = () => {
  const slots = [];
  for (let h = GLOBAL_MIN_H; h < GLOBAL_MAX_H; h++) {
    const s = h.toString().padStart(2, '0') + ':00';
    const e = (h + 1).toString().padStart(2, '0') + ':00';
    slots.push({ start: s, end: e, label: `${h}-${h + 1}` });
  }
  return slots;
};
const HOURLY_SLOTS = buildHourlySlots(); 

const renderScheduleGrid = (scheduleArray) => {
  if (!scheduleArray || scheduleArray.length === 0) return null;

  const DAY_W = 38;
  const HOUR_W = 64; 
  const ROW_H = 64;
  const HEADER_H = 36;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'column' }}>

        <View style={{ flexDirection: 'row', backgroundColor: '#f0f7f0', borderBottomWidth: 2, borderBottomColor: '#e0e0e0', height: HEADER_H }}>
          <View style={{ width: DAY_W, height: HEADER_H, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e0e0e0' }}>
            <Text style={grid.headerText}>Day</Text>
          </View>

          {HOURLY_SLOTS.map((slot, idx) => (
            <View key={idx} style={{ width: HOUR_W, height: HEADER_H, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#f0f0f0' }}>
              <Text style={grid.headerText}>{slot.label}</Text>
            </View>
          ))}
        </View>

        {allDays.map((day, rowIdx) => {
          const dayItems = scheduleArray.filter(s =>
            s.day && s.day.toLowerCase() === day.toLowerCase()
          );

          
          const cells = [];
          let skipCount = 0;

          for (let sIdx = 0; sIdx < HOURLY_SLOTS.length; sIdx++) {
            if (skipCount > 0) {
              skipCount--;
              continue; 
            }

            const slot = HOURLY_SLOTS[sIdx];

            const item = dayItems.find(s => {
              const t = (s.startTime || '').trim();
              return t === slot.start || t.startsWith(slot.start.split(':')[0] + ':');
            });

            if (item) {
              const startH = parseInt((item.startTime || '0').split(':')[0]);
              const endH = parseInt((item.endTime || '0').split(':')[0]);
              const span = Math.max(1, endH - startH);
              skipCount = span - 1;

              const colors = typeColors[item.type] || typeColors.Lecture;

              cells.push(
                <View key={sIdx} style={{
                  width: HOUR_W * span,
                  height: ROW_H,
                  backgroundColor: colors.bg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 6,
                  padding: 4,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: 1,
                }}>
                  <Text style={[grid.courseCode, { color: colors.text }]} numberOfLines={1}>
                    {item.courseCode}
                  </Text>
                  <Text style={[grid.courseType, { color: colors.sub }]} numberOfLines={1}>
                    {item.type}
                  </Text>
                  <Text style={grid.courseSection} numberOfLines={1}>
                    {item.sectionName || ''}
                  </Text>
                  <Text style={grid.courseRoom} numberOfLines={1}>
                    {item.room || 'TBA'}
                  </Text>
                  {item.instructor ? (
                    <Text style={grid.courseRoom} numberOfLines={1}>
                      · {item.instructor.split(' ').pop()}
                    </Text>
                  ) : null}
                </View>
              );
            } else {
              cells.push(
                <View key={sIdx} style={{
                  width: HOUR_W,
                  height: ROW_H,
                  borderRightWidth: 1,
                  borderRightColor: '#f5f5f5',
                }} />
              );
            }
          }

          return (
            <View
              key={day}
              style={{
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
                backgroundColor: rowIdx % 2 === 0 ? '#ffffff' : '#fafcfa',
                height: ROW_H,
                alignItems: 'center',
              }}
            >
              <View style={{ width: DAY_W, height: ROW_H, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#e0e0e0' }}>
                <Text style={grid.dayText}>{day.substring(0, 3)}</Text>
              </View>

              {cells}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const renderScheduleList = (scheduleArray) => {
  if (!scheduleArray || scheduleArray.length === 0) return null;
  return scheduleArray.map((item, idx) => {
    const colors = typeColors[item.type] || typeColors.Lecture;
    return (
      <View key={idx} style={[styles.scheduleItem, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.scheduleCode, { color: colors.text }]}>{item.courseCode}: {item.courseName}</Text>
          <Text style={[styles.scheduleSub, { color: colors.sub }]}>{item.sectionName} ({item.type})</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.scheduleDay}>{item.day}</Text>
          <Text style={styles.scheduleTime}>{item.startTime} - {item.endTime}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
             <Text style={styles.scheduleRoom}>Room: {item.room || 'TBA'}</Text>
             <TouchableOpacity 
               onPress={() => {
                 setSelectedCourseForReview({
                   courseCode: item.courseCode,
                   courseName: item.courseName,
                   instructor: item.instructor || ""
                 });
                 setReviewModalVisible(true);
               }}
               style={{ backgroundColor: '#fff8e1', padding: 4, borderRadius: 6, borderWidth: 1, borderColor: '#f0e8c0' }}
             >
               <Ionicons name="star" size={14} color="#f4c542" />
             </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  });
};

export default function StudentDashboard() {
  const [studentName, setStudentName] = useState('');
  const [realStudentId, setRealStudentId] = useState('N/A');
  const [activePage, setActivePage] = useState('schedule');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [mySchedule, setMySchedule] = useState(null);
  const [options, setOptions] = useState([]);
  const [currentOptionIdx, setCurrentOptionIdx] = useState(0);
  const [excludedDays, setExcludedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [userData, setUserData] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedCourseForReview, setSelectedCourseForReview] = useState({ courseCode: '', courseName: '', instructor: '' });
  const router = useRouter();

  useFocusEffect(useCallback(() => { loadAndFetch(); }, []));

  const loadAndFetch = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        setUserData(user);
        setStudentName(user.name || '');
        const sid = user._id || user.id;
        try {
          const r = await fetch(`${API_URL}/api/students/${sid}`);
          const d = await r.json();
          if (d && d.studentId) setRealStudentId(d.studentId);
        } catch (_) {}
      }
    } catch (e) {}
    await fetchData();
  };

  const parseGeneratorResponse = (data) => {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      setOptions(Array.isArray(data.schedules) ? data.schedules : []);
      if (data.blocked) {
        setIsBlocked(true);
        setInfoMessage(data.message || 'Cannot build a complete schedule. Please contact Student Affairs.');
      } else if (!data.schedules || data.schedules.length === 0) {
        setInfoMessage(data.message || 'No valid schedule combinations were found.');
      }
    } else if (Array.isArray(data)) {
      setOptions(data.map(sch => ({ schedule: sch, registrationsLeft: '?' })));
      if (data.length === 0) setInfoMessage('No valid schedule combinations were found.');
    } else {
      setOptions([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setInfoMessage('');
    setIsBlocked(false);
    try {
      const token = await AsyncStorage.getItem('token');
      const statusRes = await fetch(`${API_URL}/api/registration/status`);
      const statusData = await statusRes.json();
      setIsRegistrationOpen(statusData.isRegistrationOpen);

      const mySchedRes = await fetch(`${API_URL}/api/registration/my-schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (mySchedRes.ok) {
        const mySchedData = await mySchedRes.json();
        setMySchedule(mySchedData && mySchedData.length > 0 ? mySchedData : null);
        if (statusData.isRegistrationOpen && (!mySchedData || mySchedData.length === 0 || editingSchedule)) {
          const optRes = await fetch(`${API_URL}/api/registration/generate-options`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (optRes.ok) {
            parseGeneratorResponse(await optRes.json());
          } else {
            const errData = await optRes.json();
            setInfoMessage(errData.message || 'Could not generate schedules.');
            setOptions([]);
          }
        }
      } else {
        setMySchedule(null);
      }
    } catch (e) {
      setInfoMessage('Could not connect to the server. Please try again later.');
    }
    setLoading(false);
  };

  const handleChangeSchedule = async () => {
    setEditingSchedule(true);
    setMySchedule(null);
    setLoading(true);
    setInfoMessage('');
    setIsBlocked(false);
    try {
      const token = await AsyncStorage.getItem('token');
      const optRes = await fetch(`${API_URL}/api/registration/generate-options`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (optRes.ok) {
        parseGeneratorResponse(await optRes.json());
      } else {
        const errData = await optRes.json();
        setInfoMessage(errData.message || 'Could not generate schedules.');
        setOptions([]);
      }
    } catch (e) {
      setInfoMessage('Could not connect to the server.');
    }
    setCurrentOptionIdx(0);
    setLoading(false);
  };

  const toggleExcludeDay = (day) => {
    setExcludedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    setCurrentOptionIdx(0);
  };

  const filteredOptions = options.filter(optObj => {
    const sch = optObj.schedule || optObj;
    if (excludedDays.length === 0) return true;
    for (let item of sch) {
      const dayNorm = item.day.charAt(0).toUpperCase() + item.day.slice(1).toLowerCase();
      if (excludedDays.includes(dayNorm)) return false;
    }
    return true;
  });

  const handleRegister = async () => {
    if (filteredOptions.length === 0) return;
    setRegistering(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const selectedOp = filteredOptions[currentOptionIdx];
      const selectedSchedule = selectedOp.schedule || selectedOp;
      const res = await fetch(`${API_URL}/api/registration/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ schedule: selectedSchedule })
      });
      if (res.ok) {
        Alert.alert('Success', 'Successfully registered for schedule!');
        setEditingSchedule(false);
        await fetchData();
      } else {
        const err = await res.json();
        Alert.alert('Error', err.message || 'Registration failed.');
        await fetchData();
      }
    } catch (e) {
      Alert.alert('Error', 'Connection failed.');
    }
    setRegistering(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/(auth)/login');
  };

  const sortByDay = (arr) =>
    [...arr].sort((a, b) =>
      allDays.indexOf(a.day.charAt(0).toUpperCase() + a.day.slice(1).toLowerCase()) -
      allDays.indexOf(b.day.charAt(0).toUpperCase() + b.day.slice(1).toLowerCase())
    );

  const renderContent = () => {
    if (activePage === 'home') {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome, {studentName}!</Text>
          <Text style={styles.cardDesc}>Use the tabs below to navigate to your schedule or profile.</Text>
          <View style={[styles.regStatusBox, { backgroundColor: isRegistrationOpen ? '#e8f5e8' : '#fff3e0' }]}>
            <Text style={[styles.regStatusValue, { color: isRegistrationOpen ? '#2d6a2d' : '#e65100' }]}>
              {isRegistrationOpen ? 'Open' : 'Closed'}
            </Text>
            <Text style={styles.regStatusLabel}>Registration Status</Text>
          </View>
        </View>
      );
    }

    if (activePage === 'profile') {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Profile</Text>
          {[
            { label: 'Full Name', value: studentName || 'N/A' },
            { label: 'Email', value: userData?.email || 'N/A' },
            { label: 'Role', value: 'Student' },
            { label: 'Student ID', value: realStudentId },
          ].map(item => (
            <View key={item.label} style={styles.profileItem}>
              <Text style={styles.profileLabel}>{item.label}</Text>
              <Text style={styles.profileValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (loading) return <ActivityIndicator size="large" color="#1a431e" style={{ marginTop: 60 }} />;

    if (mySchedule && !editingSchedule) {
      const sorted = sortByDay(mySchedule);
      return (
        <View style={styles.card}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.cardTitle}>Your Enrolled Schedule</Text>
            <View style={styles.registeredBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#1a431e" />
              <Text style={styles.registeredBadgeText}>Registered</Text>
            </View>
          </View>
          {isRegistrationOpen && (
            <TouchableOpacity style={styles.changeBtn} onPress={handleChangeSchedule}>
              <Ionicons name="refresh" size={14} color="#c6a61f" />
              <Text style={styles.changeBtnText}>Change Schedule</Text>
            </TouchableOpacity>
          )}
          {renderScheduleGrid(sorted)}
          <Text style={styles.sectionLabel}>Schedule Details</Text>
          {renderScheduleList(sorted)}
        </View>
      );
    }

    if (!isRegistrationOpen && !mySchedule) {
      return (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 50 }]}>
          <Ionicons name="lock-closed-outline" size={50} color="#ccc" />
          <Text style={styles.blockedTitle}>Registration is Closed</Text>
          <Text style={styles.blockedDesc}>
            The scheduling system is currently locked. Please wait for the administration to open the registration window.
          </Text>
        </View>
      );
    }

    const currentOpt = filteredOptions[currentOptionIdx];
    const currentScheduleRaw = currentOpt?.schedule || currentOpt;
    const currentSchedule = currentScheduleRaw ? sortByDay(currentScheduleRaw) : [];

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{editingSchedule ? 'Change Your Schedule' : 'Choose Your Schedule'}</Text>
        <Text style={styles.cardDesc}>
          {editingSchedule
            ? 'Your previous schedule will be replaced when you register a new one.'
            : 'Review the generated, conflict-free options below.'}
        </Text>

        {editingSchedule && (
          <TouchableOpacity style={styles.cancelEditBtn} onPress={() => { setEditingSchedule(false); fetchData(); }}>
            <Text style={styles.cancelEditText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>Exclude Days:</Text>
        <View style={styles.dayFilters}>
          {allDays.map(day => (
            <TouchableOpacity key={day} onPress={() => toggleExcludeDay(day)}
              style={[styles.dayChip, excludedDays.includes(day) && styles.dayChipActive]}>
              <Text style={[styles.dayChipText, excludedDays.includes(day) && styles.dayChipTextActive]}>
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredOptions.length > 0 ? (
          <>
            <View style={styles.optionNav}>
              <TouchableOpacity
                onPress={() => setCurrentOptionIdx(p => Math.max(0, p - 1))}
                disabled={currentOptionIdx === 0}
                style={[styles.navBtn, currentOptionIdx === 0 && { opacity: 0.4 }]}
              >
                <Ionicons name="chevron-back" size={20} color="#1a431e" />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.optionLabel}>Option {currentOptionIdx + 1} / {filteredOptions.length}</Text>
                {currentOpt?.registrationsLeft !== undefined && (
                  <View style={styles.seatsLeft}>
                    <Text style={styles.seatsLeftText}>{currentOpt.registrationsLeft} seats left</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setCurrentOptionIdx(p => Math.min(filteredOptions.length - 1, p + 1))}
                disabled={currentOptionIdx === filteredOptions.length - 1}
                style={[styles.navBtn, currentOptionIdx === filteredOptions.length - 1 && { opacity: 0.4 }]}
              >
                <Ionicons name="chevron-forward" size={20} color="#1a431e" />
              </TouchableOpacity>
            </View>

            {renderScheduleGrid(currentSchedule)}
            <Text style={styles.sectionLabel}>Schedule Details</Text>
            {renderScheduleList(currentSchedule)}

            
            <TouchableOpacity
              style={[styles.registerBtn, registering && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={registering}
            >
              {registering
                ? <ActivityIndicator color="#fff" size="small" />
                : <Ionicons name="checkmark-circle" size={18} color="#fff" />}
              <Text style={styles.registerBtnText}>
                {editingSchedule ? 'Confirm New Schedule' : 'Register This Schedule'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.blockedBox, isBlocked && styles.blockedBoxRed]}>
            <Text style={[styles.blockedTitle, isBlocked && { color: '#c0392b' }]}>
              {isBlocked ? 'Schedule Cannot Be Completed' : 'No Schedules Available'}
            </Text>
            <Text style={[styles.blockedDesc, isBlocked && { color: '#a94442' }]}>
              {infoMessage || 'Try removing some day filters.'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const navItems = [
    { key: 'home',     label: 'Home',     icon: 'home-outline' },
    { key: 'schedule', label: 'Schedule', icon: 'calendar-outline' },
    { key: 'profile',  label: 'Profile',  icon: 'person-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            {userData?.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={{ width: 38, height: 38, borderRadius: 19 }} />
            ) : (
              <Text style={styles.avatarText}>{studentName ? studentName.charAt(0).toUpperCase() : 'S'}</Text>
            )}
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{studentName || 'Loading...'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={24} color="#9abeaa" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomNav}>
        {navItems.map(item => {
          const isActive = activePage === item.key;
          return (
            <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => setActivePage(item.key)}>
              <Ionicons name={item.icon as any} size={22} color={isActive ? '#1a431e' : '#aaa'} />
              <Text style={[styles.navLabel, isActive && { color: '#1a431e', fontWeight: '700' }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SettingsModal visible={isSettingsVisible} onClose={() => setIsSettingsVisible(false)} />
      <ReviewModal 
        visible={reviewModalVisible} 
        onClose={() => setReviewModalVisible(false)} 
        course={selectedCourseForReview} 
      />
      <Chatbot />
    </SafeAreaView>
  );
}

const grid = StyleSheet.create({
  headerText: { fontSize: 9, fontWeight: '800', color: '#1a431e', textAlign: 'center' },
  dayText:    { fontSize: 10, fontWeight: '700', color: '#2d6a2d' },
  courseCode: { fontSize: 8,  fontWeight: '900', textAlign: 'center' },
  courseType: { fontSize: 7,  fontWeight: '700', textAlign: 'center' },
  courseSection: { fontSize: 6, color: '#555', textAlign: 'center' },
  courseRoom: { fontSize: 6,  color: '#666', textAlign: 'center' },
});

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#f5f7f5' },
  header:             { backgroundColor: '#1a2e1a', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileSection:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar:             { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2d6a2d', justifyContent: 'center', alignItems: 'center' },
  avatarText:         { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  welcomeText:        { color: '#9abeaa', fontSize: 11 },
  nameText:           { color: '#fff', fontSize: 14, fontWeight: '600' },
  logoutBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoutText:         { color: '#FF4444', fontSize: 13, fontWeight: '600' },
  card:               { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee', marginBottom: 16 },
  cardTitle:          { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  cardDesc:           { fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 20 },
  regStatusBox:       { borderRadius: 12, padding: 20, alignItems: 'center' },
  regStatusValue:     { fontSize: 26, fontWeight: '700' },
  regStatusLabel:     { fontSize: 12, color: '#666', marginTop: 4 },
  profileItem:        { padding: 14, backgroundColor: '#f8faf8', borderRadius: 8, marginBottom: 10 },
  profileLabel:       { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  profileValue:       { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  scheduleHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  registeredBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e8f5e8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  registeredBadgeText:{ fontSize: 11, color: '#1a431e', fontWeight: '700' },
  changeBtn:          { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff8e1', borderWidth: 1, borderColor: '#f0e8c0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 16 },
  changeBtnText:      { fontSize: 13, color: '#c6a61f', fontWeight: '600' },
  sectionLabel:       { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 16, marginBottom: 8 },
  scheduleItem:       { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 10, borderWidth: 1.5, marginBottom: 8 },
  scheduleCode:       { fontSize: 13, fontWeight: '700' },
  scheduleSub:        { fontSize: 11, marginTop: 2 },
  scheduleDay:        { fontSize: 12, fontWeight: '600', color: '#444' },
  scheduleTime:       { fontSize: 11, color: '#666', marginTop: 2 },
  scheduleRoom:       { fontSize: 10, color: '#888', marginTop: 2 },
  cancelEditBtn:      { alignSelf: 'flex-end', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 },
  cancelEditText:     { fontSize: 13, color: '#666', fontWeight: '600' },
  dayFilters:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  dayChip:            { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  dayChipActive:      { backgroundColor: '#c6a61f', borderColor: '#c6a61f' },
  dayChipText:        { fontSize: 12, fontWeight: '600', color: '#666' },
  dayChipTextActive:  { color: '#fff' },
  optionNav:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8faf8', borderRadius: 10, padding: 12, marginBottom: 16 },
  navBtn:             { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  optionLabel:        { fontSize: 14, fontWeight: '700', color: '#1a431e' },
  seatsLeft:          { backgroundColor: '#e8f5e8', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, marginTop: 4, borderWidth: 1, borderColor: '#c8e6c9' },
  seatsLeftText:      { fontSize: 11, color: '#2d6a2d', fontWeight: '600' },
  registerBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1a431e', padding: 16, borderRadius: 12, marginTop: 16 },
  registerBtnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  blockedBox:         { backgroundColor: '#fafafa', borderRadius: 8, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', marginTop: 8 },
  blockedBoxRed:      { backgroundColor: '#fff5f5', borderColor: '#f5c6cb' },
  blockedTitle:       { fontSize: 16, fontWeight: '700', color: '#555', marginBottom: 8, textAlign: 'center' },
  blockedDesc:        { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },
  bottomNav:          { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 8, paddingBottom: 16 },
  navItem:            { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel:           { fontSize: 11, color: '#aaa', marginTop: 3 },
});
