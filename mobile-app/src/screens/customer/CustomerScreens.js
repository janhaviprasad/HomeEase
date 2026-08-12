import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { bookingsService } from '../../api/bookings';
import { cycle2Service } from '../../api/cycle2';
import { reviewsService } from '../../api/reviews';
import { servicesService } from '../../api/services';
import {
  AppHeader,
  BookingCard,
  Card,
  DestructiveButton,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PrimaryButton,
  ProfileHeader,
  ScreenContainer,
  SearchInput,
  SecondaryButton,
  SectionHeader,
  ServiceCard,
  StatusPill,
} from '../../components';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants';
import { useAuth, useServiceCatalog } from '../../context';
// Generic string helper that happens to live with the auth forms; imported
// rather than copied so there is one definition of "strip non-digits".
import { digitsOnly } from '../../utils/authForms';
import { getUserFriendlyErrorMessage } from '../../api/errors';
import { formatVisibleDateTime } from '../../utils/dateFormat';
import {
  filterServices,
  formatCurrencyINR,
  buildServiceNavigationParams,
  mapServiceError,
  resolveServiceDetail,
} from '../../utils/serviceCatalog';
import { getServiceImageSource } from '../../utils/serviceImages';
import { addressToBookingText } from '../../utils/cycle2Forms';

const BOOKING_FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

function getFirstName(user) {
  const name = String(user?.name || '').trim();
  if (!name) return 'there';
  return name.split(/\s+/)[0];
}

function getDefaultBookingDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);

  return date;
}

function getDefaultBookingValues() {
  return {
    bookingDate: getDefaultBookingDate(),
    address: '',
  };
}

function buildBookingDate(values) {
  const date = values.bookingDate instanceof Date ? values.bookingDate : new Date(values.bookingDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatSelectedDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Choose date';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatSelectedTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Choose time';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function mergeDatePart(currentValue, nextValue) {
  const current = buildBookingDate({ bookingDate: currentValue }) || getDefaultBookingDate();
  const next = new Date(current);
  next.setFullYear(nextValue.getFullYear(), nextValue.getMonth(), nextValue.getDate());
  return next;
}

function mergeTimePart(currentValue, nextValue) {
  const current = buildBookingDate({ bookingDate: currentValue }) || getDefaultBookingDate();
  const next = new Date(current);
  next.setHours(nextValue.getHours(), nextValue.getMinutes(), 0, 0);
  return next;
}

function validateBooking(values) {
  const errors = {};
  const date = buildBookingDate(values);

  if (!date) {
    errors.date = 'Choose a booking date.';
    errors.time = 'Choose a booking time.';
  }

  if (!date || date.getTime() <= Date.now()) {
    errors.date = 'Booking date and time must be in the future.';
  }

  if (String(values.address || '').trim().length < 10) {
    errors.address = 'Address must be at least 10 characters.';
  }

  return errors;
}

function ServiceImage({ service, large = false }) {
  const [failed, setFailed] = useState(false);
  const imageSource = failed ? null : getServiceImageSource(service);
  const name = service?.name || 'Service';

  return (
    <View style={[styles.serviceImageWrap, large && styles.serviceImageLarge]}>
      {imageSource ? (
        <Image
          accessibilityLabel={`${name} service image`}
          onError={() => setFailed(true)}
          source={imageSource}
          style={styles.serviceImage}
        />
      ) : (
        <Ionicons color={COLORS.ACCENT} name="construct-outline" size={large ? 52 : 28} />
      )}
    </View>
  );
}

function RefreshingError({ message }) {
  if (!message) return null;
  return <Text style={styles.refreshError}>{message}</Text>;
}

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

function PickerField({ error, icon, label, onPress, value }) {
  return (
    <View style={styles.pickerField}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.pickerButton, error && styles.pickerButtonError]}
      >
        <Text style={styles.pickerValue}>{value}</Text>
        <Ionicons color={COLORS.TEXT_MUTED} name={icon} size={20} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function BookingSummary({ booking }) {
  if (!booking) return null;

  return (
    <Card style={styles.detailCard}>
      <View style={styles.row}>
        <Text style={styles.sectionTitle}>{booking.service?.name || booking.serviceName || 'Service'}</Text>
        <StatusPill status={booking.status} />
      </View>
      {booking.service ? <ServiceImage large service={booking.service} /> : null}
      <InfoRow icon="calendar-outline" label={formatVisibleDateTime(booking.bookingDate)} />
      <InfoRow icon="location-outline" label={booking.address} />
      <Text style={styles.priceLarge}>{formatCurrencyINR(booking.totalPrice)}</Text>
    </Card>
  );
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

export function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { services, loading, refreshing, error, refresh } = useServiceCatalog();
  const [query, setQuery] = useState('');

  const visibleServices = useMemo(() => filterServices(services, query), [query, services]);
  const hasCatalogue = services.length > 0;
  const hasQuery = query.trim().length > 0;

  const openService = useCallback(
    (service) => {
      navigation.navigate('ServiceDetail', buildServiceNavigationParams(service));
    },
    [navigation]
  );

  return (
    <ScreenContainer
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh().catch(() => {})} />}
    >
      <View style={styles.homeHeader}>
        <Text style={styles.greeting}>Hi, {getFirstName(user)}</Text>
        <Text style={styles.muted}>What service do you need today?</Text>
      </View>

      <SearchInput onChangeText={setQuery} onClear={() => setQuery('')} value={query} />
      <RefreshingError message={hasCatalogue ? error : null} />

      {loading && !hasCatalogue ? <LoadingState message="Loading services..." /> : null}
      {!loading && error && !hasCatalogue ? (
        <ErrorState message={error} onRetry={() => refresh().catch(() => {})} />
      ) : null}
      {!loading && !error && services.length === 0 ? (
        <EmptyState message="No services are available right now." />
      ) : null}
      {!loading && hasCatalogue && hasQuery && visibleServices.length === 0 ? (
        <EmptyState message="No services match your search." />
      ) : null}

      {visibleServices.map((service) => (
        <ServiceCard
          key={service.id}
          onBook={() => openService(service)}
          onPress={() => openService(service)}
          service={service}
        />
      ))}
    </ScreenContainer>
  );
}

