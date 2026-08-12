const { normalizeApiError } = require('../api/errors');
const { hasRequiredSessionFields } = require('./sessionStorage');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function validateLogin(values) {
  const errors = {};
  const email = normalizeEmail(values.email);

  if (!email) {
    errors.email = 'Email is required.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

function validateForgotPassword(values) {
  const errors = {};
  const email = normalizeEmail(values.email);

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  return errors;
}

function buildLoginPayload(values) {
  return {
    email: normalizeEmail(values.email),
    password: values.password || '',
  };
}

function buildForgotPasswordPayload(values) {
  return {
    email: normalizeEmail(values.email),
  };
}

function validateCustomerRegistration(values) {
  const errors = {};
  const fullName = String(values.fullName || '').trim();
  const email = normalizeEmail(values.email);
  const phone = digitsOnly(values.phone);

  if (!fullName) {
    errors.fullName = 'Full name is required.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (phone.length !== 10) {
    errors.phone = 'Phone number must be exactly 10 digits.';
  }

  if (!values.password || values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function buildCustomerRegistrationPayload(values) {
  return {
    name: String(values.fullName || '').trim(),
    email: normalizeEmail(values.email),
    password: values.password || '',
    role: 'CUSTOMER',
    phone: digitsOnly(values.phone),
  };
}

function validateProviderRegistration(values) {
  const errors = validateCustomerRegistration(values);
  const experience = String(values.experience || '');

  if (!values.categoryId) {
    errors.categoryId = 'Choose a service category.';
  }

  if (experience && !/^\d+$/.test(experience)) {
    errors.experience = 'Experience must be a whole number zero or greater.';
  }

  return errors;
}

function buildProviderRegistrationPayload(values) {
  return {
    ...buildCustomerRegistrationPayload(values),
    role: 'PROVIDER',
    categoryId: Number(values.categoryId),
    experience: values.experience === '' || values.experience === null || values.experience === undefined
      ? 0
      : Number(values.experience),
  };
}

function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

function createContractAuthError() {
  const error = new Error('Authentication response was missing token, userId, or role.');
  error.code = 'AUTH_CONTRACT_ERROR';
  return error;
}

function ensureCompleteAuthSession(session) {
  if (!hasRequiredSessionFields(session)) {
    throw createContractAuthError();
  }

  return session;
}

function hasInvalidCredentialsMessage(message) {
  return String(message || '').toLowerCase().includes('invalid credentials');
}

function mapLoginError(error) {
  const apiError = normalizeApiError(error);

  if (hasInvalidCredentialsMessage(apiError.message)) {
    return 'Invalid email or password.';
  }

  if (apiError.httpStatus === 400) {
    return 'Please enter your email and password.';
  }

  if (apiError.httpStatus === 401) {
    return 'Invalid email or password.';
  }

  if (apiError.code === 'NETWORK_ERROR') {
    return 'Cannot reach the server. Check that the backend is running and your phone is connected to the same network.';
  }

  if (apiError.code === 'TIMEOUT') {
    return 'The request timed out. Please try again.';
  }

  return apiError.message || 'Login failed. Please try again.';
}

function mapRegistrationError(error, context = {}) {
  const apiError = normalizeApiError(error);

  if (apiError.httpStatus === 409) {
    return 'This email is already registered. Try logging in instead.';
  }

  if (context.category && apiError.httpStatus === 400) {
    return apiError.message || 'Choose a valid service category.';
  }

  if (apiError.code === 'NETWORK_ERROR') {
    return 'Cannot reach the server. Check that the backend is running and your phone is connected to the same network.';
  }

  if (apiError.code === 'TIMEOUT') {
    return 'The request timed out. Please try again.';
  }

  return apiError.message || 'Registration failed. Please try again.';
}

function isProviderRegisterSubmitDisabled({ loading = false, categoryLoading = false } = {}) {
  return Boolean(loading || categoryLoading);
}

const OTP_LENGTH = 6;

function validateOtpCode(values) {
  const errors = {};
  const code = digitsOnly(values.code);

  if (!code) {
    errors.code = 'Enter the code from your email.';
  } else if (code.length !== OTP_LENGTH) {
    errors.code = `Enter all ${OTP_LENGTH} digits.`;
  }

  return errors;
}

function mapOtpError(error) {
  const apiError = normalizeApiError(error);
  const message = String(apiError.message || '');
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('invalid code')) {
    return "That code doesn't match. Try again.";
  }

  if (lowerMessage.includes('expired')) {
    return 'This code expired. Tap Resend for a new one.';
  }

  // "Too many attempts..." and "Please wait before resending" already read well.
  if (lowerMessage.includes('too many attempts') || apiError.httpStatus === 429) {
    return message;
  }

  if (lowerMessage.includes('no pending registration')) {
    return message;
  }

  // Kept specific rather than generic: on a LAN demo this points straight at
  // the backend instead of sending you into the app code.
  if (apiError.code === 'NETWORK_ERROR') {
    return 'Cannot reach the server. Check that the backend is running and your phone is connected to the same network.';
  }

  if (apiError.code === 'TIMEOUT') {
    return 'The request timed out. Please try again.';
  }

  return 'Something went wrong, please try again';
}

async function runVerifyOtpSubmission({ values, authService, completeAuthentication, isSubmitting = false }) {
  if (isSubmitting) {
    return { blocked: true };
  }

  const errors = validateOtpCode(values);
  if (hasErrors(errors)) {
    return { ok: false, errors };
  }

  const session = ensureCompleteAuthSession(
    await authService.verifyOtp({
      email: normalizeEmail(values.email),
      code: digitsOnly(values.code),
    })
  );

  await completeAuthentication(session);
  return { ok: true };
}

async function runResendOtpSubmission({ values, authService, isSubmitting = false }) {
  if (isSubmitting) {
    return { blocked: true };
  }

  const result = await authService.resendOtp({ email: normalizeEmail(values.email) });

  return {
    ok: true,
    message: result?.message || 'A new code is on its way.',
  };
}

async function runLoginSubmission({ values, authService, completeAuthentication, isSubmitting = false }) {
  if (isSubmitting) {
    return { blocked: true };
  }

  const errors = validateLogin(values);
  if (hasErrors(errors)) {
    return { ok: false, errors };
  }

  const payload = buildLoginPayload(values);
  const session = ensureCompleteAuthSession(await authService.login(payload.email, payload.password));
  await completeAuthentication(session);
  return { ok: true };
}

async function runForgotPasswordSubmission({ values, authService, isSubmitting = false }) {
  if (isSubmitting) {
    return { blocked: true };
  }

  const errors = validateForgotPassword(values);
  if (hasErrors(errors)) {
    return { ok: false, errors };
  }

  const payload = buildForgotPasswordPayload(values);
  const result = await authService.requestPasswordReset(payload.email);
  return {
    ok: true,
    message: result?.message || 'If an account exists, password reset instructions have been sent.',
  };
}

// Registration no longer authenticates. It asks the backend to email a code and
// hands the caller the email to carry into the OTP screen; the account is only
// created once that code is verified.
async function runCustomerRegistrationSubmission({ values, authService, isSubmitting = false }) {
  if (isSubmitting) {
    return { blocked: true };
  }

  const errors = validateCustomerRegistration(values);
  if (hasErrors(errors)) {
    return { ok: false, errors };
  }

  const payload = buildCustomerRegistrationPayload(values);
  const result = await authService.register(payload);

  return {
    ok: true,
    otpRequired: true,
    email: result?.email || payload.email,
  };
}

async function runProviderRegistrationSubmission({ values, authService, isSubmitting = false }) {
  if (isSubmitting) {
    return { blocked: true };
  }

  const errors = validateProviderRegistration(values);
  if (hasErrors(errors)) {
    return { ok: false, errors };
  }

  const payload = buildProviderRegistrationPayload(values);
  const result = await authService.register(payload);

  return {
    ok: true,
    otpRequired: true,
    email: result?.email || payload.email,
  };
}

module.exports = {
  buildCustomerRegistrationPayload,
  buildForgotPasswordPayload,
  buildLoginPayload,
  buildProviderRegistrationPayload,
  digitsOnly,
  ensureCompleteAuthSession,
  isProviderRegisterSubmitDisabled,
  mapLoginError,
  mapOtpError,
  mapRegistrationError,
  normalizeEmail,
  runCustomerRegistrationSubmission,
  runForgotPasswordSubmission,
  runLoginSubmission,
  runProviderRegistrationSubmission,
  runResendOtpSubmission,
  runVerifyOtpSubmission,
  validateCustomerRegistration,
  validateForgotPassword,
  validateLogin,
  validateOtpCode,
  validateProviderRegistration,
};
