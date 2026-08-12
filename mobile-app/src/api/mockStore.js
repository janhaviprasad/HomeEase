const { ApiError } = require('./errors');
const { readStoredSession } = require('../utils/sessionStorage');
const AsyncStorageModule = require('@react-native-async-storage/async-storage');

const AsyncStorage = AsyncStorageModule.default || AsyncStorageModule;

const MOCK_DELAY_MS = 120;
const MOCK_STATE_STORAGE_KEY = 'homeease:mock-state:v1';
const memoryStorage = new Map();

function futureIso(days, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function delay() {
  return new Promise((resolve) => {
    setTimeout(resolve, MOCK_DELAY_MS);
  });
}

function createHttpError(message, httpStatus = 400, error = 'Bad Request') {
  return new ApiError({
    message,
    httpStatus,
    error,
    code: httpStatus >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR',
  });
}

const services = [
  {
    id: 1,
    categoryId: 1,
    categoryName: 'Electrician',
    name: 'Electrical Repair',
    description: 'Switches, wiring, fans, lights, and small electrical fixes.',
    price: 299,
    imageKey: 'electricalRepair',
    imageUrl: null,
  },
  {
    id: 2,
    categoryId: 2,
    categoryName: 'Plumbing',
    name: 'Plumbing Repair',
    description: 'Leak repair, tap fitting, drain checks, and bathroom fixtures.',
    price: 349,
    imageKey: 'plumbingRepair',
    imageUrl: null,
  },
  {
    id: 3,
    categoryId: 3,
    categoryName: 'Cleaning',
    name: 'Home Deep Cleaning',
    description: 'Kitchen, bathroom, and full-home deep cleaning service.',
    price: 899,
    imageKey: 'homeCleaning',
    imageUrl: null,
  },
  {
    id: 4,
    categoryId: 1,
    categoryName: 'Electrician',
    name: 'AC Service',
    description: 'AC inspection, filter cleaning, and cooling performance check.',
    price: 499,
    imageKey: 'acService',
    imageUrl: null,
  },
];

const users = [
  {
    id: 14,
    userId: 14,
    name: 'Samruddhi',
    email: 'test2@homeease.com',
    phone: '9000000002',
    role: 'CUSTOMER',
    imageUrl: null,
    provider: null,
  },
  {
    id: 4,
    userId: 4,
    name: 'Suresh Kumar',
    email: 'suresh@example.com',
    phone: '9000000004',
    role: 'PROVIDER',
    imageUrl: null,
  },
  {
    id: 24,
    userId: 24,
    name: 'Pending Provider',
    email: 'pending@homeease.test',
    phone: '9000000099',
    role: 'PROVIDER',
    imageUrl: null,
  },
  {
    id: 1,
    userId: 1,
    name: 'HomeEase Admin',
    email: 'admin@homeease.com',
    phone: '9000000001',
    role: 'ADMIN',
    imageUrl: null,
  },
];

let nextUserId = 50;

const providers = [
  {
    id: 1,
    userId: 4,
    name: 'Suresh Kumar',
    email: 'suresh@example.com',
    phone: '9000000004',
    categoryId: 1,
    categoryName: 'Electrician',
    experience: 5,
    availability: true,
    rating: 4.7,
    isApproved: true,
  },
  {
    id: 2,
    userId: 24,
    name: 'Pending Provider',
    email: 'pending@homeease.test',
    phone: '9000000099',
    categoryId: 2,
    categoryName: 'Plumbing',
    experience: 1,
    availability: false,
    rating: 0,
    isApproved: false,
  },
];

let nextProviderId = 3;
let nextBookingId = 105;
let nextReviewId = 3;
let nextAddressId = 4;
let nextNotificationId = 6;

const bookings = [
  {
    id: 101,
    customerId: 14,
    providerId: null,
    serviceId: 1,
    bookingDate: futureIso(1, 10),
    status: 'PENDING',
    address: '14 MG Road, Indore, Madhya Pradesh',
    totalPrice: 299,
    acceptedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: futureIso(-2, 9),
    updatedAt: futureIso(-2, 9),
    reviewId: null,
  },
  {
    id: 102,
    customerId: 14,
    providerId: 1,
    serviceId: 4,
    bookingDate: futureIso(2, 14),
    status: 'ACCEPTED',
    address: '22 Residency Road, Indore, Madhya Pradesh',
    totalPrice: 499,
    acceptedAt: futureIso(-1, 12),
    completedAt: null,
    cancelledAt: null,
    createdAt: futureIso(-3, 11),
    updatedAt: futureIso(-1, 12),
    reviewId: null,
  },
  {
    id: 103,
    customerId: 14,
    providerId: 1,
    serviceId: 1,
    bookingDate: futureIso(0, 16),
    status: 'IN_PROGRESS',
    address: '41 Vijay Nagar, Indore, Madhya Pradesh',
    totalPrice: 299,
    acceptedAt: futureIso(-1, 10),
    completedAt: null,
    cancelledAt: null,
    createdAt: futureIso(-4, 10),
    updatedAt: nowIso(),
    reviewId: null,
  },
  {
    id: 104,
    customerId: 14,
    providerId: 1,
    serviceId: 4,
    bookingDate: futureIso(-4, 13),
    status: 'COMPLETED',
    address: '8 Palasia, Indore, Madhya Pradesh',
    totalPrice: 499,
    acceptedAt: futureIso(-6, 10),
    completedAt: futureIso(-4, 15),
    cancelledAt: null,
    createdAt: futureIso(-8, 10),
    updatedAt: futureIso(-4, 15),
    reviewId: null,
  },
];

const reviews = [];
const savedAddresses = [
  {
    id: 1,
    userId: 14,
    label: 'Home',
    addressLine: '14 MG Road',
    city: 'Indore',
    pincode: '452001',
    isDefault: true,
  },
  {
    id: 2,
    userId: 14,
    label: 'Parents',
    addressLine: '41 Vijay Nagar',
    city: 'Indore',
    pincode: '452010',
    isDefault: false,
  },
  {
    id: 3,
    userId: 4,
    label: 'Office',
    addressLine: '12 Service Lane',
    city: 'Indore',
    pincode: '452011',
    isDefault: true,
  },
];
const notifications = [
  {
    id: 1,
    userId: 14,
    title: 'Booking accepted',
    message: 'Suresh Kumar accepted your AC Service booking.',
    type: 'BOOKING_ACCEPTED',
    bookingId: 102,
    read: false,
    createdAt: futureIso(-1, 12),
  },
  {
    id: 2,
    userId: 14,
    title: 'Work started',
    message: 'Electrical Repair is now in progress.',
    type: 'BOOKING_IN_PROGRESS',
    bookingId: 103,
    read: false,
    createdAt: nowIso(),
  },
  {
    id: 3,
    userId: 4,
    title: 'New job available',
    message: 'A matching Electrical Repair request is available near Indore.',
    type: 'AVAILABLE_JOB',
    bookingId: 101,
    read: false,
    createdAt: futureIso(-1, 9),
  },
  {
    id: 4,
    userId: 4,
    title: 'Job completed',
    message: 'Your AC Service job was completed.',
    type: 'BOOKING_COMPLETED',
    bookingId: 104,
    read: true,
    createdAt: futureIso(-4, 15),
  },
  {
    id: 5,
    userId: 14,
    title: 'Profile tools ready',
    message: 'Saved addresses, notifications, and profile tools are available.',
    type: 'PROFILE_TOOLS',
    bookingId: null,
    read: true,
    createdAt: nowIso(),
  },
];
let mockSessionOverride = null;
let mockStateLoaded = false;
let mockStateLoadPromise = null;

function replaceArray(target, nextValue) {
  if (!Array.isArray(nextValue)) {
    return;
  }

  target.splice(0, target.length, ...clone(nextValue));
}

function nextIdFrom(list, fallback) {
  const maxId = list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  return Math.max(fallback, maxId + 1);
}

function buildPersistedState() {
  return {
    users,
    providers,
    bookings,
    reviews,
    savedAddresses,
    notifications,
    counters: {
      nextUserId,
      nextProviderId,
      nextBookingId,
      nextReviewId,
      nextAddressId,
      nextNotificationId,
    },
  };
}

function applyPersistedState(state) {
  if (!state || typeof state !== 'object') {
    return;
  }

  replaceArray(users, state.users);
  replaceArray(providers, state.providers);
  replaceArray(bookings, state.bookings);
  replaceArray(reviews, state.reviews);
  replaceArray(savedAddresses, state.savedAddresses);
  replaceArray(notifications, state.notifications);

  const counters = state.counters || {};
  nextUserId = Number(counters.nextUserId) || nextIdFrom(users, nextUserId);
  nextProviderId = Number(counters.nextProviderId) || nextIdFrom(providers, nextProviderId);
  nextBookingId = Number(counters.nextBookingId) || nextIdFrom(bookings, nextBookingId);
  nextReviewId = Number(counters.nextReviewId) || nextIdFrom(reviews, nextReviewId);
  nextAddressId = Number(counters.nextAddressId) || nextIdFrom(savedAddresses, nextAddressId);
  nextNotificationId = Number(counters.nextNotificationId) || nextIdFrom(notifications, nextNotificationId);
}

async function ensureMockStateLoaded() {
  if (mockStateLoaded) {
    return;
  }

  if (!mockStateLoadPromise) {
    mockStateLoadPromise = (async () => {
      try {
        const rawState = await readMockStateFromStorage();
        if (rawState) {
          applyPersistedState(JSON.parse(rawState));
        }
      } catch (error) {
        // Corrupted local state should not block the demo app; keep the seeded data.
      } finally {
        mockStateLoaded = true;
      }
    })();
  }

  await mockStateLoadPromise;
}

async function saveMockState() {
  await ensureMockStateLoaded();
  await writeMockStateToStorage(JSON.stringify(buildPersistedState()));
}

async function readMockStateFromStorage() {
  try {
    return await AsyncStorage.getItem(MOCK_STATE_STORAGE_KEY);
  } catch (error) {
    return memoryStorage.get(MOCK_STATE_STORAGE_KEY) || null;
  }
}

async function writeMockStateToStorage(value) {
  try {
    await AsyncStorage.setItem(MOCK_STATE_STORAGE_KEY, value);
  } catch (error) {
    memoryStorage.set(MOCK_STATE_STORAGE_KEY, value);
  }
}

function serviceForId(serviceId) {
  return services.find((service) => Number(service.id) === Number(serviceId)) || null;
}

function providerForId(providerId) {
  return providers.find((provider) => Number(provider.id) === Number(providerId)) || null;
}

function providerForUserId(userId) {
  return providers.find((provider) => Number(provider.userId) === Number(userId)) || null;
}

function userForId(userId) {
  return users.find((user) => Number(user.id) === Number(userId) || Number(user.userId) === Number(userId)) || null;
}

function sessionForUser(user) {
  return {
    token: `mock-token-${user.role.toLowerCase()}-${user.id}`,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function stripProviderUserFields(provider) {
  if (!provider) return null;
  return {
    id: provider.id,
    userId: provider.userId,
    name: provider.name,
    phone: provider.phone,
    categoryId: provider.categoryId,
    categoryName: provider.categoryName,
    rating: provider.rating,
  };
}

function expandBooking(booking) {
  const service = serviceForId(booking.serviceId);
  const customer = userForId(booking.customerId);
  const provider = providerForId(booking.providerId);

  return {
    ...booking,
    service,
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
        }
      : null,
    provider: stripProviderUserFields(provider),
    canReview: booking.status === 'COMPLETED' && !booking.reviewId,
  };
}

function compactBooking(booking) {
  const service = serviceForId(booking.serviceId);
  return {
    ...booking,
    serviceName: service ? service.name : 'Service',
    service: service ? clone(service) : null,
  };
}

async function currentSession() {
  if (mockSessionOverride) {
    return clone(mockSessionOverride);
  }

  return readStoredSession();
}

async function currentUser() {
  const session = await currentSession();
  if (!session) {
    throw createHttpError('Please log in again.', 401, 'Unauthorized');
  }

  await ensureMockStateLoaded();
  const user = userForId(session.userId);
  if (!user) {
    throw createHttpError('Session user was not found.', 401, 'Unauthorized');
  }

  return user;
}

function userWithProvider(user) {
  const provider = user.role === 'PROVIDER' ? providerForUserId(user.id) : null;
  return {
    ...user,
    provider,
  };
}

function sortedBookings(list) {
  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function locationFromAddress(address) {
  const parts = String(address || '').split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return 'Unknown';
  return parts[parts.length - 2] || parts[parts.length - 1] || 'Unknown';
}

function allowedBookingsForUser(user) {
  if (user.role === 'CUSTOMER') {
    return bookings.filter((booking) => Number(booking.customerId) === Number(user.id));
  }

  if (user.role === 'PROVIDER') {
    const provider = providerForUserId(user.id);
    if (!provider) return [];
    return bookings.filter((booking) => Number(booking.providerId) === Number(provider.id));
  }

  return bookings;
}

function assertBookingDate(payload) {
  const date = new Date(payload.bookingDate);
  if (!payload.bookingDate || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    throw createHttpError('Choose a future date and time for your booking.', 400);
  }
}

function normalizeAddressPayload(payload = {}) {
  return {
    label: String(payload.label || '').trim(),
    addressLine: String(payload.addressLine || payload.address || '').trim(),
    city: String(payload.city || '').trim(),
    pincode: String(payload.pincode || '').trim(),
  };
}

function validateAddressPayload(payload) {
  if (!payload.label) {
    throw createHttpError('Address label is required.', 400);
  }
  if (payload.addressLine.length < 10) {
    throw createHttpError('Address must be at least 10 characters.', 400);
  }
  if (!payload.city) {
    throw createHttpError('City is required.', 400);
  }
  if (!/^\d{6}$/.test(payload.pincode)) {
    throw createHttpError('Enter a valid 6 digit pincode.', 400);
  }
}

function addressText(address) {
  return `${address.addressLine}, ${address.city}, ${address.pincode}`;
}

function addNotification(userId, title, message, type, bookingId = null) {
  const notification = {
    id: nextNotificationId,
    userId,
    title,
    message,
    type,
    bookingId,
    read: false,
    createdAt: nowIso(),
  };
  nextNotificationId += 1;
  notifications.unshift(notification);
  return notification;
}

function setOnlyDefaultAddress(userId, addressId) {
  savedAddresses.forEach((address) => {
    if (Number(address.userId) === Number(userId)) {
      address.isDefault = Number(address.id) === Number(addressId);
    }
  });
}

function recalculateProviderRating(providerId) {
  const provider = providerForId(providerId);
  if (!provider) {
    return;
  }

  const providerReviews = reviews.filter((review) => Number(review.providerId) === Number(providerId));
  if (providerReviews.length === 0) {
    return;
  }

  const average = providerReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / providerReviews.length;
  provider.rating = Number(average.toFixed(1));
}

const mockServicesService = {
  async list() {
    await delay();
    await ensureMockStateLoaded();
    return clone(services);
  },

  async getOne(id) {
    await delay();
    await ensureMockStateLoaded();
    const service = serviceForId(id);
    if (!service) {
      throw createHttpError('Service not found.', 404, 'Not Found');
    }
    return clone(service);
  },
};

const mockAuthService = {
  async health() {
    await delay();
    return { message: 'Auth Service is running locally.' };
  },

  async register(payload) {
    await delay();
    await ensureMockStateLoaded();
    const email = String(payload.email || '').trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === email)) {
      throw createHttpError('Email is already registered', 409, 'Conflict');
    }

    const user = {
      id: nextUserId,
      userId: nextUserId,
      name: String(payload.name || '').trim(),
      email,
      phone: String(payload.phone || ''),
      role: payload.role,
      imageUrl: null,
      provider: null,
    };
    nextUserId += 1;
    users.push(user);

    if (user.role === 'PROVIDER') {
      const service = serviceForId(payload.categoryId);
      const provider = {
        id: nextProviderId,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        categoryId: Number(payload.categoryId),
        categoryName: service ? service.categoryName : 'Service Provider',
        experience: Number(payload.experience || 0),
        availability: false,
        rating: 0,
        isApproved: false,
      };
      nextProviderId += 1;
      providers.push(provider);
      user.provider = provider;
    }

    await saveMockState();
    return sessionForUser(user);
  },

  async login(email, password) {
    await delay();
    await ensureMockStateLoaded();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user || !password) {
      throw createHttpError('Invalid credentials', 404, 'Not Found');
    }

    return sessionForUser(user);
  },

  async requestPasswordReset(email) {
    await delay();
    await ensureMockStateLoaded();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw createHttpError('Email is required.', 400);
    }

    return {
      message: 'If an account exists, password reset instructions have been sent.',
    };
  },

  async me() {
    await delay();
    const user = await currentUser();
    return clone(userWithProvider(user));
  },

  async getUser(id) {
    await delay();
    await ensureMockStateLoaded();
    const user = userForId(id);
    if (!user) {
      throw createHttpError('User not found.', 404, 'Not Found');
    }
    return clone(user);
  },

  async listProviders() {
    await delay();
    await ensureMockStateLoaded();
    return clone(providers);
  },

  async getProvider(id) {
    await delay();
    await ensureMockStateLoaded();
    const provider = providerForId(id);
    if (!provider) {
      throw createHttpError('Provider not found.', 404, 'Not Found');
    }
    return clone(provider);
  },

  async toggleAvailability(providerId, available) {
    await delay();
    const provider = providerForId(providerId);
    if (!provider) {
      throw createHttpError('Provider not found.', 404, 'Not Found');
    }

    provider.availability = Boolean(available);
    await saveMockState();
    return clone(provider);
  },

  async updateProfile(payload) {
    await delay();
    const user = await currentUser();
    const name = String(payload.name || '').trim();
    const phone = String(payload.phone || '').replace(/\D/g, '');
    const imageUrl = payload.imageUrl ? String(payload.imageUrl).trim() : null;

    if (name.length < 2) {
      throw createHttpError('Name must be at least 2 characters.', 400);
    }
    if (!/^\d{10}$/.test(phone)) {
      throw createHttpError('Enter a valid 10 digit phone number.', 400);
    }

    user.name = name;
    user.phone = phone;
    user.imageUrl = imageUrl;

    const provider = providerForUserId(user.id);
    if (provider) {
      provider.name = name;
      provider.phone = phone;
    }

    await saveMockState();
    return clone(userWithProvider(user));
  },

  async changePassword(payload) {
    await delay();
    const user = await currentUser();
    const currentPassword = String(payload.currentPassword || payload.oldPassword || '');
    const nextPassword = String(payload.newPassword || '');

    if (!currentPassword || !nextPassword) {
      throw createHttpError('Current password and new password are required.', 400);
    }
    if (currentPassword !== 'password123') {
      throw createHttpError('Current password is incorrect.', 400);
    }
    if (nextPassword.length < 6) {
      throw createHttpError('New password must contain at least 6 characters', 400);
    }
    if (nextPassword === currentPassword) {
      throw createHttpError('Choose a new password that is different from the current password.', 400);
    }

    addNotification(user.id, 'Password changed', 'Your password was updated successfully.', 'PASSWORD_CHANGED');
    await saveMockState();
    return null;
  },
};

