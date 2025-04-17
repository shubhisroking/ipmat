import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, Pressable, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useBookmarkStore } from '@/store/bookmarkStore';
import * as Haptics from 'expo-haptics';


type Word = {
  id: number | string;
  word: string;
  meaning: string;
};


const useBookmarks = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  
  return { bookmarks, removeBookmark };
};

export default function Bookmarks() {
  const { bookmarks, removeBookmark } = useBookmarks();

  const handleRemoveBookmark = useCallback((item: Word) => {
    Alert.alert(
      'Remove Bookmark',
      `Are you sure you want to remove "${item.word}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeBookmark(item.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  }, [removeBookmark]);

  const renderBookmarkItem = useCallback(({ item }: { item: Word }) => (
    <Pressable onPress={() => handleRemoveBookmark(item)}>
      <ThemedView variant="secondary" style={styles.card}>
        <View style={styles.cardHeader}>
          <ThemedText style={styles.wordText}>{item.word}</ThemedText>
          <Ionicons name="bookmark" size={20} color={Colors.dark.systemGreen} />
        </View>
        <ThemedText variant="secondary" style={styles.meaningText}>{item.meaning}</ThemedText>
      </ThemedView>
    </Pressable>
  ), [handleRemoveBookmark]);

  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={60} color={Colors.dark.secondaryText} style={styles.emptyIcon} />
      <ThemedText variant="secondary" style={styles.emptyText}>No bookmarks yet</ThemedText>
      <ThemedText variant="tertiary" style={styles.emptySubText}>
        Bookmarked words will appear here
      </ThemedText>
    </View>
  ), []);

  const keyExtractor = useCallback((item: Word) => item.id.toString(), []);

  return (
    <ThemedView style={styles.container}>
      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          keyExtractor={keyExtractor}
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
