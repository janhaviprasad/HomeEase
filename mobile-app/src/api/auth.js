const { authApi } = require('./client');
const { isMockApiEnabled } = require('./config');
const { ApiError, isNotFoundOrMethodError } = require('./errors');
const { mockAuthService } = require('./mockStore');
const { readStoredSession } = require('../utils/sessionStorage');

function normalizeUserWithProvider(user, provider = null) {
  return {
    ...user,
    provider,
    integrationWarning: provider ? undefined : user.integrationWarning,
  };
}

function findProviderForUser(providers, userId) {
  if (!Array.isArray(providers)) {
    return null;
  }

  return providers.find((provider) => Number(provider.userId) === Number(userId)) || null;
}

function getRawErrorText(error) {
  const data =
    (error && error.originalError && error.originalError.response && error.originalError.response.data) ||
    (error && error.response && error.response.data) ||
    null;

  return [data && data.message, data && data.msg, error && error.message]
    .filter((value) => typeof value === 'string')
    .join(' ');
}

function isMissingMeEndpointError(error) {
  if (isNotFoundOrMethodError(error)) {
    return true;
  }

  const rawText = getRawErrorText(error).toLowerCase();
  return rawText.includes('no static resource api/auth/me');
}

function createAuthService({ api = authApi, sessionReader = readStoredSession } = {}) {
  return {
  register(payload) {
    return api.post('/api/auth/register', payload, { skipAuth: true });
  },

  login(email, password) {
    return api.post('/api/auth/login', { email, password }, { skipAuth: true });
  },

  // Registration is two-step now: register emails a code and creates nothing,
  // verifyOtp creates the account and returns the same flat session login does.
  verifyOtp({ email, code }) {
    return api.post('/api/auth/verify-otp', { email, code }, { skipAuth: true });
  },

  resendOtp({ email }) {
    return api.post('/api/auth/resend-otp', { email }, { skipAuth: true });
  },

  requestPasswordReset(email) {
    return Promise.reject(
      new ApiError({
        message: 'Forgot password is not available from the current Auth Service contract.',
        code: 'UNSUPPORTED_ENDPOINT',
        error: 'Unsupported Endpoint',
      })
    );
  },

  health() {
    return api.get('/api/auth/health', { skipAuth: true });
  },

  async me() {
    try {
      const user = await api.get('/api/auth/me', { allowPlainResponse: true });
      const userRole = user.role;

      if (userRole === 'CUSTOMER') {
        return normalizeUserWithProvider(user, null);
      }

      if (userRole === 'PROVIDER') {
        if (user.provider) {
          return normalizeUserWithProvider(user, user.provider);
        }

        const provider = await api.get(`/api/providers/user/${user.id || user.userId}`);
        return normalizeUserWithProvider(
          {
            ...user,
            integrationWarning: provider ? undefined : 'No provider record matched the authenticated user.',
          },
          provider
        );
      }

      return user;
    } catch (error) {
      if (!isMissingMeEndpointError(error)) {
        throw error;
      }

      const storedSession = await sessionReader();
      if (!storedSession || !storedSession.userId) {
        throw error;
      }

      const user = await api.get(`/api/users/${storedSession.userId}`, { allowPlainResponse: true });
      const userRole = user.role || storedSession.role;

      if (userRole === 'CUSTOMER') {
        return normalizeUserWithProvider({ ...user, role: userRole }, null);
      }

      if (userRole === 'PROVIDER') {
        const provider = await api.get(`/api/providers/user/${user.id || storedSession.userId}`);
        return normalizeUserWithProvider(
          {
            ...user,
            role: userRole,
            integrationWarning: provider ? undefined : 'No provider record matched the authenticated user.',
          },
          provider
        );
      }

      return { ...user, role: userRole };
    }
  },

  getUser(id) {
    return api.get(`/api/users/${id}`, { allowPlainResponse: true });
  },

  listProviders(params) {
    return api.get('/api/providers', { params });
  },

  getProvider(id) {
    return api.get(`/api/providers/${id}`);
  },

  toggleAvailability(providerId, available) {
    return api.put(`/api/providers/${providerId}/availability`, null, {
      allowPlainResponse: true,
      params: { available },
    });
  },

  async updateProfile(payload) {
    const storedSession = await sessionReader();
    if (!storedSession || !storedSession.userId) {
      throw new Error('Cannot update profile without a signed-in user.');
    }

    return api.put(`/api/users/${storedSession.userId}`, payload, { allowPlainResponse: true });
  },

  async changePassword(payload) {
    const storedSession = await sessionReader();
    if (!storedSession || !storedSession.userId) {
      throw new Error('Cannot change password without a signed-in user.');
    }

    return api.put(`/api/users/${storedSession.userId}/password`, {
      oldPassword: payload.oldPassword || payload.currentPassword,
      newPassword: payload.newPassword,
    }, {
      allowEmptyResponse: true,
    });
  },

  async uploadProfilePicture(formData) {
    const storedSession = await sessionReader();
    if (!storedSession || !storedSession.userId) {
      throw new Error('Cannot upload a profile picture without a signed-in user.');
    }

    return api.post(`/api/users/${storedSession.userId}/profile-picture`, formData, {
      allowPlainResponse: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
}

const authService = isMockApiEnabled() ? mockAuthService : createAuthService();

module.exports = {
  authService,
  createAuthService,
  findProviderForUser,
  isMissingMeEndpointError,
};
