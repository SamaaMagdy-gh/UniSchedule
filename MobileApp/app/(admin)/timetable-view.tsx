import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, BackHandler 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_URL = "https://unischedule2-production.up.railway.app"; 

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableView() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const backAction = () => {
      router.replace("/dashboard");
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    fetchDailySchedule();
  }, [selectedDay]);

  const fetchDailySchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/timetable?day=${selectedDay}`);
      const data = await response.json();
      
      if (response.ok) {
        setSchedule(data);
      } else {
        setSchedule([]);
      }
    } catch (error) {
      setSchedule([
        { id: 1, time: "08:00 - 09:30", course: "Software Lab", room: "Lab 4", instructor: "Admin Team", type: "Lab" },
        { id: 2, time: "10:00 - 11:30", course: "Linear Algebra", room: "Hall 2", instructor: "Math Dept", type: "Lecture" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/dashboard")} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2d6a2d" />
        </TouchableOpacity>
        <Text style={styles.title}>Weekly Schedule</Text>
      </View>

      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.daysScroll}
        >
          {days.map((day) => (
            <TouchableOpacity 
              key={day} 
              onPress={() => setSelectedDay(day)}
              style={[styles.dayTab, selectedDay === day && styles.dayTabActive]}
            >
              <Text style={[styles.dayTabText, selectedDay === day && styles.dayTabTextActive]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#2d6a2d" style={{ marginTop: 50 }} />
        ) : schedule.length > 0 ? (
          schedule.map((item) => (
            <View key={item.id} style={styles.sessionCard}>
              <View style={styles.timeSection}>
                <Ionicons name="time-outline" size={16} color="#2d6a2d" />
                <Text style={styles.timeText}>{item.time}</Text>
                <View style={styles.typeBadge}>
                   <Text style={styles.typeText}>{item.type}</Text>
                </View>
              </View>
              
              <View style={styles.infoSection}>
                <Text style={styles.courseName}>{item.course}</Text>
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="business-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{item.room}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="person-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{item.instructor}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No lectures scheduled for {selectedDay}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 15 },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#E8F5E8' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a431e' },
  daysScroll: { paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff' },
  dayTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10, backgroundColor: '#F0F0F0' },
  dayTabActive: { backgroundColor: '#2d6a2d' },
  dayTabText: { color: '#666', fontWeight: 'bold' },
  dayTabTextActive: { color: '#fff' },
  listContent: { padding: 20 },
  sessionCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, borderLeftWidth: 5, borderLeftColor: '#2d6a2d' },
  timeSection: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  timeText: { fontSize: 13, fontWeight: 'bold', color: '#2d6a2d', flex: 1 },
  typeBadge: { backgroundColor: '#E8F5E8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  typeText: { fontSize: 11, color: '#2d6a2d', fontWeight: 'bold' },
  infoSection: { marginTop: 5 },
  courseName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  detailsRow: { flexDirection: 'row', gap: 15, marginTop: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 13, color: '#666' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 }
});
