import { Text, TextProps } from 'react-native';
import { useThemeColor, ThemeProps } from '../hooks/useThemeColor';

export type ThemedTextProps = TextProps &
  ThemeProps & {
    variant?: 'default' | 'secondary' | 'tertiary';
  };

export function ThemedText(props: ThemedTextProps) {
  const { style, darkColor, variant = 'default', ...otherProps } = props;

  const colorName =
    variant === 'secondary' ? 'secondaryText' : variant === 'tertiary' ? 'tertiaryText' : 'text';

  const color = useThemeColor({ darkColor }, colorName);

  return <Text style={[{ color }, style]} {...otherProps} />;
}