export function ServiceDetailScreen({ navigation, route }) {
  const serviceId = route.params?.serviceId;
  const routeService = route.params?.service;
  const { getServiceById } = useServiceCatalog();
  const cachedService = getServiceById(serviceId);
  const [service, setService] = useState(cachedService || routeService || null);
  const [loading, setLoading] = useState(Boolean(serviceId && !cachedService && !routeService));
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const loadService = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const result = await resolveServiceDetail({
        getOne: servicesService.getOne,
        getServiceById,
        routeService,
        serviceId,
      });

      if (result.status === 'notFound') {
        setNotFound(true);
      } else {
        setService(result.service);
      }
    } catch (nextError) {
      setError(mapServiceError(nextError));
    } finally {
      setLoading(false);
    }
  }, [getServiceById, routeService, serviceId]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader title="HomeEase" showBack onBack={() => navigation.goBack()} />
        <LoadingState message="Loading service..." />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader title="HomeEase" showBack onBack={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={loadService} />
      </ScreenContainer>
    );
  }

  if (notFound || !service) {
    return (
      <ScreenContainer>
        <AppHeader title="HomeEase" showBack onBack={() => navigation.goBack()} />
        <EmptyState title="Service not found" message="This service is not available right now." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title="HomeEase" showBack onBack={() => navigation.goBack()} />
      <Card style={styles.detailCard}>
        <ServiceImage large service={service} />
        <Text style={styles.sectionTitle}>{service.name}</Text>
        {service.categoryName ? <Text style={styles.muted}>{service.categoryName}</Text> : null}
        <Text style={styles.body}>{service.description}</Text>
        <Text style={styles.priceLarge}>{formatCurrencyINR(service.price)}</Text>
      </Card>
      <PrimaryButton
        title="Book Now"
        onPress={() => navigation.navigate('BookingForm', buildServiceNavigationParams(service))}
      />
    </ScreenContainer>
  );
}

