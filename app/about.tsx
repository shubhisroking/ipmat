import React from 'react';
import { StyleSheet, ScrollView, View, Image } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AboutScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'About',
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
          <ThemedText style={styles.title}>IPMAT Vocab</ThemedText>
          <ThemedText variant="tertiary" style={styles.version}>
            Version 1.0.0
          </ThemedText>
        </View>
        <ThemedView variant="secondary" style={styles.card}>
          <ThemedText style={styles.sectionTitle}>About this App</ThemedText>
          <ThemedText variant="secondary" style={styles.paragraph}>
            IPMAT Vocab is designed to help students master essential vocabulary for the Integrated
            Program in Management Aptitude Test (IPMAT). Our app make learning
            new words engaging and efficient.
          </ThemedText>
        </ThemedView>
        <ThemedView variant="secondary" style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
          <ThemedText style={styles.emailText}>ipmatvocab@proton.me</ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  version: {
    fontSize: 15,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 12,
  },
  emailText: {
    fontSize: 17,
    color: Colors.dark.systemBlue,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default AboutScreen;
