# HomeEase React Native Project Handoff

Last verified: 30 July 2026

This document covers only the HomeEase Expo React Native application in
`mobile-app/`. It does not describe ownership of the Spring Boot Auth Service,
Express Booking Service, web dashboard, or databases.

## 1. What Codex Built From Scratch

The mobile application started as a blank JavaScript Expo project and was
expanded into a role-based HomeEase application.

The implementation includes:

- Expo managed React Native project using JavaScript only.
- React Navigation native stacks and bottom tabs.
- Customer, provider, and authentication navigation branches.
- Shared design tokens and reusable UI components.
- Auth session storage and restoration with AsyncStorage.
- Axios clients for separate Auth and Booking services.
- Strict API response validation and safe error normalization.
- Customer service discovery, booking, tracking, cancellation, and review UI.
- Provider dashboard, available jobs, job progress, and availability UI.
- Native calendar and time selection for booking.
- Forgot-password UI with an explicit unsupported-backend state.
- Cycle 2 UI for addresses, profile editing, password changes, notifications,
  and provider earnings.
- In-memory mock services for complete customer and provider demonstrations.
- Automated tests for API contracts, forms, navigation, mock flows, and service
  catalogue behavior.

The application does not use TypeScript, Expo Router, Redux, or a custom native
Android/iOS project.

## 2. Technology

| Area | Implementation |
| --- | --- |
| Framework | Expo SDK 57 and React Native 0.86 |
| Language | JavaScript |
| React | React 19 |
| Navigation | React Navigation native stack and bottom tabs |
| Networking | Axios |
| Session storage | AsyncStorage |
| Native date/time | `@react-native-community/datetimepicker` |
| Icons | `@expo/vector-icons` |
| Safe areas | `react-native-safe-area-context` |
| Fonts | Inter and Plus Jakarta Sans through Expo Google Fonts |
| Tests | Node's built-in test runner |

## 3. Application Entry and Navigation

`App.js` loads fonts, keeps the splash screen visible until fonts are ready,
wraps the app in `SafeAreaProvider` and `AuthProvider`, and starts
`RootNavigator`.

`RootNavigator` selects the navigation branch from the restored session:

- No valid session: authentication stack.
- `CUSTOMER`: customer bottom tabs.
- `PROVIDER`: provider bottom tabs.
- `ADMIN`: mobile access is blocked and the user is directed to the web
  dashboard.
- Session network failure: retryable restore-error screen.

In development builds, a UI preview gallery is also available for visual
inspection.

## 4. Authentication Flow

The authentication stack contains:

- Welcome and role selection.
- Customer/provider login.
- Customer registration.
- Provider registration.
- Forgot-password screen.

Role selection opens the login screen first. The register link on login opens
the correct customer or provider registration screen.

After login or registration:

1. The API returns a token and minimum session fields.
2. The session is saved in AsyncStorage.
3. The app calls `authService.me()` to load the current user.
4. Provider users are enriched with the matching provider record when needed.
5. `RootNavigator` opens the correct role branch.

Stored session fields are limited to:

- `token`
- `userId`
- `name`
- `email`
- `role`

Passwords and test credentials are not stored.

Forgot password is implemented in the UI, but the current real Auth Service
adapter intentionally returns an unsupported-endpoint error because a verified
password-reset contract has not been provided.

## 5. Customer Features

The customer application contains four tabs.

### Home

- Loads the service catalogue.
- Supports local service search.
- Displays service images, categories, descriptions, and prices.
- Opens service details.
- Opens the booking form.

### Booking

- Selects a service.
- Uses native date and time pickers.
- Accepts and validates the service address.
- Creates a booking through `bookingsService`.
- Lists the customer's bookings.
- Displays booking details.
- Allows supported booking cancellation.
- Allows one review for an eligible completed booking.

### Alerts

- Lists notifications.
- Displays unread counts and read state.
- Supports mark-as-read and mark-all-read behavior.

### Profile

- Displays customer identity information.
- Opens saved addresses.
- Supports adding, editing, deleting, and selecting a default address.
- Opens edit-profile and change-password forms.
- Supports logout.

## 6. Provider Features

The provider application contains five tabs.

### Dashboard

- Displays accepted, in-progress, and completed job statistics.
- Shows the active job.
- Opens the active job details.
- Opens available jobs.

### Jobs

