import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        
        <Stack.Screen name="(auth)/login" /> 
        
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(student)/index" />
        <Stack.Screen name="(teacher)/index" />
      </Stack>
    </>
  );
}