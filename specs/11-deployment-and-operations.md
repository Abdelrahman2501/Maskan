# 11 — Deployment and Operations

Status: **Draft v0.1** — the hosting provider is pending ❓Q-21.

## 1. Environments

| Env | Purpose | Data | Integrations |
|---|---|---|---|
| local | Development | Seed data only (`make seed` / `python -m app.scripts.seed`), clearly fake | Dev adapters, MinIO |
| staging | Client UAT | Synthetic + client test data | Real providers in sandbox/test mode |
| production | Live | Real | Real providers |

Each environment has separate databases, buckets, secrets, and provider credentials. Production data is never copied to lower environments.

## 2. Local stack

`docker-compose.yml` provides PostgreSQL 16 now. MinIO is added with FEAT-003. Frontend and backend run natively for fast reloads (see README). A full-container mode can be added later.

## 3. Hosting options (to be decided with the client — fits the USD 20–100/month allowance)

| Option | Shape | Rough monthly cost (estimate, verify before committing) |
|---|---|---|
| A. Single VPS (e.g. Hetzner/DigitalOcean) + Docker Compose + Caddy (auto-HTTPS) + managed backups to R2 | Cheapest, most control, more ops work | ~USD 15–40 |
| B. PaaS: Render/Railway/Fly for API + Vercel for frontend + managed Postgres | Less ops, easy previews | ~USD 40–100 |
| C. AWS (App Runner/ECS + RDS + S3) | Most enterprise-ready, more complex | ~USD 80+ |

Recommendation: **A or B**. Storage on **Cloudflare R2** (S3 API, no egress fees, which suits video).

## 4. CI/CD (proposed)

1. On PR: lint, type-check, unit and integration tests (Postgres service), frontend build, `pip-audit` / `npm audit`.
2. On merge to `main`: build images, deploy to staging, run migrations, smoke test `/health`.
3. Production: manual approval → deploy → migrate → smoke test.

The CI platform depends on where the repository is hosted (GitHub Actions vs. Gitea Actions — both use similar workflow syntax) ❓Q-22.

## 5. Migrations

- `alembic upgrade head` runs as a release step, before new app instances take traffic.
- Migrations are backward-compatible with the previous release (expand → migrate → contract) so a deploy can roll back.

## 6. Observability

- Structured JSON logs with request ID.
- Error monitoring: Sentry (free tier is likely sufficient), frontend and backend, with PII scrubbing enabled.
- Uptime check on `/api/v1/health`.

## 7. Backups and recovery

- Postgres: daily logical dump (or provider snapshots) + PITR if the provider supports it. Encrypted, retained 30 days, stored in a separate account/bucket.
- Object storage: versioning enabled on the private bucket.
- **Restore drill** before launch and quarterly: restore to a scratch database, run smoke tests, record the time taken. The procedure is documented in `README.md` §Operations once hosting is chosen.
