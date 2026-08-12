const AUTH_BASE_URL_ENV = 'EXPO_PUBLIC_AUTH_BASE_URL';
const BOOKING_BASE_URL_ENV = 'EXPO_PUBLIC_BOOKING_BASE_URL';
const USE_MOCK_API_ENV = 'EXPO_PUBLIC_USE_MOCK_API';
const USE_MOCK_AVAILABLE_JOBS_ENV = 'EXPO_PUBLIC_USE_MOCK_AVAILABLE_JOBS';
const MOCK_ONLY_CYCLE_MODE = false;

function readEnv(name) {
  if (typeof process === 'undefined' || !process.env) {
    return undefined;
  }

  if (name === AUTH_BASE_URL_ENV) {
    return process.env.EXPO_PUBLIC_AUTH_BASE_URL;
  }

  if (name === BOOKING_BASE_URL_ENV) {
    return process.env.EXPO_PUBLIC_BOOKING_BASE_URL;
  }

  if (name === USE_MOCK_API_ENV) {
    return process.env.EXPO_PUBLIC_USE_MOCK_API;
  }

  if (name === USE_MOCK_AVAILABLE_JOBS_ENV) {
    return process.env.EXPO_PUBLIC_USE_MOCK_AVAILABLE_JOBS;
  }

  return undefined;
}

function isTruthyEnv(value) {
  return String(value || '').trim().toLowerCase() === 'true';
}

function getAuthBaseUrl() {
  return readEnv(AUTH_BASE_URL_ENV);
}

function getBookingBaseUrl() {
  return readEnv(BOOKING_BASE_URL_ENV);
}

function isMockAvailableJobsEnabled() {
  return isTruthyEnv(readEnv(USE_MOCK_AVAILABLE_JOBS_ENV));
}

function isMockApiEnabled() {
  return MOCK_ONLY_CYCLE_MODE || isTruthyEnv(readEnv(USE_MOCK_API_ENV));
}

function getMissingEnvironmentKeys() {
  return [AUTH_BASE_URL_ENV, BOOKING_BASE_URL_ENV].filter((key) => !readEnv(key));
}

module.exports = {
  AUTH_BASE_URL_ENV,
  BOOKING_BASE_URL_ENV,
  MOCK_ONLY_CYCLE_MODE,
  USE_MOCK_API_ENV,
  USE_MOCK_AVAILABLE_JOBS_ENV,
  getAuthBaseUrl,
  getBookingBaseUrl,
  getMissingEnvironmentKeys,
  isMockApiEnabled,
  isMockAvailableJobsEnabled,
  isTruthyEnv,
};
