const assert = require('node:assert/strict');
const test = require('node:test');
const {
  TOKEN_STORAGE_KEY,
  attachAuthToken,
  handleSuccessResponse,
} = require('../api/client');
const {
  extractFinalQuotedMessage,
  getUserFriendlyErrorMessage,
  isForbiddenError,
  isNetworkError,
  isUnauthorizedError,
  isUnsupportedEndpointError,
  normalizeApiError,
} = require('../api/errors');
const { normalizeApiPayload } = require('../api/normalizers');
const { adaptBookingList, createRealBookingsService, toStatusPayload } = require('../api/bookings');
const {
  adaptCreatedBooking,
  adaptCreatedReview,
  adaptStatusUpdate,
  createUnsupportedEndpointError,
  formatBookingDateForApi,
  toCreateBookingPayload,
  toCreateReviewPayload,
} = require('../api/bookingContract');
const { createRealReviewsService } = require('../api/reviews');
const { createRealServicesService } = require('../api/services');
const { createRealCycle2Service } = require('../api/cycle2');

const TEST_TOKEN = ['abc', 'def', 'ghi'].join('.');

test('unwraps success wrapper and normalizes nested snake_case keys', () => {
  const result = handleSuccessResponse({
    status: 200,
    data: {
      status: 'SUCCESS',
      data: {
        user_id: 10,
        nested_value: {
          is_approved: true,
          image_url: null,
        },
      },
    },
  });

  assert.deepEqual(result, {
    userId: 10,
    nestedValue: {
      isApproved: true,
      imageUrl: null,
    },
  });
});

test('normalizes arrays of objects and preserves primitives', () => {
  const result = normalizeApiPayload({
    providers: [
      { provider_id: 1, category_id: 2 },
      { provider_id: 3, category_id: 4 },
    ],
    label: 'Provider list',
  });

  assert.deepEqual(result, {
    providers: [
      { providerId: 1, categoryId: 2 },
      { providerId: 3, categoryId: 4 },
    ],
    label: 'Provider list',
  });
});

test('preserves null values safely', () => {
  assert.deepEqual(normalizeApiPayload({ provider_id: null }), { providerId: null });
});

test('converts total_price string to numeric totalPrice', () => {
  assert.deepEqual(normalizeApiPayload({ total_price: '299.00' }), { totalPrice: 299 });
});

test('converts service price string to numeric price', () => {
  assert.deepEqual(normalizeApiPayload({ price: '499.50' }), { price: 499.5 });
});

test('preserves count and compact bookings structure', () => {
  const result = handleSuccessResponse({
    status: 200,
    data: {
      status: 'SUCCESS',
      data: {
        count: 1,
        bookings: [
          {
            id: 7,
            customer_id: 10,
            provider_id: null,
            service_id: 4,
            booking_date: '2026-06-20T04:30:00.000Z',
            status: 'PENDING',
            address: '14 MG Road, Indore',
            total_price: '499.00',
            accepted_at: null,
            completed_at: null,
            cancelled_at: null,
            created_at: '2026-06-18T08:56:23.000Z',
            updated_at: '2026-06-18T08:56:23.000Z',
          },
        ],
      },
    },
  });

  assert.deepEqual(result, {
    count: 1,
    bookings: [
      {
        id: 7,
        customerId: 10,
        providerId: null,
        serviceId: 4,
        bookingDate: '2026-06-20T04:30:00.000Z',
        status: 'PENDING',
        address: '14 MG Road, Indore',
        totalPrice: 499,
        acceptedAt: null,
        completedAt: null,
        cancelledAt: null,
        createdAt: '2026-06-18T08:56:23.000Z',
        updatedAt: '2026-06-18T08:56:23.000Z',
      },
    ],
  });
});

test('returns data:null success as null', () => {
  const result = handleSuccessResponse({
    status: 200,
    data: { status: 'SUCCESS', data: null },
  });

  assert.equal(result, null);
});

test('extracts backend error message and preserves HTTP status', () => {
  const result = normalizeApiError({
    response: {
      status: 400,
      data: {
        status: 'ERROR',
        error: 'Bad Request',
        message: 'Email is already registered',
        timestamp: '2026-06-18T14:30:00Z',
      },
    },
  });

  assert.equal(result.message, 'Email is already registered');
  assert.equal(result.httpStatus, 400);
  assert.equal(result.error, 'Bad Request');
  assert.equal(result.timestamp, '2026-06-18T14:30:00Z');
  assert.equal(getUserFriendlyErrorMessage(result), 'Email is already registered');
});

test('ERROR response using message preserves safe message', () => {
  const result = normalizeApiError({
    response: {
      status: 400,
      data: {
        status: 'ERROR',
        message: 'Email is required',
      },
    },
  });

  assert.equal(result.message, 'Email is required');
  assert.equal(result.httpStatus, 400);
});

