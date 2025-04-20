import React, { useMemo } from 'react';
import { Text, TextStyle, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface HighlighterProps {
  text: string;
  searchQuery: string;
  textStyle?: TextStyle;
  highlightStyle?: TextStyle;
  variant?: 'secondary' | 'tertiary' | 'default';
}

const Highlighter: React.FC<HighlighterProps> = ({
  text,
  searchQuery,
  textStyle,
  highlightStyle,
  variant
}) => {
  const parts = useMemo(() => {
    if (!searchQuery.trim()) {
      return [{ text, highlight: false }];
    }

    try {
      const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
      const parts = text.split(regex);
      return parts.map(part => ({
        text: part,
        highlight: part.toLowerCase() === searchQuery.toLowerCase()
      }));
    } catch (error) {
      // If there's an error with the regex (e.g., invalid search query with special chars)
      // Just return the original text without highlighting
      return [{ text, highlight: false }];
    }
  }, [text, searchQuery]);

  return (
    <ThemedText variant={variant} style={textStyle}>
      {parts.map((part, i) => (
        part.highlight ? (
          <Text key={i} style={highlightStyle}>
            {part.text}
          </Text>
        ) : (
          part.text
        )
      ))}
    </ThemedText>
  );
};

export default React.memo(Highlighter); 