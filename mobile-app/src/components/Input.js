import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SIZES, SPACING, TYPOGRAPHY } from '../constants';

export default function Input({
  label,
  error,
  secureTextEntry = false,
  style,
  inputStyle,
  ...props
}) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        <TextInput
          placeholderTextColor={COLORS.TEXT_MUTED}
          secureTextEntry={isSecure}
          style={[styles.input, inputStyle]}
          {...props}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setIsSecure((value) => !value)}
            style={styles.iconButton}
          >
            <Ionicons
              color={COLORS.TEXT_MUTED}
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    ...TYPOGRAPHY.bodyBold,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderColor: COLORS.BORDER_SOFT,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: SIZES.inputHeight,
    paddingHorizontal: 12,
    width: '100%',
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  input: {
    ...TYPOGRAPHY.body,
    flex: 1,
    paddingVertical: SPACING.fieldGap,
    width: '100%',
  },
  iconButton: {
    paddingLeft: 8,
  },
  error: {
    ...TYPOGRAPHY.caption,
    color: COLORS.ERROR,
  },
});
