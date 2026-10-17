# ElSakka — Claude Code project instructions

Virtual real estate agency platform (Egypt, New Cairo first): recruit → verify → interview → train → qualify agents, then give them a property catalogue and manually assigned leads. Phase 1 has a fixed scope and budget.

## Start every session

1. Read `specs/implementation-status.md` (where work stopped and what comes next).
2. Read `specs/open-questions.md`. Never implement behavior that depends on an open question. Use the documented default only if it is marked as accepted, or ask.
3. Read the spec of the feature you are working on (`specs/features/FEAT-xxx-*.md`). If it doesn't exist yet, write it first.

## Spec-driven rules

- **Specs are the source of truth.** If code and spec disagree, fix the code or update the spec explicitly. Never let them silently drift.
- Requirement IDs (`PLAT-`, `AUTH-`, `OTP-`, `IDV-`, `INT-`, `TRN-`, `QUIZ-`, `PROP-`, `LEAD-`, `ADM-`, `SEC-`, `AUTHZ-`) go in test comments (`# covers: AUTH-003`) and commit messages.
- Small, reviewable slices. A slice is done only when its acceptance criteria are checked with evidence recorded in `implementation-status.md`.
- Never claim tests pass without running them. Report failures with output.
- Out-of-scope requests become change requests in `specs/12-delivery-roadmap.md`.
- Ask before: paid services, production deploys, irreversible actions, new major dependencies, framework changes, schema changes that drop data.

## Layout

```
specs/      requirements, architecture, ADRs, feature specs, status
backend/    FastAPI (Python 3.12) — app/{core,db,api,modules/<domain>,integrations}
frontend/   Next.js 16 App Router + TS + Tailwind v4 — src/{app,components/ui,lib}
infra/      local infra helpers (Postgres init)
```

## Commands

```bash
docker compose up -d db                               # Postgres 16 on localhost:5433
# backend (from backend/, venv at backend/.venv)
.venv/Scripts/python -m uvicorn app.main:app --reload # API on :8000
.venv/Scripts/python -m alembic upgrade head
.venv/Scripts/python -m pytest -q                     # needs the db container
.venv/Scripts/python -m ruff check . && .venv/Scripts/python -m mypy app tests
# frontend (from frontend/)
npm run dev                                           # :3000, proxies /api → API_ORIGIN
npm run check                                         # lint + token lint + typecheck + tests
npm run build
```

## Backend conventions

- Routers do HTTP only. Services hold business rules and own transactions. Repositories do queries. Integrations sit behind `Protocol` interfaces with dev adapters.
- Every endpoint has a Pydantic `response_model`. Never return ORM objects.
- Every non-public route declares an auth/permission/stage dependency (deny by default). Object-scoped reads return **404** to non-owners.
- Errors: raise `app.core.errors.AppError(status, CODE, message)`. Never hand-build error JSON.
- Schema changes only via Alembic migrations, which must upgrade **and** downgrade.
- Workflow transitions: compare-and-set on `applications.stage` under `SELECT … FOR UPDATE`.
- Never log passwords, OTPs, tokens, national IDs, or document contents.

## Frontend conventions

- **Next.js 16 differs from older versions.** See `frontend/AGENTS.md`. Check `frontend/node_modules/next/dist/docs/` before using an unfamiliar API.
- Colors come only from tokens in `src/app/globals.css` (`bg-navy`, `text-ink`, `text-ink-muted`, `border-border`, `bg-success/10`…). `npm run lint:tokens` fails on raw hex.
- Primitives live in `src/components/ui` (cva variants + `cn()`). Links styled as buttons use `buttonVariants()` on `<Link>`.
- Every data view handles loading (skeleton), empty, error (with retry), and permission-denied states. No `alert()`/`confirm()`.
- Use logical spacing (`ms-`, `pe-`, `start-`, `end-`) so Arabic/RTL (Q-01) stays cheap.
- Mobile-first for applicant/agent screens, desktop-first for admin.

## Security non-negotiables

Private storage + short-lived signed URLs for IDs and videos · Argon2id · HttpOnly session cookies + CSRF (ADR-0002) · backend enforcement of every gate · audit log for sensitive actions · no secrets in code, `.env.example` holds placeholders only.
