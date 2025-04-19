import { View, ViewProps } from 'react-native';
import { useThemeColor, ThemeProps } from '../hooks/useThemeColor';

export type ThemedViewProps = ViewProps &
  ThemeProps & {
    variant?: 'default' | 'secondary' | 'grouped';
  };

export function ThemedView(props: ThemedViewProps) {
  const { style, darkColor, variant = 'default', ...otherProps } = props;

  const colorName =
    variant === 'secondary'
      ? 'secondaryBackground'
      : variant === 'grouped'
        ? 'groupedBackground'
        : 'background';

  const backgroundColor = useThemeColor({ darkColor }, colorName);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
