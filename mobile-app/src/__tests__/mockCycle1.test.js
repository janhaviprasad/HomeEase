const assert = require('node:assert/strict');
const test = require('node:test');
const {
  mockAuthService,
  mockBookingsService,
  mockReviewsService,
  mockServicesService,
  setMockSessionForTests,
} = require('../api/mockStore');

function futureBookingDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(11, 30, 0, 0);
  return date.toISOString();
}

test('mock services return a complete catalogue', async () => {
  const services = await mockServicesService.list();

  assert.equal(services.length >= 4, true);
  assert.equal(typeof services[0].id, 'number');
  assert.equal(typeof services[0].price, 'number');
  assert.equal(Boolean(services[0].name), true);
  assert.equal(Boolean(services[0].imageKey), true);
});

test('mock customer can create and list a booking', async () => {
  const session = await mockAuthService.login('test2@homeease.com', 'password123');
  setMockSessionForTests(session);

  const created = await mockBookingsService.create({
    serviceId: 2,
    bookingDate: futureBookingDate(),
    address: '123 Mock Street, Indore, Madhya Pradesh',
  });
  const result = await mockBookingsService.list();

  assert.equal(created.status, 'PENDING');
  assert.equal(created.customer.id, session.userId);
  assert.equal(result.bookings.some((booking) => booking.id === created.id), true);
});

test('mock provider can accept, start, and complete a matching job', async () => {
  const customerSession = await mockAuthService.login('test2@homeease.com', 'password123');
  setMockSessionForTests(customerSession);
  const booking = await mockBookingsService.create({
    serviceId: 1,
    bookingDate: futureBookingDate(),
    address: '456 Provider Flow Road, Indore, Madhya Pradesh',
  });

  const providerSession = await mockAuthService.login('suresh@example.com', 'password123');
  setMockSessionForTests(providerSession);
  const available = await mockBookingsService.listAvailable();

  assert.equal(available.bookings.some((job) => job.id === booking.id), true);

  const accepted = await mockBookingsService.updateStatus(booking.id, 'ACCEPTED');
  const started = await mockBookingsService.updateStatus(booking.id, 'IN_PROGRESS');
  const completed = await mockBookingsService.updateStatus(booking.id, 'COMPLETED');

  assert.equal(accepted.status, 'ACCEPTED');
  assert.equal(started.status, 'IN_PROGRESS');
  assert.equal(completed.status, 'COMPLETED');
});

test('mock completed booking can be reviewed once by its customer', async () => {
  const customerSession = await mockAuthService.login('test2@homeease.com', 'password123');
  setMockSessionForTests(customerSession);
  const list = await mockBookingsService.list();
  const completed = list.bookings.find((booking) => booking.status === 'COMPLETED');

  assert.equal(Boolean(completed), true);

  const review = await mockReviewsService.create({
    bookingId: completed.id,
    rating: 5,
    comment: 'Professional and on time.',
  });

  assert.equal(review.bookingId, completed.id);
  await assert.rejects(
    () =>
      mockReviewsService.create({
        bookingId: completed.id,
        rating: 5,
        comment: 'Duplicate review.',
      }),
    /already has a review/
  );
});

test('mock provider availability toggles on profile data', async () => {
  const providerSession = await mockAuthService.login('suresh@example.com', 'password123');
  setMockSessionForTests(providerSession);
  const user = await mockAuthService.me();
  const nextAvailability = !user.provider.availability;
  const updatedProvider = await mockAuthService.toggleAvailability(user.provider.id, nextAvailability);
  const refreshed = await mockAuthService.me();

  assert.equal(updatedProvider.availability, nextAvailability);
  assert.equal(refreshed.provider.availability, nextAvailability);
});
