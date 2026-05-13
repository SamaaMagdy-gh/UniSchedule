import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import Sidebar from "../../components/Sidebar";
import { Ionicons } from '@expo/vector-icons';
import Chatbot from "../../components/Chatbot";

export default function AdminLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <Sidebar {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1a2e1a',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          drawerStyle: { width: 280 },
          drawerType: 'front',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Dashboard',
            title: 'Admin Dashboard',
            drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="students"
          options={{
            drawerLabel: 'Students',
            title: 'Students Management',
            drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="teachers"
          options={{
            drawerLabel: 'Teachers',
            title: 'Teachers List',
            drawerIcon: ({ color }) => <Ionicons name="school-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="admins"
          options={{
            drawerLabel: 'Admins',
            title: 'System Admins',
            drawerIcon: ({ color }) => <Ionicons name="shield-checkmark-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="courses"
          options={{
            drawerLabel: 'Course Catalog',
            title: 'Academic Courses',
            drawerIcon: ({ color }) => <Ionicons name="book-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="section-scheduling"
          options={{
            drawerLabel: 'Section Scheduling',
            title: 'Scheduling & Sections',
            drawerIcon: ({ color }) => <Ionicons name="time-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="rooms"
          options={{
            drawerLabel: 'Rooms',
            title: 'Rooms & Halls',
            drawerIcon: ({ color }) => <Ionicons name="business-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="reviews"
          options={{
            drawerLabel: 'Course Reviews',
            title: 'Student Feedback',
            drawerIcon: ({ color }) => <Ionicons name="star-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="generatetimetable"
          options={{
            drawerLabel: 'Registration Control',
            title: 'Registration Control Center',
            drawerIcon: ({ color }) => <Ionicons name="sparkles-outline" size={22} color={color} />,
          }}
        />

        
        <Drawer.Screen name="add-admin" options={{ drawerItemStyle: { display: 'none' }, title: 'Add Admin' }} />
        <Drawer.Screen name="add-student" options={{ drawerItemStyle: { display: 'none' }, title: 'Add Student' }} />
        <Drawer.Screen name="add-teacher" options={{ drawerItemStyle: { display: 'none' }, title: 'Add Teacher' }} />
        <Drawer.Screen name="add-course" options={{ drawerItemStyle: { display: 'none' }, title: 'Add Course' }} />
        <Drawer.Screen name="add-room" options={{ drawerItemStyle: { display: 'none' }, title: 'Add Room' }} />
        <Drawer.Screen name="timetable-view" options={{ drawerItemStyle: { display: 'none' }, title: 'Weekly Schedule' }} />
      </Drawer>
      <Chatbot />
    </GestureHandlerRootView>
  );
}
