import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicy() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
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
          <ThemedText style={styles.sectionTitle}>IPMAT Vocab Privacy Policy</ThemedText>
          <ThemedText style={styles.lastUpdated}>Last Updated: April 22, 2025</ThemedText>

          <ThemedText variant="secondary" style={styles.paragraph}>
            Thank you for using IPMAT Vocab. This privacy policy describes our policies and
            procedures on the collection, use, and disclosure of your information.
          </ThemedText>

          <ThemedText style={styles.heading}>Information Collection</ThemedText>
          <ThemedText variant="secondary" style={styles.paragraph}>
            IPMAT Vocab does not collect, store, or transmit any personal information, usage data,
            or any other data from your device to external servers.
          </ThemedText>

          <ThemedText style={styles.heading}>Local Data Storage</ThemedText>
          <ThemedText variant="secondary" style={styles.paragraph}>
            All app data, including word lists, user preferences, and learning progress, is stored
            locally on your device using AsyncStorage. This data never leaves your device and is
            used solely to provide functionality within the app.
          </ThemedText>

          <ThemedText style={styles.heading}>Third-Party Services</ThemedText>
          <ThemedText variant="secondary" style={styles.paragraph}>
            IPMAT Vocab does not integrate with any third-party analytics, advertising, or tracking
            services. We do not share any information with third parties.
          </ThemedText>

          <ThemedText style={styles.heading}>Changes to This Policy</ThemedText>
          <ThemedText variant="secondary" style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            updating the "Last Updated" date of this policy.
          </ThemedText>

          <ThemedText style={styles.heading}>Contact Us</ThemedText>
          <ThemedText variant="secondary" style={styles.paragraph}>
            If you have any questions about this Privacy Policy, you can contact us at:
            ipmatvocab@proton.me
          </ThemedText>
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
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  lastUpdated: {
    fontSize: 14,
    color: Colors.dark.tertiaryText,
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});