- Lists available jobs.
- Accepts a pending job.
- Lists the provider's jobs.
- Displays job details.
- Supports valid booking state actions:
  - `PENDING` to `ACCEPTED`
  - `ACCEPTED` to `IN_PROGRESS`
  - `IN_PROGRESS` to `COMPLETED`
  - supported cancellation/rejection actions

### Earnings

- Summarizes completed-job earnings.
- Displays recent completed jobs and monthly totals.

### Alerts

- Uses the shared notification screen.

### Profile

- Displays provider category, experience, rating, and approval state.
- Supports availability changes.
- Opens edit-profile and change-password forms.
- Supports logout.

## 7. Shared UI Foundation

Reusable components live in `src/components/`. Important components include:

- `ScreenContainer`
- `AppHeader`
- `PrimaryButton`
- `SecondaryButton`
- `DestructiveButton`
- `ActionButton`
- `Card`
- `Input`
- `StatusPill`
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `ApprovalBanner`
- `ServiceCard`
- `BookingCard`
- `AvailableJobCard`
- `RatingStars`
- `ProfileHeader`
- `SearchInput`
- `SectionHeader`
- `StatCard`

Design tokens live in `src/constants/` and define colors, spacing, radius,
typography, shadows, and component dimensions. The current visual system uses
the approved HomeEase teal accent, white cards, light canvas, dark text, and
status-specific colors.

Service and UI images live in `assets/`. Screenshot references used during the
UI correction pass live in `docs/screenshots/phase1a-corrections/`.

## 8. API Architecture

Screens do not call Axios directly. Screens call service modules in `src/api/`:

- `auth.js`
- `services.js`
- `bookings.js`
- `reviews.js`
- `cycle2.js`

`client.js` creates two Axios clients:

- Auth Service base URL from `EXPO_PUBLIC_AUTH_BASE_URL`.
- Booking Service base URL from `EXPO_PUBLIC_BOOKING_BASE_URL`.

The request interceptor attaches `Authorization: Bearer <token>` when a stored
token exists. Public requests use `skipAuth`.

The response interceptor requires the standard success wrapper:

```json
{
  "status": "SUCCESS",
  "data": {}
}
```

Error handling supports both current backend fields:

```json
{
  "status": "ERROR",
  "message": "Human-readable message"
}
```

```json
{
  "status": "ERROR",
  "msg": "Human-readable or Spring exception message"
}
```

The client:

- Rejects malformed success responses.
- Rejects `status: "ERROR"` even when returned with HTTP 200.
- Preserves the real HTTP status.
- Extracts safe text from Spring exception messages.
- Prevents Java exception classes, raw response objects, and tokens from being
  displayed in the UI.
- Recursively converts snake_case response keys to camelCase.
- Converts supported price fields to numbers.

## 9. Current Real API Mapping

### Auth Service

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/health`
- `GET /api/auth/me`
- `GET /api/users/{id}` compatibility fallback
- `GET /api/providers`
- `GET /api/providers/{id}`
- `PUT /api/providers/{id}/availability`
- `PUT /api/users/{id}`
- `PUT /api/users/{id}/password`
- `POST /api/users/{id}/profile-picture`

### Booking Service

- `GET /`
- `GET /api/test-db`
- `GET /api/services`
- `GET /api/services/{id}`
- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/bookings/{id}`
- `PUT /api/bookings/{id}/accept`
- `PUT /api/bookings/{id}/start`
- `PUT /api/bookings/{id}/complete`
- `PUT /api/bookings/{id}/cancel`
- `PUT /api/bookings/{id}/reject`
- `GET /api/provider/bookings/pending`
- `GET /api/provider/bookings/accepted`
- `GET /api/provider/bookings/completed`
- `GET /api/provider/bookings/today`
- `DELETE /api/bookings/{id}`
- `POST /api/reviews`

### Cycle 2 Adapter Paths

