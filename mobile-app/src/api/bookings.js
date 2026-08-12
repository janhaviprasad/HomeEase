const { bookingApi } = require('./client');
const {
  adaptCreatedBooking,
  adaptStatusUpdate,
  createUnsupportedEndpointError,
  toCreateBookingPayload,
  toStatusPayload,
} = require('./bookingContract');
const { isMockApiEnabled } = require('./config');
const { mockBookingsService } = require('./mockStore');
const { readStoredSession } = require('../utils/sessionStorage');

// The Booking Service sends booking-level fields in snake_case, but every
// response passes through normalizeApiPayload first, so callers here see
// customerId / bookingDate. The snake_case fallbacks are for injected test
// doubles, which bypass the interceptor and return raw payloads.
function getCustomerId(booking) {
  return booking.customerId ?? booking.customer_id ?? booking.customer?.id;
}

function getBookingTime(booking) {
  const raw =
    booking.bookingDate ?? booking.booking_date ?? booking.createdAt ?? booking.created_at;
  const time = new Date(raw).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function sortByBookingDateDesc(bookings) {
  return [...bookings].sort((a, b) => getBookingTime(b) - getBookingTime(a));
}

// BookingCard, BookingSummary and the job detail header all read serviceName.
// The name arrives as service.categoryName from the enrichment join, as a
// top-level categoryName on leaner rows, or already as serviceName when
// BookingFormScreen injects it on create.
function addServiceName(booking) {
  const serviceName = booking.serviceName ?? booking.service?.categoryName ?? booking.categoryName;

  // Left untouched when there is no name to resolve, rather than stamping on a
  // serviceName: undefined key that every consumer would have to ignore.
  return serviceName === undefined ? booking : { ...booking, serviceName };
}

// Shape-preserving: an unexpected payload passes through untouched so callers
// keep failing the way they did before rather than silently seeing an empty list.
function withServiceNames(result) {
  if (!Array.isArray(result?.bookings)) {
    return result;
  }

  return {
    ...result,
    bookings: result.bookings.map(addServiceName),
  };
}

function adaptBookingList(result) {
  if (Array.isArray(result)) {
    return {
      count: result.length,
      bookings: result,
    };
  }

  if (Array.isArray(result?.bookings)) {
    return {
      count: result.count ?? result.bookings.length,
      bookings: result.bookings,
    };
  }

  return result;
}

function createRealBookingsService(api = bookingApi, { sessionReader = readStoredSession } = {}) {
  return {
  health() {
    return api.get('/', { allowPlainResponse: true, skipAuth: true });
  },

  testDb() {
    return api.get('/api/test-db', { skipAuth: true });
  },

  async create(payload) {
    const result = await api.post('/api/bookings', toCreateBookingPayload(payload));
    return adaptCreatedBooking(result);
  },

  // GET /api/bookings returns every booking in the system. The Booking Service
  // does not scope the list to the caller's token yet (admin auth middleware is
  // still pending), so the customer filter below is what keeps one customer from
  // seeing another's bookings. It becomes a no-op once that middleware ships.
  async list() {
    const storedSession = await sessionReader();
    if (!storedSession || !storedSession.userId) {
      throw new Error('Cannot load bookings without a signed-in user.');
    }

    const result = adaptBookingList(await api.get('/api/bookings'));
    const bookings = sortByBookingDateDesc(
      (result?.bookings || []).filter(
        (booking) => Number(getCustomerId(booking)) === Number(storedSession.userId)
      )
    ).map(addServiceName);

    // count is the filtered length, not the server's total, so it always agrees
    // with the array beside it.
    return {
      count: bookings.length,
      bookings,
    };
  },

  async listProviderAssigned(params) {
    return withServiceNames(adaptBookingList(await api.get('/api/provider/bookings', { params })));
  },

  async getOne(id) {
    const assigned = await this.listProviderAssigned();
    const assignedBooking = assigned.bookings.find((booking) => Number(booking.id) === Number(id));
    if (assignedBooking) {
      return assignedBooking;
    }

    const available = await this.listAvailable();
    const availableBooking = available.bookings.find((booking) => Number(booking.id) === Number(id));
    if (availableBooking) {
      return availableBooking;
    }

    throw createUnsupportedEndpointError(
      'Booking detail is not available from the current Booking Service contract for this booking.'
    );
  },

  async updateStatus(id, statusOrPayload) {
    const payload = toStatusPayload(statusOrPayload);
    const actionByStatus = {
      ACCEPTED: 'accept',
      IN_PROGRESS: 'start',
      COMPLETED: 'complete',
      CANCELLED: 'cancel',
      REJECTED: 'reject',
    };
    const action = actionByStatus[payload.status];

    if (!action) {
      throw createUnsupportedEndpointError(`Unsupported booking status action: ${payload.status || 'missing status'}.`);
    }

    const providerActionByStatus = {
      ACCEPTED: 'accept',
      IN_PROGRESS: 'start',
      COMPLETED: 'complete',
      REJECTED: 'reject',
    };

    const providerAction = providerActionByStatus[payload.status];
    const result = providerAction
      ? await api.put(`/api/provider/bookings/${id}/${providerAction}`)
      : await api.patch(`/api/bookings/${id}/status`, payload);
    const statusUpdate = adaptStatusUpdate(result, id);

    try {
      const booking = await this.getOne(id);
      return {
        ...booking,
        ...statusUpdate,
      };
    } catch (error) {
      return statusUpdate;
    }
  },

  async listAvailable(params) {
    return withServiceNames(adaptBookingList(await api.get('/api/provider/bookings/available', { params })));
  },

  async listProviderAccepted(params) {
    return adaptBookingList(await api.get('/api/provider/bookings/accepted', { params }));
  },

  async listProviderCompleted(params) {
    return adaptBookingList(await api.get('/api/provider/bookings/completed', { params }));
  },

  async listProviderToday(params) {
    return adaptBookingList(await api.get('/api/provider/bookings/today', { params }));
  },

  delete(id) {
    return api.delete(`/api/bookings/${id}`);
  },
};
}

const realBookingsService = createRealBookingsService();

const bookingsService = isMockApiEnabled() ? mockBookingsService : realBookingsService;

module.exports = {
  adaptBookingList,
  bookingsService,
  createRealBookingsService,
  toStatusPayload,
  realBookingsService,
};
