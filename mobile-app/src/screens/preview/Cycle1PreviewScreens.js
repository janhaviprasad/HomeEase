import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppHeader,
  AvailableJobCard,
  BookingCard,
  BottomTabs,
  Card,
  DestructiveButton,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PrimaryButton,
  ProfileHeader,
  RatingStars,
  ScreenContainer,
  SearchInput,
  SectionHeader,
  ServiceCard,
  StatCard,
  StatusPill,
} from '../../components';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants';
import {
  assignedJobs,
  availableJobs,
  bookings,
  previewUser,
  providerProfile,
  providerUser,
  services,
} from '../../development/fixtures';
import { isProviderRegisterSubmitDisabled } from '../../utils/authForms';
import { formatVisibleDateTime } from '../../utils/dateFormat';

const logo = require('../../../assets/homeease-logo.png');

function PreviewBadge({ visible = true }) {
  if (!__DEV__ || !visible) return null;
  return (
    <View style={styles.previewBadge}>
      <Text style={styles.previewBadgeText}>UI Preview</Text>
    </View>
  );
}

function AuthShell({ title, subtitle, children, showPreviewChrome = true }) {
  return (
    <ScreenContainer contentContainerStyle={styles.authContainer}>
      <PreviewBadge visible={showPreviewChrome} />
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Card style={styles.authCard}>
        <Text style={styles.authTitle}>{title}</Text>
        <Text style={styles.authSubtitle}>{subtitle}</Text>
        {children}
      </Card>
    </ScreenContainer>
  );
}

function RoleCard({ icon, title, body, onPress }) {
  return (
    <Pressable accessibilityRole="button" disabled={!onPress} onPress={onPress}>
      <Card style={styles.roleCard}>
      <View style={styles.roleIcon}>
        <Ionicons color={COLORS.ACCENT} name={icon} size={24} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.muted}>{body}</Text>
      </View>
      <Ionicons color={COLORS.TEXT_SUBTLE} name="chevron-forward" size={18} />
      </Card>
    </Pressable>
  );
}

