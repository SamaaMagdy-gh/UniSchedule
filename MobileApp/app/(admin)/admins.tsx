// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

export default function AdminManagement() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminsRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/admins`),
        fetch(`${API_URL}/api/registration/status`),
      ]);
      const adminsData = await adminsRes.json();
      const statusData = await statusRes.json();
      if (adminsRes.ok) setAdmins(adminsData);
      setIsRegOpen(statusData.isRegistrationOpen ?? false);
    } catch (error) {
      Alert.alert('Connection Error', 'Check your IP and Server status.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  useEffect(() => {
    const backAction = () => {
      router.replace('/(admin)/dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const toggleRegistration = async () => {
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
        Alert.alert('Error', 'Action forbidden or server error.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server.');
    }
    setToggling(false);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Remove Admin', `Are you sure you want to remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/api/auth/admins/${id}`, { method: 'DELETE' });
            if (response.ok) {
              setAdmins((prev) => prev.filter((a) => a._id !== id));
              Alert.alert('Success', 'Admin removed');
            }
          } catch (e) {
            Alert.alert('Error', 'Action failed');
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#1B3C2A" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
     
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.mainTitle}>Admin Management</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>System Online</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
           <TouchableOpacity
            style={[
              styles.regToggleBtn,
              { backgroundColor: isRegOpen ? '#ffebee' : '#e8f5e8', borderColor: isRegOpen ? '#ef9a9a' : '#c8e6c9' },
              toggling && { opacity: 0.6 },
            ]}
            onPress={toggleRegistration}
            disabled={toggling}
          >
            {toggling ? (
              <ActivityIndicator size="small" color={isRegOpen ? '#c62828' : '#1a431e'} />
            ) : (
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={isRegOpen ? '#c62828' : '#1a431e'}
              />
            )}
            <Text style={[styles.regToggleText, { color: isRegOpen ? '#c62828' : '#1a431e' }]}>
              {isRegOpen ? 'Close Reg.' : 'Open Reg.'}
            </Text>
          </TouchableOpacity>

           <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(admin)/add-admin')}
          >
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

       <View style={[styles.regBanner, { backgroundColor: isRegOpen ? '#e8f5e8' : '#fff3e0' }]}>
        <Ionicons
          name={isRegOpen ? 'lock-open-outline' : 'lock-closed-outline'}
          size={16}
          color={isRegOpen ? '#2d6a2d' : '#e65100'}
        />
        <Text style={[styles.regBannerText, { color: isRegOpen ? '#2d6a2d' : '#e65100' }]}>
          Student Registration is currently {isRegOpen ? 'OPEN' : 'CLOSED'}
        </Text>
      </View>

       <FlatList
        data={admins}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.adminCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.adminName}>{item.name}</Text>
              <Text style={styles.adminEmail}>{item.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{item.role?.toUpperCase()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id, item.name)}>
              <Ionicons name="trash-outline" size={22} color="#FF4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No admins found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  pageHeader: {
    padding: 15,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  mainTitle: { fontSize: 20, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#28A745', marginRight: 5 },
  statusText: { fontSize: 11, color: '#666' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  regToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  regToggleText: { fontSize: 12, fontWeight: '600' },
  addBtn: {
    backgroundColor: '#1B3C2A',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13, flexShrink: 0 },
  regBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginTop: 12,
    borderRadius: 10,
  },
  regBannerText: { fontSize: 13, fontWeight: '600' },
  adminCard: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#1B3C2A', fontWeight: 'bold', fontSize: 16 },
  infoContainer: { flex: 1, marginLeft: 12 },
  adminName: { fontSize: 15, fontWeight: 'bold' },
  adminEmail: { fontSize: 12, color: '#666' },
  roleBadge: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  roleText: { fontSize: 10, color: '#2E7D32', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 14, marginTop: 12 },
});
