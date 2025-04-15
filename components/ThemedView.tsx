import { View, ViewProps } from 'react-native';
import { useThemeColor, ThemeProps } from '../hooks/useThemeColor';

export type ThemedViewProps = ViewProps & ThemeProps & {
  variant?: 'default' | 'secondary' | 'grouped';
};

export function ThemedView(props: ThemedViewProps) {
  const { style, lightColor, darkColor, variant = 'default', ...otherProps } = props;
  
  // Map variant to color name
  const colorName = variant === 'secondary' 
    ? 'secondaryBackground'
    : variant === 'grouped'
      ? 'groupedBackground'
      : 'background';
  
  const backgroundColor = useThemeColor({ lightColor, darkColor }, colorName);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
