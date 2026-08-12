const assert = require('node:assert/strict');
const test = require('node:test');
const { createAuthService } = require('../api/auth');
const { ApiError } = require('../api/errors');
const { buildSessionFromUser, isAdminRole, shouldClearSessionForRestoreError } = require('../utils/authSession');
const {
  STORAGE_KEYS,
  createSessionStorage,
} = require('../utils/sessionStorage');

const TEST_TOKEN = ['token', '123'].join('-');

function createMemoryStorage(initialValues = {}) {
  const store = new Map(Object.entries(initialValues));

  return {
    store,
    async multiGet(keys) {
      return keys.map((key) => [key, store.has(key) ? store.get(key) : null]);
    },
    async multiRemove(keys) {
      keys.forEach((key) => store.delete(key));
    },
    async multiSet(entries) {
      entries.forEach(([key, value]) => store.set(key, value));
    },
  };
}

function createApiMock(routes) {
  const calls = [];

  return {
    calls,
    async get(path) {
      calls.push(['get', path]);
      const handler = routes[path];
      if (typeof handler === 'function') {
        return handler();
      }
      if (handler instanceof Error) {
        throw handler;
      }
      return handler;
    },
  };
}

test('saves, reads, and clears a complete session', async () => {
  const memory = createMemoryStorage();
  const sessionStorage = createSessionStorage(memory);

  await sessionStorage.saveSession({
    token: TEST_TOKEN,
    userId: 42,
    name: 'Riya',
    email: 'riya@example.com',
    role: 'CUSTOMER',
  });

  assert.deepEqual(await sessionStorage.readStoredSession(), {
    token: TEST_TOKEN,
    userId: 42,
    name: 'Riya',
    email: 'riya@example.com',
    role: 'CUSTOMER',
  });

  await sessionStorage.clearSession();
  assert.equal(memory.store.size, 0);
});

test('clears corrupt partial session safely', async () => {
  const memory = createMemoryStorage({
    [STORAGE_KEYS.token]: TEST_TOKEN,
    [STORAGE_KEYS.role]: 'CUSTOMER',
  });
  const sessionStorage = createSessionStorage(memory);

  assert.equal(await sessionStorage.readStoredSession(), null);
  assert.equal(memory.store.size, 0);
});

test('authService.me returns direct /me success without fallback', async () => {
  const api = createApiMock({
    '/api/auth/me': { id: 9, name: 'Riya', role: 'CUSTOMER' },
  });
  const service = createAuthService({ api, sessionReader: async () => null });

  assert.deepEqual(await service.me(), {
    id: 9,
    name: 'Riya',
    role: 'CUSTOMER',
    provider: null,
    integrationWarning: undefined,
  });
  assert.deepEqual(api.calls, [['get', '/api/auth/me']]);
});

test('authService.me enriches direct Cycle 1 provider /me with provider fallback', async () => {
  const api = createApiMock({
    '/api/auth/me': { id: 4, name: 'Suresh', role: 'PROVIDER' },
    '/api/providers/user/4': { id: 1, userId: 4, categoryName: 'Electrician', isApproved: true },
  });
  const service = createAuthService({ api, sessionReader: async () => null });

  assert.deepEqual(await service.me(), {
    id: 4,
    name: 'Suresh',
    role: 'PROVIDER',
    provider: { id: 1, userId: 4, categoryName: 'Electrician', isApproved: true },
    integrationWarning: undefined,
  });
  assert.deepEqual(api.calls, [
    ['get', '/api/auth/me'],
    ['get', '/api/providers/user/4'],
  ]);
});

test('authService.me uses 404 compatibility fallback for customer with provider:null', async () => {
  const api = createApiMock({
    '/api/auth/me': new ApiError({ message: 'Missing', httpStatus: 404 }),
    '/api/users/10': { id: 10, name: 'Riya', role: 'CUSTOMER' },
  });
  const service = createAuthService({
    api,
    sessionReader: async () => ({ token: TEST_TOKEN, userId: 10, role: 'CUSTOMER' }),
  });

  assert.deepEqual(await service.me(), {
    id: 10,
    name: 'Riya',
    role: 'CUSTOMER',
    provider: null,
    integrationWarning: undefined,
  });
});

