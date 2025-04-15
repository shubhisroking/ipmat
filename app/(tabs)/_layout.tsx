import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';



export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#ffd33d',
      headerStyle: {
      backgroundColor: '#25292e',
      },
      headerShadowVisible: false,
      headerTintColor: '#fff',
      tabBarStyle: {
      backgroundColor: '#25292e',
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
