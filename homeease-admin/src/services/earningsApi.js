// Booking Service (port 8082) — provider earnings.
//
//   GET /api/analytics/provider/{providerId}/earnings
//   Optional: ?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD  (omitted = all-time)
//
//   { "status": "SUCCESS",
//     "data": { "completedBookings": 3, "totalEarnings": "897.00" } }
//
// Confirmed working. Notes:
//
//   1. This endpoint is camelCase, unlike /api/bookings and
//      /api/analytics/services/popular which are snake_case. The Booking
//      Service is not internally consistent — check per endpoint.
//   2. totalEarnings is a string. Coerce with Number() before display;
//      utils/format.js formatCurrency() does this.
//   3. The response does NOT echo providerId or the date range, so the caller
//      is the only record of what was asked for.
//   4. TODO: unconfirmed whether {providerId} is providers.id or users.id.
//      Earnings.jsx sends provider.id. A wrong id returns 200 with "0.00"
//      and 0 rather than an error, so a mistake here is silent — verify
//      against a provider known to have completed bookings.

import bookingApiClient from "./bookingApiClient";

export const getProviderEarnings = (
  providerId,
  fromDate,
  toDate
) => {
  const params = {};

  if (fromDate) {
    params.fromDate = fromDate;
  }

  if (toDate) {
    params.toDate = toDate;
  }

  return bookingApiClient.get(
    `/api/analytics/providers/${providerId}/earnings`,
    { params }
  );
};
