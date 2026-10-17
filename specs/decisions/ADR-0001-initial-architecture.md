# ADR-0001 — Initial Architecture

- Status: **Accepted (proposed by engineering; pending client acknowledgment)**
- Date: 2026-10-17

## Context

The repository was empty at project start. The brief specifies Next.js + FastAPI + PostgreSQL. The team is small, the budget is fixed (EGP 240k), the timeline is about 12 weeks, and the infrastructure allowance is USD 20–100 per month.

## Decision

1. **Modular monolith:** one FastAPI backend, organized by domain modules (`app/modules/<domain>`), and one Next.js frontend. Monorepo layout `frontend/`, `backend/`, `specs/`.
2. **Sync SQLAlchemy 2.0 + psycopg 3** (not async). The core risks in this product are transactional (state transitions, attempt limits, assignments). Sync sessions with `SELECT … FOR UPDATE` are simpler to get right and to test. Throughput needs are modest. FastAPI runs sync endpoints in its threadpool.
3. **UUID primary keys** (non-enumerable, which helps with IDOR safety).
4. **Third-party integrations behind `Protocol` interfaces**, with dev adapters selected by config. Production refuses to start with dev adapters.
5. **Direct-to-storage uploads** via pre-signed URLs. Large video and image bodies never pass through the API process.
6. **Tailwind v4 CSS-variable tokens** as the single design-token source. UI primitives follow shadcn/ui conventions and are added on demand.
7. **pip + `pyproject.toml`** for the backend and **npm** for the frontend. These are the tools available on the development machine, and no extra tooling is needed.

## Consequences

- Simple to run locally and to deploy on a single VPS or PaaS.
- Modules can be extracted later if one needs to scale independently. Nothing in Phase 1 requires that.
- Sync DB access caps concurrency per worker. This is mitigated by running multiple Uvicorn workers if needed.
