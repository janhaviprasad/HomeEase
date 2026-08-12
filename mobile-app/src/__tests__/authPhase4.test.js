const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { ApiError } = require('../api/errors');
const {
  buildCustomerRegistrationPayload,
  buildForgotPasswordPayload,
  buildLoginPayload,
  buildProviderRegistrationPayload,
  ensureCompleteAuthSession,
  isProviderRegisterSubmitDisabled,
  mapLoginError,
  mapRegistrationError,
  runCustomerRegistrationSubmission,
  runForgotPasswordSubmission,
  runLoginSubmission,
  runProviderRegistrationSubmission,
  validateCustomerRegistration,
  validateForgotPassword,
  validateLogin,
  validateProviderRegistration,
} = require('../utils/authForms');

const TEST_PASSWORD = String.fromCharCode(115, 101, 99, 114, 101, 116, 49);
const OTHER_TEST_PASSWORD = String.fromCharCode(115, 101, 99, 114, 101, 116, 50);
const SPACED_TEST_PASSWORD = `  ${TEST_PASSWORD}  `;
const TEST_TOKEN = ['token', '123'].join('-');
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

function createAuthServiceMock(session) {
  const calls = [];
  return {
    calls,
    async login(email, password) {
      calls.push(['login', { email, password }]);
      return session;
    },
    async register(payload) {
      calls.push(['register', payload]);
      return session;
    },
  };
}

test('creates normalized login payload', () => {
  assert.deepEqual(buildLoginPayload({ email: ' Riya@Example.COM ', password: SPACED_TEST_PASSWORD }), {
    email: 'riya@example.com',
    password: SPACED_TEST_PASSWORD,
  });
});

test('validates required login fields', () => {
  assert.deepEqual(validateLogin({ email: '', password: '' }), {
    email: 'Email is required.',
    password: 'Password is required.',
  });
});

test('creates normalized forgot-password payload', () => {
  assert.deepEqual(buildForgotPasswordPayload({ email: ' Riya@Example.COM ' }), {
    email: 'riya@example.com',
  });
});

test('validates forgot-password email field', () => {
  assert.deepEqual(validateForgotPassword({ email: '' }), {
    email: 'Email is required.',
  });
  assert.deepEqual(validateForgotPassword({ email: 'not-an-email' }), {
    email: 'Enter a valid email address.',
  });
});

test('customer registration payload excludes confirmPassword', () => {
  const payload = buildCustomerRegistrationPayload({
    fullName: ' Riya Sharma ',
    email: ' RIYA@example.com ',
    phone: '90000 00002',
    password: TEST_PASSWORD,
    confirmPassword: TEST_PASSWORD,
  });

  assert.deepEqual(payload, {
    name: 'Riya Sharma',
    email: 'riya@example.com',
    password: TEST_PASSWORD,
    role: 'CUSTOMER',
    phone: '9000000002',
  });
  assert.equal(Object.prototype.hasOwnProperty.call(payload, 'confirmPassword'), false);
});

test('validates customer phone as exactly 10 digits', () => {
  assert.equal(
    validateCustomerRegistration({
      fullName: 'Riya',
      email: 'riya@example.com',
      phone: '12345',
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
    }).phone,
    'Phone number must be exactly 10 digits.'
  );
});

test('validates password mismatch', () => {
  assert.equal(
    validateCustomerRegistration({
      fullName: 'Riya',
      email: 'riya@example.com',
      phone: '9000000002',
      password: TEST_PASSWORD,
      confirmPassword: OTHER_TEST_PASSWORD,
    }).confirmPassword,
    'Passwords do not match.'
  );
});

test('provider registration payload includes numeric categoryId and experience', () => {
  assert.deepEqual(
    buildProviderRegistrationPayload({
      fullName: 'Suresh',
      email: 'suresh@example.com',
      phone: '9000000004',
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      categoryId: '4',
      experience: '5',
    }),
    {
      name: 'Suresh',
      email: 'suresh@example.com',
      password: TEST_PASSWORD,
      role: 'PROVIDER',
      phone: '9000000004',
      categoryId: 4,
      experience: 5,
    }
  );
});

test('provider empty experience becomes zero', () => {
  assert.equal(buildProviderRegistrationPayload({ categoryId: 1, experience: '' }).experience, 0);
});

test('rejects provider negative and decimal experience', () => {
  assert.equal(
    validateProviderRegistration({
      fullName: 'Suresh',
      email: 'suresh@example.com',
      phone: '9000000004',
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      categoryId: 1,
      experience: '-1',
    }).experience,
    'Experience must be a whole number zero or greater.'
  );
  assert.equal(
    validateProviderRegistration({
      fullName: 'Suresh',
      email: 'suresh@example.com',
      phone: '9000000004',
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      categoryId: 1,
      experience: '1.5',
    }).experience,
    'Experience must be a whole number zero or greater.'
  );
});

