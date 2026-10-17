# 00 — Product Overview

| Field | Value |
|---|---|
| Product | ElSakka |
| Type | Virtual real estate agency platform: native mobile app (iOS/Android) for applicants and agents, web admin dashboard (ADR-0003) |
| Initial market | Egypt — New Cairo, extensible to other locations |
| Phase | Phase 1 (approx. 12 weeks, EGP 240,000 development budget, before CR-001) |
| Languages | Arabic (RTL) and English, user-switchable (Q-01) |
| Status | Discovery — specifications in draft, awaiting client approval |

## 1. Problem

ElSakka recruits independent real estate agents. Today, recruiting, verifying, training, and equipping those agents with property information and leads is manual. This is slow, hard to audit, and inconsistent.

## 2. Solution

A single platform that moves a candidate through an explicit, auditable pipeline:

```
Register → WhatsApp OTP → National ID + photo (OCR + manual review)
        → Browser video interview → Recruiter decision
        → Training courses → Qualification quiz
        → Qualified agent workspace (property catalogue + assigned leads)
```

Administrators (recruiters, training admins, property managers, sales managers, super admins) operate each stage from a dedicated admin dashboard.

## 3. Primary objectives (from the client brief)

| ID | Objective |
|---|---|
| OBJ-01 | Digitize agent registration and recruitment |
| OBJ-02 | Verify phone ownership through WhatsApp OTP |
| OBJ-03 | Collect national ID documents and perform OCR-assisted comparison |
| OBJ-04 | Browser-recorded interview video (~1 minute) |
| OBJ-05 | Recruiters approve or reject applicants |
| OBJ-06 | Training courses and a qualification quiz for accepted applicants |
| OBJ-07 | Unlock the agent workspace after qualification |
| OBJ-08 | Organize property information, specifications, media, and prices |
| OBJ-09 | Manual lead assignment by sales administrators |
| OBJ-10 | Admin control of users, roles, training, properties, leads, and records |

## 4. Out of scope for Phase 1

~~Native mobile apps~~ (now in scope via CR-001) · automatic FX conversion · automatic lead distribution · AI lead scoring · AI interview scoring / advanced proctoring · external property-portal integrations · customer-facing WhatsApp sales automation · producing course videos or property photography · unspecified legacy data migration · independent penetration testing or formal compliance certification · maintenance after the 30-day defect warranty.

Anything outside this scope is handled as a **change request** (see `12-delivery-roadmap.md` §Change control).

## 5. Success criteria for Phase 1

1. A real applicant can complete the full journey from registration to qualified agent without staff intervention, except for the review steps that require it by design.
2. Every gate (OTP, identity, interview, quiz) is enforced by the backend, not only by the UI.
3. Every consequential administrative action is attributable (who, when, what) in the audit log.
4. Sensitive documents and recordings are never publicly reachable.
5. The client's staff can manage catalogue content, training content, and leads without developer help.

## 6. Specification index

| File | Purpose |
|---|---|
| `01-business-requirements.md` | Business rules and constraints |
| `02-user-roles-and-permissions.md` | Roles and the permission matrix |
| `03-user-journeys.md` | Journeys and the applicant state machine |
| `04-functional-requirements.md` | Numbered functional requirements (requirement IDs) |
| `05-ui-ux-design-system.md` | Design tokens, components, layout rules |
| `06-technical-architecture.md` | Stack, module layout, integration boundaries |
| `07-database-schema.md` | Logical data model / ERD |
| `08-api-contracts.md` | API conventions and endpoint catalogue |
| `09-security-and-privacy.md` | Security controls, privacy, retention |
| `10-testing-and-acceptance-criteria.md` | Test strategy and E2E scenarios |
| `11-deployment-and-operations.md` | Environments, deployment, backups |
| `12-delivery-roadmap.md` | Milestones, change control |
| `decisions/` | Architecture Decision Records (ADRs) |
| `features/` | Per-feature specifications |
| `open-questions.md` | Business decisions awaiting the client |
| `implementation-status.md` | Live status — where to resume work |
