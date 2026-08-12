class ApiError extends Error {
  constructor({
    message,
    httpStatus = null,
    error = null,
    timestamp = null,
    code = 'API_ERROR',
    originalError = null,
  }) {
    super(message || 'Something went wrong.');
    this.name = 'ApiError';
    this.httpStatus = httpStatus;
    this.error = error;
    this.timestamp = timestamp;
    this.code = code;
    this.originalError = originalError;
  }
}

function createConfigError(envKey, originalError = null) {
  return new ApiError({
    message: `Missing ${envKey}. Set it in mobile-app/.env using your LAN URL before calling the API.`,
    code: 'CONFIG_ERROR',
    originalError,
  });
}

function createContractError(message, httpStatus = null, originalError = null) {
  return new ApiError({
    message,
    httpStatus,
    error: 'Contract Error',
    code: 'CONTRACT_ERROR',
    originalError,
  });
}

function extractFinalQuotedMessage(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const matches = [...value.matchAll(/"([^"]+)"/g)];
  if (matches.length === 0) {
    return null;
  }

  const finalMatch = matches[matches.length - 1];
  return finalMatch && finalMatch[1] ? finalMatch[1].trim() : null;
}

function containsUnsafeExceptionText(value) {
  const text = String(value || '');
  return (
    text.includes('org.springframework') ||
    text.includes('java.') ||
    /\b[A-Za-z]+Exception\b/.test(text) ||
    /\bat\s+[\w.$]+\(.*:\d+\)/.test(text)
  );
}

function maskSensitiveTokens(value) {
  return String(value || '').replace(
    /\b[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    '[redacted token]'
  );
}

function sanitizeBackendMessage(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const quotedMessage = extractFinalQuotedMessage(value);
  const candidate = quotedMessage || value;
  const oneLine = maskSensitiveTokens(candidate).split(/\r?\n/)[0].trim();

  if (!oneLine) {
    return null;
  }

  if (!quotedMessage && containsUnsafeExceptionText(oneLine)) {
    return null;
  }

  return oneLine;
}

function getBackendMessage(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  return sanitizeBackendMessage(data.message) || sanitizeBackendMessage(data.msg) || sanitizeBackendMessage(data.error);
}

function normalizeApiError(originalError) {
  if (originalError instanceof ApiError) {
    return originalError;
  }

  if (originalError && originalError.response) {
    const { status, data } = originalError.response;
    const backendMessage = getBackendMessage(data);

    return new ApiError({
      message: backendMessage || 'The server could not complete the request.',
      httpStatus: status || null,
      error: data && data.error ? data.error : null,
      timestamp: data && data.timestamp ? data.timestamp : null,
      code: status >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR',
      originalError,
    });
  }

  if (
    originalError &&
    (originalError.code === 'ECONNABORTED' ||
      originalError.code === 'ETIMEDOUT' ||
      String(originalError.message || '').toLowerCase().includes('timeout'))
  ) {
    return new ApiError({
      message: 'The request timed out. Please try again.',
      code: 'TIMEOUT',
      originalError,
    });
  }

  if (originalError && originalError.request && !originalError.response) {
    return new ApiError({
      message: 'Unable to reach the server. Check your connection and LAN URL.',
      code: 'NETWORK_ERROR',
      originalError,
    });
  }

  return new ApiError({
    message: 'Something went wrong.',
    code: 'UNKNOWN_ERROR',
    originalError,
  });
}

function isUnauthorizedError(error) {
  return normalizeApiError(error).httpStatus === 401;
}

function isForbiddenError(error) {
  return normalizeApiError(error).httpStatus === 403;
}

function isNetworkError(error) {
  return normalizeApiError(error).code === 'NETWORK_ERROR';
}

function isUnsupportedEndpointError(error) {
  return normalizeApiError(error).code === 'UNSUPPORTED_ENDPOINT';
}

function isNotFoundOrMethodError(error) {
  const apiError = normalizeApiError(error);
  return apiError.httpStatus === 404 || apiError.httpStatus === 405;
}

function getUserFriendlyErrorMessage(error) {
  return normalizeApiError(error).message;
}

module.exports = {
  ApiError,
  createConfigError,
  createContractError,
  extractFinalQuotedMessage,
  getUserFriendlyErrorMessage,
  isForbiddenError,
  isNetworkError,
  isNotFoundOrMethodError,
  isUnauthorizedError,
  isUnsupportedEndpointError,
  normalizeApiError,
  sanitizeBackendMessage,
};
