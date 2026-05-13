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

export default function AddCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeptList, setShowDeptList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);
  const [showStatusList, setShowStatusList] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    department: 'Computer Science',
    academicYear: 'Year 1',
    major: 'CS',
    creditHours: 3,
    status: 'Active',
  });

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => { router.replace('/(admin)/courses'); return true; };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      Alert.alert('Error', 'Please fill Course Name and Code');
      return;
    }
    setLoading(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      department: form.department,
      academicYear: form.academicYear,
      major: form.major.trim(),
      creditHours: Number(form.creditHours),
      status: form.status,
      sections: [],
    };
    try {
      const response = await fetch(`${API_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Course Added!');
        router.replace('/(admin)/courses');
      } else {
        Alert.alert('Error', data.message || 'Unknown Error');
      }
    } catch (e) {
      Alert.alert('Connection Error', 'Check if Backend is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setShowDeptList(false); setShowYearList(false); setShowStatusList(false); }}>
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.header}>Add New Course</Text>

            <Text style={styles.label}>Course Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Algorithms" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />

            <Text style={styles.label}>Course Code</Text>
            <TextInput style={styles.input} placeholder="e.g. CS202" value={form.code} onChangeText={(v) => setForm({ ...form, code: v })} />

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

            <Text style={styles.label}>Credit Hours</Text>
            <TextInput style={styles.input} placeholder="e.g. 3" keyboardType="numeric" value={String(form.creditHours)} onChangeText={(v) => setForm({ ...form, creditHours: Number(v) || 3 })} />

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
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add Course</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/(admin)/courses')} style={{ marginTop: 15 }}>
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
  card: { backgroundColor: '#fff', margin: 20, padding: 25, borderRadius: 15, marginTop: 50, elevation: 5 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 22, color: '#1B3C2A', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14, backgroundColor: '#FAFAFA' },
  dropdown: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 8, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFAFA' },
  dropdownText: { fontSize: 14, color: '#333' },
  dropdownList: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, marginBottom: 16, backgroundColor: '#fff', elevation: 3 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownItemText: { fontSize: 14, color: '#333' },
  btn: { backgroundColor: '#1B3C2A', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelText: { color: '#666', textAlign: 'center', fontWeight: '500' },
});