export function WelcomeScreenPreview({
  showPreviewChrome = true,
  onCustomer,
  onProvider,
  onLogin,
  onOpenGallery,
}) {
  return (
    <ScreenContainer contentContainerStyle={styles.authContainer}>
      <PreviewBadge visible={showPreviewChrome} />
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.authTitle}>Welcome to HomeEase</Text>
      <Text style={styles.authSubtitle}>Choose how you would like to continue</Text>
      <RoleCard icon="person-outline" title="Customer" body="Book trusted home services" onPress={onCustomer} />
      <RoleCard icon="briefcase-outline" title="Service Provider" body="Manage jobs and grow your business" onPress={onProvider} />
      <Pressable accessibilityRole="button" onPress={onLogin}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Pressable>
      {__DEV__ && onOpenGallery ? (
        <Pressable accessibilityRole="button" onPress={onOpenGallery} style={styles.devGalleryButton}>
          <Ionicons color={COLORS.ACCENT} name="albums-outline" size={16} />
          <Text style={styles.linkText}>Open UI Gallery</Text>
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}

export function LoginScreenPreview({
  values = {},
  errors = {},
  formError,
  loading = false,
  onChange = () => {},
  onForgotPassword,
  onRegister,
  onSubmit,
  showPreviewChrome = true,
}) {
  return (
    <AuthShell title="Welcome Back" subtitle="Log in to manage your property" showPreviewChrome={showPreviewChrome}>
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
        keyboardType="email-address"
        label="Email"
        onChangeText={(value) => onChange('email', value)}
        onSubmitEditing={onSubmit}
        placeholder="name@example.com"
        returnKeyType="next"
        textContentType="emailAddress"
        value={values.email}
      />
      <Input
        autoCapitalize="none"
        error={errors.password}
        label="Password"
        onChangeText={(value) => onChange('password', value)}
        onSubmitEditing={onSubmit}
        placeholder="Password"
        returnKeyType="done"
        secureTextEntry
        textContentType="password"
        value={values.password}
      />
      <Pressable accessibilityRole="button" onPress={onForgotPassword} style={styles.alignEnd}>
        <Text style={styles.linkText}>Forgot password?</Text>
      </Pressable>
      <PrimaryButton disabled={loading} loading={loading} onPress={onSubmit} title="Login" />
      <Pressable accessibilityRole="button" onPress={onRegister}>
        <Text style={styles.linkText}>Do not have an account? Register</Text>
      </Pressable>
    </AuthShell>
  );
}

export function ForgotPasswordScreenPreview({
  values = {},
  errors = {},
  formError,
  successMessage,
  loading = false,
  onBack,
  onChange = () => {},
  onSubmit,
  showPreviewChrome = true,
}) {
  return (
    <AuthShell title="Reset Password" subtitle="Enter your email to receive reset instructions" showPreviewChrome={showPreviewChrome}>
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
        keyboardType="email-address"
        label="Email"
        onChangeText={(value) => onChange('email', value)}
        onSubmitEditing={onSubmit}
        placeholder="name@example.com"
        returnKeyType="done"
        textContentType="emailAddress"
        value={values.email}
      />
      <PrimaryButton disabled={loading} loading={loading} onPress={onSubmit} title="Send Reset Link" />
      <Pressable accessibilityRole="button" onPress={onBack}>
        <Text style={styles.linkText}>Back to Login</Text>
      </Pressable>
    </AuthShell>
  );
}

export function VerifyOtpScreenPreview({
  values = {},
  errors = {},
  formError,
  successMessage,
  loading = false,
  resendLoading = false,
  resendCooldown = 0,
  onBack,
  onChange = () => {},
  onResend = () => {},
  onSubmit,
  showPreviewChrome = true,
}) {
  const email = values.email || 'your email';

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${email}`}
      showPreviewChrome={showPreviewChrome}
    >
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.code}
        keyboardType="number-pad"
        label="Verification Code"
        maxLength={6}
        onChangeText={(value) => onChange('code', value)}
        onSubmitEditing={onSubmit}
        placeholder="123456"
        returnKeyType="done"
        textContentType="oneTimeCode"
        value={values.code}
      />
      <PrimaryButton disabled={loading} loading={loading} onPress={onSubmit} title="Verify" />
      <Pressable
        accessibilityRole="button"
        disabled={resendCooldown > 0 || resendLoading}
        onPress={onResend}
      >
        <Text style={[styles.linkText, (resendCooldown > 0 || resendLoading) && styles.linkTextDisabled]}>
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onBack}>
        <Text style={styles.linkText}>Back</Text>
      </Pressable>
    </AuthShell>
  );
}

export function CustomerRegisterScreenPreview({
  values = {},
  errors = {},
  formError,
  loading = false,
  onChange = () => {},
  onLogin,
  onSubmit,
  showPreviewChrome = true,
}) {
  return (
    <AuthShell title="Create Account" subtitle="Join HomeEase to manage your property needs" showPreviewChrome={showPreviewChrome}>
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <Input
        error={errors.fullName}
        label="Full Name"
        onChangeText={(value) => onChange('fullName', value)}
        placeholder="Riya Sharma"
        returnKeyType="next"
        textContentType="name"
        value={values.fullName}
      />
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
        keyboardType="email-address"
        label="Email"
        onChangeText={(value) => onChange('email', value)}
        placeholder="riya@homeease.com"
        returnKeyType="next"
        textContentType="emailAddress"
        value={values.email}
      />
      <Input
        error={errors.phone}
        keyboardType="phone-pad"
        label="Phone Number"
        onChangeText={(value) => onChange('phone', value)}
        placeholder="9000000002"
        returnKeyType="next"
        textContentType="telephoneNumber"
        value={values.phone}
      />
      <Input
        autoCapitalize="none"
        error={errors.password}
        label="Password"
        onChangeText={(value) => onChange('password', value)}
        placeholder="Password"
        returnKeyType="next"
        secureTextEntry
        textContentType="newPassword"
        value={values.password}
      />
      <Input
        autoCapitalize="none"
        error={errors.confirmPassword}
        label="Confirm Password"
        onChangeText={(value) => onChange('confirmPassword', value)}
        onSubmitEditing={onSubmit}
        placeholder="Confirm password"
        returnKeyType="done"
        secureTextEntry
        textContentType="newPassword"
        value={values.confirmPassword}
      />
      <PrimaryButton disabled={loading} loading={loading} onPress={onSubmit} title="Register" />
      <Pressable accessibilityRole="button" onPress={onLogin}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Pressable>
    </AuthShell>
  );
}

export function ProviderRegisterScreenPreview({
  categories = [],
  categoryError,
  categoryLoading = false,
  emptyCategoryMessage = 'No service categories are available yet.',
  errors = {},
  formError,
  loading = false,
  onCategoryRetry,
  onChange = () => {},
  onLogin,
  onSubmit,
  showPreviewChrome = true,
  values = {},
}) {
  return (
    <AuthShell title="Register as Provider" subtitle="Create your provider profile" showPreviewChrome={showPreviewChrome}>
      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <Input
        error={errors.fullName}
        label="Full Name"
        onChangeText={(value) => onChange('fullName', value)}
        placeholder="Suresh Kumar"
        returnKeyType="next"
        textContentType="name"
        value={values.fullName}
      />
      <Input
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
        keyboardType="email-address"
        label="Email"
        onChangeText={(value) => onChange('email', value)}
        placeholder="suresh@example.com"
        returnKeyType="next"
        textContentType="emailAddress"
        value={values.email}
      />
      <Input
        error={errors.phone}
        keyboardType="phone-pad"
        label="Phone Number"
        onChangeText={(value) => onChange('phone', value)}
        placeholder="9000000004"
        returnKeyType="next"
        textContentType="telephoneNumber"
        value={values.phone}
      />
      <Input
        autoCapitalize="none"
        error={errors.password}
        label="Password"
        onChangeText={(value) => onChange('password', value)}
        placeholder="Password"
        returnKeyType="next"
        secureTextEntry
        textContentType="newPassword"
        value={values.password}
      />
      <Input
        autoCapitalize="none"
        error={errors.confirmPassword}
        label="Confirm Password"
        onChangeText={(value) => onChange('confirmPassword', value)}
        placeholder="Confirm password"
        returnKeyType="next"
        secureTextEntry
        textContentType="newPassword"
        value={values.confirmPassword}
      />
      <View style={styles.categorySection}>
        <Text style={styles.cardTitle}>Service Category</Text>
        {errors.categoryId ? <Text style={styles.errorText}>{errors.categoryId}</Text> : null}
        {categoryLoading ? <LoadingState message="Loading service categories..." /> : null}
        {!categoryLoading && categoryError ? (
          <ErrorState message={categoryError} onRetry={onCategoryRetry} />
        ) : null}
        {!categoryLoading && !categoryError && categories.length === 0 ? (
          <EmptyState message={emptyCategoryMessage} />
        ) : null}
        {!categoryLoading && !categoryError
          ? categories.map((category) => {
              const selected = Number(values.categoryId) === Number(category.id);
              return (
                <Pressable
                  accessibilityRole="button"
                  key={category.id}
                  onPress={() => onChange('categoryId', category.id)}
                  style={[styles.categoryOption, selected && styles.categoryOptionSelected]}
                >
                  <Text style={[styles.cardTitle, selected && styles.categoryOptionTextSelected]}>
                    {category.name || category.categoryName}
                  </Text>
                  {selected ? <Ionicons color={COLORS.ACCENT} name="checkmark-circle" size={20} /> : null}
                </Pressable>
              );
            })
          : null}
      </View>
      <Input
        error={errors.experience}
        keyboardType="number-pad"
        label="Years of Experience"
        onChangeText={(value) => onChange('experience', value)}
        onSubmitEditing={onSubmit}
        placeholder="0"
        returnKeyType="done"
        value={values.experience}
      />
      <PrimaryButton
        disabled={isProviderRegisterSubmitDisabled({ categoryLoading, loading })}
        loading={loading}
        onPress={onSubmit}
        title="Register"
      />
      <Pressable accessibilityRole="button" onPress={onLogin}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </Pressable>
    </AuthShell>
  );
}

export function HomeScreenPreview({ showPreviewChrome = true, showTabs = true, onServicePress }) {
  return (
    <ScreenContainer contentContainerStyle={styles.withTabs}>
      <PreviewBadge visible={showPreviewChrome} />
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.greeting}>Hi, {previewUser.name}</Text>
          <Text style={styles.muted}>What service do you need today?</Text>
        </View>
      </View>
      <SearchInput />
      {services.slice(0, 3).map((service) => (
        <Pressable accessibilityRole="button" key={service.id} onPress={() => onServicePress?.(service)}>
          <ServiceCard service={service} />
        </Pressable>
      ))}
      {showTabs ? <BottomTabs active="Home" /> : null}
    </ScreenContainer>
  );
}

export function ServiceDetailScreenPreview({ showPreviewChrome = true, onBack, onBook }) {
  const service = services[0];
  return (
    <ScreenContainer>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title="HomeEase" showBack onBack={onBack} />
      <Card style={styles.serviceHeroCard}>
        <View style={styles.serviceHeroImage}>
          <Ionicons color={COLORS.ACCENT} name="flash-outline" size={52} />
        </View>
        <View style={styles.serviceHeroContent}>
          <Text style={styles.sectionTitle}>{service.name} Services</Text>
          <Text style={styles.body}>{service.description}</Text>
          <Text style={styles.priceLarge}>₹{service.price.toFixed(2)} / service</Text>
        </View>
      </Card>
      <PrimaryButton title="Book Now" onPress={onBook} />
    </ScreenContainer>
  );
}

export function BookingFormScreenPreview({ showPreviewChrome = true, onBack, onConfirm }) {
  return (
    <ScreenContainer>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title="Book Electrician" showBack onBack={onBack} />
      <Card style={styles.summaryCard}>
        <ServiceCard compact service={services[0]} />
      </Card>
      <Card style={styles.formCard}>
        <SectionHeader title="Booking Details" />
        <Input label="Select Date" value="20 Jun 2026" editable={false} />
        <Input label="Select Time" value="10:00 AM" editable={false} />
        <Input label="Service Address" placeholder="Enter your full address..." multiline inputStyle={styles.multiline} />
      </Card>
      <View style={styles.stickyAction}>
        <View>
          <Text style={styles.muted}>Total Price</Text>
          <Text style={styles.priceLarge}>₹299.00</Text>
        </View>
        <PrimaryButton title="Confirm Booking" onPress={onConfirm} style={styles.stickyButton} />
      </View>
    </ScreenContainer>
  );
}

export function MyBookingsScreenPreview({ showPreviewChrome = true, showTabs = true, onBookingPress }) {
  return (
    <ScreenContainer contentContainerStyle={styles.withTabs}>
      <PreviewBadge visible={showPreviewChrome} />
      <SectionHeader title="My Bookings" />
      {bookings.map((booking) => (
        <Pressable accessibilityRole="button" key={booking.id} onPress={() => onBookingPress?.(booking)}>
          <BookingCard booking={booking} />
        </Pressable>
      ))}
      {showTabs ? <BottomTabs active="Bookings" /> : null}
    </ScreenContainer>
  );
}

export function BookingDetailScreenPreview({ showPreviewChrome = true, onBack, onReview }) {
  const booking = bookings[1];
  return (
    <ScreenContainer>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title={`Booking #${booking.id}`} showBack onBack={onBack} />
      <Card style={styles.detailCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Status</Text>
          <StatusPill status={booking.status} />
        </View>
      </Card>
      <Card style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Service</Text>
        <Text style={styles.body}>{booking.serviceName}</Text>
        <Text style={styles.priceLarge}>₹{booking.totalPrice.toFixed(2)}</Text>
      </Card>
      <Card style={styles.detailCard}>
        <Text style={styles.sectionTitle}>When</Text>
        <Text style={styles.body}>{formatVisibleDateTime(booking.bookingDate)}</Text>
      </Card>
      <Card style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Where</Text>
        <Text style={styles.body}>{booking.address}</Text>
      </Card>
      {booking.provider ? (
        <Card style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Provider</Text>
          <Text style={styles.body}>{booking.provider.name}</Text>
          {booking.provider.rating ? (
            <View style={styles.inlineMeta}>
              <Ionicons color="#f59e0b" name="star" size={14} />
              <Text style={styles.muted}>{booking.provider.rating}</Text>
            </View>
          ) : null}
          {booking.provider.phone ? <Text style={styles.muted}>{booking.provider.phone}</Text> : null}
        </Card>
      ) : null}
      {booking.canReview ? <PrimaryButton title="Leave a Review" onPress={onReview} /> : null}
      {['PENDING', 'ACCEPTED'].includes(booking.status) ? <DestructiveButton title="Cancel Booking" /> : null}
    </ScreenContainer>
  );
}

export function ReviewScreenPreview({ showPreviewChrome = true, onBack }) {
  return (
    <ScreenContainer>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title="HomeEase" showBack onBack={onBack} />
      <Card style={styles.reviewCard}>
        <Text style={styles.authTitle}>Rate your service</Text>
        <Text style={styles.authSubtitle}>Your feedback helps us improve.</Text>
        <Card style={styles.providerMini}>
          <ProfileHeader user={{ name: 'Alex Johnson', email: 'Plumbing Repair - Oct 12' }} />
        </Card>
        <RatingStars rating={4} size={30} />
        <Input
          label="Comment"
          multiline
          placeholder="Tell us about your experience..."
          style={styles.fullWidth}
          inputStyle={styles.reviewInput}
        />
        <PrimaryButton title="Submit Review" />
      </Card>
    </ScreenContainer>
  );
}

export function CustomerProfileScreenPreview({ showPreviewChrome = true, showTabs = true, onLogout }) {
  return (
    <ScreenContainer contentContainerStyle={styles.withTabs}>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title="HomeEase" />
      <ProfileHeader user={{ name: 'Jane Doe', email: 'jane.doe@example.com' }} />
      <Card style={styles.profileRows}>
        <ProfileRow icon="person-outline" label="Jane Doe" />
        <ProfileRow icon="mail-outline" label="jane.doe@example.com" />
        <ProfileRow icon="call-outline" label="+91 90000 00002" />
      </Card>
      <DestructiveButton title="Logout" onPress={onLogout} />
      {showTabs ? <BottomTabs active="Profile" /> : null}
    </ScreenContainer>
  );
}

export function ProviderHomeScreenPreview({ showPreviewChrome = true, showTabs = true, onActiveJobPress, onAvailableJobs }) {
  return (
    <ScreenContainer contentContainerStyle={styles.withTabs}>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title="HomeEase" subtitle="Here is your schedule for today." />
      <Text style={styles.greeting}>Good Morning, Alex</Text>
      <View style={styles.statRow}>
        <StatCard title="Accepted" value="2" caption="Ready to start" icon="checkmark-done-outline" />
        <StatCard title="In Progress" value="1" caption="Working now" icon="time-outline" />
      </View>
      <StatCard title="Completed" value="8" caption="Job history" icon="list-outline" />
      <Pressable accessibilityRole="button" onPress={onActiveJobPress}>
      <Card style={styles.detailCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Active Job</Text>
          <StatusPill status="IN_PROGRESS" />
        </View>
        <Text style={styles.cardTitle}>{assignedJobs[0].serviceName}</Text>
        <Text style={styles.muted}>{formatVisibleDateTime(assignedJobs[0].bookingDate)}</Text>
        <Text style={styles.muted}>Tap to view job details</Text>
      </Card>
      </Pressable>
      <PrimaryButton title="See Available Jobs" onPress={onAvailableJobs} />
      {showTabs ? <BottomTabs active="Dashboard" tabs={['Dashboard', 'Jobs', 'Profile']} /> : null}
    </ScreenContainer>
  );
}

export function AvailableJobsScreenPreview({ showPreviewChrome = true, showTabs = true, onJobPress, onMyJobs }) {
  return (
    <ScreenContainer contentContainerStyle={styles.withTabs}>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title="New Requests" />
      <View style={styles.segmentRow}>
        <PrimaryButton title="Available" style={styles.segmentButtonActive} />
        <Pressable accessibilityRole="button" onPress={onMyJobs} style={styles.segmentButton}>
          <Text style={styles.segmentButtonText}>My Jobs</Text>
        </Pressable>
      </View>
      {availableJobs.map((job) => (
        <Pressable accessibilityRole="button" key={job.id} onPress={() => onJobPress?.(job)}>
          <AvailableJobCard job={job} />
        </Pressable>
      ))}
      {showTabs ? <BottomTabs active="Jobs" tabs={['Dashboard', 'Jobs', 'Profile']} /> : null}
    </ScreenContainer>
  );
}

export function MyJobsScreenPreview({ showPreviewChrome = true, showTabs = true, onJobPress, onAvailableJobs }) {
  return (
    <ScreenContainer contentContainerStyle={styles.withTabs}>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title="My Jobs" />
      <View style={styles.segmentRow}>
        <Pressable accessibilityRole="button" onPress={onAvailableJobs} style={styles.segmentButton}>
          <Text style={styles.segmentButtonText}>Available</Text>
        </Pressable>
        <PrimaryButton title="My Jobs" style={styles.segmentButtonActive} />
      </View>
      {assignedJobs.map((job) => (
        <Pressable accessibilityRole="button" key={job.id} onPress={() => onJobPress?.(job)}>
          <BookingCard booking={job} />
        </Pressable>
      ))}
      {showTabs ? <BottomTabs active="Jobs" tabs={['Dashboard', 'Jobs', 'Profile']} /> : null}
    </ScreenContainer>
  );
}

export function JobDetailScreenPreview({ showPreviewChrome = true, onBack }) {
  const job = assignedJobs[0];
  return (
    <ScreenContainer>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title={`Job #${job.id}`} showBack onBack={onBack} />
      <Card style={styles.detailCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>{job.serviceName}</Text>
          <StatusPill status={job.status} />
        </View>
        <Text style={styles.priceLarge}>₹{job.totalPrice.toFixed(2)}</Text>
      </Card>
      <Card style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.body}>{job.customer}</Text>
        <Text style={styles.muted}>{job.phone}</Text>
      </Card>
      <Card style={styles.detailCard}>
        <Text style={styles.sectionTitle}>When</Text>
        <Text style={styles.body}>{formatVisibleDateTime(job.bookingDate)}</Text>
      </Card>
      <Card style={styles.detailCard}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.body}>{job.address}</Text>
      </Card>
      <PrimaryButton title="Mark Completed" />
    </ScreenContainer>
  );
}

export function ProviderProfileScreenPreview({ showPreviewChrome = true, showTabs = true, onLogout }) {
  return (
    <ScreenContainer contentContainerStyle={styles.withTabs}>
      <PreviewBadge visible={showPreviewChrome} />
      <AppHeader title="HomeEase" />
      <ProfileHeader user={providerUser} provider={providerProfile} />
      <Card style={styles.profileRows}>
        <ProfileRow icon="briefcase-outline" label="Electrician" />
        <ProfileRow icon="star-outline" label="4.9 rating" />
        <View style={styles.rowBetween}>
          <ProfileRow icon="radio-button-on-outline" label="Available for jobs" plain />
          <Switch
            ios_backgroundColor={COLORS.BORDER_SOFT}
            thumbColor={COLORS.BG_CARD}
            trackColor={{ false: COLORS.BORDER_SOFT, true: COLORS.ACCENT_FIXED }}
            value
          />
        </View>
      </Card>
      <DestructiveButton title="Logout" onPress={onLogout} />
      {showTabs ? <BottomTabs active="Profile" tabs={['Dashboard', 'Jobs', 'Profile']} /> : null}
    </ScreenContainer>
  );
}

function ProfileRow({ icon, label, plain = false }) {
  const content = (
    <View style={styles.profileRowInner}>
      <Ionicons color={COLORS.ACCENT} name={icon} size={18} />
      <Text style={styles.cardTitle}>{label}</Text>
    </View>
  );
  if (plain) return content;
  return <View style={styles.profileRow}>{content}</View>;
}

export const previewScreens = [
  { name: 'WelcomeScreen', component: WelcomeScreenPreview, reference: 'Derived from login/register' },
  { name: 'LoginScreen', component: LoginScreenPreview, reference: 'login' },
  { name: 'CustomerRegisterScreen', component: CustomerRegisterScreenPreview, reference: 'register_user_role_selection' },
  { name: 'ProviderRegisterScreen', component: ProviderRegisterScreenPreview, reference: 'register_user_role_selection' },
  { name: 'HomeScreen', component: HomeScreenPreview, reference: 'home_service_list' },
  { name: 'ServiceDetailScreen', component: ServiceDetailScreenPreview, reference: 'Derived from home_service_list + booking_form' },
  { name: 'BookingFormScreen', component: BookingFormScreenPreview, reference: 'booking_form' },
  { name: 'MyBookingsScreen', component: MyBookingsScreenPreview, reference: 'my_bookings' },
  { name: 'BookingDetailScreen', component: BookingDetailScreenPreview, reference: 'Derived from booking_form + my_bookings' },
  { name: 'ReviewScreen', component: ReviewScreenPreview, reference: 'leave_a_review' },
  { name: 'CustomerProfileScreen', component: CustomerProfileScreenPreview, reference: 'profile_settings' },
  { name: 'ProviderHomeScreen', component: ProviderHomeScreenPreview, reference: 'provider_dashboard' },
  { name: 'AvailableJobsScreen', component: AvailableJobsScreenPreview, reference: 'incoming_requests' },
  { name: 'MyJobsScreen', component: MyJobsScreenPreview, reference: 'Derived from my_bookings' },
  { name: 'JobDetailScreen', component: JobDetailScreenPreview, reference: 'Derived from booking detail + provider_dashboard' },
  { name: 'ProviderProfileScreen', component: ProviderProfileScreenPreview, reference: 'provider_profile_earnings' },
];

function GalleryIndex({ onSelect }) {
  return (
    <ScreenContainer>
      <PreviewBadge />
      <Image source={logo} style={styles.galleryLogo} resizeMode="contain" />
      <Text style={styles.greeting}>UI Gallery</Text>
      <Text style={styles.muted}>Browse every screen shell before API integration.</Text>
      <View style={styles.galleryGrid}>
        {previewScreens.map((screen, index) => (
          <Pressable
            accessibilityRole="button"
            key={screen.name}
            onPress={() => onSelect(index)}
            style={styles.galleryItem}
          >
            <Text style={styles.cardTitle}>{screen.name.replace('Screen', '')}</Text>
            <Text style={styles.muted}>{screen.reference}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

export default function PreviewGallery({ currentIndex, onSelect, onBack }) {
  if (currentIndex === null) {
    return <GalleryIndex onSelect={onSelect} />;
  }

  const active = previewScreens[currentIndex];
  const ActiveScreen = active.component;

  return (
    <View style={styles.gallery}>
      <View style={styles.previewHeader}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.previewBack}>
          <Ionicons color={COLORS.ACCENT} name="arrow-back" size={18} />
          <Text style={styles.linkText}>Gallery</Text>
        </Pressable>
        <Text style={styles.previewTitle}>{active.name.replace('Screen', '')}</Text>
      </View>
      <ActiveScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  gallery: {
    backgroundColor: COLORS.BG_CANVAS,
    flex: 1,
  },
  previewHeader: {
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderBottomColor: COLORS.BORDER_SOFT,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screen,
    paddingTop: 52,
    paddingBottom: 12,
  },
  previewBack: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minHeight: 36,
  },
  previewTitle: {
    ...TYPOGRAPHY.bodyBold,
  },
  galleryLogo: {
    alignSelf: 'flex-start',
    height: 38,
    width: 150,
  },
  galleryGrid: {
    gap: SPACING.cardGap,
    marginTop: SPACING.stackLg,
  },
  galleryItem: {
    backgroundColor: COLORS.BG_CARD,
    borderColor: COLORS.BORDER_SOFT,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 4,
    padding: SPACING.cardPadding,
  },
  previewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.ACCENT_SOFT,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.stackSm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.ACCENT,
    fontFamily: 'Inter_600SemiBold',
  },
  devGalleryButton: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: SPACING.stackSm,
    minHeight: 40,
  },
  authContainer: {
    gap: SPACING.stackMd,
    justifyContent: 'center',
    paddingVertical: 44,
  },
  logo: {
    alignSelf: 'center',
    height: 46,
    width: 176,
  },
  authCard: {
    gap: SPACING.stackMd,
  },
  authTitle: {
    ...TYPOGRAPHY.heading,
    textAlign: 'center',
  },
  authSubtitle: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
  },
  linkText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.ACCENT,
    textAlign: 'center',
  },
  linkTextDisabled: {
    color: COLORS.TEXT_SUBTLE,
  },
  alignEnd: {
    alignSelf: 'flex-end',
    minHeight: 36,
    justifyContent: 'center',
  },
  formError: {
    ...TYPOGRAPHY.caption,
    backgroundColor: COLORS.ERROR_SOFT,
    borderRadius: RADIUS.input,
    color: COLORS.ERROR,
    padding: 10,
    textAlign: 'center',
  },
  successText: {
    ...TYPOGRAPHY.caption,
    backgroundColor: COLORS.SUCCESS_SOFT,
    borderRadius: RADIUS.input,
    color: COLORS.SUCCESS,
    padding: 10,
    textAlign: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.ERROR,
  },
  categorySection: {
    gap: SPACING.stackSm,
  },
  categoryOption: {
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderColor: COLORS.BORDER_SOFT,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  categoryOptionSelected: {
    backgroundColor: COLORS.ACCENT_SOFT,
    borderColor: COLORS.ACCENT,
  },
  categoryOptionTextSelected: {
    color: COLORS.ACCENT,
  },
  roleCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.cardGap,
  },
  roleIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.ACCENT_SOFT,
    borderRadius: RADIUS.card,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  flex: {
    flex: 1,
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
  cardTitle: {
    ...TYPOGRAPHY.bodyBold,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subheading,
  },
  priceLarge: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ACCENT,
  },
  withTabs: {
    gap: SPACING.cardGap,
    paddingBottom: 0,
  },
  detailCard: {
    gap: SPACING.stackSm,
    marginBottom: SPACING.cardGap,
  },
  summaryCard: {
    marginBottom: SPACING.cardGap,
    padding: 0,
  },
  formCard: {
    gap: SPACING.stackMd,
  },
  serviceHeroCard: {
    gap: SPACING.stackMd,
    marginBottom: SPACING.cardGap,
    overflow: 'hidden',
    padding: 0,
  },
  serviceHeroImage: {
    alignItems: 'center',
    aspectRatio: 1.7,
    backgroundColor: COLORS.SURFACE_CONTAINER,
    justifyContent: 'center',
  },
  serviceHeroContent: {
    gap: SPACING.stackSm,
    padding: SPACING.cardPadding,
  },
  multiline: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  reviewInput: {
    minHeight: 128,
    textAlignVertical: 'top',
    width: '100%',
  },
  stickyAction: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.stackLg,
  },
  stickyButton: {
    minWidth: 170,
  },
  reviewCard: {
    alignItems: 'stretch',
    gap: SPACING.stackMd,
  },
  providerMini: {
    alignSelf: 'stretch',
    padding: 0,
  },
  profileRows: {
    gap: SPACING.stackSm,
    marginVertical: SPACING.cardGap,
  },
  profileRow: {
    borderBottomColor: COLORS.BORDER_SOFT,
    borderBottomWidth: 1,
    paddingBottom: SPACING.stackSm,
  },
  profileRowInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.cardGap,
  },
  segmentRow: {
    backgroundColor: COLORS.SURFACE_LOW,
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    gap: 8,
    padding: 6,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: RADIUS.input,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentButtonActive: {
    flex: 1,
    minHeight: 44,
  },
  segmentButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.ACCENT,
  },
  inlineMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
});
