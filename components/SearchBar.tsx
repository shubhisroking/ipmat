import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  TextInputProps,
  Modal,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface SearchFilters {
  onlyMastered?: boolean;
  onlyNotMastered?: boolean;
  onlyImportant?: boolean;
}

interface SearchBarProps extends TextInputProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

interface FilterOptionProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

const DEBOUNCE_DELAY = 300; // milliseconds

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search words...',
  showFilters = true,
  ...props
}) => {
  const [searchText, setSearchText] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const inputWidth = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const recentSearchesHeight = useRef(new Animated.Value(0)).current;

  // Load recent searches from storage on mount
  useEffect(() => {
    // Future enhancement: Load from AsyncStorage
    // For now, we'll just use an in-memory array
  }, []);

  const debouncedSearch = useCallback(
    (text: string, currentFilters?: SearchFilters) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        onSearch(text, currentFilters || filters);

        // Add to recent searches if not empty and not already in the list
        if (text && !recentSearches.includes(text)) {
          const newSearches = [text, ...recentSearches.slice(0, 4)];
          setRecentSearches(newSearches);
          // Future enhancement: Save to AsyncStorage
        }
      }, DEBOUNCE_DELAY);
    },
    [onSearch, filters, recentSearches],
  );

  const handleChangeText = useCallback(
    (text: string) => {
      setSearchText(text);
      debouncedSearch(text);

      // Show recent searches dropdown if the input is focused but empty
      const shouldShowRecent = text.length === 0 && isFocused;
      setShowRecentSearches(shouldShowRecent);

      // Animate recent searches container
      Animated.timing(recentSearchesHeight, {
        toValue: shouldShowRecent && recentSearches.length > 0 ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [debouncedSearch, isFocused, recentSearches, recentSearchesHeight],
  );

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    debouncedSearch('');

    // Animate focus back to the input
    Animated.sequence([
      Animated.timing(containerOpacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }, [debouncedSearch, containerOpacity]);

  const handleFilterPress = useCallback(() => {
    setIsFilterModalVisible(true);
  }, []);

  const handleCloseFilters = useCallback(() => {
    setIsFilterModalVisible(false);
  }, []);

  const handleFilterChange = useCallback(
    (updatedFilters: SearchFilters) => {
      setFilters(updatedFilters);
      debouncedSearch(searchText, updatedFilters);
    },
    [searchText, debouncedSearch],
  );

  const handleRecentSearchPress = useCallback(
    (search: string) => {
      setSearchText(search);
      debouncedSearch(search);
      setShowRecentSearches(false);

      // Animate recent searches container closed
      Animated.timing(recentSearchesHeight, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    },
    [debouncedSearch, recentSearchesHeight],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    const shouldShowRecent = searchText.length === 0 && recentSearches.length > 0;
    setShowRecentSearches(shouldShowRecent);

    // Animate input expansion
    Animated.timing(inputWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Animate recent searches container
    Animated.timing(recentSearchesHeight, {
      toValue: shouldShowRecent ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [searchText, recentSearches, inputWidth, recentSearchesHeight]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);

    // Animate input collapsing if empty
    if (searchText.length === 0) {
      Animated.timing(inputWidth, {
        toValue: 0.85, // Collapse to 85% of full width when not focused and empty
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    // Delay hiding recent searches to allow for clicks
    setTimeout(() => {
      setShowRecentSearches(false);
      Animated.timing(recentSearchesHeight, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }, 200);
  }, [searchText, inputWidth, recentSearchesHeight]);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}
      style={styles.keyboardAvoid}>
      <Animated.View style={[styles.animatedContainer, { opacity: containerOpacity }]}>
        <ThemedView
          variant="secondary"
          style={[styles.container, isFocused && styles.containerFocused]}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={
                isFocused || searchText.length > 0
                  ? Colors.dark.systemBlue
                  : Colors.dark.secondaryText
              }
              style={styles.searchIcon}
            />
            <Animated.View style={[styles.inputContainer, { flex: inputWidth }]}>
              <TextInput
                value={searchText}
                onChangeText={handleChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.dark.secondaryText}
                style={styles.input}
                clearButtonMode="never"
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoComplete="off"
                {...props}
              />
            </Animated.View>

            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                style={styles.clearButton}
                activeOpacity={0.7}>
                <View style={styles.clearButtonInner}>
                  <Ionicons name="close-circle" size={18} color={Colors.dark.secondaryText} />
                </View>
              </TouchableOpacity>
            )}

            {showFilters && (
              <TouchableOpacity
                onPress={handleFilterPress}
                style={styles.filterButton}
                activeOpacity={0.7}>
                <View style={styles.filterIconContainer}>
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={
                      activeFilterCount > 0 ? Colors.dark.systemBlue : Colors.dark.secondaryText
                    }
                  />
                  {activeFilterCount > 0 && (
                    <View style={styles.filterBadge}>
                      <ThemedText style={styles.filterBadgeText}>{activeFilterCount}</ThemedText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Recent searches dropdown */}
          <Animated.View
            style={[
              styles.recentSearchesContainer,
              {
                maxHeight: recentSearchesHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200], // Maximum height of recent searches container
                }),
                opacity: recentSearchesHeight,
              },
            ]}>
            {recentSearches.length > 0 && (
              <ThemedView variant="secondary" style={styles.recentSearchesContent}>
                <View style={styles.recentHeaderRow}>
                  <ThemedText variant="secondary" style={styles.recentSearchesTitle}>
                    Recent Searches
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setRecentSearches([])}
                    style={styles.clearRecentButton}>
                    <ThemedText variant="tertiary" style={styles.clearRecentText}>
                      Clear
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRecentSearchPress(search)}
                    style={styles.recentSearchItem}
                    activeOpacity={0.7}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={Colors.dark.secondaryText}
                      style={styles.recentSearchIcon}
                    />
                    <ThemedText>{search}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            )}
          </Animated.View>
        </ThemedView>
      </Animated.View>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseFilters}>
        <Pressable style={styles.modalOverlay} onPress={handleCloseFilters}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ThemedView style={styles.filtersContainer}>
              <View style={styles.filtersHeader}>
                <ThemedText style={styles.filtersTitle}>Search Filters</ThemedText>
                <TouchableOpacity onPress={handleCloseFilters} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.dark.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.filtersScrollView}>
                <FilterOption
                  label="Only Mastered Words"
                  value={filters.onlyMastered || false}
                  onToggle={() => {
                    const updated = {
                      ...filters,
                      onlyMastered: !filters.onlyMastered,
                      // Ensure mutually exclusive options
                      onlyNotMastered: filters.onlyMastered ? filters.onlyNotMastered : false,
                    };
                    handleFilterChange(updated);
                  }}
                />

                <FilterOption
                  label="Only Not Mastered Words"
                  value={filters.onlyNotMastered || false}
                  onToggle={() => {
                    const updated = {
                      ...filters,
                      onlyNotMastered: !filters.onlyNotMastered,
                      // Ensure mutually exclusive options
                      onlyMastered: filters.onlyNotMastered ? filters.onlyMastered : false,
                    };
                    handleFilterChange(updated);
                  }}
                />

                <FilterOption
                  label="Only Important Words"
                  value={filters.onlyImportant || false}
                  onToggle={() => {
                    const updated = {
                      ...filters,
                      onlyImportant: !filters.onlyImportant,
                    };
                    handleFilterChange(updated);
                  }}
                />
              </ScrollView>

              <View style={styles.filterActions}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    const emptyFilters = {};
                    setFilters(emptyFilters);
                    debouncedSearch(searchText, emptyFilters);
                  }}>
                  <ThemedText>Reset Filters</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.applyButton} onPress={handleCloseFilters}>
                  <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const FilterOption: React.FC<FilterOptionProps> = ({ label, value, onToggle }) => {
  return (
    <TouchableOpacity style={styles.filterOption} onPress={onToggle} activeOpacity={0.7}>
      <ThemedText>{label}</ThemedText>
      <Ionicons
        name={value ? 'radio-button-on' : 'radio-button-off'}
        size={24}
        color={value ? Colors.dark.systemBlue : Colors.dark.secondaryText}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    width: '100%',
    zIndex: 10,
  },
  animatedContainer: {
    width: '100%',
  },
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  containerFocused: {
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 8,
  },
  inputContainer: {
    flex: 1,
    height: '100%',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    height: '100%',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  clearButtonInner: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
  },
  filterIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.dark.systemBlue,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '50%',
  },
  filtersContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    height: '100%',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filtersScrollView: {
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 16,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.secondaryText,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.dark.systemBlue,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  recentSearchesContainer: {
    overflow: 'hidden',
  },
  recentSearchesContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentSearchesTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  clearRecentButton: {
    padding: 4,
  },
  clearRecentText: {
    fontSize: 12,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  recentSearchIcon: {
    marginRight: 8,
  },
});

export default React.memo(SearchBar);
