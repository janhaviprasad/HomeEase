const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { ApiError } = require('../api/errors');
const {
  adaptServiceCollection,
  buildServiceNavigationParams,
  createServiceCatalogStore,
  filterServices,
  findServiceById,
  formatCurrencyINR,
  resolveServiceDetail,
} = require('../utils/serviceCatalog');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const serviceList = [
  {
    id: 1,
    categoryName: 'Electrician',
    description: 'Fan and switch repairs',
    price: 299,
  },
  {
    id: 2,
    categoryName: 'Cleaning',
    description: 'Kitchen deep cleaning',
    price: 499.5,
  },
];

test('adapts catalogue array responses', () => {
  assert.deepEqual(adaptServiceCollection(serviceList), [
    {
      id: 1,
      name: 'Electrician',
      categoryName: 'Electrician',
      categoryId: 1,
      description: 'Fan and switch repairs',
      imageUrl: null,
      price: 299,
    },
    {
      id: 2,
      name: 'Cleaning',
      categoryName: 'Cleaning',
      categoryId: 2,
      description: 'Kitchen deep cleaning',
      imageUrl: null,
      price: 499.5,
    },
  ]);
});

test('adapts { count, services } catalogue responses', () => {
  assert.equal(adaptServiceCollection({ count: 2, services: serviceList }).length, 2);
});

test('throws on malformed catalogue response', () => {
  assert.throws(() => adaptServiceCollection({ count: 1, data: [] }), /Malformed service catalogue/);
});

test('service catalogue store performs initial load', async () => {
  const store = createServiceCatalogStore({ listServices: async () => serviceList });

  assert.equal((await store.load()).length, 2);
  assert.equal(store.getServices().length, 2);
});

test('service catalogue store prevents duplicate concurrent loads', async () => {
  let calls = 0;
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const store = createServiceCatalogStore({
    listServices: async () => {
      calls += 1;
      await pending;
      return serviceList;
    },
  });

  const first = store.load();
  const second = store.load();
  release();
  await Promise.all([first, second]);

  assert.equal(calls, 1);
});

test('service catalogue store refreshes successfully', async () => {
  let response = serviceList.slice(0, 1);
  const store = createServiceCatalogStore({ listServices: async () => response });

  await store.load();
  response = serviceList;
  await store.load();

  assert.equal(store.getServices().length, 2);
});

test('service catalogue store preserves existing services after refresh failure', async () => {
  let shouldFail = false;
  const store = createServiceCatalogStore({
    listServices: async () => {
      if (shouldFail) {
        throw new Error('offline');
      }
      return serviceList;
    },
  });

  await store.load();
  shouldFail = true;
  await assert.rejects(() => store.load());

  assert.equal(store.getServices().length, 2);
});

test('findServiceById accepts numeric and string route IDs', () => {
  const services = adaptServiceCollection(serviceList);

  assert.equal(findServiceById(services, 1).name, 'Electrician');
  assert.equal(findServiceById(services, '2').name, 'Cleaning');
});

test('local search matches service name, category, and description', () => {
  const services = adaptServiceCollection(serviceList);

  assert.equal(filterServices(services, 'electric').length, 1);
  assert.equal(filterServices(services, 'cleaning').length, 1);
  assert.equal(filterServices(services, 'switch').length, 1);
});

test('local search returns empty array for no results', () => {
  assert.deepEqual(filterServices(adaptServiceCollection(serviceList), 'plumbing'), []);
});

test('formats INR values and invalid prices safely', () => {
  assert.equal(formatCurrencyINR(299), '₹299.00');
  assert.equal(formatCurrencyINR(299.5), '₹299.50');
  assert.equal(formatCurrencyINR(null), 'Price unavailable');
  assert.equal(formatCurrencyINR('299'), 'Price unavailable');
});

test('service navigation params include canonical serviceId', () => {
  assert.deepEqual(buildServiceNavigationParams({ id: 7, name: 'AC Service' }), {
    service: { id: 7, name: 'AC Service' },
    serviceId: 7,
  });
});

test('Service Detail resolver uses cached service before network fallback', async () => {
  let networkCalls = 0;
  const result = await resolveServiceDetail({
    getOne: async () => {
      networkCalls += 1;
      return serviceList[1];
    },
    getServiceById: () => adaptServiceCollection(serviceList)[0],
    serviceId: 1,
  });

  assert.equal(result.source, 'cache');
  assert.equal(networkCalls, 0);
});

test('Service Detail resolver calls getOne when service is absent from cache', async () => {
  let networkCalls = 0;
  const result = await resolveServiceDetail({
    getOne: async () => {
      networkCalls += 1;
      return serviceList[1];
    },
    getServiceById: () => null,
    serviceId: 2,
  });

  assert.equal(result.source, 'network');
  assert.equal(result.service.name, 'Cleaning');
  assert.equal(networkCalls, 1);
});

test('Service Detail resolver handles not found state', async () => {
  const result = await resolveServiceDetail({
    getOne: async () => {
      throw new ApiError({ message: 'Not found', httpStatus: 404 });
    },
    getServiceById: () => null,
    serviceId: 42,
  });

  assert.deepEqual(result, { status: 'notFound', service: null });
});

test('Book Now navigation params pass serviceId to Booking Form', () => {
  assert.equal(buildServiceNavigationParams({ id: 4, name: 'AC Service' }).serviceId, 4);
});

test('production CustomerScreens does not import development fixtures', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/screens/customer/CustomerScreens.js'), 'utf8');

  assert.equal(source.includes('development/fixtures'), false);
  assert.equal(source.includes('previewUser'), false);
});

test('Booking Form submits through bookingsService.create only', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/screens/customer/CustomerScreens.js'), 'utf8');

  assert.equal(source.includes('bookingsService.create'), true);
  assert.equal(source.includes('from \'axios\''), false);
  assert.equal(source.includes('from "axios"'), false);
});

test('Booking Form uses native date and time selectors', () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, 'src/screens/customer/CustomerScreens.js'), 'utf8');

  assert.equal(source.includes('@react-native-community/datetimepicker'), true);
  assert.equal(source.includes("mode={pickerMode}"), true);
  assert.equal(source.includes("setPickerMode('date')"), true);
  assert.equal(source.includes("setPickerMode('time')"), true);
  assert.equal(source.includes('placeholder="YYYY-MM-DD"'), false);
  assert.equal(source.includes('placeholder="HH:mm"'), false);
});
