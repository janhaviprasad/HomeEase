// Auth Service (port 8081) — admin user list.
//
//   GET /api/users?page=0&size=20&role=CUSTOMER        (ADMIN only)
//
//   {
//     "content": [
//       { "id": 18, "name": "Janhvi Kulkarni", "email": "janhvi@example.com",
//         "role": "CUSTOMER", "phone": "9876543210", "imageUrl": null },
//       { "id": 16, "name": "Anuja Mhetre", "email": "anuja@example.com",
//         "role": "CUSTOMER", "phone": "9867534280",
//         "imageUrl": "/uploads/user-16-482fccab-....jpg" }
//     ],
//     "page": 0, "size": 20, "totalElements": 4, "totalPages": 1
//   }
//
// ENVELOPE DEVIATION — read this before changing anything here.
//
// This endpoint returns a raw Spring Data Page at the TOP LEVEL. It is NOT
// wrapped in { status, data } like every other Auth Service endpoint, so the
// array is response.data.content, not response.data.data.content.
//
// Accepted for cycle 2 and flagged in the wrap-up. The deviation is contained
// to this one file deliberately: unwrapping inside createApiClient would
// silently break /api/providers and /api/auth/login, which DO follow the
// envelope. Do not add unwrapping middleware.
//
// Roles are the User.Role enum: CUSTOMER | PROVIDER | ADMIN. The role param is
// omitted entirely when unset or "ALL" — the backend has no ALL member, so
// sending it would be an unknown enum value rather than "no filter".

import apiClient from "./apiClient";

export const DEFAULT_PAGE_SIZE = 20;

export const getUsers = async ({
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  role = "",
} = {}) => {

  const params = { page, size };

  if (role && role !== "ALL") {
    params.role = role;
  }

  const response = await apiClient.get(
    "/api/users",
    { params }
  );

  // Already the Page object. Nothing to unwrap.
  return response.data;
};
