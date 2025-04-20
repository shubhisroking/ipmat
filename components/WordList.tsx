import React, { useCallback, memo } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Word, wordService } from '@/services/wordService';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type WordListProps = {
  words: Word[];
  onItemPress?: (word: Word) => void;
  onMasteredToggle?: (word: Word, mastered: boolean) => void;
  showMasteredToggle?: boolean;
};

// Memoize the WordItem component
const WordItem = memo(({ 
  item, 
  onPress,
  onMasteredToggle,
  showMasteredToggle = true
}: { 
  item: Word; 
  onPress: (word: Word) => void;
  onMasteredToggle?: (word: Word, mastered: boolean) => void;
  showMasteredToggle?: boolean;
}) => {
  const handleMasteredToggle = useCallback((e: any) => {
    e.stopPropagation();
    if (onMasteredToggle) {
      const newMasteredState = !item.mastered;
      onMasteredToggle(item, newMasteredState);
    }
  }, [item, onMasteredToggle]);

  return (
    <Pressable onPress={() => onPress(item)}>
      <ThemedView variant="secondary" style={styles.item}>
        <View style={styles.wordContainer}>
          <View style={styles.wordHeader}>
            <ThemedText style={styles.wordText}>{item.word}</ThemedText>
            {showMasteredToggle && (
              <Pressable 
                onPress={handleMasteredToggle}
                style={styles.masteredButton}
                hitSlop={10}
              >
                <Ionicons
                  name={item.mastered ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={item.mastered ? Colors.dark.systemGreen : Colors.dark.secondaryText}
                />
              </Pressable>
            )}
          </View>
          <ThemedText variant="secondary" style={styles.meaningText}>
            {item.meaning}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
});

const WordList: React.FC<WordListProps> = ({ 
  words, 
  onItemPress,
  onMasteredToggle,
  showMasteredToggle = true
}) => {
  const handlePressItem = useCallback((word: Word) => {
    onItemPress?.(word);
  }, [onItemPress]);

  const handleMasteredToggle = useCallback((word: Word, mastered: boolean) => {
    onMasteredToggle?.(word, mastered);
  }, [onMasteredToggle]);

  const renderItem = useCallback(({ item }: { item: Word }) => {
    return (
      <WordItem 
        item={item}
        onPress={handlePressItem}
        onMasteredToggle={handleMasteredToggle}
        showMasteredToggle={showMasteredToggle}
      />
    );
  }, [handlePressItem, handleMasteredToggle, showMasteredToggle]);

  const keyExtractor = useCallback((item: Word) => item.id.toString(), []);

  const emptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="book-outline"
        size={60}
        color={Colors.dark.secondaryText}
        style={styles.emptyIcon}
      />
      <ThemedText variant="secondary" style={styles.emptyText}>
        No words available
      </ThemedText>
      <ThemedText variant="tertiary" style={styles.emptySubText}>
        Try refreshing or check back later
      </ThemedText>
    </View>
  ), []);

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
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  item: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  wordContainer: {
    marginBottom: 10,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  wordText: {
    fontSize: 22,
    fontWeight: '600',
  },
  meaningText: {
    fontSize: 16,
    lineHeight: 22,
  },
  masteredButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 300,
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

export default memo(WordList); 