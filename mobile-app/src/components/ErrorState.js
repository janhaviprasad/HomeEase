import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from './PrimaryButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
  retryLabel = 'Retry',
}) {
  return (
    <View style={styles.container}>
      <Ionicons color={COLORS.ERROR} name="alert-circle-outline" size={34} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <PrimaryButton title={retryLabel} onPress={onRetry} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    padding: SPACING.section,
  },
  title: {
    ...TYPOGRAPHY.subheading,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
  },
  button: {
    marginTop: 4,
    minWidth: 140,
  },
});
