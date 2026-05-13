import React, { useState,useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator,KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,BackHandler } from 'react-native';
import { useRouter,useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

export default function AddRoom() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    capacity: '',
    type: 'Lecture Hall'
  });

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(admin)/rooms"); 
        return true; 
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove(); 
    }, [])
  );

  const handleSave = async () => {
    if (!form.name.trim() || !form.capacity.trim()) {
      Alert.alert("Validation", "Please enter Room Name and Capacity");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Room added successfully");
       router.replace("/(admin)/rooms");
      } else {
        Alert.alert("Error", data.message || "Failed to add room");
      }
    } catch (e) {
      Alert.alert("Connection Error", "Check server connection");
    } finally {
      setLoading(false);
    }
  };

  return (
   <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.header}>Add New Room</Text>
        
        <Text style={styles.label}>Room Name / No</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Hall 101" 
          onChangeText={(v) => setForm({...form, name: v})} 
        />

        <Text style={styles.label}>Capacity</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 100" 
          keyboardType="numeric"
          onChangeText={(v) => setForm({...form, capacity: v})} 
        />

        <Text style={styles.label}>Room Type</Text>
        <View style={styles.typeSelector}>
           {['Lecture Hall', 'Laboratory', 'seminar Room'].map((t) => (
             <TouchableOpacity 
               key={t} 
               style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
               onPress={() => setForm({...form, type: t})}
             >
               <Text style={[styles.typeBtnText, form.type === t && styles.typeBtnTextActive]}>{t}</Text>
             </TouchableOpacity>
           ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Add Room</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/(admin)/rooms")}>
          <Text style={styles.cancelLink}>Cancel</Text>
        </TouchableOpacity>
        
      </View>
    </ScrollView>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  card: { backgroundColor: '#fff', margin: 20, padding: 25, borderRadius: 15, marginTop: 60, elevation: 5 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 25, color: '#1B3C2A' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 8, marginBottom: 20, backgroundColor: '#FAFAFA' },
  typeSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  typeBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#EEE', borderRadius: 8, alignItems: 'center', marginHorizontal: 2 },
  typeBtnActive: { backgroundColor: '#1B3C2A', borderColor: '#1B3C2A' },
  typeBtnText: { fontSize: 11, color: '#666' },
  typeBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#1B3C2A', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelLink: { color: '#666', textAlign: 'center', marginTop: 20 }
});