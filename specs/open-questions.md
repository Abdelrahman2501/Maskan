# Open Questions (client decisions)

Each question has a **proposed default**. Work that does not depend on a question proceeds. Work that does depend on one waits, or is built on the default, and that dependency is recorded here.

| ID | Question | Proposed default | Blocks | Status |
|---|---|---|---|---|
| Q-01 | UI language: Arabic, English, or bilingual (with RTL)? | — | All UI copy; layout direction | **Decided 2026-10-17: bilingual Arabic (RTL) + English, user-switchable** |
| Q-02 | Does an OCR match auto-approve identity, or is every identity human-reviewed? | Auto-approve on match ≥ confidence threshold; reviewers can revoke | FEAT-003 | Open |
| Q-03 | Must identity be *approved* before the interview, or only *submitted*? | Approved | FEAT-003/004 | Open |
| Q-04 | Allow a video file-upload fallback when browser recording fails? | Yes, same length/size limits | FEAT-004 | Open |
| Q-05 | Quiz timer expiry / disconnect behavior | Answers autosave; at deadline the server finalizes using saved answers (unanswered = wrong) | FEAT-006 | Open |
| Q-06 | Must all training videos be completed before the quiz unlocks? | Yes — every required video ≥ 90% watched | FEAT-005/006 | Open |
| Q-07 | Can rejected applicants re-apply? After how long? | No re-application in Phase 1; admin can reopen manually | FEAT-004 | Open |
| Q-08 | After all quiz attempts fail: permanent, or can an admin grant extra attempts? | Admin can grant +1 attempt with reason (audited) | FEAT-006 | Open |
| Q-09 | Approve the lead status set | New, Contacted, Interested, Follow-up required, Viewing scheduled, Converted, Not interested, Unreachable | FEAT-008 | Open |
| Q-10 | Lead CSV import in Phase 1? Columns? | Yes: full_name, phone, email, interest, location, source | FEAT-008 | Open |
| Q-11 | On reassignment, may the new agent see previous notes? Which customer fields can agents see? | New agent sees all notes; agents see name, phone, email, interest | FEAT-008 | Open |
| Q-12 | Password reset channel | Email link (requires an email provider) | FEAT-001 | Open |
| Q-13 | Confirm the Egyptian national ID validation rules (14 digits; century/birth date/governorate/sequence/check-digit structure) and whether the birth date must be cross-checked | Validate length + digits + embedded birth date; no check-digit enforcement until the algorithm is confirmed | FEAT-003 | Open |
| Q-14 | How many identity resubmissions are allowed? | 3 | FEAT-003 | Open |
| Q-15 | Show correct answers after a quiz attempt? | No | FEAT-006 | Open |
| Q-16 | Notify decisions by email/WhatsApp, or in-app only? | In-app + WhatsApp template message | NOTIF | Open |
| Q-17 | WhatsApp provider (Meta Cloud API direct / Twilio / local BSP) — who owns the Meta Business account? | Meta Cloud API direct (lowest per-message cost; authentication templates) | FEAT-002 production | Open |
| Q-18 | OCR provider — evaluate on sample IDs | Trial Google Cloud Vision vs. Azure Document Intelligence on 20 consented test images | FEAT-003 production | Open |
| Q-19 | Legal review of PDPL (Law 151/2020) obligations — who handles it? | Client's legal advisor before launch | Launch | Open |
| Q-20 | Data retention periods | See `09-security-and-privacy.md` §3 | Retention job | Open |
| Q-21 | Hosting choice | VPS + Docker Compose or PaaS (see `11-…` §3); R2 for storage | Staging (week 3–4) | Open |
| Q-22 | Where will the repository live (GitHub / Gitea / other)? | — | CI | Open |
| Q-23 | Is there a client logo / brand asset kit and licensed real-estate imagery? | Text wordmark + neutral gradient until supplied | Landing polish | Open |
