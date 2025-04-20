import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Pressable, 
  Platform, 
  KeyboardAvoidingView, 
  TextInputProps
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import { ThemedView } from './ThemedView';

interface SearchBarProps extends TextInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = 'Search words...', 
  ...props 
}) => {
  const [searchText, setSearchText] = useState('');

  const handleChangeText = useCallback((text: string) => {
    setSearchText(text);
    onSearch(text);
  }, [onSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    onSearch('');
  }, [onSearch]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}
      style={styles.keyboardAvoid}
    >
      <ThemedView variant="secondary" style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color={Colors.dark.secondaryText} 
            style={styles.searchIcon} 
          />
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
            {...props}
          />
          {searchText.length > 0 && (
            <Pressable 
              onPress={handleClearSearch}
              style={({ pressed }) => [
                styles.clearButton,
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Ionicons 
                name="close-circle" 
                size={18} 
                color={Colors.dark.secondaryText} 
              />
            </Pressable>
          )}
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    width: '100%',
  },
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    height: '100%',
  },
  clearButton: {
    padding: 8,
  },
});

export default React.memo(SearchBar); 