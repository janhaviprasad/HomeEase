// Booking Service analytics endpoints (port 8082).
//
//   GET /api/analytics/bookings
//   { "status": "SUCCESS", "data": {
//       "totalBookings": 13, "pending": 1, "accepted": 4,
//       "inProgress": 0, "completed": 4, "cancelled": 4,
//       "totalRevenue": "987.00" } }
//
//   GET /api/analytics/services/popular
//   { "status": "SUCCESS", "data": [
//       { "id": 1, "category_name": "Plumbing",
//         "bookingCount": 5, "revenue": "420.00" } ] }
//
// Two things to know about these payloads:
//
//   1. Casing is mixed in the second one — category_name is snake_case while
//      bookingCount is camelCase. Consumers read both as-is for now; revisit
//      if the Booking Service standardises.
//
//   2. Money arrives as strings ("987.00"). Coerce with Number() before
//      display or before feeding a chart. utils/format.js does this.
//
// The envelope on the second endpoint is assumed to match the first
// ({ status, data }) since every other HomeEase endpoint uses it. Dashboard
// guards with Array.isArray() so a bare-array response degrades to an empty
// chart rather than a crash.

import bookingApiClient from "./bookingApiClient";

export const getBookingStats = () =>
  bookingApiClient.get("/api/analytics/bookings");

export const getPopularServices = () =>
  bookingApiClient.get(
    "/api/analytics/services/popular"
  );
