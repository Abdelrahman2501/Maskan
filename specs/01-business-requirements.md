# 01 — Business Requirements

Status: **Draft v0.1**. Items marked ❓ link to `open-questions.md` and need a client decision before they become final.

## BR-1 Recruitment pipeline

| ID | Requirement |
|---|---|
| BR-1.1 | Anyone may register as an applicant with first name, last name, email, phone, and password. |
| BR-1.2 | Phone ownership must be proven by a WhatsApp OTP before any identity document is accepted. |
| BR-1.3 | Applicants submit their Egyptian national ID number, the front and back ID images, and a personal photo. |
| BR-1.4 | OCR extracts the ID number and compares it with the entered number. Uncertain or mismatched cases go to manual review. OCR is an aid. It does **not** prove that a document is authentic or that the applicant matches the photo. |
| BR-1.5 | Only an authorized administrator may approve or reject an identity review. |
| BR-1.6 | The applicant records a ~1-minute introduction video in the browser, guided by a reference video. ❓Q-04 (upload fallback) |
| BR-1.7 | The interview becomes available after the identity step meets the approved policy. ❓Q-03 (must identity be *approved* first, or only *submitted*?) |
| BR-1.8 | A recruiter accepts or rejects the interview. Rejection blocks training, property, and lead access. Internal notes are never shown to the applicant. |
| BR-1.9 | Only one interview submission is allowed, unless an authorized admin reopens the interview. |
| BR-1.10 | Rules for rejected applicants re-applying. ❓Q-07 |

## BR-2 Training and qualification

| ID | Requirement |
|---|---|
| BR-2.1 | Accepted applicants become **trainees** and gain access to published courses. |
| BR-2.2 | Video progress is tracked, with resume where supported. Whether all videos must be completed before the quiz unlocks: ❓Q-06 |
| BR-2.3 | Quiz defaults: 10 questions, 70% pass threshold, maximum 2 attempts, admin-configurable timer. Equal weights by default. |
| BR-2.4 | Admins change quiz settings without code changes. A setting change affects only attempts started after the change. |
| BR-2.5 | The deadline, scoring, and attempt limit are enforced on the server. |
| BR-2.6 | Behavior when the timer expires or the connection is lost. Proposed: answers are saved as they are given, and at the deadline the server finalizes the attempt using the saved answers. ❓Q-05 |
| BR-2.7 | Passing makes the trainee a **qualified agent**. Using up all attempts without passing: ❓Q-08 (permanently disqualified, or an admin can grant more attempts?) |

## BR-3 Property catalogue

| ID | Requirement |
|---|---|
| BR-3.1 | Hierarchy: Location → Compound/Development → Property Type → Unit Model → Media & Prices. |
| BR-3.2 | New locations, developments, and property types must not require schema changes. |
| BR-3.3 | Every price has an exact decimal amount and an explicit ISO 4217 currency code. No automatic conversion in Phase 1. |
| BR-3.4 | Each price records when it was last updated and by whom. Price history is kept (proposed default — low cost, high audit value). |
| BR-3.5 | Only qualified agents (and authorized admins) can view catalogue data. There is no public catalogue in Phase 1. |
| BR-3.6 | Real developer and listing data is supplied by the client. The platform never invents listings. |

## BR-4 Leads CRM

| ID | Requirement |
|---|---|
| BR-4.1 | Leads are assigned **manually** by authorized admins. No automatic distribution or scoring. |
| BR-4.2 | An agent sees only the leads currently assigned to them. |
| BR-4.3 | Agents add timestamped, append-only notes and update the statuses they are permitted to change. |
| BR-4.4 | Every assignment and reassignment records who, when, from whom, and to whom. The history is never overwritten. |
| BR-4.5 | Lead status set. ❓Q-09. Proposed: New, Contacted, Interested, Follow-up required, Viewing scheduled, Converted, Not interested, Unreachable. |
| BR-4.6 | Lead creation: manual entry in Phase 1. CSV import format: ❓Q-10 |
| BR-4.7 | What happens to a previous agent's notes after reassignment, and which customer contact fields agents may see. ❓Q-11 |

## BR-5 Administration

| ID | Requirement |
|---|---|
| BR-5.1 | Role-based access, deny by default, enforced in the backend. |
| BR-5.2 | The last active Super Admin cannot be deactivated or demoted. |
| BR-5.3 | All dashboard figures come from real data. There is no hardcoded production data. |
| BR-5.4 | Audit log covers role changes, identity decisions, interview decisions, quiz configuration changes, price updates, lead assignments, and other sensitive admin changes. |

## BR-6 Cross-cutting constraints

| ID | Requirement |
|---|---|
| BR-6.1 | Applicants and agents use the native mobile app (iOS and Android). Staff use the web admin dashboard (desktop-first, responsive). Changed by CR-001 / ADR-0003. |
| BR-6.2 | The whole product (applicant, agent and admin areas) is bilingual: Arabic (right-to-left) and English, switchable by the user. Decided 2026-10-17 (Q-01). |
| BR-6.3 | National ID images, photos, phone numbers, and recordings are sensitive personal data (see `09-security-and-privacy.md`). |
| BR-6.4 | Third-party running costs (hosting, WhatsApp, OCR, storage, email) are paid separately by the client. Any paid service needs the client's approval before use. |
| BR-6.5 | Infrastructure planning allowance: ~USD 20–100 per month before substantial usage. This is an estimate, not a quotation. |
