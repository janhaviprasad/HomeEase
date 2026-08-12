const { bookingApi } = require('./client');
const { isMockApiEnabled } = require('./config');
const { mockServicesService } = require('./mockStore');

function createRealServicesService(api = bookingApi) {
  return {
  list() {
    return api.get('/api/services', { skipAuth: true });
  },

  async getOne(id) {
    const services = await this.list();
    const service = Array.isArray(services)
      ? services.find((item) => Number(item.id ?? item.categoryId) === Number(id))
      : null;

    if (!service) {
      const error = new Error('Service not found.');
      error.httpStatus = 404;
      throw error;
    }

    return service;
  },
};
}

const realServicesService = createRealServicesService();

const servicesService = isMockApiEnabled() ? mockServicesService : realServicesService;

module.exports = {
  createRealServicesService,
  servicesService,
  realServicesService,
};
