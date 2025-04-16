import React from 'react';
import { StyleSheet, useColorScheme, View, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Settings() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.sectionHeader} variant="secondary">ABOUT</ThemedText>
        
        <ThemedView variant="secondary" style={styles.card}>
          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="help-circle-outline" size={22} color={Colors[colorScheme].systemBlue} />
            <ThemedText style={styles.linkText}>Help & Support</ThemedText>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={Colors[colorScheme].tertiaryText} 
              style={styles.chevron}
            />
          </TouchableOpacity>
          
          <View style={[styles.separator, { backgroundColor: Colors[colorScheme].separator }]} />
          
          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="document-text-outline" size={22} color={Colors[colorScheme].systemBlue} />
            <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={Colors[colorScheme].tertiaryText} 
              style={styles.chevron}
            />
          </TouchableOpacity>
          
          <View style={[styles.separator, { backgroundColor: Colors[colorScheme].separator }]} />
          
          <TouchableOpacity style={styles.linkRow}>
            <Ionicons name="information-circle-outline" size={22} color={Colors[colorScheme].systemBlue} />
            <ThemedText style={styles.linkText}>About</ThemedText>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={Colors[colorScheme].tertiaryText} 
              style={styles.chevron}
            />
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedText style={styles.versionText} variant="tertiary">
          Version 1.0.0
        </ThemedText>
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
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  linkText: {
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 12,
    flex: 1,
  },
  chevron: {
    marginLeft: 'auto',
  },
  versionText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
});
