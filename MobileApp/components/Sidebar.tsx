import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsModal from './SettingsModal';

export default function Sidebar(props: any) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin User");
  const [adminProfileImage, setAdminProfileImage] = useState("");
  const [settingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.name) setAdminName(user.name);
          if (user.profileImage) setAdminProfileImage(user.profileImage);
        }
      } catch (e) {
        console.log("Error loading user data",e);
      }
    };
    getUserData();
  }, []);

  const menuItems = [
    { path: "/(admin)/dashboard", name: "Dashboard", icon: "grid-outline" },
    { path: "/(admin)/students", name: "Students", icon: "people-outline" },
    { path: "/(admin)/teachers", name: "Teachers", icon: "school-outline" },
    { path: "/(admin)/admins", name: "Admins", icon: "shield-checkmark-outline" },
    { path: "/(admin)/courses", name: "Course Catalog", icon: "book-outline" },
     { path: "/(admin)/section-scheduling", name: "Section Scheduling", icon: "calendar-outline" },
    { path: "/(admin)/rooms", name: "Rooms", icon: "business-outline" },
    { path: "/(admin)/reviews", name: "Course Reviews", icon: "star-outline" },
    { path: "/(admin)/generatetimetable", name: "Generate Timetable", icon: "sparkles-outline" },
  ];


  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      router.replace('/(auth)/login'); 
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.sidebarContainer}>
      
        <View style={styles.logoSection}>
          <View style={styles.logoIconBg}>
            <Ionicons name="school" size={24} color="#1a5e4d" />
          </View>
          <Text style={styles.logoText}>UniSchedule</Text>
        </View>

        <ScrollView style={styles.navSection} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <TouchableOpacity
                key={item.path}
                onPress={() => router.push(item.path as any)}
                style={[styles.navItem, isActive && styles.activeNavItem]}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={isActive ? "white" : "#9abeaa"} 
                />
                <Text style={[styles.navText, isActive && styles.activeNavText]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footerSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatarCircle}>
              {adminProfileImage ? (
                <Image source={{ uri: adminProfileImage }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : (
                <Text style={styles.avatarText}>{adminName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View>
              <Text style={styles.userName} numberOfLines={1}>{adminName}</Text>
              <Text style={styles.userRole}>System Administrator</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={16} color="#ff8888" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setSettingsVisible(true)} 
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={18} color="#9abeaa" />
            </TouchableOpacity>
          </View>
        </View>

        <SettingsModal 
          visible={settingsVisible} 
          onClose={() => setSettingsVisible(false)} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a5e4d",
  },
  sidebarContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  logoIconBg: {
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  navSection: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 5,
  },
  activeNavItem: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  navText: {
    color: "#9abeaa",
    fontSize: 15,
    fontWeight: "500",
  },
  activeNavText: {
    color: "white",
    fontWeight: "600",
  },
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 20,
    marginTop: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  userName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    width: 140,
  },
  userRole: {
    color: "#9abeaa",
    fontSize: 11,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  logoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "rgba(255,136,136,0.1)",
    borderRadius: 10,
  },
  logoutText: {
    color: "#ff8888",
    fontSize: 14,
    fontWeight: "600",
  },
  settingsButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
  }
});
