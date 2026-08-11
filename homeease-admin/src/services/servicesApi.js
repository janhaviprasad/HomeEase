// Booking Service (port 8082) — service catalogue CRUD.
//
//   GET /api/services            all services, active and inactive
//   { "status": "SUCCESS", "data": [
//     { "id": 1, "category_name": "Electrician",
//       "description": "Wiring, switchboard, fan and appliance repair",
//       "price": "299.00", "image_url": null,
//       "created_at": "...", "updated_at": "...", "is_active": 1 } ] }
//
//   POST /api/services           body { category_name, description, price, image_url }
//   { "status": "SUCCESS", "data": { "service_id": 9 } }
//   Returns the new id only, not the object — callers re-fetch the list.
//
//   PUT /api/services/{id}       same body shape
//   Returns the full updated service, same shape as a GET element, so callers
//   can splice it into state without re-fetching.
//
//   DELETE /api/services/{id}    soft delete, sets is_active to 0
//   { "status": "SUCCESS", "data": { "serviceId": "6" } }
//
// Two inconsistencies, deliberately NOT normalised here — they belong to the
// Booking Service's own migration pass, and hiding them at this layer would
// make the eventual cleanup harder to verify:
//
//   * GET/POST/PUT are snake_case; DELETE's response is camelCase.
//   * price arrives as a string on GET but is sent as a number on POST/PUT.
//     DELETE also returns its id as a string.
//
// The DELETE response body carries nothing the caller needs; handlers re-fetch
// and ignore it.

import bookingApiClient from "./bookingApiClient";

export const getServices = () =>
  bookingApiClient.get("/api/services");

export const createService = (payload) =>
  bookingApiClient.post("/api/services", payload);

export const updateService = (id, payload) =>
  bookingApiClient.put(
    `/api/services/${id}`,
    payload
  );

export const deleteService = (id) =>
  bookingApiClient.delete(`/api/services/${id}`);