test('ERROR response using msg preserves safe message', () => {
  const result = normalizeApiError({
    response: {
      status: 404,
      data: {
        status: 'ERROR',
        msg: 'Invalid credentials',
      },
    },
  });

  assert.equal(result.message, 'Invalid credentials');
  assert.equal(result.httpStatus, 404);
});

test('Spring exception string extracts final quoted message', () => {
  const springText =
    'org.springframework.web.server.ResponseStatusException :404 NOT_FOUND "Invalid credentials"';
  const result = normalizeApiError({
    response: {
      status: 404,
      data: {
        status: 'ERROR',
        msg: springText,
      },
    },
  });

  assert.equal(extractFinalQuotedMessage(springText), 'Invalid credentials');
  assert.equal(result.message, 'Invalid credentials');
  assert.equal(result.message.includes('org.springframework'), false);
  assert.equal(result.message.includes('ResponseStatusException'), false);
});

test('classifies network errors separately from HTTP errors', () => {
  const result = normalizeApiError({ request: {}, message: 'Network Error' });

  assert.equal(result.code, 'NETWORK_ERROR');
  assert.equal(isNetworkError(result), true);
});

test('preserves empty booking response shape', () => {
  const result = handleSuccessResponse({
    status: 200,
    data: { status: 'SUCCESS', data: { count: 0, bookings: [] } },
  });

  assert.deepEqual(result, { count: 0, bookings: [] });
});

test('ERROR body returned with HTTP 200 is rejected as ApiError', () => {
  assert.throws(
    () =>
      handleSuccessResponse({
        status: 200,
        data: {
          status: 'ERROR',
          msg: 'org.springframework.web.server.ResponseStatusException :404 NOT_FOUND "Invalid credentials"',
        },
      }),
    (error) => {
      assert.equal(error.name, 'ApiError');
      assert.equal(error.httpStatus, 200);
      assert.equal(error.message, 'Invalid credentials');
      return true;
    }
  );
});

test('malformed success response remains rejected', () => {
  assert.throws(
    () =>
      handleSuccessResponse({
        status: 200,
        data: { status: 'SUCCESS' },
      }),
    /Unexpected API response shape/
  );
});

test('Booking Service strict success handling remains unchanged', () => {
  assert.throws(
    () =>
      handleSuccessResponse({
        status: 200,
        data: { count: 0, bookings: [] },
      }),
    /Expected \{ status: "SUCCESS", data \}/
  );
});

test('normalizes available-jobs target response without PII fields', () => {
  const result = handleSuccessResponse({
    status: 200,
    data: {
      status: 'SUCCESS',
      data: {
        count: 1,
        bookings: [
          {
            id: 7,
            service_id: 4,
            service_name: 'AC Service',
            booking_date: '2026-06-20T04:30:00.000Z',
            location: 'Indore',
            total_price: '499.00',
            status: 'PENDING',
            created_at: '2026-06-18T08:56:23.000Z',
          },
        ],
      },
    },
  });

  assert.deepEqual(result, {
    count: 1,
    bookings: [
      {
        id: 7,
        serviceId: 4,
        serviceName: 'AC Service',
        bookingDate: '2026-06-20T04:30:00.000Z',
        location: 'Indore',
        totalPrice: 499,
        status: 'PENDING',
        createdAt: '2026-06-18T08:56:23.000Z',
      },
    ],
  });
  assert.equal(Object.prototype.hasOwnProperty.call(result.bookings[0], 'customerId'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.bookings[0], 'address'), false);
});

test('does not convert invalid numeric money strings to zero', () => {
  assert.deepEqual(normalizeApiPayload({ total_price: 'not-a-price', price: '' }), {
    totalPrice: 'not-a-price',
    price: '',
  });
});

test('attaches JWT from AsyncStorage-compatible token storage', async () => {
  const config = await attachAuthToken(
    { headers: {} },
    {
      baseURL: 'http://localhost:8081',
      envKey: 'EXPO_PUBLIC_AUTH_BASE_URL',
      tokenStorage: {
        getItem: async (key) => (key === TOKEN_STORAGE_KEY ? TEST_TOKEN : null),
      },
    }
  );

  assert.equal(config.headers.Authorization, `Bearer ${TEST_TOKEN}`);
});

test('skips JWT attachment for public auth requests', async () => {
  const config = await attachAuthToken(
    { headers: {}, skipAuth: true },
    {
      baseURL: 'http://localhost:8081',
      envKey: 'EXPO_PUBLIC_AUTH_BASE_URL',
      tokenStorage: {
        getItem: async () => TEST_TOKEN,
      },
    }
  );

  assert.equal(config.headers.Authorization, undefined);
});

