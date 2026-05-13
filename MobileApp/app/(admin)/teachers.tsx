// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Alert,
  ActivityIndicator, BackHandler, Modal, ScrollView, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

const departments = ['Computer Science', 'Mathematics', 'Physics', 'Biology'];
const statuses = ['Active', 'Inactive', 'Pending'];

const statusColors = {
  Active:   { bg: '#e8f5e8', text: '#2d6a2d' },
  Inactive: { bg: '#f5f5f5', text: '#888' },
  Pending:  { bg: '#fff8e1', text: '#b8860b' },
};

export default function TeacherManagement() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menuTeacher, setMenuTeacher] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', teacherId: '', department: 'Computer Science', status: 'Active' });
  const [saving, setSaving] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teachers`);
      const data = await res.json();
      if (res.ok) setTeachers(data);
    } catch { Alert.alert('Error', 'Failed to fetch teachers'); }
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchTeachers(); }, []));

  useEffect(() => {
    const bh = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(admin)/dashboard'); return true;
    });
    return () => bh.remove();
  }, []);

  const handleDelete = (id, name) => {
    setMenuTeacher(null);
    Alert.alert('Delete Teacher', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const res = await fetch(`${API_URL}/api/teachers/${id}`, { method: 'DELETE' });
          if (res.ok) setTeachers(prev => prev.filter(t => t._id !== id));
        } catch { Alert.alert('Error', 'Delete failed'); }
      }},
    ]);
  };

  const openEdit = (teacher) => {
    setMenuTeacher(null);
    setEditTeacher(teacher);
    setEditForm({
      name: teacher.name || '',
      email: teacher.email || '',
      teacherId: teacher.teacherId || '',
      department: teacher.department || 'Computer Science',
      status: teacher.status || 'Active',
    });
    setShowDeptPicker(false);
    setShowStatusPicker(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.email) {
      Alert.alert('Error', 'Name and Email are required.'); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/teachers/${editTeacher._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setTeachers(prev => prev.map(t => t._id === editTeacher._id ? data : t));
        setShowEditModal(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to save');
      }
    } catch { Alert.alert('Error', 'Connection failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <ActivityIndicator size="large" color="#1B3C2A" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.mainTitle}>Teachers Management</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusHint}>System Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(admin)/add-teacher')}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add Teacher</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={teachers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        renderItem={({ item }) => {
          const sc = statusColors[item.status] || statusColors.Active;
          return (
            <View style={styles.teacherCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.teacherName}>{item.name}</Text>
                <Text style={styles.teacherEmail}>{item.email}</Text>
                <Text style={styles.teacherDetails}>{item.department} • ID: {item.teacherId}</Text>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: sc.text }]}>{item.status || 'Active'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setMenuTeacher(item)} style={styles.menuBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          );
        }}
      />

    
      <Modal visible={!!menuTeacher} animationType="fade" transparent onRequestClose={() => setMenuTeacher(null)}>
        <TouchableOpacity style={sheet.overlay} activeOpacity={1} onPress={() => setMenuTeacher(null)}>
          <View style={sheet.container}>
            {menuTeacher && (
              <View style={sheet.sheetHeader}>
                <View style={sheet.sheetAvatar}>
                  <Text style={sheet.sheetAvatarText}>{menuTeacher.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={sheet.sheetName}>{menuTeacher.name}</Text>
                  <Text style={sheet.sheetSub}>{menuTeacher.department} • {menuTeacher.teacherId}</Text>
                </View>
              </View>
            )}
            <View style={sheet.divider} />

            <TouchableOpacity style={sheet.item} onPress={() => menuTeacher && openEdit(menuTeacher)}>
              <View style={[sheet.iconBox, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="create-outline" size={20} color="#e65100" />
              </View>
              <View>
                <Text style={sheet.itemTitle}>Edit</Text>
                <Text style={sheet.itemSub}>Modify teacher information</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={sheet.item} onPress={() => menuTeacher && handleDelete(menuTeacher._id, menuTeacher.name)}>
              <View style={[sheet.iconBox, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="trash-outline" size={20} color="#c62828" />
              </View>
              <View>
                <Text style={[sheet.itemTitle, { color: '#c62828' }]}>Delete</Text>
                <Text style={sheet.itemSub}>Remove teacher permanently</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={sheet.cancelBtn} onPress={() => setMenuTeacher(null)}>
              <Text style={sheet.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={modal.overlay}>
          <View style={modal.container}>
            <View style={modal.header}>
              <Text style={modal.title}>Edit Teacher</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView style={modal.body} contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
              {[
                { label: 'Full Name',  key: 'name',      placeholder: 'e.g. Ahmed Ali' },
                { label: 'Email',      key: 'email',     placeholder: 'teacher@uni.edu', keyboard: 'email-address' },
                { label: 'Teacher ID', key: 'teacherId', placeholder: 'e.g. T-001' },
              ].map(f => (
                <View key={f.key}>
                  <Text style={modal.label}>{f.label}</Text>
                  <TextInput style={modal.input} value={editForm[f.key]} onChangeText={v => setEditForm({ ...editForm, [f.key]: v })} placeholder={f.placeholder} keyboardType={f.keyboard || 'default'} autoCapitalize="none" />
                </View>
              ))}

              <Text style={modal.label}>Department</Text>
              <TouchableOpacity style={modal.dropdown} onPress={() => { setShowDeptPicker(!showDeptPicker); setShowStatusPicker(false); }}>
                <Text style={modal.dropdownText}>{editForm.department}</Text>
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
              {showDeptPicker && <View style={modal.pickerList}>{departments.map(d => <TouchableOpacity key={d} style={modal.pickerItem} onPress={() => { setEditForm({ ...editForm, department: d }); setShowDeptPicker(false); }}><Text style={modal.pickerText}>{d}</Text></TouchableOpacity>)}</View>}

              <Text style={modal.label}>Status</Text>
              <TouchableOpacity style={modal.dropdown} onPress={() => { setShowStatusPicker(!showStatusPicker); setShowDeptPicker(false); }}>
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
  teacherCard: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', marginTop: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#1B3C2A', fontWeight: 'bold', fontSize: 16 },
  infoContainer: { flex: 1, marginLeft: 12 },
  teacherName: { fontSize: 15, fontWeight: 'bold' },
  teacherEmail: { fontSize: 12, color: '#666' },
  teacherDetails: { fontSize: 11, color: '#999', marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 5 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
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
  container: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
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