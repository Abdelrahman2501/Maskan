# 12 — Delivery Roadmap

Status: **Draft v0.1** — this is a planning estimate, not a guarantee. It assumes consistent availability, timely approvals, and provider access.

| Weeks | Milestone | Slices | Payment milestone |
|---|---|---|---|
| 1–2 | Discovery & design | Specs (this folder), open-question resolution, Figma design system + core screens, **FEAT-000 platform foundation** | Kickoff 20% (EGP 48,000) |
| 3–4 | Platform foundation | FEAT-001 auth + sessions + RBAC seed, audit log core, storage foundation (MinIO/R2), CI, staging | Design approval & foundation 25% (EGP 60,000) |
| 5–6 | Recruitment & verification | FEAT-002 OTP, FEAT-003 identity + OCR + review, FEAT-004 interview + decisions | — |
| 7–8 | Training & qualification | FEAT-005 training, FEAT-006 quiz | Recruitment, verification & training 25% (EGP 60,000) |
| 9–10 | Properties, leads & admin | FEAT-007 catalogue, FEAT-008 leads, FEAT-009 admin modules + reports | Properties, CRM & admin 20% (EGP 48,000) |
| 11–12 | QA & launch | E2E suite, security checks, fixes, prod deploy, docs, handover | Acceptance & handover 10% (EGP 24,000) |

## Critical-path dependencies (client side)

1. WhatsApp Business account + Meta business verification. Approval can take days to weeks, so **start in week 1**.
2. OCR provider account + sample (redacted/test) Egyptian ID images for evaluation.
3. Hosting account and domain.
4. Answers to `open-questions.md`, especially Q-01 (language/RTL), which affects every screen.
5. Reference interview video, course videos, quiz questions, and catalogue content.

## Change control

Any request outside `00-product-overview.md` §3/§4 is logged here as a change request (CR-nnn), with its impact on schedule, complexity, and cost. It is not implemented until approved.

| CR | Description | Impact | Status |
|---|---|---|---|
| CR-001 | Native mobile app (React Native/Expo, iOS + Android) for applicants and agents, replacing the responsive applicant/agent web UI. Web stays for admin + landing. Bilingual AR/EN across all surfaces (ADR-0003). | Engineering estimate: **+4 to 6 weeks**. Extra cost to be priced and agreed with the client (not yet quoted). New third-party costs: Apple Developer USD 99/yr, Google Play USD 25 one-time, EAS Build (free tier may suffice). Store review adds 1–7 days per release. Bilingual UI is included in the estimate. | **Approved in direction by client 2026-10-17. Price and dates pending.** |
