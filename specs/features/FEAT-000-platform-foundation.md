# FEAT-000 — Platform Foundation

| Field | Value |
|---|---|
| Requirements | PLAT-001 … PLAT-008 |
| Status | **Implemented — see implementation-status.md for verification evidence** |
| Depends on | — |

## Objective

Create a runnable, tested skeleton that every later feature builds on. It covers repository layout, configuration, database and migrations, the error and request-ID conventions, design tokens, base UI primitives, and the Stage 1 landing page.

## Scope

- Backend: FastAPI app factory, settings with production guards, DB engine and session dependency, Alembic configured (baseline migration), `/api/v1/health`, error envelope, request-ID middleware, security headers, CORS, pytest suite against Docker Postgres.
- Frontend: Next.js + TypeScript + Tailwind v4, design tokens, Inter font, `cn()` helper, primitives: `Button`, `Card`, `Badge`/`StatusBadge`, `Skeleton`. Landing page. Dev-only `/design-system` preview page. Vitest component tests. Token lint script.
- Infra: `docker-compose.yml` (Postgres 16), `.env.example`, README, CLAUDE.md.

## Non-goals

Auth, users, any business tables, storage, CI pipeline file (pending Q-22), deployment.

## Main flows

1. A developer clones the repo, copies `.env.example`, runs `docker compose up -d db`, then runs the backend and the frontend → the landing page renders, and `/api/v1/health` returns `{"status":"ok","database":"ok"}`.
2. The database is down → `/api/v1/health` returns HTTP 503 with `{"status":"degraded","database":"unavailable"}`.

## API

`GET /api/v1/health` — public.
```json
200 { "status": "ok", "database": "ok", "version": "0.1.0", "environment": "local" }
503 { "status": "degraded", "database": "unavailable", "version": "0.1.0", "environment": "local" }
```

## States (landing page)

Static content only. Login and Sign-up go to `/login` and `/register`. Those routes show a "Coming in the next release" placeholder until FEAT-001, so the buttons are never decorative or broken.

## Acceptance criteria

| AC | Criterion | Evidence |
|---|---|---|
| AC-000-1 | `/api/v1/health` returns 200 + `database: ok` with the DB up | `test_health_ok` |
| AC-000-2 | Health returns 503 + `database: unavailable` when the DB is unreachable | `test_health_db_down` |
| AC-000-3 | Unknown route returns 404 in the error envelope with a `request_id` | `test_not_found_envelope` |
| AC-000-4 | Validation error returns 422 in the envelope with `details` | `test_validation_envelope` |
| AC-000-5 | Every response has `X-Request-ID`. An inbound valid ID is echoed back | `test_request_id_*` |
| AC-000-6 | Production settings with a placeholder secret / debug / `*` CORS fail to load | `test_production_guards_*` |
| AC-000-7 | `alembic upgrade head` and `downgrade base` succeed on an empty DB | command log |
| AC-000-8 | Button renders all variants, is disabled + `aria-busy` while loading | `button.test.tsx` |
| AC-000-9 | No raw hex colors under `src/components` and `src/app` (except `globals.css`) | `npm run lint:tokens` |
| AC-000-10 | Landing page renders headline, Login and Sign-up links | `page.test.tsx` |
| AC-000-11 | Frontend `lint`, `typecheck`, `build` pass; backend `ruff` passes | command log |

## Risks

- Exact Next.js and Tailwind versions are those resolved by `create-next-app@latest` on 2026-10-17. They are recorded in `frontend/package.json`.
