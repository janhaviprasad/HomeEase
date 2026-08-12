import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { authService } from '../../api/auth';
import { cycle2Service } from '../../api/cycle2';
import {
  AppHeader,
  Card,
  DestructiveButton,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PrimaryButton,
  ScreenContainer,
  SecondaryButton,
  SectionHeader,
  StatusPill,
} from '../../components';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants';
import { useAuth } from '../../context';
import { getUserFriendlyErrorMessage } from '../../api/errors';
import { formatVisibleDateTime } from '../../utils/dateFormat';
import { formatCurrencyINR } from '../../utils/serviceCatalog';
import {
  addressToBookingText,
  buildAddressPayload,
  buildPasswordPayload,
  buildProfilePayload,
  validateAddress,
  validatePassword,
  validateProfile,
} from '../../utils/cycle2Forms';

function FilterChip({ active, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function AddressCard({ address, onDelete, onEdit, onSetDefault, onUse }) {
  return (
    <Card style={styles.cardGap}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.sectionTitle}>{address.label}</Text>
          <Text style={styles.body}>{addressToBookingText(address)}</Text>
        </View>
        {address.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actionRow}>
        {onUse ? <PrimaryButton title="Use" style={styles.compactButton} onPress={() => onUse(address)} /> : null}
        <SecondaryButton title="Edit" style={styles.compactButton} onPress={() => onEdit(address)} />
        {!address.isDefault ? (
          <SecondaryButton title="Default" style={styles.compactButton} onPress={() => onSetDefault(address)} />
        ) : null}
        <DestructiveButton title="Delete" style={styles.compactButton} onPress={() => onDelete(address)} />
      </View>
    </Card>
  );
}

export function SavedAddressesScreen({ navigation, route }) {
  const onSelectAddress = route.params?.onSelectAddress;
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadAddresses = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await cycle2Service.listAddresses();
      setAddresses(result.addresses || []);
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  const confirmDelete = useCallback(
    (address) => {
      Alert.alert('Delete address?', `${address.label} will be removed from your address book.`, [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cycle2Service.deleteAddress(address.id);
              loadAddresses({ refresh: true });
            } catch (nextError) {
              setError(getUserFriendlyErrorMessage(nextError));
            }
          },
        },
      ]);
    },
    [loadAddresses]
  );

  const setDefault = useCallback(
    async (address) => {
      try {
        await cycle2Service.setDefaultAddress(address.id);
        loadAddresses({ refresh: true });
      } catch (nextError) {
        setError(getUserFriendlyErrorMessage(nextError));
      }
    },
    [loadAddresses]
  );

  const useAddress = useCallback(
    (address) => {
      if (onSelectAddress) {
        onSelectAddress(addressToBookingText(address));
      }
      navigation.goBack();
    },
    [navigation, onSelectAddress]
  );

  return (
    <ScreenContainer
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAddresses({ refresh: true })} />}
    >
      <AppHeader title="Saved Addresses" showBack onBack={() => navigation.goBack()} />
      <PrimaryButton title="Add Address" onPress={() => navigation.navigate('AddressForm')} />
      {loading ? <LoadingState message="Loading saved addresses..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadAddresses} /> : null}
      {!loading && !error && addresses.length === 0 ? <EmptyState message="No saved addresses yet." /> : null}
      {!loading && !error
        ? addresses.map((address) => (
            <AddressCard
              address={address}
              key={address.id}
              onDelete={confirmDelete}
              onEdit={() => navigation.navigate('AddressForm', { address })}
              onSetDefault={setDefault}
              onUse={onSelectAddress ? useAddress : null}
            />
          ))
        : null}
    </ScreenContainer>
  );
}

