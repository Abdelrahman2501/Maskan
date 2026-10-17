# 04 — Functional Requirements

Status: **Draft v0.1**. Requirement IDs are stable. Reference them in tests (`# covers: AUTH-003`), commits, and PRs. Each feature file in `features/` expands its group with flows, states, and acceptance criteria.

## PLAT — Platform foundation (FEAT-000)
| ID | Requirement |
|---|---|
| PLAT-001 | Monorepo with `frontend/` (Next.js), `backend/` (FastAPI), `specs/`, and Docker Compose for local services. |
| PLAT-002 | `GET /api/v1/health` reports API liveness and database connectivity. |
| PLAT-003 | Configuration comes only from environment variables, validated at startup. The app refuses to start in `production` with unsafe defaults. |
| PLAT-004 | All API errors use one JSON error envelope (`08-api-contracts.md` §2). |
| PLAT-005 | Every request gets a request ID, returned as `X-Request-ID` and included in logs. |
| PLAT-006 | Database schema changes are applied only through Alembic migrations. |
| PLAT-007 | Design tokens are centralized. Components consume tokens, never raw hex values. |
| PLAT-008 | Landing page (Stage 1) with brand, headline, description, Login and Sign-up actions. |

## AUTH — Authentication (FEAT-001)
| ID | Requirement |
|---|---|
| AUTH-001 | Register with first name, last name, email, phone, and password (+ confirmation). |
| AUTH-002 | Email is lowercased and trimmed. Phone is normalized to E.164 (default region EG). Both are unique. |
| AUTH-003 | Duplicate email or phone returns a generic error that does not enumerate other accounts. |
| AUTH-004 | Password policy: ≥ 10 characters, not in a common-password list. Hashed with Argon2id. |
| AUTH-005 | Log in with email **or** phone + password. Rate-limited per IP and per identifier. |
| AUTH-006 | Session uses an opaque token in an `HttpOnly; Secure; SameSite=Lax` cookie. Only the hash is stored server-side (ADR-0002). |
| AUTH-007 | Logout revokes the server-side session. |
| AUTH-008 | `GET /auth/me` returns the user, staff roles, permissions, and agent stage. |
| AUTH-009 | State-changing requests require a CSRF token (double-submit). |
| AUTH-010 | Password reset flow. ❓Q-12 (channel: email or WhatsApp) |

## OTP — WhatsApp OTP (FEAT-002)
| ID | Requirement |
|---|---|
| OTP-001 | 6-digit OTP from a CSPRNG. Only an HMAC hash is stored. |
| OTP-002 | Expires after 5 minutes (configurable). |
| OTP-003 | Resend cooldown of 60 seconds. At most 5 sends per phone per hour. |
| OTP-004 | At most 5 wrong guesses per code. The code is then invalidated. |
| OTP-005 | Rate limits apply per user, per phone, and per IP. |
| OTP-006 | Messages are sent through a `WhatsAppOtpProvider` interface. The dev adapter writes to the dev console/log and is marked clearly in the UI ("dev mode — not sent"). |
| OTP-007 | Plaintext OTPs are never logged outside the dev adapter. The dev adapter is disabled in production. |
| OTP-008 | Distinct UI states: sent, incorrect, expired, rate-limited, provider failure. |
| OTP-009 | Verification events are recorded (sent, failed, verified, locked) without the code. |

## IDV — Identity verification (FEAT-003)
| ID | Requirement |
|---|---|
| IDV-001 | Capture the national ID number and three images: front, back, personal photo. |
| IDV-002 | Allowed types: JPEG, PNG, WebP (sniffed by magic bytes, not by extension). Max 8 MB each (configurable). |
| IDV-003 | Files upload to **private** object storage under non-guessable keys. |
| IDV-004 | Staff view files only through signed URLs with a TTL of 5 minutes or less. |
| IDV-005 | OCR runs through an `OcrProvider` interface. The extracted number, confidence, and raw status are stored. |
| IDV-006 | Outcomes: match → policy (Q-02); mismatch, low confidence, or failure → manual review. |
| IDV-007 | ID number format validation, kept as a replaceable rule. ❓Q-13 (confirm the official structure) |
| IDV-008 | Reviewer workspace shows documents, OCR fields, a match indicator, and decision + reason. The reviewer and timestamp are recorded. |
| IDV-009 | List views mask the ID number (e.g. `2••••••••••45`). |
| IDV-010 | Applicant status view with a next-step message. A resubmission limit applies. ❓Q-14 |

