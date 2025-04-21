import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HelpAndSupport() {
  const insets = useSafeAreaInsets();

  const handleContactEmail = () => {
    Linking.openURL('mailto:ipmatvocab@proton.me?subject=IPMAT%20Vocab%20Help%20Request');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Help & Support',
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
        <ThemedView variant="secondary" style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>
          
          <ThemedText style={styles.question}>How do I mark a word as mastered?</ThemedText>
          <ThemedText variant="secondary" style={styles.answer}>
            Tap the circle icon next to any word in the list to toggle its mastered status. 
            A green circle indicates that the word has been mastered.
          </ThemedText>
          
          <ThemedText style={styles.question}>How do I mark a word as important?</ThemedText>
          <ThemedText variant="secondary" style={styles.answer}>
            Tap the star icon next to any word in the list to mark it as important. 
            A yellow star indicates that the word has been marked as important.
          </ThemedText>
          
          <ThemedText style={styles.question}>How do I filter the word list?</ThemedText>
          <ThemedText variant="secondary" style={styles.answer}>
            Tap the filter icon in the search bar to open the filter options. You can filter by 
            mastered status or importance.
          </ThemedText>
          
          <ThemedText style={styles.question}>How do I search for specific words?</ThemedText>
          <ThemedText variant="secondary" style={styles.answer}>
            Use the search bar at the top of the word list to search for specific words or meanings. 
            Results will update as you type.
          </ThemedText>
          
          <ThemedText style={styles.question}>Is my progress saved?</ThemedText>
          <ThemedText variant="secondary" style={styles.answer}>
            Yes, all your progress, including mastered words and important words, is automatically saved 
            to your device and will be available the next time you open the app.
          </ThemedText>
          
          <ThemedText style={styles.question}>How do I disable haptic feedback?</ThemedText>
          <ThemedText variant="secondary" style={styles.answer}>
            You can toggle haptic feedback on/off in the Settings tab under Preferences.
          </ThemedText>
        </ThemedView>

        <ThemedView variant="secondary" style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Contact Support</ThemedText>
          <ThemedText variant="secondary" style={styles.paragraph}>
            Having trouble or found a bug? Our support team is ready to help you.
          </ThemedText>
          
          <TouchableOpacity style={styles.contactButton} onPress={handleContactEmail}>
            <Ionicons name="mail" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>Email Support</ThemedText>
          </TouchableOpacity>
          
          <ThemedText variant="tertiary" style={styles.supportNote}>
            We typically respond to all inquiries within 24-48 hours.
          </ThemedText>
        </ThemedView>

        <ThemedView variant="secondary" style={styles.card}>
          <ThemedText style={styles.sectionTitle}>App Information</ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Version:</ThemedText>
            <ThemedText variant="secondary">1.0.0</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Last Updated:</ThemedText>
            <ThemedText variant="secondary">April 22, 2025</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Platform:</ThemedText>
            <ThemedText variant="secondary">iOS & Android</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    color: Colors.dark.systemBlue,
  },
  answer: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  contactButton: {
    backgroundColor: Colors.dark.systemBlue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  supportNote: {
    textAlign: 'center',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: '600',
    marginRight: 8,
    width: 120,
  },
});
