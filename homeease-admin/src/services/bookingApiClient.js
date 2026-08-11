import { createApiClient } from "./createApiClient";

// Booking Service (port 8082): bookings and analytics.
const bookingApiClient = createApiClient(
  import.meta.env.VITE_BOOKING_API_URL
);

export default bookingApiClient;
