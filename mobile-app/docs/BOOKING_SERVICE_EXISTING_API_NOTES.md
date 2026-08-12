# Booking Service Existing API Notes

Real integration is available when `EXPO_PUBLIC_USE_MOCK_API=false`.

Integrated existing Cycle 1 endpoints:

- `GET /`
- `GET /api/test-db`
- `GET /api/services`
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/{id}/status`
- `DELETE /api/bookings/{id}`
- `POST /api/reviews`

Mobile adapter behavior:

- Create booking maps camelCase `{ serviceId, bookingDate, address }` to `{ service_id, booking_date, address }`.
- Booking date is sent as `YYYY-MM-DD HH:mm:ss`.
- Create booking maps `{ booking_id }` / `{ bookingId }` to mobile `id`.
- Status updates use `PATCH`, not `PUT`.
- Review create maps `{ bookingId, providerId, rating, comment }` to `{ booking_id, provider_id, rating, comment }`.

Guarded because the current Booking Service contract does not provide these endpoints:

- `GET /api/services/{id}`
- `GET /api/bookings/{id}`
- `GET /api/bookings/available`
- provider assigned jobs list/detail
- provider review list

The app shows clear unsupported-endpoint errors for missing real endpoints. Use mock mode for the complete provider and Cycle 2 UI flows until those backend contracts exist.
