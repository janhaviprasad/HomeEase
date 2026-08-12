import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { COLORS, TYPOGRAPHY } from '../constants';

export default function StatCard({ title, value, caption, icon = 'checkmark-circle-outline' }) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons color={COLORS.ACCENT} name={icon} size={18} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 6,
  },
  iconBox: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: COLORS.ACCENT_SOFT,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  title: {
    ...TYPOGRAPHY.caption,
  },
  value: {
    ...TYPOGRAPHY.heading,
  },
  caption: {
    ...TYPOGRAPHY.caption,
  },
});