export function AddressFormScreen({ navigation, route }) {
  const editing = route.params?.address || null;
  const [values, setValues] = useState({
    label: editing?.label || '',
    addressLine: editing?.addressLine || '',
    city: editing?.city || '',
    pincode: editing?.pincode || '',
    isDefault: Boolean(editing?.isDefault),
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const change = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }, []);

  const save = useCallback(async () => {
    if (loading) return;
    const nextErrors = validateAddress(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setFormError(null);
    try {
      const payload = buildAddressPayload(values);
      if (editing) {
        await cycle2Service.updateAddress(editing.id, payload);
      } else {
        await cycle2Service.createAddress(payload);
      }
      navigation.goBack();
    } catch (nextError) {
      setFormError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [editing, loading, navigation, values]);

  return (
    <ScreenContainer contentContainerStyle={styles.screen}>
      <AppHeader title={editing ? 'Edit Address' : 'Add Address'} showBack onBack={() => navigation.goBack()} />
      <Card style={styles.cardGap}>
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        <Input error={errors.label} label="Label" onChangeText={(value) => change('label', value)} placeholder="Home" value={values.label} />
        <Input
          error={errors.addressLine}
          label="Address"
          multiline
          onChangeText={(value) => change('addressLine', value)}
          placeholder="House, street, area"
          value={values.addressLine}
        />
        <Input error={errors.city} label="City" onChangeText={(value) => change('city', value)} placeholder="Indore" value={values.city} />
        <Input
          error={errors.pincode}
          keyboardType="number-pad"
          label="Pincode"
          onChangeText={(value) => change('pincode', value.replace(/\D/g, '').slice(0, 6))}
          placeholder="452001"
          value={values.pincode}
        />
      </Card>
      <PrimaryButton loading={loading} title={editing ? 'Save Address' : 'Create Address'} onPress={save} />
    </ScreenContainer>
  );
}

export function EditProfileScreen({ navigation }) {
  const { refreshCurrentUser, token, user } = useAuth();
  const [values, setValues] = useState({
    name: user?.name || '',
    phone: user?.phone || user?.provider?.phone || '',
    imageUrl: user?.imageUrl || '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const change = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }, []);

  const save = useCallback(async () => {
    if (loading) return;
    const nextErrors = validateProfile(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setFormError(null);
    try {
      await authService.updateProfile(buildProfilePayload(values));
      await refreshCurrentUser(token);
      navigation.goBack();
    } catch (nextError) {
      setFormError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [loading, navigation, refreshCurrentUser, token, values]);

  return (
    <ScreenContainer contentContainerStyle={styles.screen}>
      <AppHeader title="Edit Profile" showBack onBack={() => navigation.goBack()} />
      <Card style={styles.cardGap}>
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        <Input error={errors.name} label="Name" onChangeText={(value) => change('name', value)} value={values.name} />
        <Input
          error={errors.phone}
          keyboardType="phone-pad"
          label="Phone"
          onChangeText={(value) => change('phone', value.replace(/\D/g, '').slice(0, 10))}
          value={values.phone}
        />
        <Text style={styles.caption}>Email stays read-only.</Text>
      </Card>
      <PrimaryButton loading={loading} title="Save Profile" onPress={save} />
    </ScreenContainer>
  );
}

export function ChangePasswordScreen({ navigation }) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const change = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
    setSuccess(null);
  }, []);

  const save = useCallback(async () => {
    if (loading) return;
    const nextErrors = validatePassword(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setFormError(null);
    setSuccess(null);
    try {
      await authService.changePassword(buildPasswordPayload(values));
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully.');
    } catch (nextError) {
      setFormError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [loading, values]);

  return (
    <ScreenContainer contentContainerStyle={styles.screen}>
      <AppHeader title="Change Password" showBack onBack={() => navigation.goBack()} />
      <Card style={styles.cardGap}>
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}
        <Input
          error={errors.currentPassword}
          label="Current Password"
          onChangeText={(value) => change('currentPassword', value)}
          secureTextEntry
          value={values.currentPassword}
        />
        <Input
          error={errors.newPassword}
          label="New Password"
          onChangeText={(value) => change('newPassword', value)}
          secureTextEntry
          value={values.newPassword}
        />
        <Input
          error={errors.confirmPassword}
          label="Confirm Password"
          onChangeText={(value) => change('confirmPassword', value)}
          secureTextEntry
          value={values.confirmPassword}
        />
        <Text style={styles.caption}>Current password is password123 for demo accounts.</Text>
      </Card>
      <PrimaryButton loading={loading} title="Change Password" onPress={save} />
    </ScreenContainer>
  );
}

export function NotificationsScreen({ navigation }) {
  const [filter, setFilter] = useState('ALL');
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      setData(await cycle2Service.listNotifications());
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const visibleNotifications = useMemo(() => {
    if (filter === 'UNREAD') {
      return data.notifications.filter((notification) => !notification.read);
    }
    return data.notifications;
  }, [data.notifications, filter]);

  const markOne = useCallback(
    async (notification) => {
      try {
        await cycle2Service.markNotificationRead(notification.id);
        loadNotifications({ refresh: true });
      } catch (nextError) {
        setError(getUserFriendlyErrorMessage(nextError));
      }
    },
    [loadNotifications]
  );

  const markAll = useCallback(async () => {
    try {
      await cycle2Service.markAllNotificationsRead();
      loadNotifications({ refresh: true });
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    }
  }, [loadNotifications]);

  return (
    <ScreenContainer
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications({ refresh: true })} />}
    >
      <AppHeader title="Notifications" showBack={Boolean(navigation.canGoBack?.())} onBack={() => navigation.goBack()} />
      <View style={styles.row}>
        <Text style={styles.caption}>{data.unreadCount || 0} unread</Text>
        <SecondaryButton title="Mark All Read" style={styles.smallButton} onPress={markAll} />
      </View>
      <View style={styles.filterRow}>
        <FilterChip active={filter === 'ALL'} label="All" onPress={() => setFilter('ALL')} />
        <FilterChip active={filter === 'UNREAD'} label="Unread" onPress={() => setFilter('UNREAD')} />
      </View>
      {loading ? <LoadingState message="Loading notifications..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadNotifications} /> : null}
      {!loading && !error && visibleNotifications.length === 0 ? <EmptyState message="No notifications here." /> : null}
      {!loading && !error
        ? visibleNotifications.map((notification) => (
            <Pressable
              accessibilityRole="button"
              key={notification.id}
              onPress={() => markOne(notification)}
            >
              <Card style={[styles.cardGap, !notification.read && styles.unreadCard]}>
                <View style={styles.row}>
                  <Text style={styles.sectionTitle}>{notification.title}</Text>
                  {!notification.read ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.body}>{notification.message}</Text>
                <Text style={styles.caption}>{formatVisibleDateTime(notification.createdAt)}</Text>
              </Card>
            </Pressable>
          ))
        : null}
    </ScreenContainer>
  );
}

export function ProviderEarningsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadEarnings = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      setData(await cycle2Service.getProviderEarnings());
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEarnings();
    }, [loadEarnings])
  );

  const maxMonthly = Math.max(...(data?.monthly || [{ total: 1 }]).map((item) => item.total), 1);

  return (
    <ScreenContainer
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadEarnings({ refresh: true })} />}
    >
      <AppHeader title="Earnings" showBack={Boolean(navigation.canGoBack?.())} onBack={() => navigation.goBack()} />
      {loading ? <LoadingState message="Loading earnings..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadEarnings} /> : null}
      {!loading && data ? (
        <>
          <Card style={styles.cardGap}>
            <Text style={styles.caption}>Total Earnings</Text>
            <Text style={styles.money}>{formatCurrencyINR(data.totalEarnings)}</Text>
            <Text style={styles.body}>{data.completedJobCount} completed jobs</Text>
            <Text style={styles.caption}>{data.averageRating || 0} average rating</Text>
          </Card>
          <Card style={styles.cardGap}>
            <SectionHeader title="Monthly Trend" />
            {data.monthly.map((item) => (
              <View key={item.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{item.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { flex: item.total / maxMonthly }]} />
                  <View style={{ flex: 1 - item.total / maxMonthly }} />
                </View>
                <Text style={styles.barValue}>{formatCurrencyINR(item.total)}</Text>
              </View>
            ))}
          </Card>
          <SectionHeader title="Recent Completed Jobs" />
          {data.recentJobs.length === 0 ? <EmptyState message="Completed jobs will appear here." /> : null}
          {data.recentJobs.map((job) => (
            <Card key={job.id} style={styles.cardGap}>
              <View style={styles.row}>
                <Text style={styles.sectionTitle}>{job.service?.name || 'Service'}</Text>
                <StatusPill status={job.status} />
              </View>
              <Text style={styles.caption}>{formatVisibleDateTime(job.completedAt || job.bookingDate)}</Text>
              <Text style={styles.body}>{formatCurrencyINR(job.totalPrice)}</Text>
            </Card>
          ))}
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: SPACING.cardGap,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.stackSm,
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  cardGap: {
    gap: SPACING.fieldGap,
  },
  body: {
    ...TYPOGRAPHY.body,
  },
  caption: {
    ...TYPOGRAPHY.caption,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyBold,
    flexShrink: 1,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.ERROR,
  },
  successText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.SUCCESS,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.stackSm,
  },
  compactButton: {
    flexGrow: 1,
    minHeight: 42,
  },
  defaultBadge: {
    backgroundColor: COLORS.ACCENT_SOFT,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.ACCENT,
    fontFamily: 'Inter_600SemiBold',
  },
  smallButton: {
    minHeight: 38,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.stackSm,
  },
  chip: {
    backgroundColor: COLORS.BG_CARD,
    borderColor: COLORS.BORDER,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: COLORS.ACCENT_SOFT,
    borderColor: COLORS.ACCENT,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
  },
  chipTextActive: {
    color: COLORS.ACCENT,
    fontFamily: 'Inter_600SemiBold',
  },
  unreadCard: {
    borderColor: COLORS.ACCENT,
  },
  unreadDot: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  money: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ACCENT,
    fontSize: 28,
    lineHeight: 34,
  },
  barRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.stackSm,
  },
  barLabel: {
    ...TYPOGRAPHY.caption,
    width: 34,
  },
  barTrack: {
    backgroundColor: COLORS.SURFACE_LOW,
    borderRadius: RADIUS.pill,
    flex: 1,
    flexDirection: 'row',
    height: 12,
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: COLORS.ACCENT,
  },
  barValue: {
    ...TYPOGRAPHY.caption,
    minWidth: 72,
    textAlign: 'right',
  },
});
