# ADR-0003 — React Native mobile app for applicants and agents; bilingual Arabic/English

- Status: **Accepted (client decision 2026-10-17)**
- Date: 2026-10-17
- Related: CR-001 (`12-delivery-roadmap.md`), Q-01 (`open-questions.md`), amends ADR-0001 and ADR-0002

## Context

The original brief scoped Phase 1 as a responsive web application and excluded native apps. On 2026-10-17 the client decided:

1. Applicants and agents use a **native mobile app (iOS and Android)**. The admin dashboard stays on the web.
2. The whole product is **bilingual: Arabic (right-to-left) and English**, switchable by the user.

## Decision

### Client surfaces

| Surface | Users | Technology | Folder |
|---|---|---|---|
| Mobile app | Applicants, trainees, qualified agents | React Native + **Expo** (managed workflow, EAS Build) + TypeScript | `mobile/` |
| Web admin | Staff roles (recruiter, training admin, sales manager, property manager, super admin) | Next.js (existing `frontend/`) | `frontend/` |
| Public landing | Visitors | Next.js landing page with app-store links | `frontend/` |

The mobile stack matches the team's existing Expo project (Tab-Mobile): React Navigation, TanStack Query (server state), Zustand (client state), and `expo-secure-store` (session token).

The backend is **unchanged**: one FastAPI API serves both clients.

### Mobile-specific choices

- **Interview recording** uses `expo-camera` video recording instead of the browser MediaRecorder API (INT-002). This also removes the browser-support fallback question (Q-04 now only concerns permission denial).
- **ID images and selfie** use the camera or photo picker, with an on-device resize/compress step before upload.
- **Uploads** go directly to private storage through pre-signed URLs, as before.
- **OTP**: WhatsApp OTP is unchanged.

### Internationalization (both clients)

- Library: `i18next` + `react-i18next` on mobile, with the device locale detected by `expo-localization`. The web admin uses an equivalent setup chosen when admin screens start.
- Message catalogues live per client: `mobile/src/i18n/locales/{en,ar}.json`. Keys are identical in both files, and a test fails if a key is missing from either.
- **Arabic is right-to-left.** Mobile uses `I18nManager.forceRTL` (applied after an app reload). Layouts use `start`/`end` (never `left`/`right`).
- The default language is the device language if it is Arabic or English, otherwise English. The user's choice is persisted.
- Numbers, dates and currency are formatted with `Intl` for the active locale. Prices always show the explicit currency code (BR-3.3).
- Backend error `message` stays English for logs. Clients map error `code` to translated text, so the API does not need to localize.
- Arabic font: **IBM Plex Sans Arabic** for Arabic text, with Inter for Latin text. Both are open-licensed.

## Consequences

- Adds a third codebase (`mobile/`), app-store accounts (Apple Developer USD 99/year, Google Play USD 25 one-time), store review time, and app release management.
- ADR-0002 amended: mobile authenticates with the same opaque session token sent as `Authorization: Bearer <token>`. CSRF does not apply to bearer requests. The web admin keeps HttpOnly cookies + CSRF.
- The Next.js `/register` and `/login` pages no longer host the applicant journey. `/login` becomes the **staff** login, and the landing page points applicants to the app stores.
- Schedule and cost impact is tracked in CR-001.
