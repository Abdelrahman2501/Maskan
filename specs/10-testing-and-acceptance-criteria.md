# 10 — Testing Strategy and Acceptance Criteria

Status: **Draft v0.1**

## 1. Levels

| Level | Tool | Scope | Runs |
|---|---|---|---|
| Backend unit | pytest | Services, validators, scoring, state machine | Every commit |
| Backend integration | pytest + real Postgres (Docker) + fake integrations | Routers end to end, authz, transactions, concurrency | Every commit |
| Frontend unit/component | Vitest + Testing Library | Components, form validation, state rendering | Every commit |
| Static | Ruff, ESLint, `tsc --noEmit`, token lint | — | Every commit |
| E2E | Playwright (against Docker Compose stack) | The scenarios in §3 | PR to main, nightly |

Tests reference requirement IDs in their name or a `covers:` comment, e.g. `def test_health_reports_db_status():  # covers: PLAT-002`.

## 2. Mandatory cross-cutting tests

- **Route auth inventory** (SEC-008): walk FastAPI routes and fail if any non-public route lacks an auth or permission dependency.
- **IDOR matrix:** for each object-scoped endpoint, a second user receives 404.
- **Concurrency:** parallel duplicate submissions (interview, quiz start, quiz submit) result in exactly one effect.
- **No hex in components:** token lint (PLAT-007).

## 3. End-to-end scenarios

| # | Scenario | Key assertions |
|---|---|---|
| E2E-01 | Applicant registers and verifies phone | OTP via dev adapter; stage → identity_pending |
| E2E-02 | Applicant submits identity documents | Files private; stage → identity_processing |
| E2E-03 | OCR match → approved / mismatch → manual review → approve | Correct routing; reviewer audit entry |
| E2E-04 | Applicant records and submits interview | Single submission; duplicate blocked |
| E2E-05 | Recruiter accepts / rejects | Rejection screen; training blocked for rejected |
| E2E-06 | Trainee completes training | Progress persisted across reload |
| E2E-07 | Trainee fails, then passes quiz | Attempts decrement; qualified on pass |
| E2E-08 | Qualified agent browses properties | Prices with currency; non-qualified user gets 403 |
| E2E-09 | Admin assigns lead | Assignment history entry |
| E2E-10 | Agent adds a note to an assigned lead | Timestamp + author |
| E2E-11 | Agent cannot open another agent's lead | 404 in UI and API |
| E2E-12 | Non-staff cannot reach the admin area | 403 page; API 403 |
| E2E-13 | Quiz expiry and attempt limit survive refresh / direct API | Server-finalized; no extra attempt |

## 4. Definition of Done (per slice)

1. Acceptance criteria in the feature spec are checked off with evidence (test names).
2. Lint, type-check, unit and integration tests pass locally (commands and results recorded in `implementation-status.md`).
3. Migrations upgrade **and** downgrade cleanly on an empty DB.
4. No new raw hex colors. No secrets committed.
5. `implementation-status.md` updated.
