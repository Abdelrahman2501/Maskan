# ADR-0002 — Server-side sessions in HttpOnly cookies (not JWT)

- Status: **Proposed** (implemented with FEAT-001)
- Date: 2026-10-17

## Context

Authentication must be revocable (suspension, role changes, logout everywhere). It must be resistant to XSS token theft and simple to reason about. The frontend and API are served from the same site.

## Options

| Option | Pros | Cons |
|---|---|---|
| JWT access + refresh in localStorage | Stateless | XSS can steal tokens; revocation needs a denylist |
| JWT in HttpOnly cookies + refresh rotation | No JS access | Still needs a server state for revocation; more moving parts |
| **Opaque session token in an HttpOnly cookie, hash stored in DB** | Instantly revocable, no JS access, simple | One indexed DB lookup per request (negligible at this scale) |

## Decision

Use opaque sessions: a 256-bit random token in the `elsakka_session` cookie (`HttpOnly; Secure; SameSite=Lax; Path=/`). The `sessions` table stores SHA-256(token). CSRF uses a double-submit token. Sessions rotate on login and privilege change.

## Consequences

- No refresh endpoint is needed. `POST /auth/refresh` from the brief is intentionally omitted.
- Role and stage changes take effect on the next request, because permissions are loaded per request.

## Amendment (2026-10-17, ADR-0003)

The mobile app cannot rely on browser cookie semantics. On login from mobile (`client: "mobile"` in the request), the API returns the opaque session token in the response body. The app stores it in `expo-secure-store` and sends it as `Authorization: Bearer <token>`. The server looks it up in the same `sessions` table (same revocation, expiry, and rotation rules). CSRF checks apply only to cookie-authenticated requests. Bearer requests are not vulnerable to CSRF.
