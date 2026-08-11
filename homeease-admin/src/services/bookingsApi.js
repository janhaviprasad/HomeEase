// Booking Service (port 8082). Snake_case payload, money as strings.
//
//   GET /api/bookings
//
//   { "status": "SUCCESS",
//     "data": {
//       "page": 0, "size": 20, "count": 13,
//       "bookings": [
//         { "id": 13, "customer_id": 9, "provider_id": null,
//           "service_id": 1, "booking_date": "2026-08-15T04:30:00.000Z",
//           "status": "CANCELLED", "address": "Pune",
//           "total_price": "299.00", "accepted_at": null,
//           "completed_at": null, "cancelled_at": null,
//           "created_at": "...", "updated_at": "..." } ] } }
//
// Verified against Postman with an admin token, 29 Jul 2026.
//
//   1. The array is at data.bookings, NOT data — the envelope carries
//      pagination metadata alongside it.
//   2. Already paginated at size 20 server-side. There is no pagination UI
//      yet, so past 20 bookings only the first 20 are visible. Revisit when
//      volume warrants.
//   3. No customer_name / provider_name / service_name in the payload yet;
//      the table shows raw ids. Samruddhi is adding the names.
//   4. Status filtering is client-side for now. When ?status= ships, add
//      `{ params: status ? { status } : {} }` here and drop the filter in
//      Booking.jsx.

import bookingApiClient from "./bookingApiClient";

export const getBookings = () =>
  bookingApiClient.get("/api/bookings");
