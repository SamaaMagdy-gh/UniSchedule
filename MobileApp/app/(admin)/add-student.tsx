import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, BackHandler
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/utils/constant';

const departments = ['Computer Science', 'Mathematics', 'Physics', 'Biology'];
const academicYears = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const statuses = ['Active', 'Inactive', 'Pending'];

export default function AddStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [showDeptList, setShowDeptList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);
  const [showStatusList, setShowStatusList] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science',
    academicYear: 'Year 1',
    major: 'CS',
    status: 'Active',
  });

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => { router.replace('/(admin)/students'); return true; };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.studentId.trim()) {
      Alert.alert('Required Fields', 'Please fill Name, Email, and Student ID.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          studentId: form.studentId.trim(),
          department: form.department,
          academicYear: form.academicYear,
          major: form.major.trim(),
          status: form.status,
        }),
      });
      const responseText = await response.text();
      let data: any;
      try { data = JSON.parse(responseText); } catch (e) { throw new Error('Invalid response from server.'); }
      if (response.ok) {
        Alert.alert('Success', 'Student has been added successfully.');
        router.replace('/(admin)/students');
      } else {
        Alert.alert('Error', data.message || 'Failed to save student.');
      }
    } catch (e: any) {
      Alert.alert('Connection Failed', e.message || 'Server is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowDeptList(false); setShowYearList(false); setShowStatusList(false); }}>
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.header}>Add New Student</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Youssef Abdullah" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="student@university.edu" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>Student ID</Text>
            <TextInput style={styles.input} placeholder="e.g. 2327159" value={form.studentId} onChangeText={(v) => setForm({ ...form, studentId: v })} keyboardType="numeric" />

            <Text style={styles.label}>Department</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => { setShowDeptList(!showDeptList); setShowYearList(false); setShowStatusList(false); }}>
              <Text style={styles.dropdownText}>{form.department}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            {showDeptList && (
              <View style={styles.dropdownList}>
                {departments.map((d) => (
                  <TouchableOpacity key={d} style={styles.dropdownItem} onPress={() => { setForm({ ...form, department: d }); setShowDeptList(false); }}>
                    <Text style={styles.dropdownItemText}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Academic Year</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => { setShowYearList(!showYearList); setShowDeptList(false); setShowStatusList(false); }}>
              <Text style={styles.dropdownText}>{form.academicYear}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            {showYearList && (
              <View style={styles.dropdownList}>
                {academicYears.map((y) => (
                  <TouchableOpacity key={y} style={styles.dropdownItem} onPress={() => { setForm({ ...form, academicYear: y }); setShowYearList(false); }}>
                    <Text style={styles.dropdownItemText}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Major</Text>
            <TextInput style={styles.input} placeholder="e.g. CS" value={form.major} onChangeText={(v) => setForm({ ...form, major: v })} />

            <Text style={styles.label}>Status</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => { setShowStatusList(!showStatusList); setShowDeptList(false); setShowYearList(false); }}>
              <Text style={styles.dropdownText}>{form.status}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            {showStatusList && (
              <View style={styles.dropdownList}>
                {statuses.map((s) => (
                  <TouchableOpacity key={s} style={styles.dropdownItem} onPress={() => { setForm({ ...form, status: s }); setShowStatusList(false); }}>
                    <Text style={styles.dropdownItemText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Student</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(admin)/students')} style={{ marginTop: 20 }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  formCard: { backgroundColor: '#fff', padding: 25, borderRadius: 15, margin: 20, elevation: 4, marginTop: 40 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 25, color: '#1B3C2A', textAlign: 'center' },
  label: { fontWeight: 'bold', marginBottom: 6, color: '#444', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 14, borderRadius: 10, marginBottom: 16, backgroundColor: '#FAFAFA', fontSize: 14 },
  dropdown: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 8, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA' },
  dropdownText: { fontSize: 14, color: '#333' },
  dropdownList: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginBottom: 16, backgroundColor: '#fff', elevation: 3 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownItemText: { fontSize: 14, color: '#333' },
  btn: { backgroundColor: '#1B3C2A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelText: { color: '#666', textAlign: 'center', fontWeight: '500' },
});