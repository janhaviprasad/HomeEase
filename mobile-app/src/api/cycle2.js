const { authApi, bookingApi } = require('./client');
const { MOCK_ONLY_CYCLE_MODE, isMockApiEnabled } = require('./config');
const { mockCycle2Service } = require('./mockStore');

function adaptNotification(notification = {}) {
  const read =
    notification.read !== undefined
      ? Boolean(notification.read)
      : Boolean(notification.isRead);

  return {
    ...notification,
    read,
  };
}

function normalizeBookingList(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.bookings)) {
    return result.bookings;
  }

  return [];
}

function buildMonthlyEarnings(bookings) {
  const totalsByMonth = new Map();

  bookings.forEach((booking) => {
    const date = new Date(booking.completedAt || booking.bookingDate || booking.createdAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const label = date.toLocaleString('en-IN', { month: 'short' });
    totalsByMonth.set(label, (totalsByMonth.get(label) || 0) + Number(booking.totalPrice || 0));
  });

  return Array.from(totalsByMonth.entries()).map(([label, total]) => ({ label, total }));
}

function createRealCycle2Service({ auth = authApi, booking = bookingApi } = {}) {
  return {
    async listAddresses() {
      const addresses = await auth.get('/api/addresses', { allowPlainResponse: true });
      const list = Array.isArray(addresses) ? addresses : [];

      return {
        count: list.length,
        addresses: list,
      };
    },

    createAddress(payload) {
      return auth.post('/api/addresses', payload, { allowPlainResponse: true });
    },

    updateAddress(id, payload) {
      return auth.put(`/api/addresses/${id}`, payload, { allowPlainResponse: true });
    },

    deleteAddress(id) {
      return auth.delete(`/api/addresses/${id}`, { allowEmptyResponse: true });
    },

    setDefaultAddress(id) {
      return auth.put(`/api/addresses/${id}/default`, null, { allowEmptyResponse: true });
    },

    async listNotifications(params = {}) {
      const notifications = await booking.get('/api/notifications', { params });
      const list = (Array.isArray(notifications) ? notifications : []).map(adaptNotification);

      return {
        count: list.length,
        unreadCount: list.filter((notification) => !notification.read).length,
        notifications: list,
      };
    },

    markNotificationRead(id) {
      return booking.put(`/api/notifications/${id}/read`);
    },

    markAllNotificationsRead() {
      return booking.put('/api/notifications/read-all');
    },

    deleteNotification(id) {
      return booking.delete(`/api/notifications/${id}`);
    },

    async getProviderEarnings() {
      const result = await booking.get('/api/provider/bookings/completed');
      const completedJobs = normalizeBookingList(result);
      const totalEarnings = completedJobs.reduce(
        (sum, booking) => sum + Number(booking.totalPrice || 0),
        0
      );

      return {
        totalEarnings,
        completedJobCount: completedJobs.length,
        averageRating: null,
        recentJobs: completedJobs.slice(0, 5),
        monthly: buildMonthlyEarnings(completedJobs),
      };
    },
  };
}

const realCycle2Service = createRealCycle2Service();
const cycle2Service = isMockApiEnabled() ? mockCycle2Service : realCycle2Service;

module.exports = {
  MOCK_ONLY_CYCLE_MODE,
  createRealCycle2Service,
  cycle2Service,
  realCycle2Service,
};
