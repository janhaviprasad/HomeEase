const { ApiError } = require('./errors');

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatBookingDateForApi(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join('-') + ` ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function toCreateBookingPayload(payload = {}) {
  const requestPayload = {
    service_id: payload.serviceId ?? payload.service_id,
    provider_id: payload.providerId ?? payload.provider_id,
    booking_date: formatBookingDateForApi(payload.bookingDate ?? payload.booking_date),
    address: payload.address,
  };

  if (requestPayload.provider_id === undefined || requestPayload.provider_id === null || requestPayload.provider_id === '') {
    delete requestPayload.provider_id;
  }

  return requestPayload;
}

function toStatusPayload(statusOrPayload) {
  if (typeof statusOrPayload === 'string') {
    return { status: statusOrPayload };
  }

  return statusOrPayload;
}

function adaptCreatedBooking(response = {}) {
  const id = response.id ?? response.bookingId;
  return {
    ...response,
    id,
    bookingId: response.bookingId ?? id,
  };
}

function adaptStatusUpdate(response = {}, fallbackId = null) {
  const id = response.id ?? response.bookingId ?? fallbackId;
  return {
    ...response,
    id,
    bookingId: response.bookingId ?? id,
  };
}

function toCreateReviewPayload(payload = {}, booking = null) {
  const providerId = payload.providerId ?? payload.provider_id ?? booking?.providerId ?? booking?.provider?.id;
  const requestPayload = {
    booking_id: payload.bookingId ?? payload.booking_id,
    rating: payload.rating,
    comment: payload.comment,
  };

  if (providerId !== undefined && providerId !== null) {
    requestPayload.provider_id = providerId;
  }

  return requestPayload;
}

function adaptCreatedReview(response = {}) {
  const id = response.id ?? response.reviewId;
  return {
    ...response,
    id,
    reviewId: response.reviewId ?? id,
  };
}

function createUnsupportedEndpointError(message) {
  return new ApiError({
    message,
    code: 'UNSUPPORTED_ENDPOINT',
    error: 'Unsupported Endpoint',
  });
}

module.exports = {
  adaptCreatedBooking,
  adaptCreatedReview,
  adaptStatusUpdate,
  createUnsupportedEndpointError,
  formatBookingDateForApi,
  toCreateBookingPayload,
  toCreateReviewPayload,
  toStatusPayload,
};
