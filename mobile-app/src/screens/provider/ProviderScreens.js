import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { authService } from '../../api/auth';
import { bookingsService } from '../../api/bookings';
import { getUserFriendlyErrorMessage, isUnsupportedEndpointError } from '../../api/errors';
import {
  AppHeader,
  ApprovalBanner,
  AvailableJobCard,
  BookingCard,
  Card,
  DestructiveButton,
  EmptyState,
  ErrorState,
  LoadingState,
  PrimaryButton,
  ProfileHeader,
  ScreenContainer,
  SecondaryButton,
  SectionHeader,
  StatCard,
  StatusPill,
} from '../../components';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants';
import { useAuth } from '../../context';
import { formatVisibleDateTime } from '../../utils/dateFormat';
import { formatCurrencyINR } from '../../utils/serviceCatalog';

const JOB_FILTERS = ['ALL', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

function FilterChip({ active, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ApprovalBadge({ approved }) {
  return (
    <View style={[styles.approvalBadge, approved ? styles.approvalBadgeApproved : styles.approvalBadgePending]}>
      <Text style={[styles.approvalBadgeText, approved ? styles.approvalBadgeTextApproved : styles.approvalBadgeTextPending]}>
        {approved ? 'Approved' : 'Pending'}
      </Text>
    </View>
  );
}

function providerFromUser(user) {
  return user?.provider || null;
}

function countJobs(bookings, status) {
  return bookings.filter((booking) => booking.status === status).length;
}

function formatRating(value) {
  const rating = Number(value);
  return Number.isFinite(rating) ? rating.toFixed(1) : '0.0';
}

function InfoRow({ icon, label }) {
  if (!label) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons color={COLORS.TEXT_SUBTLE} name={icon} size={16} />
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}

function ApprovalAwareContent({ provider, children }) {
  if (!provider?.isApproved) {
    return (
      <View style={styles.stack}>
        <ApprovalBanner />
        {children}
      </View>
    );
  }

  return children;
}

export function ProviderHomeScreen({ navigation }) {
  const { user } = useAuth();
  const provider = providerFromUser(user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await bookingsService.listProviderAssigned();
      setBookings(result.bookings || []);
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const activeJob = bookings.find((booking) => booking.status === 'IN_PROGRESS') || bookings.find((booking) => booking.status === 'ACCEPTED');

  return (
    <ScreenContainer
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboard({ refresh: true })} />}
    >
      <AppHeader title="HomeEase" />
      <ProfileHeader
        user={{
          name: user?.name || 'Provider',
          email: provider?.categoryName || user?.email || '',
        }}
      />
      <ApprovalAwareContent provider={provider}>
        {loading ? <LoadingState message="Loading dashboard..." /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={loadDashboard} /> : null}
        {!loading && !error ? (
          <>
            <View style={styles.statsRow}>
              <StatCard title="Accepted" value={countJobs(bookings, 'ACCEPTED')} icon="checkmark-done-outline" />
              <StatCard title="In Progress" value={countJobs(bookings, 'IN_PROGRESS')} icon="hammer-outline" />
            </View>
            <View style={styles.statsRow}>
              <StatCard title="Completed" value={countJobs(bookings, 'COMPLETED')} icon="sparkles-outline" />
              <StatCard title="Cancelled" value={countJobs(bookings, 'CANCELLED')} icon="close-circle-outline" />
            </View>
            {activeJob ? (
              <BookingCard
                booking={activeJob}
                onPress={() =>
                  navigation.navigate('JobsTab', {
                    screen: 'JobDetail',
                    params: { bookingId: activeJob.id, booking: activeJob },
                  })
                }
              />
            ) : (
              <EmptyState message="No active assigned job right now." />
            )}
            <PrimaryButton
              disabled={!provider?.isApproved}
              title="See Available Jobs"
              onPress={() => navigation.navigate('JobsTab', { screen: 'AvailableJobs' })}
            />
          </>
        ) : null}
      </ApprovalAwareContent>
    </ScreenContainer>
  );
}

export function AvailableJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState(null);
  const [backendNotice, setBackendNotice] = useState(null);
  const [approvalBlocked, setApprovalBlocked] = useState(false);

  const loadJobs = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setBackendNotice(null);
    setApprovalBlocked(false);

    try {
      const result = await bookingsService.listAvailable();
      setJobs(result.bookings || []);
    } catch (nextError) {
      const message = getUserFriendlyErrorMessage(nextError);

      if (isUnsupportedEndpointError(nextError)) {
        setJobs([]);
        setBackendNotice(message);
        return;
      }

      const lowerMessage = String(message).toLowerCase();
      setApprovalBlocked(lowerMessage.includes('awaiting approval') || lowerMessage.includes('not approved'));
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const acceptJob = useCallback(
    async (job) => {
      if (acceptingId) return;
      setAcceptingId(job.id);
      setError(null);

      try {
        const accepted = await bookingsService.updateStatus(job.id, 'ACCEPTED');
        setJobs((current) => current.filter((item) => item.id !== job.id));
        // job carries the available-list fields, accepted carries the post-action
        // ones. The PUT succeeding is what confirms ACCEPTED, so fall back to it
        // if the service's follow-up refetch came back thin.
        navigation.navigate('JobDetail', {
          bookingId: accepted.id,
          booking: { ...job, ...accepted, status: accepted.status || 'ACCEPTED' },
        });
      } catch (nextError) {
        setError(getUserFriendlyErrorMessage(nextError));
        loadJobs({ refresh: true });
      } finally {
        setAcceptingId(null);
      }
    },
    [acceptingId, loadJobs, navigation]
  );

  return (
    <ScreenContainer
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadJobs({ refresh: true })} />}
    >
      <AppHeader title="Available Jobs" />
      {approvalBlocked ? <ApprovalBanner message="Provider account is awaiting approval." /> : null}
      {loading ? <LoadingState message="Loading available jobs..." /> : null}
      {!loading && backendNotice ? <EmptyState message={backendNotice} /> : null}
      {!loading && error && !approvalBlocked ? <ErrorState message={error} onRetry={loadJobs} /> : null}
      {!loading && !error && !backendNotice && jobs.length === 0 ? <EmptyState message="No available jobs right now." /> : null}
      {!loading && !approvalBlocked && !backendNotice
        ? jobs.map((job) => (
            <AvailableJobCard
              accepting={acceptingId === job.id}
              job={job}
              key={job.id}
              onAccept={() => acceptJob(job)}
            />
          ))
        : null}
      <SecondaryButton title="My Jobs" onPress={() => navigation.navigate('MyJobs')} />
    </ScreenContainer>
  );
}

