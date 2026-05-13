// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, BackHandler, Modal, ScrollView, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

const departments = ['Computer Science', 'Mathematics', 'Physics', 'Biology'];
const academicYears = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const statuses = ['Active', 'Inactive', 'Pending'];

const statusColors = {
  Active:   { bg: '#e8f5e8', text: '#2d6a2d' },
  Inactive: { bg: '#f5f5f5', text: '#888' },
  Pending:  { bg: '#fff8e1', text: '#b8860b' },
};

const allDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const typeColors = {
  Lecture: { bg: '#e8f5e8', border: '#c8e6c9', text: '#1a431e', sub: '#2d6a2d' },
  Section: { bg: '#e8f0ff', border: '#b3ccff', text: '#1a3f7a', sub: '#4a6abf' },
};

export default function StudentManagement() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menuStudent, setMenuStudent] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', studentId: '', department: 'Computer Science', academicYear: 'Year 1', major: 'CS', status: 'Active' });
  const [saving, setSaving] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const [showTimetable, setShowTimetable] = useState(false);
  const [timetableStudent, setTimetableStudent] = useState(null);
  const [timetableData, setTimetableData] = useState([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/students`);
      const data = await res.json();
      if (res.ok) setStudents(data);
    } catch { Alert.alert('Error', 'Server connection failed'); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchStudents(); }, []));

  useEffect(() => {
    const bh = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(admin)/dashboard'); return true;
    });
    return () => bh.remove();
  }, []);

  const handleDelete = (id, name) => {
    setMenuStudent(null);
    Alert.alert('Delete Student', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const res = await fetch(`${API_URL}/api/students/${id}`, { method: 'DELETE' });
          if (res.ok) setStudents(prev => prev.filter(s => s._id !== id));
        } catch { Alert.alert('Error', 'Delete failed'); }
      }},
    ]);
  };

  const openEdit = (student) => {
    setMenuStudent(null);
    setEditStudent(student);
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      studentId: student.studentId || '',
      department: student.department || 'Computer Science',
      academicYear: student.academicYear || 'Year 1',
      major: student.major || 'CS',
      status: student.status || 'Active',
    });
    setShowDeptPicker(false);
    setShowYearPicker(false);
    setShowStatusPicker(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.email || !editForm.studentId) {
      Alert.alert('Error', 'Name, Email, and Student ID are required.'); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/students/${editStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(prev => prev.map(s => s._id === editStudent._id ? data : s));
        setShowEditModal(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to save');
      }
    } catch { Alert.alert('Error', 'Connection failed'); }
    finally { setSaving(false); }
  };

  const openTimetable = async (student) => {
    setMenuStudent(null);
    setTimetableStudent(student);
    setTimetableData([]);
    setShowTimetable(true);
    setLoadingTimetable(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/registration/student-schedule/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTimetableData(Array.isArray(data) ? data : []);
      } else {
        setTimetableData([]);
      }
    } catch { setTimetableData([]); }
    finally { setLoadingTimetable(false); }
  };

  if (loading) return <ActivityIndicator size="large" color="#1B3C2A" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.mainTitle}>Student Management</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusHint}>System Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(admin)/add-student')}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add Student</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        renderItem={({ item }) => {
          const sc = statusColors[item.status] || statusColors.Active;
          return (
            <View style={styles.studentCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentEmail}>{item.email}</Text>
                <Text style={styles.studentDetails}>{item.department || 'CS'} • ID: {item.studentId}</Text>
                <View style={styles.tagsRow}>
                  {item.academicYear ? <View style={styles.yearBadge}><Text style={styles.yearBadgeText}>{item.academicYear}</Text></View> : null}
                  {item.major ? <View style={[styles.yearBadge, { backgroundColor: '#e8f0ff' }]}><Text style={[styles.yearBadgeText, { color: '#3366cc' }]}>{item.major}</Text></View> : null}
                  <View style={[styles.yearBadge, { backgroundColor: sc.bg }]}><Text style={[styles.yearBadgeText, { color: sc.text }]}>{item.status || 'Active'}</Text></View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setMenuStudent(item)} style={styles.menuBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <Modal visible={!!menuStudent} animationType="fade" transparent onRequestClose={() => setMenuStudent(null)}>
        <TouchableOpacity style={sheet.overlay} activeOpacity={1} onPress={() => setMenuStudent(null)}>
          <View style={sheet.container}>
            {menuStudent && (
              <View style={sheet.sheetHeader}>
                <View style={sheet.sheetAvatar}>
                  <Text style={sheet.sheetAvatarText}>{menuStudent.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={sheet.sheetName}>{menuStudent.name}</Text>
                  <Text style={sheet.sheetSub}>{menuStudent.email}</Text>
                </View>
              </View>
            )}
            <View style={sheet.divider} />

            <TouchableOpacity style={sheet.item} onPress={() => menuStudent && openTimetable(menuStudent)}>
              <View style={[sheet.iconBox, { backgroundColor: '#e8f5e8' }]}>
                <Ionicons name="calendar-outline" size={20} color="#1a431e" />
              </View>
              <View>
                <Text style={sheet.itemTitle}>View Timetable</Text>
                <Text style={sheet.itemSub}>See registered schedule</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={sheet.item} onPress={() => menuStudent && openEdit(menuStudent)}>
              <View style={[sheet.iconBox, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="create-outline" size={20} color="#e65100" />
              </View>
              <View>
                <Text style={sheet.itemTitle}>Edit</Text>
                <Text style={sheet.itemSub}>Modify student info</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={sheet.item} onPress={() => menuStudent && handleDelete(menuStudent._id, menuStudent.name)}>
              <View style={[sheet.iconBox, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="trash-outline" size={20} color="#c62828" />
              </View>
              <View>
                <Text style={[sheet.itemTitle, { color: '#c62828' }]}>Delete</Text>
                <Text style={sheet.itemSub}>Remove student permanently</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={sheet.cancelBtn} onPress={() => setMenuStudent(null)}>
              <Text style={sheet.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={modal.overlay}>
          <View style={modal.container}>
            <View style={modal.header}>
              <Text style={modal.title}>Edit Student</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <ScrollView style={modal.body} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
              {[
                { label: 'Full Name',   key: 'name',      placeholder: 'e.g. Youssef' },
                { label: 'Email',       key: 'email',     placeholder: 'student@uni.edu', keyboard: 'email-address' },
                { label: 'Student ID',  key: 'studentId', placeholder: 'e.g. 2327159',   keyboard: 'numeric' },
                { label: 'Major',       key: 'major',     placeholder: 'e.g. CS' },
              ].map(f => (
                <View key={f.key}>
                  <Text style={modal.label}>{f.label}</Text>
                  <TextInput style={modal.input} value={editForm[f.key]} onChangeText={v => setEditForm({ ...editForm, [f.key]: v })} placeholder={f.placeholder} keyboardType={f.keyboard || 'default'} autoCapitalize="none" />
                </View>
              ))}

              <Text style={modal.label}>Department</Text>
              <TouchableOpacity style={modal.dropdown} onPress={() => { setShowDeptPicker(!showDeptPicker); setShowYearPicker(false); setShowStatusPicker(false); }}>
                <Text style={modal.dropdownText}>{editForm.department}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              {showDeptPicker && <View style={modal.pickerList}>{departments.map(d => <TouchableOpacity key={d} style={modal.pickerItem} onPress={() => { setEditForm({ ...editForm, department: d }); setShowDeptPicker(false); }}><Text style={modal.pickerText}>{d}</Text></TouchableOpacity>)}</View>}

              <Text style={modal.label}>Academic Year</Text>
              <TouchableOpacity style={modal.dropdown} onPress={() => { setShowYearPicker(!showYearPicker); setShowDeptPicker(false); setShowStatusPicker(false); }}>
                <Text style={modal.dropdownText}>{editForm.academicYear}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              {showYearPicker && <View style={modal.pickerList}>{academicYears.map(y => <TouchableOpacity key={y} style={modal.pickerItem} onPress={() => { setEditForm({ ...editForm, academicYear: y }); setShowYearPicker(false); }}><Text style={modal.pickerText}>{y}</Text></TouchableOpacity>)}</View>}

              <Text style={modal.label}>Status</Text>
              <TouchableOpacity style={modal.dropdown} onPress={() => { setShowStatusPicker(!showStatusPicker); setShowDeptPicker(false); setShowYearPicker(false); }}>
                <Text style={modal.dropdownText}>{editForm.status}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              {showStatusPicker && <View style={modal.pickerList}>{statuses.map(s => <TouchableOpacity key={s} style={modal.pickerItem} onPress={() => { setEditForm({ ...editForm, status: s }); setShowStatusPicker(false); }}><Text style={modal.pickerText}>{s}</Text></TouchableOpacity>)}</View>}
            </ScrollView>

            <View style={modal.footer}>
              <TouchableOpacity style={modal.cancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={modal.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[modal.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSaveEdit} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={modal.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    
      <Modal visible={showTimetable} animationType="slide" transparent onRequestClose={() => setShowTimetable(false)}>
        <View style={modal.overlay}>
          <View style={[modal.container, { maxHeight: '88%' }]}>
            <View style={modal.header}>
              <View>
                <Text style={modal.title}>Student Timetable</Text>
                {timetableStudent && <Text style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{timetableStudent.name}</Text>}
              </View>
              <TouchableOpacity onPress={() => setShowTimetable(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modal.body}>
              {loadingTimetable ? (
                <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                  <ActivityIndicator size="large" color="#1B3C2A" />
                  <Text style={{ color: '#888', marginTop: 12 }}>Loading schedule...</Text>
                </View>
              ) : timetableData.length === 0 ? (
                <View style={tt.emptyBox}>
                  <Ionicons name="calendar-outline" size={52} color="#ccc" />
                  <Text style={tt.emptyTitle}>No Registered Schedule</Text>
                  <Text style={tt.emptyDesc}>This student hasn't registered for a schedule yet.</Text>
                </View>
              ) : (
                allDays.map(day => {
                  const dayItems = timetableData.filter(s => s.day?.toLowerCase() === day.toLowerCase());
                  if (!dayItems.length) return null;
                  return (
                    <View key={day} style={tt.daySection}>
                      <Text style={tt.dayTitle}>{day}</Text>
                      {dayItems.map((item, idx) => {
                        const c = typeColors[item.type] || typeColors.Lecture;
                        return (
                          <View key={idx} style={[tt.slotCard, { backgroundColor: c.bg, borderColor: c.border }]}>
                            <View style={{ flex: 1 }}>
                              <Text style={[tt.courseName, { color: c.text }]}>{item.courseCode}: {item.courseName}</Text>
                              {item.sectionName ? <Text style={[tt.sectionName, { color: c.sub }]}>{item.sectionName} • {item.type}</Text> : null}
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={tt.time}>{item.startTime} – {item.endTime}</Text>
                              <Text style={tt.room}>🚪 {item.room || 'TBA'}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  pageHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  mainTitle: { fontSize: 20, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#28A745', marginRight: 5 },
  statusHint: { fontSize: 11, color: '#666' },
  addBtn: { backgroundColor: '#1B3C2A', flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  studentCard: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', marginTop: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#1B3C2A', fontWeight: 'bold', fontSize: 16 },
  infoContainer: { flex: 1, marginLeft: 12 },
  studentName: { fontSize: 15, fontWeight: 'bold' },
  studentEmail: { fontSize: 12, color: '#666' },
  studentDetails: { fontSize: 11, color: '#999', marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  yearBadge: { backgroundColor: '#e8f5e8', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  yearBadgeText: { fontSize: 10, color: '#2d6a2d', fontWeight: '700' },
  menuBtn: { padding: 8 },
});

const sheet = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30, paddingTop: 8 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  sheetAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  sheetAvatarText: { color: '#1B3C2A', fontWeight: 'bold', fontSize: 18 },
  sheetName: { fontSize: 16, fontWeight: '700', color: '#111' },
  sheetSub: { fontSize: 12, color: '#888', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  itemSub: { fontSize: 12, color: '#888', marginTop: 2 },
  cancelBtn: { marginHorizontal: 20, marginTop: 10, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#444' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 18, fontWeight: '700' },
  body: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 12, fontSize: 14, backgroundColor: '#FAFAFA' },
  dropdown: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA' },
  dropdownText: { fontSize: 14, color: '#333' },
  pickerList: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginTop: 4, backgroundColor: '#fff', elevation: 4 },
  pickerItem: { padding: 13, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  pickerText: { fontSize: 14, color: '#333' },
  footer: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#666' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#1B3C2A', alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

const tt = StyleSheet.create({
  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#555', marginTop: 16 },
  emptyDesc: { fontSize: 13, color: '#999', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  daySection: { marginBottom: 20 },
  dayTitle: { fontSize: 12, fontWeight: '800', color: '#1B3C2A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  slotCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 8 },
  courseName: { fontSize: 13, fontWeight: '700' },
  sectionName: { fontSize: 11, marginTop: 3 },
  time: { fontSize: 12, fontWeight: '700', color: '#444' },
  room: { fontSize: 11, color: '#888', marginTop: 4 },
});
