import React, { useState,useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,BackHandler} from 'react-native';
import { useRouter,useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/utils/constant';

export default function AddAdmin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(admin)/admins");
        return true; 
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove(); 
    }, [])
  );

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Info", "All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/add-admin`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "New Admin has been created successfully.");
        router.replace("/(admin)/admins");
      } else {
        Alert.alert("Error", data.message || "Failed to create admin.");
      }
    } catch (e) {
      Alert.alert("Network Error", "Could not reach the server. Make sure IP is correct.");
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
        <Text style={styles.header}>Add New Admin</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Admin Youssef" 
          value={name} 
          onChangeText={setName} 
        />
        
        <Text style={styles.label}>Email Address</Text>
        <TextInput 
          style={styles.input} 
          placeholder="admin@unischedule.edu" 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter secure password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry={true} 
        />

        <TouchableOpacity 
          style={[styles.btn, loading && { opacity: 0.7 }]} 
          onPress={handleSave} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Create Admin Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace("/(admin)/admins")}
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
  input: { borderWidth: 1, borderColor: '#EEE', padding: 14, borderRadius: 10, marginBottom: 20, backgroundColor: '#FAFAFA', fontSize: 16 },
  btn: { backgroundColor: '#1B3C2A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});