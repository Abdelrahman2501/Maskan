# 08 — API Contracts

Status: **Draft v0.1**. FastAPI's generated OpenAPI (`/api/v1/openapi.json`, docs at `/api/v1/docs` in non-production) is the detailed contract. This file defines the conventions plus the endpoint catalogue. Each feature spec defines its endpoints' request and response schemas in full.

## 1. Conventions

- Base path `/api/v1`. JSON only (`application/json`), except binary uploads, which go **directly to storage via pre-signed URLs**.
- Field names are `snake_case`. Timestamps are ISO 8601 UTC (`2026-10-17T09:30:00Z`). Money is `{ "amount": "4500000.00", "currency": "EGP" }`, with the amount as a **string** to avoid float rounding.
- Auth uses the session cookie (`elsakka_session`). State-changing methods (POST/PUT/PATCH/DELETE) require the `X-CSRF-Token` header to match the `elsakka_csrf` cookie.
- Every response carries `X-Request-ID`.

## 2. Error envelope (PLAT-004)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Some fields are invalid.",
    "details": [{ "field": "email", "message": "Enter a valid email address." }],
    "request_id": "8f0c…"
  }
}
```

| HTTP | `code` | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed request |
| 401 | `UNAUTHENTICATED` | No valid session |
| 403 | `FORBIDDEN` | Authenticated but lacks the permission or stage |
| 403 | `CSRF_FAILED` | Missing or mismatched CSRF token |
| 404 | `NOT_FOUND` | Missing **or not visible to the caller** (IDOR-safe) |
| 409 | `CONFLICT` / `INVALID_STATE` | Duplicate, or the action is not allowed in the current workflow stage |
| 422 | `VALIDATION_ERROR` | Body or query validation failed (`details` populated) |
| 429 | `RATE_LIMITED` | Rate limit hit. `Retry-After` header set |
| 502 | `PROVIDER_ERROR` | Third-party (WhatsApp/OCR/storage) failure |
| 500 | `INTERNAL_ERROR` | Unhandled. Message is generic and details are only in logs |

## 3. Pagination

List endpoints: `?page=1&page_size=20` (max 100), `?sort=-created_at`, plus resource filters.

```json
{ "items": [ … ], "page": 1, "page_size": 20, "total": 134 }
```

## 4. Endpoint catalogue

Legend — **Auth:** `public` · `user` (any logged-in user) · `stage:<x>` · `perm:<x>`

### Platform
| Method & path | Auth | Spec |
|---|---|---|
| GET `/health` | public | PLAT-002 |

### Auth & OTP (FEAT-001/002)
| Method & path | Auth | Spec |
|---|---|---|
| POST `/auth/register` | public | AUTH-001..004 |
| POST `/auth/login` | public | AUTH-005/006 |
| POST `/auth/logout` | user | AUTH-007 |
| GET `/auth/me` | user | AUTH-008 |
| GET `/auth/csrf` | public | AUTH-009 (issues the CSRF cookie for anonymous forms) |
| POST `/auth/whatsapp-otp/send` | user | OTP-001..005 |
| POST `/auth/whatsapp-otp/verify` | user | OTP-004 |

### Identity (FEAT-003)
| Method & path | Auth | Spec |
|---|---|---|
| POST `/identity/upload-urls` | stage:applicant (identity_pending / action_required) | IDV-003 |
| POST `/identity/submissions` | same | IDV-001/005 |
| GET `/identity/status` | user | IDV-010 |
| GET `/admin/identity-reviews` | perm:identity.review | IDV-008/009 |
| GET `/admin/identity-reviews/{id}` | perm:identity.review | IDV-004/008 |
| POST `/admin/identity-reviews/{id}/decision` | perm:identity.review | IDV-008 |

### Applications & interviews (FEAT-004)
| Method & path | Auth | Spec |
|---|---|---|
| GET `/applications/me` | user | journey routing |
| GET `/interviews/instructions` | stage:interview_pending | INT-001 |
| POST `/interviews/upload-url` | stage:interview_pending | INT-004 |
| POST `/interviews` | stage:interview_pending (`Idempotency-Key` header) | INT-004/006 |
| GET `/admin/applications` | perm:applicants.read | INT-007 |
| GET `/admin/interviews/{id}` | perm:interviews.review | INT-007 |
| POST `/admin/applications/{id}/decision` | perm:applications.decide | INT-007 |
| POST `/admin/applications/{id}/reopen-interview` | perm:applications.decide | T8 |

### Training & quiz (FEAT-005/006)
| Method & path | Auth | Spec |
|---|---|---|
| GET `/courses` · GET `/courses/{id}` | stage:trainee+ | TRN-003 |
| PUT `/course-videos/{id}/progress` | stage:trainee+ | TRN-004 |
| GET `/quizzes/available` | stage:trainee | QUIZ-008 |
| POST `/quizzes/attempts` | stage:quiz_eligible | QUIZ-003/007 |
| GET `/attempts/{id}` | owner | QUIZ-005 (resume after refresh) |
| PUT `/attempts/{id}/answers/{attempt_question_id}` | owner | QUIZ-004 |
| POST `/attempts/{id}/submit` | owner | QUIZ-005 |
| GET `/attempts/{id}/result` | owner | QUIZ-008 |
| Admin CRUD `/admin/courses`, `/admin/course-videos`, `/admin/questions`, `/admin/quiz-config`, GET `/admin/quiz-attempts` | perm:training.manage / quiz.manage / quiz.results.read | TRN-001/002, QUIZ-001/002 |

> The brief listed `POST /quizzes/{id}/attempts` and `POST /attempts/{id}/answers`. These were refined: a single current quiz config means there is no quiz ID, and answers are a per-question `PUT`, which makes saves naturally idempotent.

### Catalogue (FEAT-007)
| Method & path | Auth | Spec |
|---|---|---|
| GET `/locations` · `/locations/{id}/compounds` · `/compounds/{id}` · `/compounds/{id}/unit-models` · `/unit-models/{id}` | stage:qualified_agent or perm:properties.manage | PROP-007/008/009 |
| Admin CRUD `/admin/locations`, `/admin/compounds`, `/admin/property-types`, `/admin/unit-models`, `/admin/property-media`, `/admin/unit-prices` | perm:properties.manage / prices.manage | PROP-001..006 |

### Leads (FEAT-008)
| Method & path | Auth | Spec |
|---|---|---|
| GET `/leads` · GET `/leads/{id}` | stage:qualified_agent (assignee only) | LEAD-003/004/007 |
| GET, POST `/leads/{id}/notes` | assignee | LEAD-005 |
| PATCH `/leads/{id}/status` | assignee | LEAD-006 |
| GET, POST `/admin/leads` · PATCH `/admin/leads/{id}` | perm:leads.manage | LEAD-001 |
| POST `/admin/leads/{id}/assignment` | perm:leads.assign | LEAD-002 |
| GET `/admin/leads/assignment-history` | perm:leads.read_all | LEAD-002 |

### Admin platform (FEAT-009)
| Method & path | Auth | Spec |
|---|---|---|
| GET `/admin/dashboard/summary` | perm:reports.read (scoped) | ADM-002 |
| CRUD `/admin/users` · PUT `/admin/users/{id}/roles` | perm:users.manage / roles.manage | ADM-003 |
| GET `/admin/audit-logs` | perm:audit.read | ADM-004 |
| GET `/admin/reports/{report}` | perm:reports.read | ADM-005 |
| GET, PUT `/admin/settings` | perm:settings.manage | ADM-006 |

## 5. Idempotency and concurrency

- **Interview submit:** a client-generated `Idempotency-Key` (UUID). Repeating the key returns the original result. The partial unique index blocks a second active submission.
- **Quiz:** the attempt limit is guarded by `unique(user_id, attempt_no)` plus a row lock on the application. Submit is a no-op if the attempt is already finalized, and returns the stored result.
- **Stage transitions:** compare-and-set on `applications.stage` under `FOR UPDATE`. A mismatch returns `409 INVALID_STATE`.
- **Admin edits** of catalogue and leads: optimistic concurrency through `updated_at` sent as `If-Match` (added when the admin modules are built).