- `GET /api/addresses`
- `POST /api/addresses`
- `PUT /api/addresses/{id}`
- `DELETE /api/addresses/{id}`
- `PUT /api/addresses/{id}/default`
- `GET /api/notifications`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/read-all`
- `DELETE /api/notifications/{id}`

These are frontend adapter paths, not proof that every partner backend currently
implements the contract.

## 10. Mock and Real Modes

The mode is controlled by:

```env
EXPO_PUBLIC_USE_MOCK_API=true
```

Use `true` for a complete in-memory customer/provider demo. Mock data resets
when the app process restarts.

Use:

```env
EXPO_PUBLIC_USE_MOCK_API=false
```

to call configured real services.

Important: the current flag is global. When it is `false`, Cycle 2 adapters also
attempt real API calls. Until Cycle 2 backend contracts are verified, partners
should treat Cycle 2 as mock-ready rather than confirmed live integration.

`EXPO_PUBLIC_USE_MOCK_AVAILABLE_JOBS` is retained for available-job development
behavior.

## 11. Environment Setup

Use LAN-accessible backend URLs. Do not use `localhost` on a physical phone.

```env
EXPO_PUBLIC_AUTH_BASE_URL=http://YOUR_LAN_IP:8081
EXPO_PUBLIC_BOOKING_BASE_URL=http://YOUR_LAN_IP:8082
EXPO_PUBLIC_USE_MOCK_API=true
EXPO_PUBLIC_USE_MOCK_AVAILABLE_JOBS=false
```

The phone and development computer must normally be on the same network. Backend
servers must listen on an address reachable from the phone, and local firewalls
must allow the service ports.

Do not commit real LAN IPs, passwords, JWTs, or shared secrets.

## 12. Install, Start, and Test

From `mobile-app/`:

```bash
npm install
npm start
```

The Expo development server is intentionally configured for port `8083`.

Platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

Run automated tests:

```bash
npm test
```

Run the Expo health check when internet/package metadata is available:

```bash
npx expo-doctor
```

Latest local test result on 30 July 2026:

```text
109 tests passed
0 failed
```

The Expo Doctor recheck on the same date could not reach `registry.npmjs.org`
because the execution environment had no network access. A previous project
check passed all 20 checks, but partners should rerun it on their own connected
machine.

## 13. Recommended Demonstration

For a reliable UI demonstration:

1. Set `EXPO_PUBLIC_USE_MOCK_API=true`.
2. Restart Expo after changing environment variables.
3. Demonstrate customer role selection and login.
4. Browse a service and create a booking with the date/time picker.
5. Show the new booking in My Bookings.
6. Sign out and demonstrate the provider dashboard.
7. Accept a pending job, start it, and complete it.
8. Return to the customer and submit a review.
9. Show saved addresses, notifications, profile tools, and provider earnings.

For a real API demonstration:

1. Set both LAN base URLs.
2. Set `EXPO_PUBLIC_USE_MOCK_API=false`.
3. Restart Expo with cache clearing if old environment values remain.
4. Verify Auth Service health and Booking Service health from the same network.
5. Test login and registration before beginning the faculty demonstration.
6. Verify one complete booking lifecycle against seeded database records.

## 14. Remaining Work

The most important work remaining before production is:

1. Verify the complete real customer and provider lifecycle against both running
   partner services.
2. Provide and integrate a real forgot-password/reset-password contract.
3. Confirm every booking detail, provider job, review, and notification response
   against live backend data.
4. Verify Cycle 2 contracts and replace mock-only assumptions with tested live
   behavior.
5. Separate Cycle 1 and Cycle 2 mode flags if the services will become available
   at different times.
6. Replace any machine-specific URL in the example environment file with
   `YOUR_LAN_IP` placeholders before sharing or committing.
7. Add backend integration tests and repeatable database seed data.
8. Update production app name, identifiers, icons, signing, and EAS build
   configuration before release.

## 15. Important File Map

```text
mobile-app/
|-- App.js
|-- app.json
|-- package.json
|-- assets/
|-- docs/
|   `-- REACT_NATIVE_PROJECT_HANDOFF.md
`-- src/
    |-- __tests__/
    |-- api/
    |-- components/
    |-- constants/
    |-- context/
    |-- development/
    |-- navigation/
    |-- screens/
    |   |-- auth/
    |   |-- customer/
    |   |-- cycle2/
    |   |-- preview/
    |   |-- provider/
    |   `-- system/
    `-- utils/
```

## 16. Partner Handoff Summary

Codex built the React Native application foundation, HomeEase UI system,
role-based navigation, authentication/session handling, customer and provider
flows, mock Cycle 1 and Cycle 2 data services, real API adapters, compatibility
handling for current backend response differences, and the automated test
suite.

The mobile project is ready for a stable mock demonstration. Real integration
must be demonstrated only after the partner Auth and Booking services are
reachable and their current contracts have been verified end to end.
