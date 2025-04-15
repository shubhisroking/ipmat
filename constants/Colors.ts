/**
 * Apple-like color scheme for the app.
 * These colors follow iOS design principles with clean, minimal aesthetics.
 */

// Primary colors
const primaryLight = '#007AFF'; // iOS blue
const primaryDark = '#0A84FF'; // iOS blue (dark mode)

export const Colors = {
  light: {
    text: '#000000',
    secondaryText: '#3C3C43',
    tertiaryText: '#8E8E93',
    background: '#FFFFFF',
    secondaryBackground: '#F2F2F7',
    groupedBackground: '#F2F2F7',
    tint: primaryLight,
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryLight,
    separator: 'rgba(60, 60, 67, 0.29)',
    systemGray: '#8E8E93',
    systemRed: '#FF3B30',
    systemGreen: '#34C759',
    systemBlue: '#007AFF',
  },
  dark: {
    text: '#FFFFFF',
    secondaryText: '#EBEBF5',
    tertiaryText: '#8E8E93',
    background: '#000000',
    secondaryBackground: '#1C1C1E',
    groupedBackground: '#1C1C1E',
    tint: primaryDark,
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryDark,
    separator: 'rgba(84, 84, 88, 0.65)',
    systemGray: '#8E8E93',
    systemRed: '#FF453A',
    systemGreen: '#32D74B',
    systemBlue: '#0A84FF',  }
};
