const { normalizeApiError } = require('../api/errors');

function toNumericId(value) {
  const id = Number(value);
  return Number.isFinite(id) ? id : value;
}

function normalizeService(service) {
  if (!service || typeof service !== 'object' || Array.isArray(service)) {
    throw new Error('Malformed service item received from backend.');
  }

  const id = service.id ?? service.serviceId ?? service.categoryId;
  const name = service.name ?? service.categoryName ?? service.category;

  if (id === undefined || !name) {
    throw new Error('Malformed service item received from backend.');
  }

  return {
    ...service,
    id: toNumericId(id),
    name,
    description: service.description || '',
    price: service.price,
    imageUrl: service.imageUrl || null,
    categoryId: service.categoryId ? toNumericId(service.categoryId) : toNumericId(id),
    categoryName: service.categoryName || name,
  };
}

function adaptServiceCollection(response) {
  const rawServices = Array.isArray(response)
    ? response
    : response && Array.isArray(response.services)
      ? response.services
      : null;

  if (!rawServices) {
    throw new Error('Malformed service catalogue response.');
  }

  return rawServices.map(normalizeService);
}

function filterServices(services, query) {
  const trimmedQuery = String(query || '').trim().toLowerCase();
  if (!trimmedQuery) {
    return services;
  }

  return services.filter((service) => {
    const haystack = [
      service.name,
      service.categoryName,
      service.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(trimmedQuery);
  });
}

function formatCurrencyINR(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Price unavailable';
  }

  return new Intl.NumberFormat('en-IN', {
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value);
}

function mapServiceError(error) {
  const apiError = normalizeApiError(error);

  if (apiError.code === 'NETWORK_ERROR') {
    return 'Cannot reach the server. Check that the backend is running and your phone is connected to the same network.';
  }

  if (apiError.code === 'TIMEOUT') {
    return 'The request timed out. Please try again.';
  }

  return apiError.message || 'Unable to load services. Please try again.';
}

function findServiceById(services, id) {
  return services.find((service) => Number(service.id) === Number(id)) || null;
}

function buildServiceNavigationParams(service) {
  if (!service || service.id === undefined || service.id === null) {
    throw new Error('Cannot navigate without a serviceId.');
  }

  return {
    service,
    serviceId: service.id,
  };
}

async function resolveServiceDetail({ getOne, getServiceById, serviceId, routeService }) {
  if (!serviceId) {
    return { status: 'notFound', service: null };
  }

  const cachedService = getServiceById ? getServiceById(serviceId) : null;
  if (cachedService) {
    return { status: 'ready', service: cachedService, source: 'cache' };
  }

  if (routeService && Number(routeService.id) === Number(serviceId)) {
    return { status: 'ready', service: routeService, source: 'route' };
  }

  try {
    return {
      status: 'ready',
      service: normalizeService(await getOne(serviceId)),
      source: 'network',
    };
  } catch (error) {
    if (error && error.httpStatus === 404) {
      return { status: 'notFound', service: null };
    }

    throw error;
  }
}

function createServiceCatalogStore({ listServices }) {
  let services = [];
  let loadingPromise = null;

  async function load({ preserveOnError = true } = {}) {
    if (loadingPromise) {
      return loadingPromise;
    }

    loadingPromise = listServices()
      .then((response) => {
        services = adaptServiceCollection(response);
        return services;
      })
      .catch((error) => {
        if (!preserveOnError) {
          services = [];
        }
        throw error;
      })
      .finally(() => {
        loadingPromise = null;
      });

    return loadingPromise;
  }

  return {
    getServices: () => services,
    getServiceById: (id) => findServiceById(services, id),
    load,
  };
}

module.exports = {
  adaptServiceCollection,
  buildServiceNavigationParams,
  createServiceCatalogStore,
  filterServices,
  findServiceById,
  formatCurrencyINR,
  mapServiceError,
  normalizeService,
  resolveServiceDetail,
};
