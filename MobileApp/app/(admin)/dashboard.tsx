 import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashboardCard from '../../components/DashboardCard'; 
import { API_URL } from '../../constants/utils/constant';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({ students: 0, teachers: 0, rooms: 0, courses: 0, reviews: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
const fetchStats = async () => {
  try {
    setLoading(true);
    
    const [resStudents, resTeachers, resCourses, resRooms, resReviews] = await Promise.all([
      fetch(`${API_URL}/api/students`),
      fetch(`${API_URL}/api/teachers`),
      fetch(`${API_URL}/api/courses`),
      fetch(`${API_URL}/api/rooms`),
      fetch(`${API_URL}/api/reviews/all`)
    ]);

    const students = await resStudents.json();
    const teachers = await resTeachers.json();
    const courses = await resCourses.json();
    const rooms = await resRooms.json();
    const reviews = await resReviews.json();

    setStats({
      students: Array.isArray(students) ? students.length : 0,
      teachers: Array.isArray(teachers) ? teachers.length : 0,
      rooms: Array.isArray(rooms) ? rooms.length : 0,
      courses: Array.isArray(courses) ? courses.length : 0,
      reviews: Array.isArray(reviews) ? reviews.length : 0
    });

    const combined: any[] = [
      ...(Array.isArray(students) ? students.map((s: any) => ({ name: s.name, dept: s.department || "N/A", type: "student", date: new Date(s.createdAt || Date.now()) })) : []),
      ...(Array.isArray(teachers) ? teachers.map((t: any) => ({ name: t.name, dept: t.department || "N/A", type: "teacher", date: new Date(t.createdAt || Date.now()) })) : []),
      ...(Array.isArray(courses) ? courses.map((c: any) => ({ name: c.name, dept: c.department || "N/A", type: "course", date: new Date(c.createdAt || Date.now()) })) : []),
      ...(Array.isArray(rooms) ? rooms.map((r: any) => ({ name: r.name, dept: "System", type: "room", date: new Date(r.createdAt || Date.now()) })) : [])
    ];

    combined.sort((a, b) => b.date.getTime() - a.date.getTime());
    setRecentActivity(combined.slice(0, 5));
    
  } catch (error) {
    console.error("Dashboard sync error:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={[styles.dashboardWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2d6a2d" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.dashboardWrapper}>
      

      <View style={styles.statsContainer}>
        <DashboardCard label="Total Students" value={stats.students} iconName="people" color="#2d6a2d" />
        <DashboardCard label="Total Instructors" value={stats.teachers} iconName="school" color="#1a2e1a" />
        <DashboardCard label="Total Rooms" value={stats.rooms} iconName="business" color="#4a7c4a" />
        <DashboardCard label="Total Courses" value={stats.courses} iconName="book" color="#2d6a2d" />
        <DashboardCard label="Course Reviews" value={stats.reviews} iconName="star" color="#c6a61f" />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
        </View>

        {recentActivity.length === 0 ? (
          <Text style={styles.emptyText}>No activity yet.</Text>
        ) : (
          recentActivity.map((item: any, i: number) => (
            <View key={i} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  New {item.type} <Text style={styles.boldText}>{item.name}</Text> was added to <Text style={styles.boldText}>{item.dept}</Text>
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dashboardWrapper: { flex: 1, backgroundColor: '#f5f7f5', paddingHorizontal: 20, 
    paddingTop: 10 },
  dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  statusText: { color: '#2d6a2d', fontSize: 13, marginTop: 4 },
  refreshButton: { padding: 8, backgroundColor: '#fff', borderRadius: 50, elevation: 2 },
  statsContainer: { marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#eee', marginBottom: 20 },
  cardHeader: { marginBottom: 15 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2d6a2d', marginRight: 12 },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 14, color: '#444', lineHeight: 20 },
  boldText: { fontWeight: 'bold', color: '#000' },
  emptyText: { textAlign: 'center', padding: 20, color: '#aaa' }
});