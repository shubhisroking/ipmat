import React, { useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word, wordService } from '@/services/wordService';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Highlighter from './Highlighter';

type WordListProps = {
  words: Word[];
  onItemPress?: (word: Word) => void;
  onMasteredToggle?: (word: Word, mastered: boolean) => void;
  onImportantToggle?: (word: Word, important: boolean) => void;
  showMasteredToggle?: boolean;
  showImportantToggle?: boolean;
  searchQuery?: string;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

// Memoize the WordItem component
const WordItem = memo(
  ({
    item,
    onPress,
    onMasteredToggle,
    onImportantToggle,
    showMasteredToggle = true,
    showImportantToggle = true,
    searchQuery = '',
  }: {
    item: Word;
    onPress: (word: Word) => void;
    onMasteredToggle?: (word: Word, mastered: boolean) => void;
    onImportantToggle?: (word: Word, important: boolean) => void;
    showMasteredToggle?: boolean;
    showImportantToggle?: boolean;
    searchQuery?: string;
  }) => {
    const handleMasteredToggle = useCallback(
      (e: any) => {
        e.stopPropagation();
        if (onMasteredToggle) {
          const newMasteredState = !item.mastered;
          onMasteredToggle(item, newMasteredState);
        }
      },
      [item, onMasteredToggle],
    );

    const handleImportantToggle = useCallback(
      (e: any) => {
        e.stopPropagation();
        if (onImportantToggle) {
          const newImportantState = !item.important;
          onImportantToggle(item, newImportantState);
        }
      },
      [item, onImportantToggle],
    );

    return (
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => [pressed ? styles.itemPressed : null]}>
        <ThemedView
          variant="secondary"
          style={[
            styles.item,
            item.important ? styles.importantItem : null,
            item.mastered ? styles.masteredItem : null,
          ]}>
          <View style={styles.wordContainer}>
            <View style={styles.wordHeader}>
              <Highlighter
                text={item.word}
                searchQuery={searchQuery}
                textStyle={styles.wordText}
                highlightStyle={styles.highlight}
              />
              <View style={styles.buttonContainer}>
                {showImportantToggle && (
                  <Pressable
                    onPress={handleImportantToggle}
                    style={[
                      styles.iconButton,
                      styles.importantButton,
                      item.important ? styles.importantActive : null,
                    ]}
                    hitSlop={12}>
                    <Ionicons
                      name={item.important ? 'star' : 'star-outline'}
                      size={24}
                      color={item.important ? Colors.dark.systemYellow : Colors.dark.secondaryText}
                    />
                  </Pressable>
                )}
                {showMasteredToggle && (
                  <Pressable
                    onPress={handleMasteredToggle}
                    style={[
                      styles.iconButton,
                      styles.masteredButton,
                      item.mastered ? styles.masteredActive : null,
                    ]}
                    hitSlop={12}>
                    <Ionicons
                      name={item.mastered ? 'radio-button-on' : 'radio-button-off'}
                      size={24}
                      color={item.mastered ? Colors.dark.systemGreen : Colors.dark.secondaryText}
                    />
                  </Pressable>
                )}
              </View>
            </View>
            <View style={styles.divider} />
            <Highlighter
              text={item.meaning}
              searchQuery={searchQuery}
              textStyle={styles.meaningText}
              highlightStyle={styles.highlight}
              variant="secondary"
            />
          </View>
        </ThemedView>
      </Pressable>
    );
  },
);

const WordList: React.FC<WordListProps> = ({
  words,
  onItemPress,
  onMasteredToggle,
  onImportantToggle,
  showMasteredToggle = true,
  showImportantToggle = true,
  searchQuery = '',
  onScroll,
}) => {
  const handlePressItem = useCallback(
    (word: Word) => {
      onItemPress?.(word);
    },
    [onItemPress],
  );

  const handleMasteredToggle = useCallback(
    (word: Word, mastered: boolean) => {
      onMasteredToggle?.(word, mastered);
    },
    [onMasteredToggle],
  );

  const handleImportantToggle = useCallback(
    (word: Word, important: boolean) => {
      onImportantToggle?.(word, important);
    },
    [onImportantToggle],
  );

  const renderItem = useCallback(
    ({ item }: { item: Word }) => {
      return (
        <WordItem
          item={item}
          onPress={handlePressItem}
          onMasteredToggle={handleMasteredToggle}
          onImportantToggle={handleImportantToggle}
          showMasteredToggle={showMasteredToggle}
          showImportantToggle={showImportantToggle}
          searchQuery={searchQuery}
        />
      );
    },
    [
      handlePressItem,
      handleMasteredToggle,
      handleImportantToggle,
      showMasteredToggle,
      showImportantToggle,
      searchQuery,
    ],
  );

  const keyExtractor = useCallback((item: Word) => item.id.toString(), []);

  const emptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="search-outline"
            size={70}
            color={Colors.dark.secondaryText}
            style={styles.emptyIcon}
          />
        </View>
        <ThemedText style={styles.emptyText}>No matching words found</ThemedText>
        <ThemedText variant="tertiary" style={styles.emptySubText}>
          Try a different search term or filter
        </ThemedText>
      </View>
    ),
    [],
  );

  return (
    <FlatList
      data={words}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={emptyComponent}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      bounces={true}
      overScrollMode="always"
      ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  item: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  importantItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.systemYellow,
  },
  masteredItem: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.systemGreen,
  },
  wordContainer: {
    marginBottom: 0,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  wordText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  meaningText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.dark.secondaryText,
    marginTop: 4,
  },
  highlight: {
    backgroundColor: 'rgba(255, 204, 0, 0.35)',
    color: '#FFCC00',
    borderRadius: 3,
    paddingHorizontal: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    borderRadius: 20,
  },
  masteredButton: {
    marginLeft: 8,
  },
  importantButton: {
    marginLeft: 8,
  },
  masteredActive: {
    backgroundColor: 'rgba(50, 215, 75, 0.15)',
  },
  importantActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: '90%',
    color: Colors.dark.tertiaryText,
  },
});

export default memo(WordList);