test('throws a clear configuration error before requests without base URL', async () => {
  await assert.rejects(
    () =>
      attachAuthToken(
        { headers: {} },
        {
          baseURL: '',
          envKey: 'EXPO_PUBLIC_AUTH_BASE_URL',
          tokenStorage: { getItem: async () => null },
        }
      ),
    /Missing EXPO_PUBLIC_AUTH_BASE_URL/
  );
});

test('helper predicates identify 401 and 403 errors', () => {
  assert.equal(isUnauthorizedError({ response: { status: 401, data: { message: 'Expired' } } }), true);
  assert.equal(isForbiddenError({ response: { status: 403, data: { message: 'Forbidden' } } }), true);
});

test('status update helper accepts string or object payloads', () => {
  assert.deepEqual(toStatusPayload('ACCEPTED'), { status: 'ACCEPTED' });
  assert.deepEqual(toStatusPayload({ status: 'COMPLETED' }), { status: 'COMPLETED' });
});

test('Booking Service create payload uses existing snake_case contract', () => {
  const formattedDate = formatBookingDateForApi('2026-08-20T10:00:00.000+05:30');

  assert.match(formattedDate, /^2026-08-20 \d{2}:00:00$/);
  assert.deepEqual(
    toCreateBookingPayload({
      serviceId: 4,
      providerId: 8,
      bookingDate: '2026-08-20T10:00:00.000+05:30',
      address: '14 MG Road, Indore',
    }),
    {
      service_id: 4,
      provider_id: 8,
      booking_date: formattedDate,
      address: '14 MG Road, Indore',
    }
  );
});

test('Booking Service create response is adapted to mobile id', () => {
  assert.deepEqual(adaptCreatedBooking({ bookingId: 15 }), {
    bookingId: 15,
    id: 15,
  });
  assert.deepEqual(adaptStatusUpdate({ bookingId: 7, status: 'ACCEPTED' }), {
    bookingId: 7,
    id: 7,
    status: 'ACCEPTED',
  });
});

test('real bookings adapter uses Cycle 2 action endpoints for status updates', async () => {
  const calls = [];
  const api = {
    async post(path, payload) {
      calls.push({ method: 'post', path, payload });
      return { id: 15 };
    },
    async put(path, payload) {
      calls.push({ method: 'put', path, payload });
      return { id: 7, status: 'ACCEPTED' };
    },
    async get(path, options) {
      calls.push({ method: 'get', path, options });
      return { count: 1, bookings: [{ id: 7, bookingDate: '2026-08-20T10:00:00.000Z', status: 'ACCEPTED' }] };
    },
  };
  const service = createRealBookingsService(api);

  const created = await service.create({
    serviceId: 4,
    providerId: 8,
    bookingDate: '2026-08-20T10:00:00.000+05:30',
    address: '14 MG Road, Indore',
  });
  const updated = await service.updateStatus(7, 'ACCEPTED');

  assert.deepEqual(calls[0], {
    method: 'post',
    path: '/api/bookings',
    payload: {
      service_id: 4,
      provider_id: 8,
      booking_date: calls[0].payload.booking_date,
      address: '14 MG Road, Indore',
    },
  });
  assert.match(calls[0].payload.booking_date, /^2026-08-20 \d{2}:00:00$/);
  assert.equal(created.id, 15);
  assert.deepEqual(calls[1], {
    method: 'put',
    path: '/api/provider/bookings/7/accept',
    payload: undefined,
  });
  assert.equal(calls[2].method, 'get');
  assert.equal(calls[2].path, '/api/provider/bookings');
  assert.equal(updated.id, 7);
  assert.equal(updated.status, 'ACCEPTED');
});

test('real bookings adapter normalizes Cycle 2 array list responses', async () => {
  assert.deepEqual(adaptBookingList([{ id: 1 }, { id: 2 }]), {
    count: 2,
    bookings: [{ id: 1 }, { id: 2 }],
  });

  const calls = [];
  const service = createRealBookingsService({
    async get(path, options) {
      calls.push({ path, options });
      return [{ id: 9 }];
    },
  });

  assert.deepEqual(await service.listAvailable(), { count: 1, bookings: [{ id: 9 }] });
  assert.deepEqual(await service.listProviderToday(), { count: 1, bookings: [{ id: 9 }] });
  assert.equal(calls[0].path, '/api/provider/bookings/available');
  assert.equal(calls[1].path, '/api/provider/bookings/today');
});

test('real bookings adapter exposes existing health endpoints', async () => {
  const calls = [];
  const service = createRealBookingsService({
    async get(path) {
      calls.push(path);
      return { message: path === '/' ? 'HomeEase Booking Service is running' : 'Database connected successfully' };
    },
  });

  assert.deepEqual(await service.health(), { message: 'HomeEase Booking Service is running' });
  assert.deepEqual(await service.testDb(), { message: 'Database connected successfully' });
  assert.deepEqual(calls, ['/', '/api/test-db']);
});

