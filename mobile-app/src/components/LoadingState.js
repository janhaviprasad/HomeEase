import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={COLORS.ACCENT} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.cardGap,
    justifyContent: 'center',
    padding: SPACING.section,
  },
  message: {
    ...TYPOGRAPHY.caption,
  },
});
