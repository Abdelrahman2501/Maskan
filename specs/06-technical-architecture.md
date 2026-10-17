# 06 — Technical Architecture

Status: **Draft v0.2** — see `decisions/ADR-0001-initial-architecture.md`, `ADR-0002-session-auth.md` and **`ADR-0003-mobile-app-and-bilingual.md`** (mobile app + bilingual, which supersedes the "browser-only" parts below).

> **Clients (ADR-0003):** `mobile/` (Expo React Native: applicants, trainees, agents) and `frontend/` (Next.js: landing + staff admin). Both call the same `/api/v1`. Mobile sends `Authorization: Bearer`, and web uses cookies.

## 1. Shape: modular monolith

```
                ┌──────────────────────────── Browser ───────────────────────────┐
                │ Next.js app (applicant · agent · admin areas)                  │
                └──────────────┬──────────────────────────────┬──────────────────┘
                               │ /api/v1 (same-site, cookie)  │ PUT/GET pre-signed URLs
                ┌──────────────▼───────────────┐      ┌───────▼────────────────────┐
                │ FastAPI (modular monolith)   │─────▶│ Private object storage     │
                │  routers → services → repos  │      │ (S3-compatible: R2 / MinIO)│
                │  integrations (interfaces)   │      └────────────────────────────┘
                └───┬──────────────┬───────────┘
                    │              │ provider adapters
             ┌──────▼─────┐  ┌─────▼─────────────────────────┐
             │ PostgreSQL │  │ WhatsApp OTP · OCR · Email     │
             └────────────┘  └───────────────────────────────┘
```

- One deployable backend and one deployable frontend. No microservices or Kubernetes in Phase 1.
- Background work (OCR, quiz-expiry sweep) starts as in-process tasks with DB-backed state, so it is retry-safe. A dedicated worker is introduced only when load requires it (it would be recorded as an ADR).

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile | Expo (React Native) + TypeScript, React Navigation, TanStack Query, Zustand, expo-secure-store, i18next | `mobile/` |
| Frontend (admin + landing) | Next.js (App Router) + React + TypeScript (strict) | `frontend/` |
| Styling | Tailwind CSS v4 with CSS-variable design tokens | `globals.css` `@theme` |
| UI primitives | shadcn/ui conventions (Radix + cva), added on demand | |
| Forms | React Hook Form + Zod | Added with FEAT-001 |
| Frontend tests | Vitest + Testing Library; Playwright for E2E | |
| Backend | Python 3.12, FastAPI, Pydantic v2, pydantic-settings | `backend/` |
| ORM / migrations | SQLAlchemy 2.0 (sync, psycopg 3) + Alembic | Sync SQLAlchemy keeps transactions and row locking simple. FastAPI runs sync endpoints in a threadpool. |
| DB | PostgreSQL 16 | |
| Backend tests | pytest against a real Postgres (Docker) | |
| Lint/format | Ruff (Python), ESLint + TypeScript (frontend) | |
| Storage | S3-compatible private bucket. Local: MinIO in Docker Compose. | Added with FEAT-003 |

## 3. Backend module layout

```
backend/
  app/
    main.py              # app factory, middleware, router registration
    core/                # config, logging, errors, security primitives, request id
    db/                  # engine, session dependency, declarative Base
    api/v1/              # router aggregation; one router module per domain
    modules/
      auth/              # router.py · schemas.py · service.py · repository.py · models.py
      otp/
      identity/
      recruitment/
      training/
      quiz/
      catalogue/
      leads/
      admin/
      audit/
    integrations/
      whatsapp/          # base.py (Protocol) · dev.py · <provider>.py
      ocr/
      storage/
  migrations/            # Alembic
  tests/
```

Rules:
- **Routers** handle HTTP only: parse, call a service, map to a response schema.
- **Services** hold business rules and state transitions. They own the transaction boundary.
- **Repositories / queries** do database access. No business decisions.
- **Integrations** are reached only through a `Protocol` interface and are chosen by config. This lets tests use fakes.
- ORM objects are never returned. Every endpoint declares a Pydantic `response_model`.

## 4. Frontend layout

```
frontend/src/
  app/
    (public)/            # landing, login, register
    (applicant)/         # onboarding stages
    (agent)/             # dashboard, properties, leads
    admin/               # admin shell + modules
  components/ui/         # design-system primitives
  components/<domain>/   # composed components
  lib/                   # api client, auth helpers, utils
```

- The API client is a thin `fetch` wrapper. It sends credentials and the CSRF header, and parses the error envelope into a typed `ApiError`.
- Next.js rewrites `/api/*` to the backend in dev. In production both are served from the same site, so cookies stay first-party and `SameSite=Lax` works.

## 5. Integration interfaces

| Interface | Methods | Dev adapter | Production candidates (decision pending) |
|---|---|---|---|
| `WhatsAppOtpProvider` | `send_otp(phone_e164, code, locale)` | Logs to console. UI shows "dev mode" | Meta WhatsApp Cloud API (direct), Twilio Verify (WhatsApp channel), local Egyptian BSP — ❓Q-17 |
| `OcrProvider` | `extract_national_id(front_image) -> OcrResult` | Deterministic fake | Google Cloud Vision, AWS Textract, Azure Document Intelligence — needs a trial on Arabic/Eastern-Arabic numerals — ❓Q-18 |
| `ObjectStorage` | `presign_put`, `presign_get`, `head`, `delete` | MinIO | Cloudflare R2 (no egress fees), AWS S3 |
| `Mailer` | `send(template, to, ctx)` | Console | Pending ❓Q-12/Q-16 |

## 6. Configuration

All settings come from environment variables via `pydantic-settings` (`app/core/config.py`). In `ENVIRONMENT=production`, startup **fails** if any of these hold:
- `SECRET_KEY` is the placeholder or shorter than 32 characters
- `DEBUG` is true
- a dev integration adapter is selected
- `CORS_ORIGINS` contains `*`
