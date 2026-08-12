# Auth Service Contract Notes

The provided Auth Service contract uses:

- Base URL: `EXPO_PUBLIC_AUTH_BASE_URL`, port `8081`
- Success wrapper: `{ "status": "SUCCESS", "data": ... }`
- Error wrapper: `{ "status": "ERROR", "msg": "Human-readable error message" }`
- Protected endpoints require `Authorization: Bearer <JWT_TOKEN>`

Mobile compatibility status:

- `register`, `login`, `/api/auth/me`, `GET /api/users/{id}`, `GET /api/providers`, `GET /api/providers/{id}`, and provider availability paths match the contract.
- The response/error compatibility layer already accepts `msg`.
- Profile update maps to `PUT /api/users/{id}`.
- Change password maps to `PUT /api/users/{id}/password` with `{ oldPassword, newPassword }`.
- Auth health uses `allowPlainResponse` because `/api/auth/health` returns plain text.
- Forgot password is still mock-only; it was added before this contract and no real endpoint is documented here.

Real Auth integration is available when `EXPO_PUBLIC_USE_MOCK_API=false`.
