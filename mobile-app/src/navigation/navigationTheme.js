import { DefaultTheme } from '@react-navigation/native';
import { COLORS } from '../constants';

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.BG_CANVAS,
    border: COLORS.BORDER_SOFT,
    card: COLORS.BG_CARD,
    primary: COLORS.ACCENT,
    text: COLORS.TEXT_PRIMARY,
  },
};
