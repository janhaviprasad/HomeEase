const assert = require('node:assert/strict');
const test = require('node:test');
const { isMockApiEnabled, isTruthyEnv, MOCK_ONLY_CYCLE_MODE } = require('../api/config');
const {
  mockAuthService,
  mockCycle2Service,
  setMockSessionForTests,
} = require('../api/mockStore');
const {
  addressToBookingText,
  buildAddressPayload,
  buildPasswordPayload,
  buildProfilePayload,
  validateAddress,
  validatePassword,
  validateProfile,
} = require('../utils/cycle2Forms');

async function useCustomerSession() {
  const session = await mockAuthService.login('test2@homeease.com', 'password123');
  setMockSessionForTests(session);
  return session;
}

async function useProviderSession() {
  const session = await mockAuthService.login('suresh@example.com', 'password123');
  setMockSessionForTests(session);
  return session;
}

test('mobile app can leave mock-only mode when env disables mocks', () => {
  process.env.EXPO_PUBLIC_USE_MOCK_API = 'false';

  assert.equal(MOCK_ONLY_CYCLE_MODE, false);
  assert.equal(isMockApiEnabled(), false);
});

test('mock-mode env parsing accepts Expo public boolean values safely', () => {
  process.env.EXPO_PUBLIC_USE_MOCK_API = ' TRUE ';

  assert.equal(isTruthyEnv(' TRUE '), true);
  assert.equal(isMockApiEnabled(), true);
});

test('Cycle 2 address helpers validate and build booking-ready address text', () => {
  assert.deepEqual(validateAddress({}), {
    label: 'Address label is required.',
    addressLine: 'Address must be at least 10 characters.',
    city: 'City is required.',
    pincode: 'Enter a valid 6 digit pincode.',
  });

  const payload = buildAddressPayload({
    label: ' Work ',
    addressLine: ' 55 Business Park ',
    city: ' Indore ',
    pincode: '452020',
    isDefault: true,
  });

  assert.deepEqual(payload, {
    label: 'Work',
    addressLine: '55 Business Park',
    city: 'Indore',
    pincode: '452020',
    isDefault: true,
  });
  assert.equal(addressToBookingText(payload), '55 Business Park, Indore, 452020');
});

test('mock saved addresses support create, default, update, and delete', async () => {
  await useCustomerSession();
  const created = await mockCycle2Service.createAddress({
    label: 'Studio',
    addressLine: '91 Mock Studio Road',
    city: 'Indore',
    pincode: '452030',
    isDefault: true,
  });
  let list = await mockCycle2Service.listAddresses();

  assert.equal(list.addresses.some((address) => address.id === created.id), true);
  assert.equal(list.addresses.find((address) => address.id === created.id).isDefault, true);
  assert.equal(list.addresses.filter((address) => address.isDefault).length, 1);

  const updated = await mockCycle2Service.updateAddress(created.id, {
    label: 'Studio Updated',
    addressLine: '91 Mock Studio Road',
    city: 'Indore',
    pincode: '452031',
  });

  assert.equal(updated.label, 'Studio Updated');
  assert.equal(updated.pincode, '452031');

  await mockCycle2Service.deleteAddress(created.id);
  list = await mockCycle2Service.listAddresses();
  assert.equal(list.addresses.some((address) => address.id === created.id), false);
});

test('Cycle 2 profile and password helpers normalize safely', () => {
  assert.deepEqual(validateProfile({ name: 'A', phone: '123' }), {
    name: 'Name must be at least 2 characters.',
    phone: 'Enter a valid 10 digit phone number.',
  });
  assert.deepEqual(buildProfilePayload({ name: ' Sam ', phone: '(900) 000-0002', imageUrl: '' }), {
    name: 'Sam',
    phone: '9000000002',
    imageUrl: null,
  });
  assert.deepEqual(validatePassword({ currentPassword: 'password123', newPassword: '12345', confirmPassword: 'x' }), {
    newPassword: 'New password must be at least 6 characters.',
    confirmPassword: 'Passwords must match.',
  });
  assert.deepEqual(buildPasswordPayload({ currentPassword: 'old', newPassword: 'new-password' }), {
    oldPassword: 'old',
    newPassword: 'new-password',
  });
});

test('mock profile update and password change work without backend endpoints', async () => {
  await useCustomerSession();
  const updated = await mockAuthService.updateProfile({
    name: 'Samruddhi Demo',
    phone: '9000000014',
    imageUrl: null,
  });

  assert.equal(updated.name, 'Samruddhi Demo');
  assert.equal(updated.phone, '9000000014');

  await mockAuthService.changePassword({
    oldPassword: 'password123',
    newPassword: 'newPassword123',
  });
  const notifications = await mockCycle2Service.listNotifications();
  assert.equal(
    notifications.notifications.some((notification) => notification.type === 'PASSWORD_CHANGED'),
    true
  );
});

test('mock notifications support unread counts and read-all', async () => {
  await useCustomerSession();
  const before = await mockCycle2Service.listNotifications();

  assert.equal(before.count >= before.unreadCount, true);
  await mockCycle2Service.markAllNotificationsRead();

  const after = await mockCycle2Service.listNotifications();
  assert.equal(after.unreadCount, 0);
});

test('mock provider earnings summarize completed jobs', async () => {
  await useProviderSession();
  const earnings = await mockCycle2Service.getProviderEarnings();

  assert.equal(typeof earnings.totalEarnings, 'number');
  assert.equal(earnings.completedJobCount >= 1, true);
  assert.equal(Array.isArray(earnings.monthly), true);
  assert.equal(Array.isArray(earnings.recentJobs), true);
});
