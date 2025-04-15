import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme].tint,
      headerStyle: {
      backgroundColor: Colors[colorScheme].background,
      },
      headerShadowVisible: false,
      headerTintColor: Colors[colorScheme].text,
      tabBarStyle: {
      backgroundColor: Colors[colorScheme].background,
      },
    }}
    >
      <Tabs.Screen
      name="index"
      options={{
        title: 'Words',
        tabBarIcon: ({ color, focused }) => (
        <Ionicons name={focused ? 'book-sharp' : 'book-outline'} color={color} size={24} />
        ),
      }}
      />
      <Tabs.Screen
      name="settings"
      options={{
        title: 'settings',
        tabBarIcon: ({ color, focused }) => (
        <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} color={color} size={24}/>
        ),
      }}
      />
    </Tabs>
  );
}
