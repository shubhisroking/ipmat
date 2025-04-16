import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            headerTitle: 'Not Found',
            headerLargeTitleShadowVisible: false,
            headerTitleStyle: {
              fontWeight: '600'
            }
          }} 
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
