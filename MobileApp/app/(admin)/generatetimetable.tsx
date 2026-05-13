// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/utils/constant';

export default function GenerateTimetable() {
  const router = useRouter();
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [])
  );

  useEffect(() => {
    const backAction = () => {
      router.replace('/(admin)/dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/registration/status`);
      const data = await res.json();
      setIsRegOpen(data.isRegistrationOpen ?? false);
    } catch (e) {
      Alert.alert('Connection Error', 'Could not reach server.');
    }
    setLoading(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/registration/toggle-status`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsRegOpen(data.isRegistrationOpen);
      } else {
        Alert.alert('Error', 'Action forbidden. Ensure you are logged in as Admin.');
      }
    } catch (err) {
      Alert.alert('Connection Error', 'Could not reach server.');
    }
    setToggling(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Registrations',
      'Are you sure you want to RESET ALL registrations? This will clear all student schedules and set section enrollments to zero. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setToggling(true);
            try {
              const token = await AsyncStorage.getItem('token');
              const res = await fetch(`${API_URL}/api/registration/reset`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                Alert.alert('Success', 'All registrations have been reset successfully.');
              } else {
                Alert.alert('Error', 'Failed to reset registrations.');
              }
            } catch (err) {
              Alert.alert('Connection Error', 'Could not reach server.');
            }
            setToggling(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a431e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.breadcrumb}>UniSchedule / System Settings</Text>
        <Text style={styles.title}>Registration Control Center</Text>
      </View>

      <View style={styles.mainCard}>
        <View style={[styles.iconCircle, { backgroundColor: isRegOpen ? '#e8f5e8' : '#ffebee' }]}>
          <Ionicons
            name="shield-checkmark"
            size={48}
            color={isRegOpen ? '#2d6a2d' : '#c62828'}
          />
        </View>

        <Text style={styles.gatewayTitle}>Student Registration Gateway</Text>

        <Text style={styles.gatewayDesc}>
          {isRegOpen
            ? 'The system is actively generating combinatorial schedules for students based on the Course sections configured.'
            : 'The gateway is locked. Students can view their existing registered schedules but cannot browse or register for new combinations.'}
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: isRegOpen ? '#e8f5e8' : '#ffebee' }]}>
          <View style={[styles.statusDot, { backgroundColor: isRegOpen ? '#2d6a2d' : '#c62828' }]} />
          <Text style={[styles.statusBadgeText, { color: isRegOpen ? '#2d6a2d' : '#c62828' }]}>
            {isRegOpen ? 'Gateway OPEN' : 'Gateway CLOSED'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            { backgroundColor: isRegOpen ? '#c62828' : '#1a431e' },
            toggling && { opacity: 0.7 },
          ]}
          onPress={handleToggle}
          disabled={toggling}
        >
          {toggling ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="settings-outline" size={20} color="#fff" />
          )}
          <Text style={styles.toggleBtnText}>
            {isRegOpen ? 'Close Registration Gateway' : 'Open Registration Gateway'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetBtn, toggling && { opacity: 0.7 }]}
          onPress={handleReset}
          disabled={toggling}
        >
          <Ionicons name="server-outline" size={16} color="#c62828" />
          <Text style={styles.resetBtnText}>Reset All Registrations</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIconBox}>
          <Ionicons name="server-outline" size={20} color="#2d6a2d" />
        </View>
        <Text style={styles.infoTitle}>Architecture Logic</Text>
        <Text style={styles.infoDesc}>
          The system uses a Node.js Brute-force Cartesian Product algorithm. When the gateway is OPEN, any student logging in will trigger a live calculation of all possible non-conflicting schedules based entirely on the sections configured in the Courses tab.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={[styles.infoIconBox, { backgroundColor: '#fcfdcf' }]}>
          <Ionicons name="people-outline" size={20} color="#c6a61f" />
        </View>
        <Text style={styles.infoTitle}>Seat Capacity</Text>
        <Text style={styles.infoDesc}>
          Capacities are handled automatically using MongoDB $inc validation. If a section's enrollment reaches its Max Capacity, it will instantly be excluded from any future student's possible schedule variations.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  header: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  breadcrumb: { fontSize: 12, color: '#888', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  mainCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  gatewayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  gatewayDesc: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    maxWidth: 300,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBadgeText: { fontSize: 13, fontWeight: '700' },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
    elevation: 3,
  },
  toggleBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    backgroundColor: 'rgba(255,205,210,0.1)',
    width: '100%',
  },
  resetBtnText: { color: '#c62828', fontSize: 14, fontWeight: '600' },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f7f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  infoDesc: { fontSize: 13, color: '#666', lineHeight: 20 },
});