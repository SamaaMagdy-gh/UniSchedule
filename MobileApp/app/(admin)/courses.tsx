import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

interface Course {
  _id: string;
  name: string;
  code: string;
  department: string;
  academicYear?: string;
  major?: string;
  creditHours?: number;
  status: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Active:   { bg: '#e8f5e8', text: '#2d6a2d' },
  Inactive: { bg: '#f5f5f5', text: '#888' },
  Pending:  { bg: '#fff8e1', text: '#b8860b' },
};

export default function CourseManagement() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/courses`);
      const data = await response.json();
      if (response.ok) setCourses(data);
    } catch (error) {
      Alert.alert('Error', 'Check server connection');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchCourses(); }, []));

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(admin)/dashboard');
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/api/courses/${id}`, { method: 'DELETE' });
            if (response.ok) {
              setCourses(prev => prev.filter(c => c._id !== id));
              Alert.alert('Success', 'Course deleted');
            }
          } catch (e) { Alert.alert('Error', 'Delete failed'); }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#1B3C2A" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.mainTitle}>Course Catalog</Text>
          <Text style={styles.subTitle}>Manage academic records</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(admin)/add-course' as any)}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Course</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => {
          const sc = statusColors[item.status] || { bg: '#f5f5f5', text: '#888' };
          return (
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Ionicons name="book" size={22} color="#1B3C2A" />
              </View>
              <View style={styles.info}>
                <Text style={styles.courseTitle}>{item.name}</Text>
                <Text style={styles.deptText}>{item.department}</Text>
                <View style={styles.tagsRow}>
                  {item.academicYear ? (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.academicYear}</Text>
                    </View>
                  ) : null}
                  {item.major ? (
                    <View style={[styles.tag, { backgroundColor: '#e8f0ff' }]}>
                      <Text style={[styles.tagText, { color: '#3366cc' }]}>{item.major}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={styles.rightSide}>
                <Text style={styles.codeText}>{item.code}</Text>
                {item.creditHours ? (
                  <View style={styles.creditBadge}>
                    <Text style={styles.creditText}>{item.creditHours} hrs</Text>
                  </View>
                ) : null}
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={{ marginTop: 6 }}>
                  <Ionicons name="trash-outline" size={20} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  pageHeader: { padding: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  mainTitle: { fontSize: 20, fontWeight: 'bold' },
  subTitle: { fontSize: 11, color: '#666' },
  addBtn: { backgroundColor: '#1B3C2A', padding: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 4 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'flex-start', elevation: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F0F4F2', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  info: { flex: 1, marginLeft: 12 },
  courseTitle: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  deptText: { fontSize: 12, color: '#888', marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: { backgroundColor: '#e8f5e8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagText: { fontSize: 11, color: '#2d6a2d', fontWeight: '600' },
  rightSide: { alignItems: 'flex-end', minWidth: 70 },
  codeText: { fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 4 },
  creditBadge: { backgroundColor: '#e8f5e8', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginBottom: 4 },
  creditText: { fontSize: 11, color: '#2d6a2d', fontWeight: '700' },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
});