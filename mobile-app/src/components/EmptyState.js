import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'New items will appear here when they are available.',
  icon = 'file-tray-outline',
}) {
  return (
    <View style={styles.container}>
      <Ionicons color={COLORS.TEXT_MUTED} name={icon} size={34} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
});
