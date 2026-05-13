import { API_URL } from '../../constants/utils/constant';

import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true); 
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

 const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
       
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  console.log("Data saved successfully:", data.user.name);
  if (data.token) {
    await AsyncStorage.setItem('token', data.token);
  }
        const role = data.user?.role?.toLowerCase(); 

        if (role === 'admin') {
          router.replace("/(admin)/dashboard");
        } else if (role === 'teacher') {
          router.replace("/(teacher)");
        } else if (role === 'student') {
          router.replace("/(student)");
        } else {
          Alert.alert("Access Denied", "Account role not recognized.");
        }

      } else {
        Alert.alert("Login Failed", data.message || "Invalid email or password.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server. Please check your IP.");
    }
  };

  const handleRequestOTP = async () => {
    if (!resetEmail) return Alert.alert("Error", "Please enter your email.");
    try {
      const res = await fetch(`${API_URL}/api/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", data.message);
        setStep(2);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Server connection error.");
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) return Alert.alert("Error", "Please fill all fields.");
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", data.message);
        setIsModalOpen(false);
        setStep(1);
        setResetEmail(""); setOtp(""); setNewPassword("");
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Server connection error.");
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.leftPanel}>
            <View style={styles.brandHeader}>
              <View style={styles.logoBox}>
                <Ionicons name="calendar" size={20} color="#1a5e4d" />
              </View>
              <Text style={styles.h1}>UniSchedule</Text>
            </View>
            <Text style={styles.brandDesc}>
              An advanced Timetable Generator that eliminates scheduling
              conflicts and intelligently optimizes your academic experience.
            </Text>

            <View style={styles.featureTags}>
              <View style={styles.tag}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <Text style={styles.tagText}>Conflict-Free</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons
                  name="sync"
                  size={14}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <Text style={styles.tagText}>Real-Time Sync</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons
                  name="bulb-outline"
                  size={14}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <Text style={styles.tagText}>Smart Suggestions</Text>
              </View>
            </View>
          </View>

          <View style={styles.rightPanel}>
            <View style={styles.loginHeader}>
              <Text style={styles.h2}>Welcome back</Text>
              <Text style={styles.loginP}>
                Sign in to your account to access your timetable and manage your
                schedule.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@university.edu"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelWithLink}>
                <Text style={styles.label}>Password</Text>
               <TouchableOpacity onPress={() => setIsModalOpen(true)}>
  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
</TouchableOpacity> 
              </View>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setSecureText(!secureText)} 
                >
                  <Ionicons
                    name={secureText ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.keepSignedIn}
              onPress={() => setKeepSignedIn(!keepSignedIn)}
            >
              <Ionicons
                name={keepSignedIn ? "checkbox" : "square-outline"}
                size={20}
                color="#1a5e4d"
              />
              <Text style={styles.keepLabel}>Keep me signed in</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInBtn} onPress={handleLogin}>
              <Text style={styles.signInBtnText}>Sign In →</Text>
            </TouchableOpacity>

            <Text style={styles.requestAccess}>
             {"Don't have an account?"} 
              <Text style={styles.linkText}>Request Access</Text>
            </Text>
            <Text style={styles.termsText}>
              By signing in, you agree to our{" "}
              <Text style={styles.linkText}>Terms of Service</Text> and{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
<Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => { setIsModalOpen(false); setStep(1); }}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            {step === 1 ? (
              <View>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalSub}>Enter email to receive OTP</Text>
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="University Email" 
                  value={resetEmail} 
                  onChangeText={setResetEmail} 
                />
                <TouchableOpacity style={styles.submitBtn} onPress={handleRequestOTP}>
                  <Text style={styles.submitBtnText}>Send OTP</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.modalTitle}>Verify & Reset</Text>
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="6-digit OTP" 
                  value={otp} 
                  onChangeText={setOtp} 
                  keyboardType="number-pad"
                />
                <TextInput 
                  style={styles.modalInput} 
                  placeholder="New Password" 
                  value={newPassword} 
                  onChangeText={setNewPassword} 
                  secureTextEntry 
                />
                <TouchableOpacity style={styles.submitBtn} onPress={handleResetPassword}>
                  <Text style={styles.submitBtnText}>Confirm & Reset</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>


        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#1a5e4d" },
  leftPanel: {
    backgroundColor: "#1a5e4d",
    padding: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  brandHeader: { flexDirection: "row", alignItems: "center", gap: 15 },
  logoBox: {
    backgroundColor: "white",
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  h1: { color: "white", fontSize: 26, fontWeight: "bold" },
  brandDesc: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 20,
    lineHeight: 24,
  },
  featureTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 30,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: { color: "rgba(255, 255, 255, 0.9)", fontSize: 12 },
  rightPanel: {
    flex: 1,
    backgroundColor: "#fcfcfc",
    padding: 30,
  },
  loginHeader: { marginBottom: 30 },
  h2: { fontSize: 28, fontWeight: "700", color: "#33", marginBottom: 10 },
  loginP: { color: "#666", fontSize: 15, lineHeight: 22 },
  inputGroup: { marginBottom: 22 },
  labelWithLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },

  forgotPasswordText: {
    color: '#2d6a2d', 
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline', 
    marginTop: 5,
    textAlign: 'right', 
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  passwordWrapper: { justifyContent: "center" },
  passwordToggle: { position: "absolute", right: 15 },
  keepSignedIn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  keepLabel: { fontSize: 14, color: "#333" },
  signInBtn: {
    backgroundColor: "#1a5e4d",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  signInBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  requestAccess: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    marginTop: 10,
  },
  linkText: { color: "#1a5e4d", fontWeight: "600" },
  termsText: {
    textAlign: "center",
    fontSize: 11,
    color: "#666",
    marginTop: 30,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 20, width: '85%', elevation: 10 },
  closeBtn: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 15 },
  submitBtn: { backgroundColor: '#1a5e4d', padding: 15, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' }
});
