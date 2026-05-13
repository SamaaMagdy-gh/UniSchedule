import React, { useState,useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator ,KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,BackHandler} from 'react-native';
import { useRouter,useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

export default function AddTeacher() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tid, setTid] = useState('');
  const [dept, setDept] = useState('Computer Science');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(admin)/teachers"); 
        return true; 
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove(); 
    }, [])
  );

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !tid.trim()) {
      Alert.alert("Required Fields", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/teachers`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          name, 
          email, 
          teacherId: tid, 
          department: dept, 
          status: "Active" 
        }),
      });

      const responseText = await response.text();
      let data = JSON.parse(responseText);

      if (response.ok) {
        Alert.alert("Success", "Teacher added successfully.");
        router.replace("/(admin)/teachers"); 
      } else {
        Alert.alert("Error", data.message || "Failed to add teacher.");
      }
    } catch (e) {
      Alert.alert("Connection Error", "Check your server connection.");
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
      <View style={styles.formCard}>
        <Text style={styles.header}>Add New Teacher</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="e.g. Dr. Ahmed" value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} placeholder="teacher@university.edu" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        
        <Text style={styles.label}>Teacher ID</Text>
        <TextInput style={styles.input} placeholder="e.g. 112233" value={tid} onChangeText={setTid} keyboardType="numeric" />

        <Text style={styles.label}>Department</Text>
        <TextInput style={styles.input} value={dept} onChangeText={setDept} />

        <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add Teacher</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace("/(admin)/teachers")}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: '#666', textAlign: 'center', fontWeight: '500' }}>Cancel</Text>
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
  label: { fontWeight: 'bold', marginBottom: 8, color: '#444', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 14, borderRadius: 10, marginBottom: 20, backgroundColor: '#FAFAFA' },
  btn: { backgroundColor: '#1B3C2A', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});