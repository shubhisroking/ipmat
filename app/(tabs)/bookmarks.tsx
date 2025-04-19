import React, { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
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

// Simplified selectors
const useBookmarksData = () => {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const isLoading = useBookmarkStore((state) => state.isLoading);
  const loadingError = useBookmarkStore((state) => state.loadingError);
  const retryLoading = useBookmarkStore((state) => state.retryLoading);

  return {
    bookmarks,
    removeBookmark,
    isLoading,
    loadingError,
    retryLoading,
  };
};

// Make sure this component is properly exported
export default function Bookmarks() {
  const { bookmarks, removeBookmark, isLoading, loadingError, retryLoading } = useBookmarksData();

  // Force load on first visit or when returning to tab
  useEffect(() => {
    if (!isLoading && bookmarks.length === 0 && !loadingError) {
      retryLoading();
    }
  }, []);

  // Handle bookmark removal
  const handleRemoveBookmark = useCallback(
    (item: Word) => {
      Alert.alert('Remove Bookmark', `Are you sure you want to remove "${item.word}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeBookmark(item.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]);
    },
    [removeBookmark],
  );

  // Render individual bookmark item
  const renderBookmarkItem = useCallback(
    ({ item }: { item: Word }) => (
      <Pressable onPress={() => handleRemoveBookmark(item)}>
        <ThemedView variant="secondary" style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.wordText}>{item.word}</ThemedText>
            <Ionicons name="bookmark" size={20} color={Colors.dark.systemGreen} />
          </View>
          <ThemedText variant="secondary" style={styles.meaningText}>
            {item.meaning}
          </ThemedText>
        </ThemedView>
      </Pressable>
    ),
    [handleRemoveBookmark],
  );

  // Render empty component (loading, error, or no bookmarks)
  const renderEmptyComponent = useCallback(() => {
    // Show loading spinner
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.dark.systemBlue} />
          <ThemedText variant="secondary" style={[styles.emptyText, { marginTop: 16 }]}>
            Loading bookmarks...
          </ThemedText>
        </View>
      );
    }

    // Show error state if there was a loading error
    if (loadingError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={Colors.dark.systemRed}
            style={styles.emptyIcon}
          />
          <ThemedText variant="secondary" style={styles.emptyText}>
            Error loading bookmarks
          </ThemedText>
          <ThemedText variant="tertiary" style={styles.emptySubText}>
            {loadingError || 'Something went wrong'}
          </ThemedText>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              retryLoading();
            }}>
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </Pressable>
        </View>
      );
    }

    // Default empty state (no bookmarks yet)
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="bookmark-outline"
          size={60}
          color={Colors.dark.secondaryText}
          style={styles.emptyIcon}
        />
        <ThemedText variant="secondary" style={styles.emptyText}>
          No bookmarks yet
        </ThemedText>
        <ThemedText variant="tertiary" style={styles.emptySubText}>
          Bookmarked words will appear here
        </ThemedText>
      </View>
    );
  }, [isLoading, loadingError, retryLoading]);

  // Extract key for FlatList
  const keyExtractor = useCallback((item: Word) => item.id.toString(), []);

  // Pull-to-refresh functionality
  const handleRefresh = useCallback(() => {
    retryLoading();
  }, [retryLoading]);

  return (
    <ThemedView style={styles.container}>
      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          keyExtractor={keyExtractor}
          renderItem={renderBookmarkItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={Colors.dark.systemBlue}
              colors={[Colors.dark.systemBlue]}
            />
          }
        />
      ) : (
        renderEmptyComponent()
      )}
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
  retryButton: {
    backgroundColor: Colors.dark.systemBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