test('authService.me treats current 200 NoResource /me response as missing endpoint', async () => {
  const api = createApiMock({
    '/api/auth/me': new ApiError({
      message: 'The server could not complete the request.',
      httpStatus: 200,
      originalError: {
        response: {
          status: 200,
          data: {
            status: 'ERROR',
            msg: 'org.springframework.web.servlet.resource.NoResourceFoundException :No static resource api/auth/me.',
          },
        },
      },
    }),
    '/api/users/14': { id: 14, name: 'Samruddhi', email: 'test2@homeease.com', role: 'CUSTOMER' },
  });
  const service = createAuthService({
    api,
    sessionReader: async () => ({ token: TEST_TOKEN, userId: 14, role: 'CUSTOMER' }),
  });

  assert.deepEqual(await service.me(), {
    id: 14,
    name: 'Samruddhi',
    email: 'test2@homeease.com',
    role: 'CUSTOMER',
    provider: null,
    integrationWarning: undefined,
  });
  assert.deepEqual(api.calls, [
    ['get', '/api/auth/me'],
    ['get', '/api/users/14'],
  ]);
});

test('authService.me uses 405 fallback and matches provider by userId', async () => {
  const api = createApiMock({
    '/api/auth/me': new ApiError({ message: 'Method not allowed', httpStatus: 405 }),
    '/api/users/4': { id: 4, name: 'Suresh', role: 'PROVIDER' },
    '/api/providers/user/4': { id: 1, userId: 4, categoryName: 'Electrician', isApproved: true },
  });
  const service = createAuthService({
    api,
    sessionReader: async () => ({ token: TEST_TOKEN, userId: 4, role: 'PROVIDER' }),
  });

  assert.deepEqual(await service.me(), {
    id: 4,
    name: 'Suresh',
    role: 'PROVIDER',
    provider: { id: 1, userId: 4, categoryName: 'Electrician', isApproved: true },
    integrationWarning: undefined,
  });
});

test('authService.me preserves provider:null and warning when no provider matches', async () => {
  const api = createApiMock({
    '/api/auth/me': new ApiError({ message: 'Missing', httpStatus: 404 }),
    '/api/users/4': { id: 4, name: 'Suresh', role: 'PROVIDER' },
    '/api/providers/user/4': null,
  });
  const service = createAuthService({
    api,
    sessionReader: async () => ({ token: TEST_TOKEN, userId: 4, role: 'PROVIDER' }),
  });

  assert.deepEqual(await service.me(), {
    id: 4,
    name: 'Suresh',
    role: 'PROVIDER',
    provider: null,
    integrationWarning: 'No provider record matched the authenticated user.',
  });
});

test('authService.me does not fallback after 401', async () => {
  const error = new ApiError({ message: 'Unauthorized', httpStatus: 401 });
  const api = createApiMock({ '/api/auth/me': error });
  const service = createAuthService({
    api,
    sessionReader: async () => ({ token: TEST_TOKEN, userId: 4, role: 'PROVIDER' }),
  });

  await assert.rejects(() => service.me(), error);
  assert.deepEqual(api.calls, [['get', '/api/auth/me']]);
});

test('authService.me does not fallback after network error', async () => {
  const error = new ApiError({ message: 'Network', code: 'NETWORK_ERROR' });
  const api = createApiMock({ '/api/auth/me': error });
  const service = createAuthService({
    api,
    sessionReader: async () => ({ token: TEST_TOKEN, userId: 4, role: 'PROVIDER' }),
  });

  await assert.rejects(() => service.me(), error);
  assert.deepEqual(api.calls, [['get', '/api/auth/me']]);
});

test('admin-session helper keeps admin out of mobile role branches', () => {
  assert.equal(isAdminRole('ADMIN'), true);
  assert.equal(isAdminRole('CUSTOMER'), false);
  assert.equal(
    shouldClearSessionForRestoreError(new ApiError({ message: 'Expired', httpStatus: 401 })),
    true
  );
});

test('buildSessionFromUser stores userId as numeric context value before persistence stringification', () => {
  assert.deepEqual(
    buildSessionFromUser(TEST_TOKEN, { id: 4, name: 'Suresh', email: 'suresh@example.com', role: 'PROVIDER' }),
    {
      token: TEST_TOKEN,
      userId: 4,
      name: 'Suresh',
      email: 'suresh@example.com',
      role: 'PROVIDER',
    }
  );
});
