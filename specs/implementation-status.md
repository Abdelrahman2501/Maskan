# Implementation Status

_Last updated: 2026-10-17 — session 2 (UI prototype)_

**Resume here.** Read this file, then `open-questions.md`, then the spec for the next slice.

## Session 2 — decisions and full UI prototype

**Client decisions (2026-10-17):** bilingual Arabic (RTL) + English everywhere (Q-01 closed). Applicants/agents use a **React Native (Expo) app**; staff use the web admin (CR-001, ADR-0003; price/dates still pending).

**Built: clickable UI prototype on sample data (no backend calls).** Every screen is labelled "Prototype · sample data". Behavior that depends on open questions uses the *proposed defaults* from `open-questions.md` and must be re-checked when they are answered.

| Surface | Scope | Where |
|---|---|---|
| Mobile app (Expo SDK 58, Expo Router, i18next) | Welcome, register, WhatsApp OTP, identity docs + status, interview (simulated recorder), submitted, decision; training dashboard, course, video player, quiz intro/timed quiz/result, qualified; agent tabs (home, properties, leads, profile), compound, unit, lead detail with notes/status; prototype menu (long-press logo or tap "Prototype · sample data") | `mobile/` |
| Web admin (Next.js) | Shell with permission-filtered sidebar + role switcher; dashboard; recruitment (applicants, identity reviews, interviews, decisions); training (courses, videos, question bank, quiz config, attempts); properties (locations, compounds, types, unit models, media, pricing); sales (leads, assignments, history); administration (users, roles, reports, audit logs, settings); staff login | `frontend/src/app/admin/`, `frontend/src/app/login/` |
| Landing | Bilingual, points applicants to the app, staff sign-in link | `frontend/src/app/page.tsx` |

**Verification (2026-10-17):**
- Frontend: `npm run check` ✅ (lint, token lint, typecheck, 20 tests incl. en/ar key parity); `npm run build` ✅ 116 static pages.
- Mobile: `npx tsc --noEmit` ✅; `npx jest` ✅ 10 tests (en/ar key parity per namespace); `npx expo export -p web` ✅.
- Visual: screenshots via headless Edge device emulation (390×844 mobile, 1440×900 admin) in EN and AR — layout mirrors correctly in Arabic. Not yet tried on a physical phone.

**Known prototype limitations:** no camera (interview recorder is simulated); images are token-based placeholders; state resets on reload; RTL on native is applied by a root `direction` style (`DirectionView`), web uses `dir`. Native `supportsRTL` is disabled in `app.json` so the app controls direction itself.

**Next:** client walkthrough of the prototype → answer open questions → resume backend slices starting with FEAT-001 (auth + RBAC), then wire screens to the API one feature at a time.

## Repository assessment (session 1)

The repository was **empty** at start: no code, no git history, no documentation. There was nothing to preserve or migrate. Git was initialized (`main`, no commits yet). Tooling on the dev machine: Node 22.23, npm 12, Python 3.12.9, Docker 29.2, Git 2.51. No pnpm/uv/poetry, so the project uses npm + pip (ADR-0001).

Local port notes: 5432, 3000, and 8000 are used by other apps on the dev machine. Postgres runs on **5433**. Use other ports for ad-hoc runs if needed.

## Requirement audit

| Area | Status | Notes |
|---|---|---|
| Specs foundation (00–12, ADRs, open questions) | ✅ Drafted | Awaiting client review |
| FEAT-000 Platform foundation (PLAT-001…008) | ✅ Implemented + verified | See evidence below |
| FEAT-001 Authentication (AUTH-*) | ⬜ Missing | Next slice. Spec to be written first. Q-12 affects password reset only |
| FEAT-002 WhatsApp OTP (OTP-*) | ⬜ Missing | Dev adapter possible now. Production blocked by Q-17 (provider + Meta account) |
| FEAT-003 Identity verification (IDV-*) | ⛔ Blocked (partly) | Q-02, Q-03, Q-13, Q-14, Q-18 (OCR provider) |
| FEAT-004 Interview (INT-*) | ⬜ Missing | Q-04, Q-07 |
| FEAT-005 Training (TRN-*) | ⬜ Missing | Q-06; content from client |
| FEAT-006 Quiz (QUIZ-*) | ⬜ Missing | Q-05, Q-08, Q-15 |
| FEAT-007 Property catalogue (PROP-*) | ⬜ Missing | Content from client |
| FEAT-008 Leads (LEAD-*) | ⬜ Missing | Q-09, Q-10, Q-11 |
| FEAT-009 Admin dashboard (ADM-*) | ⬜ Missing | |
| Security/privacy controls (SEC-*) | 🟡 Partial | SEC-013 (log redaction), SEC-014 (generic 500s), SEC-015 (CORS guard), SEC-019 (baseline headers) done |
| CI/CD | ⬜ Missing | Q-22 (repo host) |
| Deployment / staging | ⬜ Missing | Q-21 (hosting) |
| i18n / RTL | ⛔ Decision needed | Q-01 — **highest-priority question** |