const mockBookingsService = {
  async health() {
    await delay();
    return { message: 'Booking Service is running locally.' };
  },

  async testDb() {
    await delay();
    return { message: 'Local database is available.' };
  },

  async create(payload) {
    await delay();
    const user = await currentUser();
    if (user.role !== 'CUSTOMER') {
      throw createHttpError('Only customers can create bookings.', 403, 'Forbidden');
    }

    const service = serviceForId(payload.serviceId);
    if (!service) {
      throw createHttpError('Choose a valid service.', 400);
    }

    const address = String(payload.address || '').trim();
    if (address.length < 10) {
      throw createHttpError('Address must be at least 10 characters.', 400);
    }

    assertBookingDate(payload);

    const booking = {
      id: nextBookingId,
      customerId: user.id,
      providerId: null,
      serviceId: Number(payload.serviceId),
      bookingDate: new Date(payload.bookingDate).toISOString(),
      status: 'PENDING',
      address,
      totalPrice: service.price,
      acceptedAt: null,
      completedAt: null,
      cancelledAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      reviewId: null,
    };
    nextBookingId += 1;
    bookings.push(booking);
    await saveMockState();
    return clone(expandBooking(booking));
  },

  async list(params = {}) {
    await delay();
    const user = await currentUser();
    let list = allowedBookingsForUser(user);

    if (params && params.status) {
      list = list.filter((booking) => booking.status === params.status);
    }

    const result = sortedBookings(list).map(compactBooking);
    return {
      count: result.length,
      bookings: clone(result),
    };
  },

  async getOne(id) {
    await delay();
    const user = await currentUser();
    const booking = bookings.find((item) => Number(item.id) === Number(id));
    if (!booking) {
      throw createHttpError('Booking not found.', 404, 'Not Found');
    }

    const provider = user.role === 'PROVIDER' ? providerForUserId(user.id) : null;
    const isCustomerOwner = user.role === 'CUSTOMER' && Number(booking.customerId) === Number(user.id);
    const isAssignedProvider = provider && Number(booking.providerId) === Number(provider.id);
    const canSeePendingJob =
      provider &&
      booking.status === 'PENDING' &&
      !booking.providerId &&
      serviceForId(booking.serviceId)?.categoryId === provider.categoryId;

    if (!isCustomerOwner && !isAssignedProvider && !canSeePendingJob) {
      throw createHttpError('Booking not found.', 404, 'Not Found');
    }

    return clone(expandBooking(booking));
  },

  async updateStatus(id, statusOrPayload) {
    await delay();
    const status = typeof statusOrPayload === 'string' ? statusOrPayload : statusOrPayload?.status;
    const user = await currentUser();
    const booking = bookings.find((item) => Number(item.id) === Number(id));
    if (!booking) {
      throw createHttpError('Booking not found.', 404, 'Not Found');
    }

    const provider = user.role === 'PROVIDER' ? providerForUserId(user.id) : null;
    const isCustomerOwner = user.role === 'CUSTOMER' && Number(booking.customerId) === Number(user.id);
    const isAssignedProvider = provider && Number(booking.providerId) === Number(provider.id);
    const service = serviceForId(booking.serviceId);
    const providerCanAccept =
      provider &&
      provider.isApproved &&
      booking.status === 'PENDING' &&
      !booking.providerId &&
      service?.categoryId === provider.categoryId &&
      status === 'ACCEPTED';

    if (isCustomerOwner && status === 'CANCELLED' && ['PENDING', 'ACCEPTED'].includes(booking.status)) {
      booking.status = 'CANCELLED';
      booking.cancelledAt = nowIso();
      if (booking.providerId) {
        const assignedProvider = providerForId(booking.providerId);
        if (assignedProvider) {
          addNotification(
            assignedProvider.userId,
            'Booking cancelled',
            `${user.name} cancelled ${service?.name || 'a booking'}.`,
            'BOOKING_CANCELLED',
            booking.id
          );
        }
      }
    } else if (providerCanAccept) {
      booking.status = 'ACCEPTED';
      booking.providerId = provider.id;
      booking.acceptedAt = nowIso();
      addNotification(
        booking.customerId,
        'Booking accepted',
        `${provider.name} accepted your ${service?.name || 'service'} booking.`,
        'BOOKING_ACCEPTED',
        booking.id
      );
    } else if (isAssignedProvider && booking.status === 'ACCEPTED' && status === 'IN_PROGRESS') {
      booking.status = 'IN_PROGRESS';
      addNotification(
        booking.customerId,
        'Work started',
        `${service?.name || 'Your booking'} is now in progress.`,
        'BOOKING_IN_PROGRESS',
        booking.id
      );
    } else if (isAssignedProvider && booking.status === 'ACCEPTED' && status === 'CANCELLED') {
      booking.status = 'CANCELLED';
      booking.cancelledAt = nowIso();
      addNotification(
        booking.customerId,
        'Booking cancelled',
        `${provider.name} cancelled your ${service?.name || 'service'} booking.`,
        'BOOKING_CANCELLED',
        booking.id
      );
    } else if (isAssignedProvider && booking.status === 'IN_PROGRESS' && status === 'COMPLETED') {
      booking.status = 'COMPLETED';
      booking.completedAt = nowIso();
      addNotification(
        booking.customerId,
        'Booking completed',
        `${service?.name || 'Your booking'} is complete. You can leave a review now.`,
        'BOOKING_COMPLETED',
        booking.id
      );
    } else {
      throw createHttpError('This status change is not allowed.', 409, 'Conflict');
    }

    booking.updatedAt = nowIso();
    await saveMockState();
    return clone(expandBooking(booking));
  },

  async listAvailable() {
    await delay();
    const user = await currentUser();
    const provider = providerForUserId(user.id);
    if (!provider || !provider.isApproved) {
      throw createHttpError('Provider account is awaiting approval', 403, 'Forbidden');
    }

    const result = bookings
      .filter((booking) => {
        const service = serviceForId(booking.serviceId);
        return booking.status === 'PENDING' && !booking.providerId && service?.categoryId === provider.categoryId;
      })
      .map((booking) => {
        const service = serviceForId(booking.serviceId);
        return {
          id: booking.id,
          serviceId: booking.serviceId,
          serviceName: service ? service.name : 'Service',
          imageKey: service ? service.imageKey : null,
          bookingDate: booking.bookingDate,
          location: locationFromAddress(booking.address),
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt,
        };
      });

    return {
      count: result.length,
      bookings: clone(result),
    };
  },

  listProviderAccepted(params = {}) {
    return this.list({ ...params, status: 'ACCEPTED' });
  },

  listProviderCompleted(params = {}) {
    return this.list({ ...params, status: 'COMPLETED' });
  },

  async listProviderToday(params = {}) {
    await delay();
    const user = await currentUser();
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    let list = allowedBookingsForUser(user).filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= start && bookingDate <= end;
    });

    if (params.status) {
      list = list.filter((booking) => booking.status === params.status);
    }

    const result = sortedBookings(list).map(compactBooking);
    return {
      count: result.length,
      bookings: clone(result),
    };
  },

  async delete(id) {
    await delay();
    const user = await currentUser();
    const index = bookings.findIndex(
      (booking) => Number(booking.id) === Number(id) && Number(booking.customerId) === Number(user.id)
    );
    if (index === -1) {
      throw createHttpError('Booking not found.', 404, 'Not Found');
    }

    bookings.splice(index, 1);
    await saveMockState();
    return null;
  },
};