export function MyJobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadJobs = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await bookingsService.listProviderAssigned();
      setJobs(result.bookings || []);
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [loadJobs])
  );

  const visibleJobs = useMemo(() => {
    if (status === 'ALL') return jobs;
    return jobs.filter((job) => job.status === status);
  }, [jobs, status]);

  return (
    <ScreenContainer
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadJobs({ refresh: true })} />}
    >
      <AppHeader title="My Jobs" />
      <View style={styles.filterRow}>
        {JOB_FILTERS.map((filter) => (
          <FilterChip
            active={status === filter}
            key={filter}
            label={filter === 'ALL' ? 'All' : filter.replace('_', ' ')}
            onPress={() => setStatus(filter)}
          />
        ))}
      </View>
      {loading ? <LoadingState message="Loading jobs..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadJobs} /> : null}
      {!loading && !error && jobs.length === 0 ? <EmptyState message="No assigned jobs yet." /> : null}
      {!loading && !error && jobs.length > 0 && visibleJobs.length === 0 ? (
        <EmptyState message="No jobs match this status." />
      ) : null}
      {!loading && !error
        ? visibleJobs.map((job) => (
            <BookingCard
              booking={job}
              key={job.id}
              onPress={() => navigation.navigate('JobDetail', { bookingId: job.id, booking: job })}
            />
          ))
        : null}
      <SecondaryButton title="Available Jobs" onPress={() => navigation.navigate('AvailableJobs')} />
    </ScreenContainer>
  );
}

