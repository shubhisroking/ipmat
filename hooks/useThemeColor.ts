import { Colors } from '../constants/Colors';

export type ThemeProps = {
  darkColor?: string;
};

export type ColorName = keyof typeof Colors.dark;

export function useThemeColor(props: ThemeProps, colorName: ColorName) {
  const colorFromProps = props.darkColor;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors.dark[colorName];
  }
}
