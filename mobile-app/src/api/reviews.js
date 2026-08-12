const { bookingApi } = require('./client');
const {
  adaptCreatedReview,
  createUnsupportedEndpointError,
  toCreateReviewPayload,
} = require('./bookingContract');
const { isMockApiEnabled } = require('./config');
const { mockReviewsService } = require('./mockStore');

function createRealReviewsService(api = bookingApi) {
  return {
  async create(payload) {
    const requestPayload = toCreateReviewPayload(payload);
    const result = await api.post('/api/reviews', requestPayload);
    return adaptCreatedReview(result);
  },

  listForProvider(providerId) {
    return Promise.reject(
      createUnsupportedEndpointError('Provider review lists are not available from the current Booking Service contract.')
    );
  },
};
}

const realReviewsService = createRealReviewsService();

const reviewsService = isMockApiEnabled() ? mockReviewsService : realReviewsService;

module.exports = {
  createRealReviewsService,
  reviewsService,
  realReviewsService,
};
