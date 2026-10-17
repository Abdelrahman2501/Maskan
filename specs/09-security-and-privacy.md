# 09 — Security and Privacy

Status: **Draft v0.1**

ElSakka processes Egyptian national ID images, personal photos, phone numbers, and interview recordings. All of these are **sensitive personal data**.

> ⚠️ Security controls do not by themselves equal legal compliance. Before launch, the client should obtain legal review of obligations under Egypt's Personal Data Protection Law (Law No. 151 of 2020) and its executive regulations, including licensing/registration, consent wording, cross-border transfer (relevant if storage or OCR providers process data outside Egypt), and retention. ❓Q-19

## 1. Controls

| ID | Control | Implementation |
|---|---|---|
| SEC-001 | HTTPS everywhere | TLS terminated at the platform/proxy. HSTS in production. |
| SEC-002 | Password hashing | Argon2id (`argon2-cffi`), parameters reviewed yearly. |
| SEC-003 | Sessions | Opaque 256-bit token, SHA-256 hash stored. `HttpOnly; Secure; SameSite=Lax`. Idle timeout 7 days, absolute 30 days (proposed). Rotated on login and privilege change. Revocable. (ADR-0002) |
| SEC-004 | CSRF | Double-submit token (`elsakka_csrf` cookie + `X-CSRF-Token` header) on state-changing requests, plus a `SameSite=Lax` cookie. |
| SEC-005 | Input validation | Pydantic schemas on every input, with explicit max lengths. Zod mirrors them in the UI. |
| SEC-006 | SQL injection | SQLAlchemy parameterized queries only. Raw SQL is forbidden outside migrations. |
| SEC-007 | XSS | React escaping. No `dangerouslySetInnerHTML` on user content. CSP header in production. |
| SEC-008 | Authorization | Dependency-based checks on every route (deny by default), plus object-level checks (AUTHZ-001/002). A test asserts that every route declares an auth dependency. |
| SEC-009 | Rate limiting | Login, register, OTP send/verify, and upload-URL issuance. Per IP + per identifier. DB-backed counters in Phase 1. Redis only if needed. |
| SEC-010 | Uploads | Pre-signed PUT with exact content-type and content-length conditions. After upload, the server checks size and magic bytes before accepting. Keys are random UUIDs and contain no PII. |
| SEC-011 | Private storage | Bucket blocks all public access. Reads go only through presigned GET URLs with TTL ≤ 5 minutes, issued after a permission check and an audit log entry. |
| SEC-012 | Field encryption | National ID number encrypted at rest (AES-GCM, key from env/KMS), with an HMAC for uniqueness lookup. Only `last4` is shown in lists. |
| SEC-013 | Logging | Structured JSON. A redaction filter covers `password`, `otp`, `code`, `token`, `national_id`, `authorization`, and `cookie`. No request bodies are logged for auth, OTP, or identity routes. |
| SEC-014 | Errors | Generic 500 messages with a request ID. No stack traces in responses. |
| SEC-015 | CORS | Explicit origin allow-list. No `*` with credentials. Production startup refuses `*`. |
| SEC-016 | Secrets | Environment variables only. `.env` is git-ignored and `.env.example` holds placeholders. Production secrets live in the hosting platform's secret store. |
| SEC-017 | Dependencies | Lockfiles committed. `npm audit` / `pip-audit` in CI. Dependabot or Renovate. |
| SEC-018 | Audit | Append-only `audit_logs`. The application DB role has no UPDATE or DELETE on that table. |
| SEC-019 | Security headers | `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`, `Permissions-Policy` (camera and microphone only on the interview route). |
| SEC-020 | Backups | Encrypted, access-restricted, restore tested (see `11-…`). |

## 2. Privacy

- **Data minimization:** collect only the fields listed in the journey. No device fingerprinting.
- **Consent:** explicit consent checkbox at registration and before identity upload, with the purpose stated. The consent text version and timestamp are stored. The wording comes from the client's legal advisor.
- **Access:** sensitive files are viewed only by `identity.review` / `interviews.review` holders, and each view is audited.
- **Applicant rights:** a process for access, correction, and deletion requests is defined with the client.

## 3. Retention (proposed — needs client and legal confirmation ❓Q-20)

| Data | Proposed retention |
|---|---|
| ID images + selfie | Deleted 90 days after the identity decision. Decision metadata kept. |
| Interview recording | Deleted 180 days after the decision. |
| Rejected applicant PII | Anonymized 12 months after rejection. |
| OTP challenges / sessions | Purged 30 days after expiry. |
| Audit logs | 3 years. |

A scheduled job applies these rules and logs counts, never content.
