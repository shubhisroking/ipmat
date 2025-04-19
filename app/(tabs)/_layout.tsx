// filepath: c:\Users\shubh\Documents\cider\ipmat\app\(tabs)\_layout.tsx
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { Platform, View } from 'react-native';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  // Preload all tab screens
  useEffect(() => {
    async function prepare() {
      try {
        // Hide splash screen after a short delay to ensure smooth transition
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 100);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        // Add smooth animation configuration
        headerStyleInterpolator: Platform.select({
          ios: undefined, // Use default on iOS
          android: ({ current, layouts }) => {
            return {
              titleStyle: {
                opacity: current.progress,
              },
            };
          },
        }),
        headerStyle: {
          backgroundColor: Colors.dark.background,
          height: 120, // Taller headers like Samsung One UI
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 28, // Larger Samsung-style title
          letterSpacing: -0.5,
          marginLeft: Platform.OS === 'ios' ? 0 : 16, // More left-aligned like Samsung
          marginBottom: 10,
          marginTop: 20, // Push text down a bit in the header
        },
        headerTitleAlign: 'left', // Left aligned titles like Samsung One UI
        headerTintColor: Colors.dark.text,
        // Custom header component to mimic Samsung One UI styling
        headerBackground: () => (
          <View 
            style={{ 
              backgroundColor: Colors.dark.background, 
              height: '100%',
              borderBottomColor: 'rgba(255, 255, 255, 0.05)',
              borderBottomWidth: 1,
            }} 
          />
        ),
        tabBarStyle: {
          backgroundColor: Colors.dark.background,
          borderTopWidth: 0, 
          elevation: 0, 
          height: 88, 
          paddingBottom: 30, 
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Words',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} color={color} size={24} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} color={color} size={24} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile', // Capitalized for consistency
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24} />
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      />
    </Tabs>
  );
}
