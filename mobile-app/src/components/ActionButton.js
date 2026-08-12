import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, RADIUS, SIZES, SPACING, TYPOGRAPHY } from '../constants';

const VARIANTS = {
  secondary: {
    borderColor: COLORS.ACCENT,
    textColor: COLORS.ACCENT,
  },
  destructive: {
    borderColor: COLORS.ERROR,
    textColor: COLORS.ERROR,
  },
};

export default function ActionButton({
  title,
  onPress,
  disabled = false,
  variant = 'secondary',
  style,
}) {
  const colors = VARIANTS[variant] || VARIANTS.secondary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.borderColor },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: SIZES.buttonHeight,
    paddingHorizontal: SPACING.cardPadding,
    paddingVertical: SPACING.buttonV,
  },
  pressed: {
    backgroundColor: COLORS.BG_CANVAS,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...TYPOGRAPHY.bodyBold,
    textAlign: 'center',
  },
});