test('real service detail resolves from existing service catalogue endpoint', async () => {
  const calls = [];
  const service = createRealServicesService({
    async get(path) {
      calls.push(path);
      return [{ id: 2, categoryName: 'Cleaning' }];
    },
  });

  assert.deepEqual(await service.getOne(2), { id: 2, categoryName: 'Cleaning' });
  assert.deepEqual(calls, ['/api/services']);
});

test('real review adapter builds booking-owned review payload', () => {
  assert.deepEqual(
    toCreateReviewPayload({ bookingId: 5, providerId: 9, rating: 3, comment: 'Good service' }),
    {
      booking_id: 5,
      provider_id: 9,
      rating: 3,
      comment: 'Good service',
    }
  );
  assert.deepEqual(adaptCreatedReview({ reviewId: 3, averageRating: 4.2 }), {
    reviewId: 3,
    id: 3,
    averageRating: 4.2,
  });
});

test('real review adapter posts existing Booking Service review contract', async () => {
  const calls = [];
  const service = createRealReviewsService({
    async post(path, payload) {
      calls.push({ method: 'post', path, payload });
      return { reviewId: 3, averageRating: 4.2 };
    },
  });

  const result = await service.create({ bookingId: 5, providerId: 9, rating: 3, comment: 'Good service' });

  assert.deepEqual(calls[0], {
    method: 'post',
    path: '/api/reviews',
    payload: {
      booking_id: 5,
      provider_id: 9,
      rating: 3,
      comment: 'Good service',
    },
  });
  assert.equal(result.id, 3);
});

test('missing current Booking Service endpoints expose unsupported endpoint errors', async () => {
  const error = createUnsupportedEndpointError('Available jobs are not available.');
  const reviewService = createRealReviewsService({});

  assert.equal(error.name, 'ApiError');
  assert.equal(error.code, 'UNSUPPORTED_ENDPOINT');
  assert.equal(isUnsupportedEndpointError(error), true);
  assert.equal(error.message, 'Available jobs are not available.');
  await assert.rejects(() => reviewService.listForProvider(1), /Provider review lists are not available/);
});

test('real Cycle 2 adapter maps address endpoints from contract', async () => {
  const calls = [];
  const service = createRealCycle2Service({
    auth: {
      async get(path) {
        calls.push(['get', path]);
        return [{ id: 1, label: 'Home' }];
      },
      async post(path, payload) {
        calls.push(['post', path, payload]);
        return { id: 2, ...payload };
      },
      async put(path, payload) {
        calls.push(['put', path, payload]);
        return { id: 1, ...(payload || {}), isDefault: true };
      },
      async delete(path) {
        calls.push(['delete', path]);
        return null;
      },
    },
    booking: {},
  });

  assert.deepEqual(await service.listAddresses(), {
    count: 1,
    addresses: [{ id: 1, label: 'Home' }],
  });
  await service.createAddress({ label: 'Work' });
  await service.updateAddress(1, { label: 'Home Updated' });
  await service.setDefaultAddress(1);
  await service.deleteAddress(1);

  assert.deepEqual(calls, [
    ['get', '/api/addresses'],
    ['post', '/api/addresses', { label: 'Work' }],
    ['put', '/api/addresses/1', { label: 'Home Updated' }],
    ['put', '/api/addresses/1/default', null],
    ['delete', '/api/addresses/1'],
  ]);
});

test('real Cycle 2 adapter maps notification endpoints and read state', async () => {
  const calls = [];
  const service = createRealCycle2Service({
    auth: {},
    booking: {
      async get(path, options) {
        calls.push(['get', path, options]);
        return [
          { id: 1, title: 'New job', isRead: false },
          { id: 2, title: 'Done', isRead: true },
        ];
      },
      async put(path) {
        calls.push(['put', path]);
        return null;
      },
      async delete(path) {
        calls.push(['delete', path]);
        return null;
      },
    },
  });

  assert.deepEqual(await service.listNotifications({ unread: true }), {
    count: 2,
    unreadCount: 1,
    notifications: [
      { id: 1, title: 'New job', isRead: false, read: false },
      { id: 2, title: 'Done', isRead: true, read: true },
    ],
  });
  await service.markNotificationRead(1);
  await service.markAllNotificationsRead();
  await service.deleteNotification(1);

  assert.equal(calls[0][1], '/api/notifications');
  assert.deepEqual(calls[0][2], { params: { unread: true } });
  assert.deepEqual(calls.slice(1), [
    ['put', '/api/notifications/1/read'],
    ['put', '/api/notifications/read-all'],
    ['delete', '/api/notifications/1'],
  ]);
});
