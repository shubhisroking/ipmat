import { Text, TextProps } from 'react-native';
import { useThemeColor, ThemeProps } from '../hooks/useThemeColor';

export type ThemedTextProps = TextProps & ThemeProps & {
  variant?: 'default' | 'secondary' | 'tertiary';
};

export function ThemedText(props: ThemedTextProps) {
  const { style, lightColor, darkColor, variant = 'default', ...otherProps } = props;
  
  // Map variant to color name
  const colorName = variant === 'secondary' 
    ? 'secondaryText' 
    : variant === 'tertiary' 
      ? 'tertiaryText' 
      : 'text';
  
  const color = useThemeColor({ lightColor, darkColor }, colorName);

  return <Text style={[{ color }, style]} {...otherProps} />;
}
