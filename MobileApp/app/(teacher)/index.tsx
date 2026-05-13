// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';
import SettingsModal from '../../components/SettingsModal';

const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export default function TeacherDashboard() {
  const [teacherName, setTeacherName] = useState('');
  const [displayTeacherId, setDisplayTeacherId] = useState('N/A');
  const [teacherDbId, setTeacherDbId] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherProfileImage, setTeacherProfileImage] = useState('');
  const [activePage, setActivePage] = useState('schedule');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [preferredCourses, setPreferredCourses] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [availableCoursesList, setAvailableCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDayPicker, setShowDayPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [selectedCourseName, setSelectedCourseName] = useState('');

  const router = useRouter();

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        setTeacherName(user.name || '');
        setTeacherEmail(user.email || '');
        setTeacherProfileImage(user.profileImage || '');
        const tid = user._id || user.id;

        const res = await fetch(`${API_URL}/api/teachers/${tid}`);
        const data = await res.json();
        if (res.ok && data) {
          setTeacherDbId(data._id);
          setDisplayTeacherId(data.teacherId || 'N/A');
          setPreferredCourses(data.preferredCourses || []);
          setAvailableTimes(data.availableTimes || []);
        }

        const cRes = await fetch(`${API_URL}/api/courses`);
        const cData = await cRes.json();
        if (Array.isArray(cData)) setAvailableCoursesList(cData);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const savePreferences = async (courses, times) => {
    try {
      const id = teacherDbId;
      if (!id) { Alert.alert('Error', 'Teacher ID not loaded yet.'); return false; }
      const res = await fetch(`${API_URL}/api/teachers/${id}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredCourses: courses, availableTimes: times }),
      });
      if (res.ok) return true;
      const data = await res.json();
      Alert.alert('Error', data.message || 'Failed to save preferences');
      return false;
    } catch {
      Alert.alert('Error', 'Connection Error. Check Backend.');
      return false;
    }
  };

  const addCourse = async () => {
    if (!selectedCourseName) { Alert.alert('Error', 'Please select a course'); return; }
    if (preferredCourses.includes(selectedCourseName)) { Alert.alert('Error', 'Course already added'); return; }
    const updated = [...preferredCourses, selectedCourseName];
    if (await savePreferences(updated, availableTimes)) {
      setPreferredCourses(updated);
      setSelectedCourseName('');
      setShowCoursePicker(false);
    }
  };

  const deleteCourse = async (name) => {
    const updated = preferredCourses.filter(c => c !== name);
    if (await savePreferences(updated, availableTimes)) setPreferredCourses(updated);
  };

  const addTime = async () => {
    if (!selectedDay || !startTime || !endTime) { Alert.alert('Error', 'Fill all time fields'); return; }
    if (startTime >= endTime) { Alert.alert('Error', 'End time must be after start time'); return; }
    const updated = [...availableTimes, { day: selectedDay, startTime, endTime }];
    if (await savePreferences(preferredCourses, updated)) {
      setAvailableTimes(updated);
      setSelectedDay('');
      setStartTime('');
      setEndTime('');
      setShowDayPicker(false);
    }
  };

  const deleteTime = async (index) => {
    const updated = availableTimes.filter((_, i) => i !== index);
    if (await savePreferences(preferredCourses, updated)) setAvailableTimes(updated);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/(auth)/login');
  };

  const navItems = [
    { key: 'schedule', label: 'Preferences', icon: 'calendar-outline' },
    { key: 'profile',  label: 'Profile',     icon: 'person-outline' },
  ];

  const renderContent = () => {
    if (activePage === 'profile') {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Teacher Profile</Text>
          {[
            { label: 'Full Name', value: 'Dr. ' + teacherName },
            { label: 'Email', value: teacherEmail || 'N/A' },
            { label: 'Role', value: 'Teacher / Instructor' },
            { label: 'Teacher ID', value: displayTeacherId },
          ].map(item => (
            <View key={item.label} style={styles.profileItem}>
              <Text style={styles.profileLabel}>{item.label}</Text>
              <Text style={styles.profileValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      );
    }

    return (
      <>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Preferred Courses</Text>

          <TouchableOpacity style={styles.dropdown} onPress={() => setShowCoursePicker(!showCoursePicker)}>
            <Text style={[styles.dropdownText, !selectedCourseName && { color: '#999' }]}>
              {selectedCourseName || 'Select Course...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#666" />
          </TouchableOpacity>
          {showCoursePicker && (
            <View style={styles.dropdownList}>
              <ScrollView
                style={{ maxHeight: 220 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {availableCoursesList.map(c => (
                  <TouchableOpacity key={c._id} style={styles.dropdownItem} onPress={() => { setSelectedCourseName(c.name); setShowCoursePicker(false); }}>
                    <Text style={styles.dropdownItemText}>{c.name} ({c.code})</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <TouchableOpacity style={styles.addBtn} onPress={addCourse}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add Course</Text>
          </TouchableOpacity>

          {preferredCourses.length === 0 ? (
            <Text style={styles.emptyText}>No preferred courses added yet.</Text>
          ) : (
            preferredCourses.map((c, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listItemText}>{c}</Text>
                <TouchableOpacity onPress={() => deleteCourse(c)}>
                  <Ionicons name="trash-outline" size={18} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available Time Slots</Text>

          <Text style={styles.inputLabel}>Day</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowDayPicker(!showDayPicker)}>
            <Text style={[styles.dropdownText, !selectedDay && { color: '#999' }]}>
              {selectedDay || 'Select Day...'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#666" />
          </TouchableOpacity>
          {showDayPicker && (
            <View style={styles.dropdownList}>
              {days.map(d => (
                <TouchableOpacity key={d} style={styles.dropdownItem} onPress={() => { setSelectedDay(d); setShowDayPicker(false); }}>
                  <Text style={styles.dropdownItemText}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Start Time (HH:MM)</Text>
              <TextInput style={styles.input} placeholder="e.g. 08:00" value={startTime} onChangeText={setStartTime} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>End Time (HH:MM)</Text>
              <TextInput style={styles.input} placeholder="e.g. 10:00" value={endTime} onChangeText={setEndTime} />
            </View>
          </View>

          <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#1a73e8' }]} onPress={addTime}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add Time Slot</Text>
          </TouchableOpacity>

          {availableTimes.length === 0 ? (
            <Text style={styles.emptyText}>No time slots added yet.</Text>
          ) : (
            availableTimes.map((t, i) => (
              <View key={i} style={styles.listItem}>
                <View>
                  <Text style={styles.listItemText}>{t.day}</Text>
                  <Text style={[styles.listItemText, { color: '#1a73e8', fontSize: 12 }]}>{t.startTime} - {t.endTime}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteTime(i)}>
                  <Ionicons name="trash-outline" size={18} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#1B3C2A" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            {teacherProfileImage ? (
              <Image source={{ uri: teacherProfileImage }} style={{ width: 38, height: 38, borderRadius: 19 }} />
            ) : (
              <Text style={styles.avatarText}>{teacherName ? teacherName.charAt(0).toUpperCase() : 'T'}</Text>
            )}
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome, Dr.</Text>
            <Text style={styles.nameText}>{teacherName || 'Loading...'}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f5' },
  header: { backgroundColor: '#1a2e1a', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2d6a2d', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  welcomeText: { color: '#9abeaa', fontSize: 11 },
  nameText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoutText: { color: '#FF4444', fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#eee', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  profileItem: { padding: 14, backgroundColor: '#f8faf8', borderRadius: 8, marginBottom: 10 },
  profileLabel: { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  profileValue: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  dropdown: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA' },
  dropdownText: { fontSize: 14, color: '#333' },
  dropdownList: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginBottom: 12, backgroundColor: '#fff', elevation: 3 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownItemText: { fontSize: 14, color: '#333' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 14, backgroundColor: '#FAFAFA' },
  addBtn: { backgroundColor: '#1B3C2A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, borderRadius: 8, marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#aaa', fontSize: 13, paddingVertical: 16 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  listItemText: { fontSize: 14, fontWeight: '600', color: '#333' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 8, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 11, color: '#aaa', marginTop: 3 },
});