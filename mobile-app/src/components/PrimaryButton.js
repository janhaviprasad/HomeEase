import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, RADIUS, SIZES, SPACING, TYPOGRAPHY } from '../constants';

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.BG_CARD} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT,
    borderRadius: RADIUS.button,
    justifyContent: 'center',
    minHeight: SIZES.buttonHeight,
    paddingHorizontal: SPACING.cardPadding,
    paddingVertical: SPACING.buttonV,
  },
  pressed: {
    backgroundColor: COLORS.ACCENT_BRIGHT,
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...TYPOGRAPHY.button,
    textAlign: 'center',
  },
});
