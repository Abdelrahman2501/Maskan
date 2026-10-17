# Maskan

Maskan is a virtual real estate agency platform for Egypt. It recruits, verifies, trains, and qualifies real estate agents, then gives qualified agents a property catalogue and manually assigned leads.

- **New here? Start with [`GETTING-STARTED.md`](GETTING-STARTED.md)** — what's built so far and how to run the web admin, the mobile app, and the backend.
- **Specifications:** [`specs/`](specs/00-product-overview.md) (start with `00-product-overview.md`)
- **Current status:** [`specs/implementation-status.md`](specs/implementation-status.md)
- **Open business decisions:** [`specs/open-questions.md`](specs/open-questions.md)

| Part | Stack |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic |
| Database | PostgreSQL 16 |

## Prerequisites

- Node.js 22+ and npm
- Python 3.12+
- Docker (for local PostgreSQL)

## Local setup

```bash
# 1. Environment
cp .env.example .env            # placeholders are fine for local development

# 2. Database (PostgreSQL on localhost:5433; also creates the maskan_test database)
docker compose up -d db

# 3. Backend
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"        # macOS/Linux: .venv/bin/python
.venv/Scripts/python -m alembic upgrade head
.venv/Scripts/python -m uvicorn app.main:app --reload  # http://localhost:8000/api/v1/docs

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev                                            # http://localhost:3000
```

The Next.js dev server proxies `/api/*` to `API_ORIGIN` (default `http://localhost:8000`). The browser therefore talks to a single origin, and session cookies stay first-party.

If ports 3000, 8000, or 5433 are already in use, change `POSTGRES_PORT`/`DATABASE_URL` in `.env`, run uvicorn with `--port`, run `npm run dev -- -p <port>`, and set `API_ORIGIN` to match.

## Tests and checks

```bash
# Backend (from backend/, requires `docker compose up -d db`)
.venv/Scripts/python -m pytest -q
.venv/Scripts/python -m ruff check .
.venv/Scripts/python -m mypy app tests

# Frontend (from frontend/)
npm run check      # ESLint + design-token lint + TypeScript + Vitest
npm run build
```

Integration tests use the `maskan_test` database. Override it with `TEST_DATABASE_URL`.

## Database migrations

```bash
cd backend
.venv/Scripts/python -m alembic revision --autogenerate -m "describe change"
.venv/Scripts/python -m alembic upgrade head
.venv/Scripts/python -m alembic downgrade -1
```

Every migration must upgrade and downgrade cleanly. Never edit a migration that has been applied to a shared environment.

## Seed data

There is no seed data yet. A local-only seed script (roles, permissions, a local super admin) arrives with FEAT-001. Seed data is always clearly fake and is never loaded in production.

## Integrations

WhatsApp OTP, OCR, and object storage are accessed through provider interfaces with local development adapters. Provider selection is pending (see `specs/open-questions.md` Q-17, Q-18). Configuration variables will be added to `.env.example` as each integration lands.

## Deployment and operations

Hosting is not chosen yet (Q-21). See [`specs/11-deployment-and-operations.md`](specs/11-deployment-and-operations.md) for the planned environments, CI/CD, backups, and restore drills. This section will hold concrete deploy and restore steps once hosting is decided.

## Design system

Tokens live in `frontend/src/app/globals.css`, and primitives in `frontend/src/components/ui`. In development, open `/design-system` for a live reference. The page is hidden in production builds.
