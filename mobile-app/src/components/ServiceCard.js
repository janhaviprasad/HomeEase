import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import PrimaryButton from './PrimaryButton';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants';
import { formatCurrencyINR } from '../utils/serviceCatalog';
import { getServiceImageSource } from '../utils/serviceImages';

const SERVICE_ICONS = {
  Electrician: 'flash-outline',
  Plumbing: 'water-outline',
  Cleaning: 'sparkles-outline',
  'AC Service': 'snow-outline',
};

export default function ServiceCard({ service, compact = false, onBook, onPress }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = imageFailed ? null : getServiceImageSource(service);
  const serviceName = service.name || service.categoryName || 'Service';
  const content = (
    <Card style={styles.card}>
      <View style={[styles.image, compact && styles.compactImage]}>
        {imageSource ? (
          <Image
            accessibilityLabel={`${serviceName} service image`}
            onError={() => setImageFailed(true)}
            source={imageSource}
            style={styles.serviceImage}
          />
        ) : (
          <Ionicons
            color={COLORS.ACCENT}
            name={SERVICE_ICONS[serviceName] || 'construct-outline'}
            size={compact ? 28 : 44}
          />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{serviceName}</Text>
          {service.badge ? <Text style={styles.badge}>{service.badge}</Text> : null}
        </View>
        <Text numberOfLines={compact ? 2 : 3} style={styles.description}>{service.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{formatCurrencyINR(service.price)}</Text>
          {!compact ? <PrimaryButton title="Book" style={styles.bookButton} onPress={onBook || onPress} /> : null}
        </View>
      </View>
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      accessibilityLabel={`View ${serviceName}`}
      accessibilityRole="button"
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 0,
    overflow: 'hidden',
    padding: 0,
  },
  image: {
    alignItems: 'center',
    aspectRatio: 1.9,
    backgroundColor: COLORS.SURFACE_CONTAINER,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    justifyContent: 'center',
  },
  serviceImage: {
    height: '100%',
    width: '100%',
  },
  compactImage: {
    aspectRatio: 1,
    borderBottomLeftRadius: RADIUS.card,
    borderBottomRightRadius: RADIUS.card,
    height: 72,
    width: 72,
  },
  content: {
    gap: 6,
    padding: SPACING.cardPadding,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    ...TYPOGRAPHY.bodyBold,
  },
  badge: {
    ...TYPOGRAPHY.caption,
    backgroundColor: COLORS.ACCENT_SOFT,
    borderRadius: RADIUS.sm,
    color: COLORS.ACCENT,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  description: {
    ...TYPOGRAPHY.caption,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.ACCENT,
  },
  bookButton: {
    minHeight: 34,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
