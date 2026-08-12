import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from './Input';
import { COLORS } from '../constants';

export default function SearchInput({
  accessibilityLabel = 'Search services',
  onChangeText,
  onClear,
  placeholder = 'Search for services...',
  value,
}) {
  return (
    <View style={styles.wrap}>
      <Ionicons color={COLORS.TEXT_SUBTLE} name="search" size={18} style={styles.icon} />
      <Input
        accessibilityLabel={accessibilityLabel}
        inputStyle={styles.input}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.field}
        value={value}
      />
      {value ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClear}
          style={styles.clearButton}
        >
          <Ionicons color={COLORS.TEXT_SUBTLE} name="close-circle" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  icon: {
    left: 14,
    position: 'absolute',
    top: 15,
    zIndex: 1,
  },
  field: {
    gap: 0,
  },
  input: {
    paddingLeft: 26,
    paddingRight: 28,
  },
  clearButton: {
    position: 'absolute',
    right: 14,
    top: 15,
    zIndex: 1,
  },
});
