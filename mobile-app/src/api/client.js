const axios = require('axios');
const {
  AUTH_BASE_URL_ENV,
  BOOKING_BASE_URL_ENV,
  getAuthBaseUrl,
  getBookingBaseUrl,
} = require('./config');
const {
  createConfigError,
  createContractError,
  normalizeApiError,
} = require('./errors');
const { normalizeApiPayload } = require('./normalizers');
const { STORAGE_KEYS } = require('../utils/sessionStorage');

const API_TIMEOUT_MS = 10000;
const TOKEN_STORAGE_KEY = STORAGE_KEYS.token;

function getAsyncStorage() {
  const storageModule = require('@react-native-async-storage/async-storage');
  return storageModule.default || storageModule;
}

function ensureBaseUrl(baseURL, envKey) {
  if (!baseURL) {
    throw createConfigError(envKey);
  }
}

async function attachAuthToken(config, options = {}) {
  const {
    baseURL = config.baseURL,
    envKey = 'EXPO_PUBLIC_BASE_URL',
    tokenStorage = getAsyncStorage(),
  } = options;

  ensureBaseUrl(baseURL, envKey);

  if (config.skipAuth) {
    return config;
  }

  const token = await tokenStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

function handleSuccessResponse(response) {
  const responseBody = response ? response.data : null;

  if (responseBody && responseBody.status === 'ERROR') {
    throw normalizeApiError({
      response: {
        status: response ? response.status : null,
        data: responseBody,
      },
    });
  }

  if (
    response &&
    response.config &&
    response.config.allowEmptyResponse &&
    (response.status === 204 || responseBody === null || responseBody === undefined || responseBody === '')
  ) {
    return null;
  }

  if (response && response.config && response.config.allowPlainResponse) {
    return normalizeApiPayload(responseBody);
  }

  if (
    !responseBody ||
    responseBody.status !== 'SUCCESS' ||
    !Object.prototype.hasOwnProperty.call(responseBody, 'data')
  ) {
    throw createContractError(
      'Unexpected API response shape. Expected { status: "SUCCESS", data }. ',
      response ? response.status : null,
      response
    );
  }

  return normalizeApiPayload(responseBody.data);
}

function handleResponseError(error) {
  return Promise.reject(normalizeApiError(error));
}

function createApiClient({ baseURL, envKey }) {
  const instance = axios.create({
    baseURL,
    timeout: API_TIMEOUT_MS,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) =>
    attachAuthToken(config, {
      baseURL,
      envKey,
    })
  );
  instance.interceptors.response.use(handleSuccessResponse, handleResponseError);

  return instance;
}

const authApi = createApiClient({
  baseURL: getAuthBaseUrl(),
  envKey: AUTH_BASE_URL_ENV,
});

const bookingApi = createApiClient({
  baseURL: getBookingBaseUrl(),
  envKey: BOOKING_BASE_URL_ENV,
});

module.exports = {
  API_TIMEOUT_MS,
  TOKEN_STORAGE_KEY,
  attachAuthToken,
  authApi,
  bookingApi,
  createApiClient,
  handleResponseError,
  handleSuccessResponse,
};
