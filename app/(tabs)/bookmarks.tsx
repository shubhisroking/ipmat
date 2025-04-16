import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

// Dummy data for the bookmarks
const dummyBookmarks = [
  { id: '1', word: 'Ephemeral', meaning: 'Lasting for a very short time' },
  { id: '2', word: 'Ubiquitous', meaning: 'Present, appearing, or found everywhere' },
  { id: '3', word: 'Serendipity', meaning: 'The occurrence of events by chance in a happy or beneficial way' },
  { id: '4', word: 'Eloquent', meaning: 'Fluent or persuasive in speaking or writing' },
];

export default function Bookmarks() {
  const renderBookmarkItem = ({ item }: { item: typeof dummyBookmarks[0] }) => (
    <ThemedView variant="secondary" style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.wordText}>{item.word}</ThemedText>
        <Ionicons name="bookmark" size={20} color={Colors.dark.systemGreen} />
      </View>
      <ThemedText variant="secondary" style={styles.meaningText}>{item.meaning}</ThemedText>
    </ThemedView>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={60} color={Colors.dark.secondaryText} style={styles.emptyIcon} />
      <ThemedText variant="secondary" style={styles.emptyText}>No bookmarks yet</ThemedText>
      <ThemedText variant="tertiary" style={styles.emptySubText}>
        Bookmarked words will appear here
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {dummyBookmarks.length > 0 ? (
        <FlatList
          data={dummyBookmarks}
          keyExtractor={(item) => item.id}
          renderItem={renderBookmarkItem}
          contentContainerStyle={styles.listContent}
        />
      ) : renderEmptyComponent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordText: {
    fontSize: 22,
    fontWeight: '600',
  },
  meaningText: {
    fontSize: 16,
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
});