test('maps 401 login to invalid credentials message', () => {
  assert.equal(
    mapLoginError(new ApiError({ message: 'Unauthorized', httpStatus: 401 })),
    'Invalid email or password.'
  );
});

test('login 404 invalid credentials maps to friendly login message', () => {
  assert.equal(
    mapLoginError({
      response: {
        status: 404,
        data: {
          status: 'ERROR',
          msg: 'org.springframework.web.server.ResponseStatusException :404 NOT_FOUND "Invalid credentials"',
        },
      },
    }),
    'Invalid email or password.'
  );
});

test('unrelated 404 does not become an invalid-credentials message', () => {
  assert.equal(
    mapLoginError(new ApiError({ message: 'Customer profile not found.', httpStatus: 404 })),
    'Customer profile not found.'
  );
});

test('registration errors can use safely extracted msg text', () => {
  assert.equal(
    mapRegistrationError({
      response: {
        status: 400,
        data: {
          status: 'ERROR',
          msg: 'org.springframework.web.server.ResponseStatusException :400 BAD_REQUEST "Phone number must be valid"',
        },
      },
    }),
    'Phone number must be valid'
  );
});

test('maps 409 registration to duplicate email message', () => {
  assert.equal(
    mapRegistrationError(new ApiError({ message: 'Conflict', httpStatus: 409 })),
    'This email is already registered. Try logging in instead.'
  );
});

test('duplicate submit guard prevents API call', async () => {
  const authService = createAuthServiceMock({ token: 't', userId: 1, role: 'CUSTOMER' });
  let completed = 0;

  const result = await runLoginSubmission({
    authService,
    completeAuthentication: async () => {
      completed += 1;
    },
    isSubmitting: true,
    values: { email: 'riya@example.com', password: TEST_PASSWORD },
  });

  assert.deepEqual(result, { blocked: true });
  assert.equal(authService.calls.length, 0);
  assert.equal(completed, 0);
});

test('forgot-password submission calls auth reset service with normalized email', async () => {
  const calls = [];
  const result = await runForgotPasswordSubmission({
    authService: {
      async requestPasswordReset(email) {
        calls.push(email);
        return { message: 'Reset instructions sent.' };
      },
    },
    values: { email: ' Customer@HomeEase.COM ' },
  });

  assert.deepEqual(calls, ['customer@homeease.com']);
  assert.deepEqual(result, { ok: true, message: 'Reset instructions sent.' });
});

test('forgot-password duplicate submit guard prevents API call', async () => {
  const result = await runForgotPasswordSubmission({
    authService: {
      async requestPasswordReset() {
        throw new Error('should not be called');
      },
    },
    isSubmitting: true,
    values: { email: 'customer@homeease.com' },
  });

  assert.deepEqual(result, { blocked: true });
});

test('incomplete authentication response is rejected', () => {
  assert.throws(() => ensureCompleteAuthSession({ token: TEST_TOKEN, role: 'CUSTOMER' }), /missing token, userId, or role/i);
});

test('successful login calls completeAuthentication once', async () => {
  const session = { token: TEST_TOKEN, userId: 10, name: 'Riya', email: 'riya@example.com', role: 'CUSTOMER' };
  const authService = createAuthServiceMock(session);
  let completed = 0;

  await runLoginSubmission({
    authService,
    completeAuthentication: async (nextSession) => {
      completed += 1;
      assert.equal(nextSession, session);
    },
    values: { email: 'riya@example.com', password: TEST_PASSWORD },
  });

  assert.equal(completed, 1);
});

test('successful registration defers authentication to OTP verification', async () => {
  // Registration no longer signs anyone in: the backend emails a code and the
  // account is only created by verify-otp.
  const authService = createAuthServiceMock({ message: 'OTP sent to your email', email: 'suresh@example.com' });
  let completed = 0;

  const result = await runProviderRegistrationSubmission({
    authService,
    completeAuthentication: async () => {
      completed += 1;
    },
    values: {
      fullName: 'Suresh',
      email: 'suresh@example.com',
      phone: '9000000004',
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
      categoryId: 1,
      experience: '5',
    },
  });

  assert.equal(completed, 0);
  assert.equal(result.ok, true);
  assert.equal(result.otpRequired, true);
  assert.equal(result.email, 'suresh@example.com');
});