export function JobDetailScreen({ navigation, route }) {
  const bookingId = route.params?.bookingId;
  const routeJob = route.params?.booking || null;
  const [job, setJob] = useState(routeJob);
  const [loading, setLoading] = useState(!routeJob);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setJob(await bookingsService.getOne(bookingId));
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      // The jobs list hands over the full booking, so skip the round-trip on
      // that path. The route param seeds initial state only and is never
      // re-applied on focus: status is mutated on this screen, and re-applying
      // would revert the pill to the list's stale snapshot.
      if (!routeJob) {
        loadJob();
      }
    }, [loadJob, routeJob])
  );

  const updateStatus = useCallback(
    async (status) => {
      setActionLoading(true);
      setError(null);

      try {
        const updated = await bookingsService.updateStatus(bookingId, status);
        setJob((current) => ({
          ...current,
          ...updated,
          status: updated.status || status,
        }));
      } catch (nextError) {
        setError(getUserFriendlyErrorMessage(nextError));
      } finally {
        setActionLoading(false);
      }
    },
    [bookingId]
  );

  const confirmUpdate = useCallback(
    (title, message, status, destructive = false) => {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: title,
          style: destructive ? 'destructive' : 'default',
          onPress: () => updateStatus(status),
        },
      ]);
    },
    [updateStatus]
  );

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader title="Job Detail" showBack onBack={() => navigation.goBack()} />
        <LoadingState message="Loading job..." />
      </ScreenContainer>
    );
  }

  if (error && !job) {
    return (
      <ScreenContainer>
        <AppHeader title="Job Detail" showBack onBack={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={loadJob} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title="Job Detail" showBack onBack={() => navigation.goBack()} />
      <Card style={styles.detailCard}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>{job?.serviceName || job?.service?.name || 'Service'}</Text>
          <StatusPill status={job?.status} />
        </View>
        <InfoRow icon="calendar-outline" label={formatVisibleDateTime(job?.bookingDate)} />
        <InfoRow icon="location-outline" label={job?.address} />
        <Text style={styles.priceLarge}>{formatCurrencyINR(job?.totalPrice)}</Text>
      </Card>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {job?.customer ? (
        <Card style={styles.formCard}>
          <SectionHeader title="Customer" />
          <Text style={styles.body}>{job.customer.name}</Text>
          <Text style={styles.muted}>{job.customer.phone}</Text>
          <Text style={styles.muted}>{job.address}</Text>
        </Card>
      ) : null}
      {job?.status === 'PENDING' ? (
        <PrimaryButton loading={actionLoading} title="Accept Job" onPress={() => updateStatus('ACCEPTED')} />
      ) : null}
      {job?.status === 'ACCEPTED' ? (
        <>
          <PrimaryButton loading={actionLoading} title="Start Work" onPress={() => updateStatus('IN_PROGRESS')} />
          <DestructiveButton
            disabled={actionLoading}
            title="Cancel Job"
            onPress={() => confirmUpdate('Cancel Job', 'This accepted job will be cancelled.', 'CANCELLED', true)}
          />
        </>
      ) : null}
      {job?.status === 'IN_PROGRESS' ? (
        <PrimaryButton
          loading={actionLoading}
          title="Mark Completed"
          onPress={() => confirmUpdate('Mark Completed', 'Confirm that this job is complete.', 'COMPLETED')}
        />
      ) : null}
      {job?.status === 'COMPLETED' || job?.status === 'CANCELLED' ? (
        <EmptyState message="No further actions are available for this job." />
      ) : null}
    </ScreenContainer>
  );
}

export function ProviderProfileScreen({ navigation }) {
  const { refreshCurrentUser, signOut, token, user } = useAuth();
  const provider = providerFromUser(user);
  const [available, setAvailable] = useState(Boolean(provider?.availability));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setAvailable(Boolean(provider?.availability));
    }, [provider?.availability])
  );

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will return to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: signOut },
    ]);
  };

  const toggleAvailability = useCallback(
    async (nextValue) => {
      if (!provider) return;
      const previous = available;
      setAvailable(nextValue);
      setLoading(true);
      setError(null);

      try {
        await authService.toggleAvailability(provider.id, nextValue);
        await refreshCurrentUser(token);
      } catch (nextError) {
        setAvailable(previous);
        setError(getUserFriendlyErrorMessage(nextError));
      } finally {
        setLoading(false);
      }
    },
    [available, provider, refreshCurrentUser, token]
  );

  return (
    <ScreenContainer>
      <AppHeader title="Profile" />
      <ProfileHeader user={{ name: user?.name || 'Provider', email: user?.email || '' }} />
      {!provider?.isApproved ? <ApprovalBanner /> : null}
      <Card style={styles.formCard}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>{provider?.categoryName || 'Service Provider'}</Text>
          <ApprovalBadge approved={Boolean(provider?.isApproved)} />
        </View>
        <Text style={styles.body}>{provider?.experience || 0} years experience</Text>
        <Text style={styles.body}>{formatRating(provider?.rating)} rating</Text>
      </Card>
      <Card style={styles.availabilityCard}>
        <View style={styles.availabilityText}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <Text style={styles.muted}>Availability is saved on your profile.</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        <Switch
          disabled={loading || !provider?.isApproved}
          onValueChange={toggleAvailability}
          thumbColor={available ? COLORS.ACCENT : COLORS.TEXT_MUTED}
          trackColor={{ false: COLORS.BORDER, true: COLORS.ACCENT_SOFT }}
          value={available}
        />
      </Card>
      <Card style={styles.formCard}>
        <SectionHeader title="Account Tools" />
        <SecondaryButton title="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
        <SecondaryButton title="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
      </Card>
      <DestructiveButton title="Logout" onPress={confirmLogout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: SPACING.cardGap,
  },
  stack: {
    gap: SPACING.cardGap,
  },
  muted: {
    ...TYPOGRAPHY.caption,
  },
  body: {
    ...TYPOGRAPHY.body,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subheading,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.stackSm,
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.cardGap,
  },
  detailCard: {
    gap: SPACING.stackSm,
    marginBottom: SPACING.cardGap,
  },
  formCard: {
    gap: SPACING.stackMd,
    marginBottom: SPACING.cardGap,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: COLORS.SURFACE_CONTAINER,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.ACCENT,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
  },
  filterChipTextActive: {
    color: COLORS.BG_CARD,
    fontWeight: '700',
  },
  approvalBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  approvalBadgeApproved: {
    backgroundColor: COLORS.SUCCESS_SOFT,
  },
  approvalBadgePending: {
    backgroundColor: COLORS.WARNING_SOFT,
  },
  approvalBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  approvalBadgeTextApproved: {
    color: COLORS.SUCCESS,
  },
  approvalBadgeTextPending: {
    color: COLORS.WARNING_TEXT,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  priceLarge: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ACCENT,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.ERROR,
  },
  availabilityCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.cardGap,
    justifyContent: 'space-between',
    marginBottom: SPACING.cardGap,
  },
  availabilityText: {
    flex: 1,
    gap: 4,
  },
});
