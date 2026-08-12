import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants';

export default function ApprovalBanner({
  message = 'Your account is awaiting admin approval. You will not see jobs until approved.',
}) {
  return (
    <View style={styles.banner}>
      <Ionicons color="#A16207" name="time-outline" size={20} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.WARNING_SOFT,
    borderColor: COLORS.STATUS_YELLOW,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: SPACING.cardPadding,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: '#854D0E',
    flex: 1,
  },
});
