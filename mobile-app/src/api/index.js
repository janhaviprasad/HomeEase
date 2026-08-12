const { authService } = require('./auth');
const { bookingsService } = require('./bookings');
const { servicesService } = require('./services');
const { reviewsService } = require('./reviews');
const { cycle2Service } = require('./cycle2');

module.exports = {
  authService,
  bookingsService,
  cycle2Service,
  reviewsService,
  servicesService,
};