test('successful customer registration calls register with customer payload', async () => {
  const session = { token: TEST_TOKEN, userId: 12, name: 'Riya', email: 'riya@example.com', role: 'CUSTOMER' };
  const authService = createAuthServiceMock(session);

  await runCustomerRegistrationSubmission({
    authService,
    completeAuthentication: async () => {},
    values: {
      fullName: 'Riya',
      email: 'riya@example.com',
      phone: '9000000002',
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
    },
  });

  assert.equal(authService.calls[0][0], 'register');
  assert.equal(authService.calls[0][1].role, 'CUSTOMER');
});

test('PrimaryButton forwards onPress to Pressable', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/PrimaryButton.js'), 'utf8');

  assert.match(source, /function PrimaryButton\(\{[\s\S]*onPress/);
  assert.match(source, /<Pressable[\s\S]*onPress=\{onPress\}/);
});

test('disabled PrimaryButton and loading PrimaryButton suppress native presses', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/PrimaryButton.js'), 'utf8');

  assert.match(source, /const isDisabled = disabled \|\| loading;/);
  assert.match(source, /disabled=\{isDisabled\}/);
});

test('Customer Register invalid submit returns visible field validation errors', async () => {
  const authService = createAuthServiceMock({ token: TEST_TOKEN, userId: 1, role: 'CUSTOMER' });

  const result = await runCustomerRegistrationSubmission({
    authService,
    completeAuthentication: async () => {},
    values: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  assert.deepEqual(result.errors, {
    fullName: 'Full name is required.',
    email: 'Email is required.',
    phone: 'Phone number must be exactly 10 digits.',
    password: 'Password must be at least 6 characters.',
    confirmPassword: 'Confirm your password.',
  });
  assert.equal(authService.calls.length, 0);
});

test('Provider Register submit becomes enabled after category loading, even with category error', () => {
  assert.equal(isProviderRegisterSubmitDisabled({ loading: false, categoryLoading: true }), true);
  assert.equal(isProviderRegisterSubmitDisabled({ loading: true, categoryLoading: false }), true);
  assert.equal(isProviderRegisterSubmitDisabled({ loading: false, categoryLoading: false, categoryError: true }), false);
});

test('network failure maps to visible registration error message', () => {
  const message = mapRegistrationError(new ApiError({ message: 'Network', code: 'NETWORK_ERROR' }));

  assert.equal(
    message,
    'Cannot reach the server. Check that the backend is running and your phone is connected to the same network.'
  );
});

test('ScreenContainer ScrollView keeps submit taps handled while keyboard is open', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/components/ScreenContainer.js'), 'utf8');

  assert.match(source, /keyboardShouldPersistTaps=\{scroll \? 'handled' : undefined\}/);
});

test('Welcome role cards open Login with selected role instead of registration screens', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/screens/auth/AuthScreens.js'), 'utf8');

  assert.match(source, /onCustomer=\{\(\) => navigation\.navigate\('Login', \{ role: 'CUSTOMER' \}\)\}/);
  assert.match(source, /onProvider=\{\(\) => navigation\.navigate\('Login', \{ role: 'PROVIDER' \}\)\}/);
});

test('Login screen exposes forgot-password route', () => {
  const authScreens = fs.readFileSync(path.join(PROJECT_ROOT, 'src/screens/auth/AuthScreens.js'), 'utf8');
  const authStack = fs.readFileSync(path.join(PROJECT_ROOT, 'src/navigation/AuthStack.js'), 'utf8');
  const preview = fs.readFileSync(path.join(PROJECT_ROOT, 'src/screens/preview/Cycle1PreviewScreens.js'), 'utf8');

  assert.match(authScreens, /onForgotPassword=\{\(\) => navigation\.navigate\('ForgotPassword'\)\}/);
  assert.match(authStack, /<Stack\.Screen name="ForgotPassword" component=\{ForgotPasswordScreen\}/);
  assert.match(preview, /Forgot password\?/);
});

test('Login register link opens role-specific registration screen when role was selected', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/screens/auth/AuthScreens.js'), 'utf8');

  assert.match(source, /const selectedRole = route\?\.params\?\.role;/);
  assert.match(source, /if \(selectedRole === 'CUSTOMER'\) \{[\s\S]*navigation\.navigate\('CustomerRegister'\);/);
  assert.match(source, /if \(selectedRole === 'PROVIDER'\) \{[\s\S]*navigation\.navigate\('ProviderRegister'\);/);
  assert.match(source, /navigation\.navigate\('Welcome'\);/);
});

test('Provider available jobs handles missing real endpoint as backend notice', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/screens/provider/ProviderScreens.js'), 'utf8');

  assert.match(source, /isUnsupportedEndpointError\(nextError\)/);
  assert.match(source, /setBackendNotice\(message\);/);
  assert.match(source, /<EmptyState message=\{backendNotice\} \/>/);
});
