import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

export default function RatingStars({ rating = 0, size = 24 }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          color={star <= rating ? '#f59e0b' : COLORS.BORDER}
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
