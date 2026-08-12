import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import PrimaryButton from './PrimaryButton';
import StatusPill from './StatusPill';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants';
import { formatVisibleDateTime } from '../utils/dateFormat';
import { formatCurrencyINR } from '../utils/serviceCatalog';
import { getServiceImageSource } from '../utils/serviceImages';

export default function AvailableJobCard({ job, onAccept, onPress, accepting = false }) {
  const imageSource = getServiceImageSource(job);

  const content = (
    <Card style={styles.card}>
      <View style={styles.header}>
        {imageSource ? (
          <Image accessibilityLabel={`${job.serviceName} service image`} source={imageSource} style={styles.thumbnail} />
        ) : (
          <View style={styles.iconBox}>
            <Ionicons color={COLORS.ACCENT} name="flash-outline" size={18} />
          </View>
        )}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{job.serviceName}</Text>
          <Text style={styles.meta}>{job.location}</Text>
        </View>
        <StatusPill status="PENDING" />
      </View>
      <View style={styles.info}>
        <Ionicons color={COLORS.TEXT_SUBTLE} name="calendar-outline" size={14} />
        <Text style={styles.meta}>{formatVisibleDateTime(job.bookingDate)}</Text>
      </View>
      <View style={styles.footer}>
        <View>
          <Text style={styles.label}>Job Value</Text>
          <Text style={styles.price}>{formatCurrencyINR(job.totalPrice)}</Text>
        </View>
        {onAccept ? (
          <PrimaryButton title="Accept" loading={accepting} style={styles.accept} onPress={onAccept} />
        ) : null}
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
    gap: SPACING.stackMd,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT_SOFT,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  thumbnail: {
    borderRadius: 10,
    height: 48,
    width: 48,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.bodyBold,
  },
  meta: {
    ...TYPOGRAPHY.caption,
  },
  info: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    ...TYPOGRAPHY.caption,
  },
  price: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.ACCENT,
  },
  accept: {
    minHeight: 38,
    minWidth: 96,
    paddingVertical: 8,
  },
});