Legend: ✅ done · 🟡 partial · ⬜ not started · ⛔ blocked by a decision or dependency

## FEAT-000 verification evidence (2026-10-17)

| Check | Command (run from) | Result |
|---|---|---|
| Migrations up/down/up | `python -m alembic upgrade head` / `downgrade base` / `upgrade head` (backend) | ✅ `0001 (head)` |
| Backend tests | `python -m pytest -q` (backend) | ✅ 16 passed, 1 warning (Starlette TestClient/httpx deprecation notice from the library) |
| Backend lint | `python -m ruff check .` | ✅ All checks passed |
| Backend types | `python -m mypy app tests` (strict) | ✅ No issues in 21 files |
| Frontend lint | `npm run lint` | ✅ |
| Token lint (AC-000-9) | `npm run lint:tokens` | ✅ |
| Frontend types | `npm run typecheck` | ✅ |
| Frontend tests | `npm test` | ✅ 11 passed (2 files) |
| Frontend build | `npm run build` | ✅ 5 static routes |
| Live smoke | API on :8010, `next start` on :3010 | ✅ `/api/v1/health` 200 direct + via Next proxy; `X-Request-ID` + security headers present; landing 200; `/design-system` 404 in prod; `/register` 200 |
| Visual check | Headless Edge screenshots at 1440 px and 390 px | ✅ Layout correct on desktop and mobile, no horizontal overflow |

Acceptance criteria AC-000-1 … AC-000-11: all met (see `features/FEAT-000-platform-foundation.md`).

## Known issues / notes

- npm 12 blocked the `unrs-resolver` postinstall script (an ESLint resolver dependency). Lint works without it. Revisit if ESLint import resolution errors appear.
- `frontend/AGENTS.md` is generated and maintained by Next.js 16 (`next dev` re-adds it). It warns that Next 16 APIs differ from older versions. Read `frontend/node_modules/next/dist/docs/` before using unfamiliar Next APIs.
- Feature spec files FEAT-001 … FEAT-009 are not yet written as standalone files. Their requirement IDs live in `04-functional-requirements.md`. Each is written in full at the start of its slice (spec-first).

## Next recommended slice: FEAT-001 Authentication + RBAC foundation

Why first: every other feature depends on identity, sessions, the stage model, and permission checks. It does not depend on any open question except password reset (Q-12), which can be deferred inside the slice.

Covers: AUTH-001…009, AUTHZ-001…006, SEC-002/003/004/008/009, part of ADM-003 (seeded roles), and the `applications` table with the stage column (T1).

Planned files:
- `specs/features/FEAT-001-authentication.md` (written first)
- `backend/app/modules/auth/*`, `backend/app/modules/audit/*` (minimal audit writer), `backend/app/core/security.py`
- Migration `0002_identity_access` (users, roles, permissions, role_permissions, user_roles, sessions, applications, application_stage_history, audit_logs)
- Seed script for roles, permissions, and a local super admin
- Frontend: `lib/api.ts`, form primitives (Input, PasswordInput, FormField, Toast), `/register` + `/login` real screens, auth-aware redirects
- Tests: register/login/logout/me, duplicate handling without enumeration, CSRF, rate limits, route-auth inventory test, Vitest form validation

New dependencies (to be confirmed at the start of the slice): `argon2-cffi`, `phonenumbers` (backend); `react-hook-form`, `zod`, `@hookform/resolvers` (frontend).