export function BookingFormScreen({ navigation, route }) {
  const serviceId = route.params?.serviceId;
  const routeService = route.params?.service;
  const { getServiceById } = useServiceCatalog();
  const service = getServiceById(serviceId) || routeService || null;
  const [values, setValues] = useState(getDefaultBookingValues);
  const [errors, setErrors] = useState({});
  const [pickerMode, setPickerMode] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const handleChange = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }, []);

  const handlePickerChange = useCallback(
    (event, selectedValue) => {
      const activeMode = pickerMode;

      if (Platform.OS !== 'ios') {
        setPickerMode(null);
      }

      if (event?.type === 'dismissed' || !selectedValue || !activeMode) {
        return;
      }

      setValues((current) => ({
        ...current,
        bookingDate:
          activeMode === 'date'
            ? mergeDatePart(current.bookingDate, selectedValue)
            : mergeTimePart(current.bookingDate, selectedValue),
      }));
      setErrors((current) => ({
        ...current,
        date: undefined,
        time: undefined,
      }));
    },
    [pickerMode]
  );

  const handleSubmit = useCallback(() => {
    const nextErrors = validateBooking(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // Payment comes first. PaymentScreen owns the booking POST so a booking is
    // only created once payment has "cleared". The payload stays camelCase —
    // toCreateBookingPayload converts it to the wire shape inside create().
    navigation.navigate('Payment', {
      bookingPayload: {
        serviceId,
        bookingDate: buildBookingDate(values).toISOString(),
        address: values.address.trim(),
      },
      service,
    });
  }, [navigation, service, serviceId, values]);

  useFocusEffect(
    useCallback(() => {
      cycle2Service
        .listAddresses()
        .then((result) => setSavedAddresses(result.addresses || []))
        .catch(() => setSavedAddresses([]));
    }, [])
  );

  if (!serviceId || !service) {
    return (
      <ScreenContainer>
        <AppHeader title="Book Service" showBack onBack={() => navigation.goBack()} />
        <ErrorState
          message="Choose a service before creating a booking."
          onRetry={() => navigation.goBack()}
          retryLabel="Go Back"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title={`Book ${service.name}`} showBack onBack={() => navigation.goBack()} />
      <Card style={styles.summaryCard}>
        <ServiceImage service={service} />
        <View style={styles.summaryContent}>
          <Text style={styles.sectionTitle}>{service.name}</Text>
          <Text style={styles.muted}>{service.description}</Text>
          <Text style={styles.priceLarge}>{formatCurrencyINR(service.price)}</Text>
        </View>
      </Card>
      <Card style={styles.formCard}>
        <SectionHeader title="Booking Details" />
        <PickerField
          error={errors.date}
          icon="calendar-outline"
          label="Date"
          onPress={() => setPickerMode('date')}
          value={formatSelectedDate(values.bookingDate)}
        />
        <PickerField
          error={errors.time}
          icon="time-outline"
          label="Time"
          onPress={() => setPickerMode('time')}
          value={formatSelectedTime(values.bookingDate)}
        />
        {pickerMode ? (
          <View style={styles.dateTimePickerWrap}>
            <DateTimePicker
              display={pickerMode === 'date' ? 'calendar' : 'clock'}
              minimumDate={pickerMode === 'date' ? new Date() : undefined}
              mode={pickerMode}
              onChange={handlePickerChange}
              value={buildBookingDate(values) || getDefaultBookingDate()}
            />
            {Platform.OS === 'ios' ? (
              <PrimaryButton title="Done" style={styles.pickerDoneButton} onPress={() => setPickerMode(null)} />
            ) : null}
          </View>
        ) : null}
        <Input
          error={errors.address}
          label="Service Address"
          multiline
          onChangeText={(value) => handleChange('address', value)}
          placeholder="Enter your full address..."
          inputStyle={styles.multiline}
          value={values.address}
        />
        {savedAddresses.length > 0 ? (
          <View style={styles.savedAddressBlock}>
            <SectionHeader title="Saved Addresses" />
            {savedAddresses.slice(0, 3).map((address) => (
              <Pressable
                accessibilityRole="button"
                key={address.id}
                onPress={() => handleChange('address', addressToBookingText(address))}
                style={styles.savedAddressRow}
              >
                <View style={styles.savedAddressText}>
                  <Text style={styles.bodyBold}>{address.label}</Text>
                  <Text style={styles.muted}>{addressToBookingText(address)}</Text>
                </View>
                {address.isDefault ? (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </Card>
      <View style={styles.stickyAction}>
        <View>
          <Text style={styles.muted}>Total Price</Text>
          <Text style={styles.priceLarge}>{formatCurrencyINR(service.price)}</Text>
        </View>
        <PrimaryButton
          title="Continue to Payment"
          style={styles.stickyButton}
          onPress={handleSubmit}
        />
      </View>
    </ScreenContainer>
  );
}
const PAYMENT_DELAY_MS = 2000;
const CARD_NUMBER_LENGTH = 16;

const PAYMENT_METHODS = [
  { id: 'CARD', title: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, RuPay', icon: 'card-outline' },
  { id: 'UPI', title: 'UPI', subtitle: 'Pay using any UPI app', icon: 'phone-portrait-outline' },
  { id: 'WALLET', title: 'Wallet', subtitle: 'Paytm, PhonePe, GPay', icon: 'wallet-outline' },
];

const WALLETS = [
  { id: 'PAYTM', title: 'Paytm' },
  { id: 'PHONEPE', title: 'PhonePe' },
  { id: 'GPAY', title: 'GPay' },
];

function SelectableRow({ icon, onPress, selected, subtitle, title }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.methodOption, selected && styles.methodOptionSelected]}
    >
      {icon ? <Ionicons color={selected ? COLORS.ACCENT : COLORS.TEXT_SUBTLE} name={icon} size={22} /> : null}
      <View style={styles.savedAddressText}>
        <Text style={styles.bodyBold}>{title}</Text>
        {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
      </View>
      <Ionicons
        color={selected ? COLORS.ACCENT : COLORS.TEXT_SUBTLE}
        name={selected ? 'radio-button-on' : 'radio-button-off'}
        size={22}
      />
    </Pressable>
  );
}

export function PaymentScreen({ navigation, route }) {
  const bookingPayload = route.params?.bookingPayload;
  const service = route.params?.service;

  const [method, setMethod] = useState('CARD');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [wallet, setWallet] = useState('PAYTM');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const timerRef = useRef(null);
  const activeRef = useRef(true);

  useEffect(
    () => () => {
      // Backing out mid-spinner must not fire a booking or write state to a
      // screen that is already gone.
      activeRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  // Card is the only method that gates the button, and only on digit count.
  // Expiry and CVV are presentational, per the mock-payment scope.
  const cardNumberDigits = digitsOnly(card.number);
  const canPay = method !== 'CARD' || cardNumberDigits.length === CARD_NUMBER_LENGTH;

  const handlePay = useCallback(() => {
    if (processing || !canPay) {
      return;
    }

    setProcessing(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      timerRef.current = null;
      const txnId = `TXN${Date.now()}`;

      try {
        const created = await bookingsService.create(bookingPayload);
        if (!activeRef.current) return;

        // serviceName and the catalogue service are layered on because
        // BookingSummary reads service.name while the server nests it as
        // service.categoryName.
        const booking = { ...created, service, serviceName: service.name };
        const assignedName = created.provider?.name;

        setProcessing(false);
        Alert.alert(
          'Payment successful!',
          `Transaction ID: ${txnId}.${assignedName ? ` You've been assigned ${assignedName}.` : ''}`,
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.getParent()?.navigate('BookingsTab', {
                  screen: 'BookingDetail',
                  params: { bookingId: created.id, booking },
                }),
            },
          ]
        );
      } catch (nextError) {
        if (!activeRef.current) return;

        const message = getUserFriendlyErrorMessage(nextError);
        setProcessing(false);
        setError(`Reference ${txnId}. ${message}`);
        Alert.alert('Payment successful but booking failed', `Reference ${txnId}. ${message}`);
      }
    }, PAYMENT_DELAY_MS);
  }, [bookingPayload, canPay, navigation, processing, service]);

  if (!bookingPayload || !service) {
    return (
      <ScreenContainer>
        <AppHeader title="Payment" showBack onBack={() => navigation.goBack()} />
        <ErrorState
          message="Start from a booking before making a payment."
          onRetry={() => navigation.goBack()}
          retryLabel="Go Back"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title="Payment" showBack onBack={() => navigation.goBack()} />

      <Card style={styles.detailCard}>
        <Text style={styles.muted}>Amount to pay</Text>
        <Text style={styles.paymentAmount}>{formatCurrencyINR(service.price)}</Text>
        <Text style={styles.muted}>{service.name}</Text>
      </Card>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Card style={styles.formCard}>
        <SectionHeader title="Payment Method" />
        {PAYMENT_METHODS.map((option) => (
          <SelectableRow
            icon={option.icon}
            key={option.id}
            onPress={() => setMethod(option.id)}
            selected={method === option.id}
            subtitle={option.subtitle}
            title={option.title}
          />
        ))}
      </Card>

      {method === 'CARD' ? (
        <Card style={styles.formCard}>
          <SectionHeader title="Card Details" />
          <Input
            keyboardType="number-pad"
            label="Card Number"
            maxLength={CARD_NUMBER_LENGTH}
            onChangeText={(value) => setCard((current) => ({ ...current, number: digitsOnly(value) }))}
            placeholder="4111 1111 1111 1111"
            value={card.number}
          />
          <Input
            label="Expiry"
            maxLength={5}
            onChangeText={(value) => setCard((current) => ({ ...current, expiry: value }))}
            placeholder="MM/YY"
            value={card.expiry}
          />
          <Input
            keyboardType="number-pad"
            label="CVV"
            maxLength={3}
            onChangeText={(value) => setCard((current) => ({ ...current, cvv: digitsOnly(value) }))}
            placeholder="123"
            value={card.cvv}
          />
          {!canPay ? (
            <Text style={styles.muted}>Enter all {CARD_NUMBER_LENGTH} digits to continue.</Text>
          ) : null}
        </Card>
      ) : null}

      {method === 'UPI' ? (
        <Card style={styles.formCard}>
          <SectionHeader title="UPI ID" />
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            label="UPI ID"
            onChangeText={setUpiId}
            placeholder="name@upi"
            value={upiId}
          />
        </Card>
      ) : null}

      {method === 'WALLET' ? (
        <Card style={styles.formCard}>
          <SectionHeader title="Choose Wallet" />
          {WALLETS.map((option) => (
            <SelectableRow
              key={option.id}
              onPress={() => setWallet(option.id)}
              selected={wallet === option.id}
              title={option.title}
            />
          ))}
        </Card>
      ) : null}

      <View style={styles.stickyAction}>
        <View>
          <Text style={styles.muted}>Total</Text>
          <Text style={styles.priceLarge}>{formatCurrencyINR(service.price)}</Text>
        </View>
        <PrimaryButton
          disabled={!canPay || processing}
          title={`Pay ${formatCurrencyINR(service.price)}`}
          style={styles.stickyButton}
          onPress={handlePay}
        />
      </View>

      <Modal animationType="fade" onRequestClose={() => {}} transparent visible={processing}>
        <View style={styles.paymentOverlay}>
          <View style={styles.paymentOverlayCard}>
            <ActivityIndicator color={COLORS.ACCENT} size="large" />
            <Text style={styles.body}>Processing payment...</Text>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

export function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadBookings = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await bookingsService.list();
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
      loadBookings();
    }, [loadBookings])
  );

  const visibleBookings = useMemo(() => {
    if (status === 'ALL') return bookings;
    return bookings.filter((booking) => booking.status === status);
  }, [bookings, status]);

  return (
    <ScreenContainer
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadBookings({ refresh: true })} />}
    >
      <SectionHeader title="My Bookings" />
      <View style={styles.filterRow}>
        {BOOKING_FILTERS.map((filter) => (
          <FilterChip
            active={status === filter}
            key={filter}
            label={filter === 'ALL' ? 'All' : filter.replace('_', ' ')}
            onPress={() => setStatus(filter)}
          />
        ))}
      </View>

      {loading ? <LoadingState message="Loading bookings..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={loadBookings} /> : null}
      {!loading && !error && bookings.length === 0 ? (
        <EmptyState message="You have no bookings yet." />
      ) : null}
      {!loading && !error && bookings.length > 0 && visibleBookings.length === 0 ? (
        <EmptyState message="No bookings match this status." />
      ) : null}
      {!loading && !error
        ? visibleBookings.map((booking) => (
            <BookingCard
              booking={booking}
              key={booking.id}
              // FIX: Pass the full enriched booking object to detail screen
              // This avoids the second API call that hits the bad provider_id
              onPress={() => navigation.navigate('BookingDetail', { 
                bookingId: booking.id,
                booking: booking  // <-- ADD THIS
              })}
            />
          ))
        : null}
    </ScreenContainer>
  );
}

export function BookingDetailScreen({ navigation, route }) {
  const bookingId = route.params?.bookingId;
  const routeBooking = route.params?.booking || null;
  const [booking, setBooking] = useState(routeBooking);
  const [loading, setLoading] = useState(Boolean(!routeBooking));
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBooking = useCallback(async () => {
    if (routeBooking) {
      setBooking(routeBooking);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setBooking(await bookingsService.getOne(bookingId));
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [bookingId, routeBooking]);

  useFocusEffect(
    useCallback(() => {
      loadBooking();
    }, [loadBooking])
  );

  const cancelBooking = useCallback(() => {
    Alert.alert('Cancel booking?', 'This booking will move to cancelled.', [
      { text: 'Keep Booking', style: 'cancel' },
      {
        text: 'Cancel Booking',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          setError(null);
          try {
            const updated = await bookingsService.updateStatus(bookingId, 'CANCELLED');
            setBooking((current) => ({
              ...current,
              ...updated,
              status: updated.status || 'CANCELLED',
            }));
          } catch (nextError) {
            setError(getUserFriendlyErrorMessage(nextError));
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }, [bookingId]);

  const canCancel = booking && ['PENDING', 'ACCEPTED'].includes(booking.status);

  // Completed, and not already reviewed. reviews.booking_id is UNIQUE, so a
  // second submission is a 409; hiding the button keeps users off that path.
  // The interceptor camelCases has_review before any screen sees it.
  const canReview = useMemo(() => {
    return booking?.status === 'COMPLETED' && booking?.hasReview !== true;
  }, [booking?.hasReview, booking?.status]);

  // FIX: Get the correct providerId for reviews
  // Priority: provider_id (raw DB user_id) > provider.userId > provider.id
  const reviewProviderId = useMemo(() => {
    if (!booking) return null;
    // When loaded from API, booking has provider_id (snake_case)
    if (booking.provider_id) return booking.provider_id;
    // When passed from BookingForm, it might be providerId (camelCase)
    if (booking.providerId) return booking.providerId;
    // From enriched provider object (backend now returns this via /api/providers/user/{userId})
    if (booking.provider?.userId) return booking.provider.userId;
    // Fallback (should not happen with correct data)
    return booking.provider?.id;
  }, [booking]);

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader title="Booking Detail" showBack onBack={() => navigation.goBack()} />
        <LoadingState message="Loading booking..." />
      </ScreenContainer>
    );
  }

  if (error && !booking) {
    return (
      <ScreenContainer>
        <AppHeader title="Booking Detail" showBack onBack={() => navigation.goBack()} />
        <ErrorState message={error} onRetry={loadBooking} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title="Booking Detail" showBack onBack={() => navigation.goBack()} />
      <BookingSummary booking={booking} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Provider Card */}
      {booking?.provider ? (
        <Card style={styles.formCard}>
          <SectionHeader title="Provider" />
          <Text style={styles.bodyBold}>{booking.provider.name}</Text>
          {booking.provider.experience != null && booking.provider.experience !== '' ? (
            <Text style={styles.muted}>{booking.provider.experience} years experience</Text>
          ) : null}
          {booking.provider.rating ? (
            <Text style={styles.muted}>⭐ {Number(booking.provider.rating).toFixed(1)} rating</Text>
          ) : null}
          {booking.provider.phone ? (
            <Text style={styles.muted}>{booking.provider.phone}</Text>
          ) : null}
        </Card>
      ) : (
        <Card style={styles.formCard}>
          <Text style={styles.body}>A provider will be assigned after your request is accepted.</Text>
        </Card>
      )}

      {/* Review Button */}
      {canReview && reviewProviderId ? (
        <PrimaryButton
          title="Review Provider"
          onPress={() => navigation.navigate('Review', { 
            bookingId, 
            providerId: reviewProviderId 
          })}
        />
      ) : null}

      {/* Cancel Button */}
      {canCancel ? (
        <DestructiveButton loading={actionLoading} title="Cancel Booking" onPress={cancelBooking} />
      ) : null}
    </ScreenContainer>
  );
}

export function ReviewScreen({ navigation, route }) {
  const bookingId = route.params?.bookingId;
  const providerId = route.params?.providerId;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitReview = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      await reviewsService.create({ bookingId, providerId, rating, comment });
      navigation.navigate('BookingDetail', { bookingId });
    } catch (nextError) {
      setError(getUserFriendlyErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [bookingId, comment, loading, navigation, providerId, rating]);

  return (
    <ScreenContainer>
      <AppHeader title="Review" showBack onBack={() => navigation.goBack()} />
      <Card style={styles.formCard}>
        <SectionHeader title="Rate your provider" />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              accessibilityRole="button"
              key={value}
              onPress={() => setRating(value)}
              style={styles.starButton}
            >
              <Ionicons
                color={COLORS.STATUS_YELLOW}
                name={value <= rating ? 'star' : 'star-outline'}
                size={34}
              />
            </Pressable>
          ))}
        </View>
        <Input
          label="Comment"
          multiline
          onChangeText={setComment}
          placeholder="Share a short note..."
          inputStyle={styles.multiline}
          value={comment}
        />
      </Card>
      <PrimaryButton loading={loading} title="Submit Review" onPress={submitReview} />
    </ScreenContainer>
  );
}

export function CustomerProfileScreen({ navigation }) {
  const { signOut, user } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will return to the login screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScreenContainer>
      <AppHeader title="HomeEase" />
      <ProfileHeader user={{ name: user?.name || 'HomeEase Customer', email: user?.email || '' }} />
      <Card style={styles.profileRows}>
        <Text style={styles.body}>{user?.name || 'Customer'}</Text>
        {user?.email ? <Text style={styles.muted}>{user.email}</Text> : null}
        {user?.phone ? <Text style={styles.muted}>{user.phone}</Text> : null}
      </Card>
      <Card style={styles.profileRows}>
        <SectionHeader title="Account" />
        <SecondaryButton title="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
      </Card>
      <DestructiveButton title="Logout" onPress={confirmLogout} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: SPACING.cardGap,
  },
  homeHeader: {
    marginTop: 8,
  },
  greeting: {
    ...TYPOGRAPHY.heading,
  },
  muted: {
    ...TYPOGRAPHY.caption,
  },
  body: {
    ...TYPOGRAPHY.body,
  },
  bodyBold: {
    ...TYPOGRAPHY.bodyBold,
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
  priceLarge: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ACCENT,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.ERROR,
  },
  refreshError: {
    ...TYPOGRAPHY.caption,
    backgroundColor: COLORS.WARNING_SOFT,
    borderRadius: RADIUS.input,
    color: COLORS.WARNING_TEXT,
    padding: 10,
  },
  detailCard: {
    gap: SPACING.stackSm,
    marginBottom: SPACING.cardGap,
    overflow: 'hidden',
  },
  serviceImageWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_CONTAINER,
    borderRadius: RADIUS.card,
    height: 82,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 82,
  },
  serviceImageLarge: {
    aspectRatio: 1.7,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: undefined,
    width: '100%',
  },
  serviceImage: {
    height: '100%',
    width: '100%',
  },
  summaryCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.cardGap,
    marginBottom: SPACING.cardGap,
  },
  summaryContent: {
    flex: 1,
    gap: 4,
  },
  formCard: {
    gap: SPACING.stackMd,
    marginBottom: SPACING.cardGap,
  },
  multiline: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  pickerField: {
    gap: 6,
  },
  pickerLabel: {
    ...TYPOGRAPHY.bodyBold,
  },
  pickerButton: {
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderColor: COLORS.BORDER_SOFT,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  pickerButtonError: {
    borderColor: COLORS.ERROR,
  },
  pickerValue: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  dateTimePickerWrap: {
    backgroundColor: COLORS.BG_CARD,
    borderColor: COLORS.BORDER_SOFT,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Platform.OS === 'ios' ? SPACING.cardPadding : 0,
  },
  pickerDoneButton: {
    marginTop: SPACING.stackSm,
  },
  paymentAmount: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ACCENT,
  },
  methodOption: {
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_LOW,
    borderColor: COLORS.BORDER_SOFT,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.stackSm,
    justifyContent: 'space-between',
    padding: SPACING.cardPadding,
  },
  methodOptionSelected: {
    backgroundColor: COLORS.ACCENT_SOFT,
    borderColor: COLORS.ACCENT,
  },
  paymentOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
  },
  paymentOverlayCard: {
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.card,
    gap: SPACING.stackSm,
    paddingHorizontal: SPACING.stackLg,
    paddingVertical: SPACING.cardPadding,
  },
  stickyAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.cardGap,
    justifyContent: 'space-between',
    marginTop: SPACING.stackLg,
  },
  stickyButton: {
    flex: 1,
    minWidth: 170,
  },
  savedAddressBlock: {
    gap: SPACING.stackSm,
  },
  savedAddressRow: {
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_LOW,
    borderRadius: RADIUS.input,
    flexDirection: 'row',
    gap: SPACING.stackSm,
    justifyContent: 'space-between',
    padding: SPACING.cardPadding,
  },
  savedAddressText: {
    flex: 1,
    gap: 2,
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
  profileRows: {
    gap: SPACING.stackSm,
    marginVertical: SPACING.cardGap,
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
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    minHeight: 44,
    minWidth: 44,
  },
});
