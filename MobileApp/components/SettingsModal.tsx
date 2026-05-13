import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, Image, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../constants/utils/constant';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const [tab, setTab] = useState<'profile' | 'security'>('profile');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [passStatus, setPassStatus] = useState<'success' | 'error' | null>(null);
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || '');
          setEmail(user.email || '');
          setProfileImage(user.profileImage || null);
        }
      } catch (e) { console.error('Error loading settings data', e); }
    };
    if (visible) loadUserData();
  }, [visible]);

  const handlePickImage = async () => {
    Alert.alert(
      "Update Profile Photo",
      "Choose a source",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
              base64: true,
            });
            if (!result.canceled) setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
              base64: true,
            });
            if (!result.canceled) setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userName,
          profileImage: profileImage
        })
      });

      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to save profile.');
      }
    } catch (e) {
      Alert.alert('Error', 'Connection error while saving profile.');
    }
  };

  const handleChangePassword = async () => {
    setPassStatus(null);
    if (!oldPass || !newPass || !confirmPass) {
      setPassStatus('error'); setPassMsg('Please fill in all fields.'); return;
    }
    if (newPass.length < 6) {
      setPassStatus('error'); setPassMsg('New password must be at least 6 characters.'); return;
    }
    if (newPass !== confirmPass) {
      setPassStatus('error'); setPassMsg('New passwords do not match.'); return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassStatus('success');
        setPassMsg('Password changed successfully!');
        setOldPass(''); setNewPass(''); setConfirmPass('');
      } else {
        setPassStatus('error');
        setPassMsg(data.message || 'Failed to change password.');
      }
    } catch {
      setPassStatus('error');
      setPassMsg('Connection error. Check your backend.');
    }
  };

  const passwordFields = [
    { label: 'Old Password',         key: 'old'     as const, val: oldPass,     set: setOldPass },
    { label: 'New Password',         key: 'new'     as const, val: newPass,     set: setNewPass },
    { label: 'Confirm New Password', key: 'confirm' as const, val: confirmPass, set: setConfirmPass },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#888" />
            </TouchableOpacity>
          </View>

          <View style={styles.tabBar}>
            {(['profile', 'security'] as const).map(t => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabItem, tab === t && styles.activeTab]}>
                <Ionicons name={t === 'profile' ? 'person-outline' : 'lock-closed-outline'} size={18} color={tab === t ? '#1a5e4d' : '#888'} />
                <Text style={[styles.tabText, tab === t && styles.activeTabText]}>{t === 'profile' ? 'Profile' : 'Security'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 30 }}>
            {tab === 'profile' ? (
              <View>
                <View style={styles.avatarSection}>
                  <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
                    {profileImage
                      ? <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                      : <Text style={styles.avatarPlaceholder}>{userName.charAt(0).toUpperCase()}</Text>
                    }
                    <View style={styles.cameraIcon}>
                      <Ionicons name="camera" size={14} color="white" />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.hintText}>Tap to change photo</Text>
                </View>

                <Text style={styles.label}>Display Name</Text>
                <TextInput style={styles.input} value={userName} onChangeText={setUserName} />

                <Text style={styles.label}>Email Address</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.sectionHint}>Choose a strong password (min 6 characters).</Text>

               
                {passStatus && (
                  <View style={[styles.statusBox, passStatus === 'success' ? styles.statusSuccess : styles.statusError]}>
                    <Ionicons name={passStatus === 'success' ? 'checkmark-circle' : 'alert-circle'} size={16} color={passStatus === 'success' ? '#1a6e1a' : '#c0392b'} />
                    <Text style={[styles.statusText, { color: passStatus === 'success' ? '#1a6e1a' : '#c0392b' }]}>{passMsg}</Text>
                  </View>
                )}

                {passwordFields.map(({ label, key, val, set }) => (
                  <View key={key}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        secureTextEntry={!showPass[key]}
                        placeholder="••••••••"
                        placeholderTextColor="#aaa"
                        value={val}
                        onChangeText={set}
                      />
                      <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPass(p => ({ ...p, [key]: !p[key] }))}>
                        <Ionicons name={showPass[key] ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                  <Text style={styles.saveButtonText}>Change Password</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginRight: 25, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#1a5e4d' },
  tabText: { marginLeft: 8, color: '#888', fontSize: 14 },
  activeTabText: { color: '#1a5e4d', fontWeight: '700' },
  body: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 25 },
  avatarWrapper: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#1a5e4d', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { color: 'white', fontSize: 30, fontWeight: '700' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1a5e4d', width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'white', justifyContent: 'center', alignItems: 'center' },
  hintText: { color: '#aaa', fontSize: 12, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14 },
  disabledInput: { backgroundColor: '#f9f9f9', color: '#999' },
  passwordContainer: { position: 'relative', justifyContent: 'center', marginBottom: 4 },
  eyeIcon: { position: 'absolute', right: 15, height: '100%', justifyContent: 'center', alignItems: 'center' },
  passwordInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, paddingRight: 45 },
  saveButton: { backgroundColor: '#1a5e4d', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 },
  saveButtonText: { color: 'white', fontWeight: '700', fontSize: 15 },
  sectionHint: { color: '#888', fontSize: 13, marginBottom: 10 },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8, marginBottom: 16 },
  statusSuccess: { backgroundColor: '#f0faf0', borderWidth: 1, borderColor: '#b2e8b2' },
  statusError: { backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#ffc0c0' },
  statusText: { fontSize: 13, flex: 1 },
});
