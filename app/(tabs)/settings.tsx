import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useSettingsStore } from '@/store/settingsStore';
import { ProgressGraph } from '@/components/ProgressGraph';
import { statsService, DailyStats } from '@/services/statsService';

export default function Settings() {
  const { hapticsEnabled, toggleHaptics } = useSettingsStore();
  const [weekStats, setWeekStats] = useState<DailyStats[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats>({ date: '', masteredCount: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      await statsService.init();
      setWeekStats(statsService.getWeekStats());
      setTodayStats(statsService.getTodayStats());
      setStatsLoaded(true);
    };

    loadStats();

    const unsubscribe = statsService.subscribe(() => {
      setWeekStats(statsService.getWeekStats());
      setTodayStats(statsService.getTodayStats());
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ThemedText style={styles.sectionHeader} variant="secondary">
          MASTERED WORDS
        </ThemedText>

        <ThemedView variant="secondary" style={styles.card}>
          {statsLoaded ? (
            <ProgressGraph weekStats={weekStats} todayStats={todayStats} />
          ) : (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading statistics...</ThemedText>
            </View>
          )}
        </ThemedView>

        <ThemedText style={styles.sectionHeader} variant="secondary">
          PREFERENCES
        </ThemedText>

        <ThemedView variant="secondary" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="pulse-outline" size={22} color={Colors.dark.systemBlue} />
              <ThemedText style={styles.settingText}>Haptic Feedback</ThemedText>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={toggleHaptics}
              trackColor={{ false: Colors.dark.secondaryBackground, true: Colors.dark.systemBlue }}
              thumbColor="#FFFFFF"
            />
          </View>
        </ThemedView>

        <ThemedText style={styles.sectionHeader} variant="secondary">
          ABOUT
        </ThemedText>

        <ThemedView variant="secondary" style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/help-support')}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.dark.systemBlue} />
            <ThemedText style={styles.linkText}>Help & Support</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.dark.tertiaryText}
              style={styles.chevron}
            />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: Colors.dark.separator }]} />

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/privacy-policy')}>
            <Ionicons name="document-text-outline" size={22} color={Colors.dark.systemBlue} />
            <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.dark.tertiaryText}
              style={styles.chevron}
            />
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: Colors.dark.separator }]} />

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/about')}>
            <Ionicons name="information-circle-outline" size={22} color={Colors.dark.systemBlue} />
            <ThemedText style={styles.linkText}>About</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.dark.tertiaryText}
              style={styles.chevron}
            />
          </TouchableOpacity>
        </ThemedView>

        <ThemedText style={styles.versionText} variant="tertiary">
          Version 1.0.0 • April 22, 2025
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
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 12,
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
