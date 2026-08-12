# HomeEase Mobile API Mode

Cycle 1 can now use the existing Auth Service and Booking Service APIs when `EXPO_PUBLIC_USE_MOCK_API=false`.

Cycle 2 remains mock-only until final backend contracts are provided.

Current behavior:

- `MOCK_ONLY_CYCLE_MODE` in `src/api/config.js` is `false`.
- `EXPO_PUBLIC_USE_MOCK_API=true` runs the full mock UI flow.
- `EXPO_PUBLIC_USE_MOCK_API=false` calls the real existing Cycle 1 endpoints.
- The current Booking Service contract does not include service detail, booking detail, available jobs, provider jobs, or review-list endpoints.
- Missing real endpoints are guarded with clear unsupported-endpoint messages.
- Mock data is in memory and resets when the app process restarts.
- Do not treat Cycle 2 screens as backend-integrated until real Cycle 2 API contracts are provided.
