import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { DailyStats } from '@/services/statsService';
import { format, parseISO } from 'date-fns';
import { ThemedText } from './ThemedText';

type ProgressGraphProps = {
  weekStats: DailyStats[];
  todayStats: DailyStats;
};

export const ProgressGraph: React.FC<ProgressGraphProps> = ({ weekStats, todayStats }) => {
  const maxCount = Math.max(...weekStats.map((day) => day.masteredCount), 1);

  const todayCount = todayStats.masteredCount;
  const weekTotal = weekStats.reduce((sum, day) => sum + day.masteredCount, 0);

  const getDayLetter = (dateString: string): string => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.headerTitle}>Today</ThemedText>
          <ThemedText style={styles.headerValue}>{todayCount}</ThemedText>
        </View>
        <View>
          <ThemedText style={styles.headerTitle}>7 Days</ThemedText>
          <ThemedText style={styles.headerValue}>{weekTotal}</ThemedText>
        </View>
      </View>

      <View style={styles.graphContainer}>
        {weekStats.map((day, index) => {
          const heightPercentage = day.masteredCount > 0 ? (day.masteredCount / maxCount) * 100 : 0;

          const dayName = getDayLetter(day.date);

          const isToday = day.date === todayStats.date;

          return (
            <View key={day.date} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    { height: `${heightPercentage}%` },
                    isToday ? styles.todayBar : null,
                  ]}
                />
              </View>
              <ThemedText style={[styles.barLabel, isToday ? styles.todayLabel : null]}>
                {dayName}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  headerValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  graphContainer: {
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '50%',
    backgroundColor: Colors.dark.secondaryText,
    borderRadius: 4,
  },
  todayBar: {
    backgroundColor: Colors.dark.systemBlue,
    width: '70%',
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
  },
  todayLabel: {
    opacity: 1,
    fontWeight: 'bold',
  },
});