## INT — Interview (FEAT-004)
| ID | Requirement |
|---|---|
| INT-001 | Instructions page with a reference video and the requirements (~60 s, introduce yourself). |
| INT-002 | Record with MediaRecorder. Permission prompt, live preview, countdown, auto-stop at the configured maximum (default 90 s). |
| INT-003 | Preview and retry before submission. |
| INT-004 | Upload directly to private storage through a pre-signed URL. The server verifies the object (size, type) before accepting the submission. |
| INT-005 | Clear states when recording is unsupported or permission is denied. Upload fallback: ❓Q-04 |
| INT-006 | One active submission. Duplicate submits are idempotent (see `08-api-contracts.md` §5). |
| INT-007 | Recruiter list, playback, accept/reject with reason, and history. |
| INT-008 | Rejection and congratulations screens. Internal notes are never exposed. |

## TRN — Training (FEAT-005)
| ID | Requirement |
|---|---|
| TRN-001 | Admins CRUD courses (title, description, order, publication status). |
| TRN-002 | Admins CRUD course videos (title, duration, order, storage key or external URL). |
| TRN-003 | Trainees see published courses with per-video progress, and can resume from the last position. |
| TRN-004 | Progress updates are monotonic. The server does not let `watched_seconds` go backwards or exceed the duration. |
| TRN-005 | Training completion rule. ❓Q-06 |

## QUIZ — Qualification quiz (FEAT-006)
| ID | Requirement |
|---|---|
| QUIZ-001 | Question bank: single-correct multiple-choice questions (Phase 1), active/inactive flag. |
| QUIZ-002 | Configuration: question count (default 10), pass threshold % (default 70), max attempts (default 2), time limit in minutes. Validated (for example, count ≤ number of active questions). |
| QUIZ-003 | Starting an attempt snapshots the config, picks the questions, and sets `deadline_at` on the server. |
| QUIZ-004 | Answers save individually and idempotently. Answers after the deadline are rejected. |
| QUIZ-005 | Submit is idempotent. An expired, unsubmitted attempt is finalized lazily on the next access, and also by a periodic sweep. |
| QUIZ-006 | Score = correct / question count. Pass if score ≥ threshold. |
| QUIZ-007 | The attempt limit is enforced server-side under a row lock. Refresh, reconnect, and parallel tabs never create extra attempts. |
| QUIZ-008 | The result shows pass/fail, the score, and remaining attempts. Correct answers are not revealed. ❓Q-15 |
| QUIZ-009 | Tab-switch warning in the UI only. It is not claimed as prevention. |

## PROP — Property catalogue (FEAT-007)
| ID | Requirement |
|---|---|
| PROP-001 | CRUD plus activate/deactivate for locations. |
| PROP-002 | CRUD for compounds: name, location, description, address/geo, developer, amenities, media, status. |
| PROP-003 | Configurable property types. |
| PROP-004 | Unit models: structured fields (area, bedrooms, bathrooms, floor, finishing, view) plus a validated `extra_specs` JSON extension. |
| PROP-005 | Media (images, floor plans, videos) attached to a compound or unit model, ordered, in storage. |
| PROP-006 | Prices: `NUMERIC(14,2)` amount + ISO 4217 code, `updated_at`/`updated_by`, and price history. |
| PROP-007 | Catalogue endpoints require stage `qualified_agent` or `properties.manage`. |
| PROP-008 | Detail screen with gallery, video, specifications, price + currency, and price last-updated time. |
| PROP-009 | List endpoints are paginated and load related rows without N+1 queries. |

## LEAD — Leads CRM (FEAT-008)
| ID | Requirement |
|---|---|
| LEAD-001 | Admins create and edit leads. CSV import is optional. ❓Q-10 |
| LEAD-002 | Assign and reassign manually. The history is append-only (who, when, from, to). |
| LEAD-003 | An agent lists only their currently assigned leads: search, status filter, paginated, sortable by last activity. |
| LEAD-004 | Lead detail: permitted customer fields, status, assignment, notes, timeline. |
| LEAD-005 | Append-only notes (author, timestamp, content 1–5000 chars). |
| LEAD-006 | Status changes are recorded in `lead_status_history`. |
| LEAD-007 | Any non-assigned agent receives `404` for the lead and every sub-resource. |

## ADM — Admin dashboard (FEAT-009)
| ID | Requirement |
|---|---|
| ADM-001 | Admin shell: navy sidebar grouped as in `05-ui-ux-design-system.md` §6, filtered by permission. |
| ADM-002 | Overview cards computed from live data, with loading, empty, and error states. |
| ADM-003 | Users and roles management, with last-super-admin protection. |
| ADM-004 | Audit log viewer: filter by actor, action, entity, and date. |
| ADM-005 | Reports: recruitment funnel, training/qualification, catalogue counts, lead status distribution. |
| ADM-006 | System settings: OTP limits, upload limits, interview max duration. |
| ADM-007 | Confirmation dialogs for every destructive or consequential action. |

## NOTIF — Notifications
| ID | Requirement |
|---|---|
| NOTIF-001 | In-app notifications for stage decisions. External channels (email/WhatsApp) for decisions: ❓Q-16 |
