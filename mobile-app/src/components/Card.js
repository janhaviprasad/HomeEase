import { StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants';
import { SHADOWS } from '../constants/theme';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderColor: COLORS.BORDER_SOFT,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING.cardPadding,
    ...SHADOWS.card,
  },
});
