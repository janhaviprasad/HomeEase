import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants';

export default function ProfileHeader({ user, provider, image }) {
  return (
    <Card style={styles.card}>
      {image ? (
        <Image source={image} style={styles.avatar} />
      ) : (
        <View style={styles.initial}>
          <Text style={styles.initialText}>{user.name?.[0] || 'H'}</Text>
        </View>
      )}
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      {provider ? (
        <View style={styles.providerMeta}>
          <Text style={styles.meta}>{provider.categoryName}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.meta}>{provider.experience} years</Text>
          {provider.rating ? (
            <>
              <Text style={styles.dot}>•</Text>
              <Ionicons color="#f59e0b" name="star" size={14} />
              <Text style={styles.meta}>{provider.rating}</Text>
            </>
          ) : null}
        </View>
      ) : null}
      {provider ? (
        <View style={[styles.approvalBadge, provider.isApproved ? styles.approved : styles.awaiting]}>
          <Text style={[styles.approvalText, provider.isApproved ? styles.approvedText : styles.awaitingText]}>
            {provider.isApproved ? 'Approved' : 'Awaiting Approval'}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  initial: {
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT_SOFT,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  initialText: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ACCENT,
  },
  name: {
    ...TYPOGRAPHY.subheading,
  },
  email: {
    ...TYPOGRAPHY.caption,
  },
  providerMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'center',
  },
  meta: {
    ...TYPOGRAPHY.caption,
  },
  dot: {
    color: COLORS.TEXT_SUBTLE,
  },
  approvalBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  approved: {
    backgroundColor: COLORS.SUCCESS_SOFT,
  },
  awaiting: {
    backgroundColor: COLORS.WARNING_SOFT,
  },
  approvalText: {
    ...TYPOGRAPHY.caption,
    fontFamily: 'Inter_600SemiBold',
  },
  approvedText: {
    color: COLORS.SUCCESS,
  },
  awaitingText: {
    color: COLORS.WARNING_TEXT,
  },
});
