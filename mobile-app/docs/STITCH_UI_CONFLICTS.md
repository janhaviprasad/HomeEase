# Stitch UI Conflicts

This file records the Phase 1A visual-reference conflicts where the Stitch export differs from the approved HomeEase Cycle 1 contract.

| Stitch reference | Project requirement | Chosen implementation | Reason |
|---|---|---|---|
| `register_with_role_selection` shows role selection on the login screen. | Login must not ask for role; backend returns the authenticated role. | Login screen uses email/password only. | Prevents role spoofing and follows Auth Service contract. |
| `register_user_role_selection` shows a role toggle inside registration. | Welcome screen owns role choice; customer/provider have separate registration flows. | Customer and provider registration previews are separate single forms. | Matches React Navigation/auth flow decisions. |
| `booking_form` includes Additional Notes. | Cycle 1 booking create sends only `serviceId`, `bookingDate`, and `address`. | Notes field omitted. | Avoids collecting unsupported data. |
| Several Stitch screens use dollar prices. | HomeEase uses Indian currency. | All monetary UI uses `₹` with decimal formatting. | Matches local product and API contract. |
| `provider_dashboard` emphasizes earnings and revenue trends. | Cycle 1 provider dashboard shows accepted, in-progress, and completed counts. | Earnings cards replaced with job counters. | Earnings/analytics are Cycle 2. |
| `profile_settings` includes Personal Information, Payment Methods, Notification Settings, Help, edit profile, change password. | Cycle 1 customer profile includes basic info and logout only. | Profile rows show name/email/phone and logout. | Removes unsupported Cycle 2 navigation. |
| `incoming_requests` shows distance, urgency, flexible timing, Decline. | Available jobs may show only service, date/time, locality, price, pending status, and Accept. | Available job cards omit distance, urgency, flexible badges, and Decline. | Preserves privacy and matches approved target endpoint. |
| `provider_dashboard` shows Contact and Navigate actions. | Those actions are not approved Cycle 1 mobile actions. | Contact/Navigate omitted. | Avoids unsupported customer contact actions outside authorized job detail. |
| `provider_profile_earnings` shows earnings chart and recent job history. | Provider profile shows profile metadata, approval, availability, and logout. | Earnings/history removed. | Earnings are Cycle 2. |
| Missing direct references for Welcome, ServiceDetail, BookingDetail, MyJobs, JobDetail, ProviderProfile. | All 16 required Cycle 1 screen shells must exist. | Derived shells use the nearest Stitch card/header/list language. | Keeps visual consistency without inventing unsupported screens. |
| Remote Google-hosted generated service images appear in HTML. | Production app should not depend on internet-hosted image URLs. | UI uses local decoded logo and native icon/category placeholders. | Remote generated images are not local assets. |
