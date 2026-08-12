import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import StatusPill from './StatusPill';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { formatVisibleDate } from '../utils/dateFormat';
import { formatCurrencyINR } from '../utils/serviceCatalog';
import { getServiceImageSource } from '../utils/serviceImages';

export default function BookingCard({ booking, onPress }) {
  const imageSource = getServiceImageSource(booking.service || booking);

  const content = (
    <Card style={styles.card}>
      {imageSource ? <Image accessibilityLabel="Service image" source={imageSource} style={styles.thumbnail} /> : null}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.title}>{booking.serviceName || booking.service?.name || 'Service'}</Text>
          <StatusPill status={booking.status} />
        </View>
        <View style={styles.metaRow}>
          <Ionicons color={COLORS.TEXT_SUBTLE} name="calendar-outline" size={14} />
          <Text style={styles.meta}>{formatVisibleDate(booking.bookingDate)}</Text>
        </View>
        {booking.address ? <Text numberOfLines={1} style={styles.address}>{booking.address}</Text> : null}
        <View style={styles.row}>
          <Text style={styles.price}>{formatCurrencyINR(booking.totalPrice)}</Text>
        </View>
      </View>
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.cardGap,
  },
  thumbnail: {
    borderRadius: 12,
    height: 76,
    width: 76,
  },
  content: {
    flex: 1,
    gap: SPACING.stackSm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    ...TYPOGRAPHY.bodyBold,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  meta: {
    ...TYPOGRAPHY.caption,
  },
  address: {
    ...TYPOGRAPHY.caption,
  },
  price: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.ACCENT,
  },
});
