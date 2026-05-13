// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, Modal, ScrollView, TextInput, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

const typeColors = {
  Lecture: { bg: '#fffde7', border: '#f0e8c0', badgeBg: '#fff8e1', badgeText: '#c6a61f' },
  Section: { bg: '#e8f0ff', border: '#c4d8ff', badgeBg: '#e0ecff', badgeText: '#3366cc' },
};

export default function SectionScheduling() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(admin)/dashboard');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, tRes, rRes] = await Promise.all([
        fetch(`${API_URL}/api/courses`),
        fetch(`${API_URL}/api/teachers`),
        fetch(`${API_URL}/api/rooms`),
      ]);
      const [c, t, r] = await Promise.all([cRes.json(), tRes.json(), rRes.json()]);
      if (Array.isArray(c)) setCourses(c);
      if (Array.isArray(t)) setTeachers(t);
      if (Array.isArray(r)) setRooms(r);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch data. Check server connection.');
    }
    setLoading(false);
  };

  const handleResetSections = () => {
    Alert.alert(
      'Wipe All Timings',
      'WARNING: This will delete ALL Lecture and Section timings across ALL courses. The courses themselves will NOT be deleted. This is permanent.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe All',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/courses/reset-sections`, { method: 'POST' });
              if (res.ok) {
                Alert.alert('Success', 'All sections have been successfully wiped.');
                fetchData();
              } else {
                Alert.alert('Error', 'Failed to wipe sections.');
              }
            } catch (e) {
              Alert.alert('Error', 'Could not reach server.');
            }
          },
        },
      ]
    );
  };

  const openManageTiming = (course) => {
    setSelectedCourse(course);
    const sanitized = (course.sections || []).map(sec => ({
      ...sec,
      day: DAYS.includes(sec.day) ? sec.day : DAYS[0],
    }));
    setSections(sanitized);
    setShowModal(true);
  };

  const addSection = (type) => {
    setSections(prev => [...prev, {
      sectionName: '',
      type,
      day: DAYS[0],
      startTime: '',
      endTime: '',
      instructor: '',
      room: '',
      maxCapacity: 40,
      currentEnrollment: 0,
    }]);
  };

  const updateSection = (idx, field, value) => {
    setSections(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const removeSection = (idx) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const handleInstructorChange = (idx, name) => {
    const updated = [...sections];
    updated[idx].instructor = name;

    const teacherObj = teachers.find(t => t.name === name);
    if (teacherObj?.availableTimes?.length > 0) {
      const firstFree = teacherObj.availableTimes.find(at => {
        const globalUsed = courses.some(c => {
          if (c._id === selectedCourse._id) return false;
          return (c.sections || []).some(s => s.instructor === name && s.day === at.day && s.startTime === at.startTime);
        });
        if (globalUsed) return false;
        return !updated.some((s, sIdx) => sIdx !== idx && s.instructor === name && s.day === at.day && s.startTime === at.startTime);
      });
      if (firstFree) {
        updated[idx].day = firstFree.day;
        updated[idx].startTime = firstFree.startTime;
        updated[idx].endTime = firstFree.endTime;
      }
    }
    setSections(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/courses/${selectedCourse._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(prev => prev.map(c => c._id === selectedCourse._id ? data : c));
        setShowModal(false);
        Alert.alert('Success', 'Schedule saved successfully!');
      } else {
        const err = await res.json();
        Alert.alert('Error', err.message || 'Update failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not reach server.');
    }
    setSaving(false);
  };

  const lectureCount = (secs) => (secs || []).filter(s => (s.type || 'Lecture') === 'Lecture').length;
  const sectionCount = (secs) => (secs || []).filter(s => s.type === 'Section').length;

  const filtered = courses.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <ActivityIndicator size="large" color="#1B3C2A" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Scheduling & Sections</Text>
          <Text style={styles.subtitle}>Configure timings, rooms and instructors</Text>
        </View>
        <TouchableOpacity style={styles.wipeBtn} onPress={handleResetSections}>
          <Ionicons name="trash-outline" size={14} color="#e53e3e" />
          <Text style={styles.wipeBtnText}>Wipe All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses to schedule..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.courseCard}>
            <View style={styles.courseIcon}>
              <Ionicons name="calendar-outline" size={18} color="#2d6a2d" />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.courseCode}>{item.code}</Text>
              <View style={styles.tagRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{lectureCount(item.sections)} Lectures</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#e8f0ff' }]}>
                  <Text style={[styles.tagText, { color: '#3366cc' }]}>{sectionCount(item.sections)} Sections</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#e8f5e8' }]}>
                  <Text style={[styles.tagText, { color: '#2d6a2d' }]}>{item.creditHours || 3} hrs</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.manageBtn} onPress={() => openManageTiming(item)}>
              <Text style={styles.manageBtnText}>Manage</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No courses found.</Text>
          </View>
        }
      />

      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedCourse?.name}
              </Text>
              <Text style={styles.modalSubtitle}>
                {selectedCourse?.code} · {selectedCourse?.department}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={26} color="#555" />
            </TouchableOpacity>
          </View>

          <View style={styles.addBtnsRow}>
            <TouchableOpacity style={styles.addLecBtn} onPress={() => addSection('Lecture')}>
              <Ionicons name="add" size={16} color="#c6a61f" />
              <Text style={styles.addLecBtnText}>Add Lecture</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addSecBtn} onPress={() => addSection('Section')}>
              <Ionicons name="add" size={16} color="#3366cc" />
              <Text style={styles.addSecBtnText}>Add Section</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15, paddingBottom: 30 }}>
            {sections.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="time-outline" size={40} color="#ccc" />
                <Text style={styles.emptySectionText}>No timings configured yet.</Text>
                <Text style={styles.emptySectionSub}>Use the buttons above to add lectures or sections.</Text>
              </View>
            ) : (
              sections.map((sec, idx) => {
                const isLecture = (sec.type || 'Lecture') === 'Lecture';
                const colors = typeColors[sec.type || 'Lecture'];
                const selectedTeacher = teachers.find(t => t.name === sec.instructor);
                const availability = selectedTeacher?.availableTimes || [];

                return (
                  <View key={idx} style={[styles.sectionCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <View style={styles.sectionTopRow}>
                      <View style={[styles.typeBadge, { backgroundColor: colors.badgeBg }]}>
                        <Text style={[styles.typeBadgeText, { color: colors.badgeText }]}>
                          {isLecture ? 'LECTURE' : 'SECTION'}
                        </Text>
                      </View>
                      <TextInput
                        style={styles.sectionNameInput}
                        placeholder={isLecture ? 'e.g. Lec A' : 'e.g. Section 1'}
                        value={sec.sectionName}
                        onChangeText={v => updateSection(idx, 'sectionName', v)}
                      />
                      <TouchableOpacity onPress={() => removeSection(idx)} style={styles.removeBtn}>
                        <Ionicons name="trash-outline" size={16} color="#e53e3e" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.fieldLabel}>{isLecture ? 'PROFESSOR' : 'TEACHING ASSISTANT'}</Text>
                    <View style={styles.pickerBox}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                          style={[styles.pickerOption, !sec.instructor && styles.pickerOptionActive]}
                          onPress={() => handleInstructorChange(idx, '')}
                        >
                          <Text style={styles.pickerOptionText}>None</Text>
                        </TouchableOpacity>
                        {teachers.map(t => (
                          <TouchableOpacity
                            key={t._id}
                            style={[styles.pickerOption, sec.instructor === t.name && styles.pickerOptionActive]}
                            onPress={() => handleInstructorChange(idx, t.name)}
                          >
                            <Text style={[styles.pickerOptionText, sec.instructor === t.name && { color: '#fff' }]}>
                              {t.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <Text style={styles.fieldLabel}>ROOM</Text>
                    <View style={styles.pickerBox}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                          style={[styles.pickerOption, !sec.room && styles.pickerOptionActive]}
                          onPress={() => updateSection(idx, 'room', '')}
                        >
                          <Text style={styles.pickerOptionText}>None</Text>
                        </TouchableOpacity>
                        {rooms.map(r => (
                          <TouchableOpacity
                            key={r._id}
                            style={[styles.pickerOption, sec.room === r.name && styles.pickerOptionActive]}
                            onPress={() => {
                              updateSection(idx, 'room', r.name);
                              updateSection(idx, 'maxCapacity', r.capacity);
                            }}
                          >
                            <Text style={[styles.pickerOptionText, sec.room === r.name && { color: '#fff' }]}>
                              {r.name} ({r.capacity})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <Text style={styles.fieldLabel}>MAX CAPACITY</Text>
                    <TextInput
                      style={styles.capacityInput}
                      keyboardType="numeric"
                      value={String(sec.maxCapacity || 40)}
                      onChangeText={v => updateSection(idx, 'maxCapacity', Number(v) || 40)}
                    />

                    {availability.length > 0 ? (
                      <>
                        <Text style={[styles.fieldLabel, { color: '#1a431e' }]}>
                          INSTRUCTOR AVAILABILITY — SELECT SLOT
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                          {availability.filter(at => {
                            const globalUsed = courses.some(c => {
                              if (c._id === selectedCourse._id) return false;
                              return (c.sections || []).some(s =>
                                s.instructor === sec.instructor && s.day === at.day && s.startTime === at.startTime
                              );
                            });
                            if (globalUsed) return false;
                            return !sections.some((s, sIdx) =>
                              sIdx !== idx && s.instructor === sec.instructor && s.day === at.day && s.startTime === at.startTime
                            );
                          }).map((at, i) => {
                            const isSelected = sec.day === at.day && sec.startTime === at.startTime;
                            return (
                              <TouchableOpacity
                                key={i}
                                style={[styles.slotChip, isSelected && styles.slotChipActive]}
                                onPress={() => {
                                  updateSection(idx, 'day', at.day);
                                  updateSection(idx, 'startTime', at.startTime);
                                  updateSection(idx, 'endTime', at.endTime);
                                }}
                              >
                                <Text style={[styles.slotChipText, isSelected && { color: '#fff' }]}>
                                  {at.day}: {at.startTime}–{at.endTime}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                        {sec.day && sec.startTime && (
                          <Text style={styles.selectedSlot}>
                            ✓ Selected: {sec.day} {sec.startTime} – {sec.endTime}
                          </Text>
                        )}
                      </>
                    ) : (
                      <>
                        <Text style={styles.fieldLabel}>DAY</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                          {DAYS.map(d => (
                            <TouchableOpacity
                              key={d}
                              style={[styles.pickerOption, sec.day === d && styles.pickerOptionActive]}
                              onPress={() => updateSection(idx, 'day', d)}
                            >
                              <Text style={[styles.pickerOptionText, sec.day === d && { color: '#fff' }]}>{d}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        <View style={styles.timeRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.fieldLabel}>START TIME</Text>
                            <TextInput
                              style={styles.timeInput}
                              placeholder="e.g. 08:00"
                              value={sec.startTime}
                              onChangeText={v => updateSection(idx, 'startTime', v)}
                            />
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.fieldLabel}>END TIME</Text>
                            <TextInput
                              style={styles.timeInput}
                              placeholder="e.g. 10:00"
                              value={sec.endTime}
                              onChangeText={v => updateSection(idx, 'endTime', v)}
                            />
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>

         
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Schedule</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  wipeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#fed7d7', backgroundColor: '#fff5f5',
  },
  wipeBtnText: { color: '#e53e3e', fontSize: 12, fontWeight: '600' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    margin: 15, backgroundColor: '#fff',
    borderRadius: 24, borderWidth: 1, borderColor: '#e0e0e0',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  courseCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 14, borderRadius: 12,
    marginBottom: 10, elevation: 1,
  },
  courseIcon: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#f0f7f0', justifyContent: 'center', alignItems: 'center',
    marginRight: 12, flexShrink: 0,
  },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: '700', color: '#111' },
  courseCode: { fontSize: 12, color: '#888', marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagText: { fontSize: 10, color: '#888', fontWeight: '600' },
  manageBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#1a2e1a', backgroundColor: 'white',
  },
  manageBtnText: { fontSize: 12, fontWeight: '700', color: '#1a2e1a' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 14, marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  modalSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  addBtnsRow: {
    flexDirection: 'row', gap: 10, padding: 12, paddingHorizontal: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE',
  },
  addLecBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#fff8e1', borderWidth: 1, borderColor: '#f0e8c0',
  },
  addLecBtnText: { fontSize: 13, fontWeight: '700', color: '#c6a61f' },
  addSecBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#e0ecff', borderWidth: 1, borderColor: '#c4d8ff',
  },
  addSecBtnText: { fontSize: 13, fontWeight: '700', color: '#3366cc' },
  emptySection: { alignItems: 'center', paddingVertical: 60 },
  emptySectionText: { fontSize: 16, fontWeight: '600', color: '#888', marginTop: 16 },
  emptySectionSub: { fontSize: 12, color: '#aaa', marginTop: 6, textAlign: 'center' },
  sectionCard: {
    borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1.5,
  },
  sectionTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  typeBadgeText: { fontSize: 10, fontWeight: '800' },
  sectionNameInput: {
    flex: 1, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.12)',
    fontSize: 14, fontWeight: '600', paddingVertical: 4, backgroundColor: 'transparent',
  },
  removeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#eee',
  },
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: '#888',
    textTransform: 'uppercase', marginBottom: 6, marginTop: 10,
  },
  pickerBox: { marginBottom: 4 },
  pickerOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
    marginRight: 8,
  },
  pickerOptionActive: { backgroundColor: '#1a2e1a', borderColor: '#1a2e1a' },
  pickerOptionText: { fontSize: 13, color: '#555', fontWeight: '500' },
  capacityInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 10, fontSize: 14, backgroundColor: '#fff', marginBottom: 4,
  },
  slotChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#8fbc8f', backgroundColor: '#f0f7f0',
    marginRight: 8,
  },
  slotChipActive: { backgroundColor: '#1a431e', borderColor: '#1a431e' },
  slotChipText: { fontSize: 12, fontWeight: '600', color: '#1a431e' },
  selectedSlot: { fontSize: 12, color: '#2d6a2d', fontWeight: '600', marginTop: 4 },
  timeRow: { flexDirection: 'row' },
  timeInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 10, fontSize: 14, backgroundColor: '#fff',
  },
  modalFooter: {
    flexDirection: 'row', gap: 12, padding: 16,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee',
  },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#555' },
  saveBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    backgroundColor: '#1a2e1a', alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
