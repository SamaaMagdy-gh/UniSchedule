import React, { useState,useCallback ,useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator ,BackHandler} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter,useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

export default function RoomManagement() {
  const router = useRouter();
  
  const [rooms, setRooms] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/rooms`);
      const data = await response.json();
      if (response.ok) {
        setRooms(data);
      } else {
        Alert.alert("Error", "Failed to fetch rooms");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Check server connection");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
    fetchRooms();
  }, []));

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Room", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/api/rooms/${id}`, { method: "DELETE" });
            if (response.ok) {
              setRooms(prev => prev.filter(r => r._id !== id));
            }
          } catch (e) { 
            Alert.alert("Error", "Delete failed"); 
          }
        }
      }
    ]);
  };

  useEffect(() => {
    const backAction = () => {
      router.replace("/(admin)/dashboard"); 
      return true; 
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#1B3C2A" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Room Management</Text>
          <Text style={styles.subtitle}>Manage lecture halls and labs</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/(admin)/add-room")}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Add Room</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms} 
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
             <View style={styles.iconContainer}>
                <Ionicons name="business-outline" size={24} color="#1B3C2A" />
             </View>
            <View style={styles.info}>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.details}>{item.type} • {item.capacity} Seats</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id, item.name)}>
              <Ionicons name="trash-outline" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 12, color: '#666' },
  addBtn: { backgroundColor: '#1B3C2A', flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, alignItems: 'center', elevation: 2 },
  iconContainer: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#F0F4F2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  info: { flex: 1 },
  roomName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  details: { fontSize: 13, color: '#777', marginTop: 4 }
});