const mockReviewsService = {
  async create(payload) {
    await delay();
    const user = await currentUser();
    const booking = bookings.find((item) => Number(item.id) === Number(payload.bookingId));

    if (!booking || Number(booking.customerId) !== Number(user.id)) {
      throw createHttpError('Booking not found.', 404, 'Not Found');
    }

    if (booking.status !== 'COMPLETED') {
      throw createHttpError('Only completed bookings can be reviewed.', 400);
    }

    if (booking.reviewId) {
      throw createHttpError('This booking already has a review.', 409, 'Conflict');
    }

    if (!booking.providerId) {
      throw createHttpError('This booking does not have an assigned provider to review.', 400);
    }

    const rating = Number(payload.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw createHttpError('Choose a rating from 1 to 5.', 400);
    }

    const review = {
      id: nextReviewId,
      bookingId: booking.id,
      providerId: booking.providerId,
      customerId: user.id,
      rating,
      comment: String(payload.comment || '').trim(),
      createdAt: nowIso(),
    };
    nextReviewId += 1;
    reviews.push(review);
    booking.reviewId = review.id;
    booking.updatedAt = nowIso();
    if (booking.providerId) {
      const reviewedProvider = providerForId(booking.providerId);
      if (reviewedProvider) {
        addNotification(
          reviewedProvider.userId,
          'New review received',
          `${user.name} rated your ${serviceForId(booking.serviceId)?.name || 'service'} job ${rating} stars.`,
          'REVIEW_RECEIVED',
          booking.id
        );
      }
      recalculateProviderRating(booking.providerId);
    }

    await saveMockState();
    return clone(review);
  },

  async listForProvider(providerId) {
    await delay();
    await ensureMockStateLoaded();
    return clone(reviews.filter((review) => Number(review.providerId) === Number(providerId)));
  },
};

