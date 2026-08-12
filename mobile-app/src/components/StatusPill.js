import { StyleSheet, Text, View } from 'react-native';
import { RADIUS, TYPOGRAPHY } from '../constants';
import { STATUS } from '../constants/theme';

export default function StatusPill({ status = 'PENDING' }) {
  const pill = STATUS[status] || STATUS.PENDING;

  return (
    <View style={[styles.pill, { backgroundColor: pill.bg }]}>
      <Text style={[styles.text, { color: pill.fg }]}>{pill.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
});
