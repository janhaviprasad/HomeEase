import { StyleSheet, Text, View } from 'react-native';
import { TYPOGRAPHY } from '../constants';

export default function SectionHeader({ title, action }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    ...TYPOGRAPHY.subheading,
  },
  action: {
    ...TYPOGRAPHY.bodyBold,
  },
});