const mockCycle2Service = {
  async listAddresses() {
    await delay();
    const user = await currentUser();
    const addresses = savedAddresses.filter((address) => Number(address.userId) === Number(user.id));
    return {
      count: addresses.length,
      addresses: clone(addresses),
    };
  },

  async createAddress(payload) {
    await delay();
    const user = await currentUser();
    const addressPayload = normalizeAddressPayload(payload);
    validateAddressPayload(addressPayload);
    const existing = savedAddresses.filter((address) => Number(address.userId) === Number(user.id));
    const address = {
      id: nextAddressId,
      userId: user.id,
      ...addressPayload,
      isDefault: existing.length === 0 || Boolean(payload.isDefault),
    };
    nextAddressId += 1;
    savedAddresses.push(address);
    if (address.isDefault) {
      setOnlyDefaultAddress(user.id, address.id);
    }
    await saveMockState();
    return clone(address);
  },

  async updateAddress(id, payload) {
    await delay();
    const user = await currentUser();
    const address = savedAddresses.find(
      (item) => Number(item.id) === Number(id) && Number(item.userId) === Number(user.id)
    );
    if (!address) {
      throw createHttpError('Address not found.', 404, 'Not Found');
    }

    const addressPayload = normalizeAddressPayload(payload);
    validateAddressPayload(addressPayload);
    Object.assign(address, addressPayload);
    if (payload.isDefault) {
      setOnlyDefaultAddress(user.id, address.id);
    }
    await saveMockState();
    return clone(address);
  },

  async deleteAddress(id) {
    await delay();
    const user = await currentUser();
    const index = savedAddresses.findIndex(
      (item) => Number(item.id) === Number(id) && Number(item.userId) === Number(user.id)
    );
    if (index === -1) {
      throw createHttpError('Address not found.', 404, 'Not Found');
    }
    const [removed] = savedAddresses.splice(index, 1);
    const remaining = savedAddresses.filter((address) => Number(address.userId) === Number(user.id));
    if (removed.isDefault && remaining.length > 0) {
      setOnlyDefaultAddress(user.id, remaining[0].id);
    }
    await saveMockState();
    return null;
  },

  async setDefaultAddress(id) {
    await delay();
    const user = await currentUser();
    const address = savedAddresses.find(
      (item) => Number(item.id) === Number(id) && Number(item.userId) === Number(user.id)
    );
    if (!address) {
      throw createHttpError('Address not found.', 404, 'Not Found');
    }
    setOnlyDefaultAddress(user.id, address.id);
    await saveMockState();
    return clone(address);
  },

  async listNotifications() {
    await delay();
    const user = await currentUser();
    const userNotifications = notifications
      .filter((notification) => Number(notification.userId) === Number(user.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return {
      count: userNotifications.length,
      unreadCount: userNotifications.filter((notification) => !notification.read).length,
      notifications: clone(userNotifications),
    };
  },

  async markNotificationRead(id) {
    await delay();
    const user = await currentUser();
    const notification = notifications.find(
      (item) => Number(item.id) === Number(id) && Number(item.userId) === Number(user.id)
    );
    if (!notification) {
      throw createHttpError('Notification not found.', 404, 'Not Found');
    }
    notification.read = true;
    await saveMockState();
    return clone(notification);
  },

  async markAllNotificationsRead() {
    await delay();
    const user = await currentUser();
    notifications.forEach((notification) => {
      if (Number(notification.userId) === Number(user.id)) {
        notification.read = true;
      }
    });
    await saveMockState();
    return null;
  },

  async deleteNotification(id) {
    await delay();
    const user = await currentUser();
    const index = notifications.findIndex(
      (item) => Number(item.id) === Number(id) && Number(item.userId) === Number(user.id)
    );
    if (index === -1) {
      throw createHttpError('Notification not found.', 404, 'Not Found');
    }

    notifications.splice(index, 1);
    await saveMockState();
    return null;
  },

  async getProviderEarnings() {
    await delay();
    const user = await currentUser();
    const provider = providerForUserId(user.id);
    if (!provider) {
      throw createHttpError('Provider profile not found.', 404, 'Not Found');
    }
    const completedJobs = bookings
      .filter((booking) => Number(booking.providerId) === Number(provider.id) && booking.status === 'COMPLETED')
      .sort((a, b) => new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime());
    const totalEarnings = completedJobs.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
    return {
      totalEarnings,
      completedJobCount: completedJobs.length,
      averageRating: provider.rating,
      recentJobs: clone(completedJobs.slice(0, 5).map(expandBooking)),
      monthly: [
        { label: 'May', total: Math.max(totalEarnings - 250, 0) },
        { label: 'Jun', total: totalEarnings },
        { label: 'Jul', total: totalEarnings + 300 },
      ],
    };
  },

  addressText,
};

module.exports = {
  mockAuthService,
  mockBookingsService,
  mockCycle2Service,
  mockReviewsService,
  mockServicesService,
  setMockSessionForTests(session) {
    mockSessionOverride = session ? clone(session) : null;
  },
};
