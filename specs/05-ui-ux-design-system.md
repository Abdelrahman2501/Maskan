# 05 — UI/UX Design System

Status: **Draft v0.1**. The implementation lives in `frontend/src/app/globals.css` (tokens) and `frontend/src/components/ui/` (primitives).

## 1. Principles

- Premium real estate brand, **navy and white**. Most surfaces are white with navy type. Blue accents are restrained.
- Semantic colors (success, warning, error, info) appear **only** to communicate status or validation.
- Generous whitespace, rounded cards, subtle shadows, minimal motion (≤ 200 ms, honoring `prefers-reduced-motion`).
- Mobile-first for applicant and agent flows. Desktop-first for admin.
- WCAG 2.1 AA: visible focus rings, labels on every input, text contrast ≥ 4.5:1.

## 2. Color tokens (single source of truth)

| Token (CSS var / Tailwind name) | Hex | Use |
|---|---|---|
| `--color-navy` / `navy` | `#0B1F3A` | Brand, nav, headers, primary buttons |
| `--color-navy-deep` / `navy-deep` | `#07172B` | Hero, login, dark surfaces |
| `--color-navy-secondary` / `navy-secondary` | `#163B66` | Secondary nav, interactive accents, primary hover |
| `--color-accent` / `accent` | `#2D6CDF` | Links, progress, focus ring |
| `--color-white` / `white` | `#FFFFFF` | Surfaces, text on dark |
| `--color-background` / `background` | `#F5F7FB` | Page background |
| `--color-surface` / `surface` | `#FFFFFF` | Cards, dialogs, tables |
| `--color-border` / `border` | `#DCE3ED` | Inputs, dividers, outlines |
| `--color-ink` / `ink` | `#172B45` | Headings, primary text |
| `--color-ink-muted` / `ink-muted` | `#66758A` | Labels, metadata |
| `--color-success` / `success` | `#16845B` | Approved, completed, qualified |
| `--color-warning` / `warning` | `#B7791F` | Pending, expiring |
| `--color-error` / `error` | `#C0393B` | Rejected, validation, destructive |
| `--color-info` / `info` | `#2D6CDF` | Informational |

The brief's "Primary text"/"Secondary text" tokens are named `ink`/`ink-muted` so Tailwind classes read `text-ink` rather than `text-text`.

Tinted backgrounds for badges and alerts are derived with `color-mix()` from the same tokens. No new hex values.

**Rule PLAT-007:** a component must never contain a raw hex color. A CI grep check enforces this (`npm run lint:tokens`).

## 3. Typography

- Font: **Inter** (via `next/font`, self-hosted, `display: swap`).
- Scale (rem / line height / weight):

| Style | Size | LH | Weight |
|---|---|---|---|
| Display | 3.0 / 2.25 mobile | 1.1 | 700 |
| H1 | 2.0 | 1.2 | 700 |
| H2 | 1.5 | 1.3 | 600 |
| H3 | 1.25 | 1.4 | 600 |
| Body | 1.0 | 1.6 | 400 |
| Small / label | 0.875 | 1.5 | 500 |
| Caption | 0.75 | 1.4 | 500 |

## 4. Spacing, radius, elevation

- Spacing: Tailwind's 4 px scale. Page gutters are 16 px mobile, 24 px tablet, 32 px desktop.
- Radius: `--radius-sm` 6 px (inputs, badges), `--radius-md` 10 px (buttons), `--radius-lg` 16 px (cards), `--radius-xl` 24 px (hero panels).
- Shadows: `--shadow-card` (subtle, 1–2 px blur) and `--shadow-elevated` (dialogs, popovers).

## 5. Component library (target)

| Component | Phase | Status |
|---|---|---|
| Button (primary / secondary / ghost / destructive; sm/md/lg; loading) | Foundation | see implementation-status |
| Input, PasswordInput, Select, Textarea, Checkbox, Radio, FormField (label + hint + error) | Foundation / Auth | |
| OtpInput | OTP | |
| Card, StatCard | Foundation / Admin | |
| Dialog, ConfirmDialog | Admin | |
| Toast | Auth | |
| Badge / StatusBadge (maps domain statuses to semantic tones) | Foundation | |
| DataTable (loading / empty / error / populated; sorting; row actions) | Admin | |
| SearchInput, FilterBar, Pagination, Tabs, Breadcrumbs | Admin | |
| StepIndicator, ProgressBar | Applicant flow | |
| FileDropzone (type/size validation, preview) | Identity | |
| VideoRecorder, VideoPlayer | Interview / Training | |
| EmptyState, ErrorState, Skeleton | Foundation | |
| AdminSidebar, TopHeader | Admin | |

Primitives follow shadcn/ui conventions: Radix primitives where interaction is non-trivial (dialog, select, tabs, dropdown), `cva` for variants, and a `cn()` helper. They are added only when a feature needs them, not up front.

## 6. Admin layout

- Dark navy (`navy`) collapsible sidebar, 264 px expanded / 72 px collapsed. Groups:
  **Overview** (Dashboard) · **Recruitment** (Applicants, Identity Reviews, Interviews, Application Decisions) · **Training** (Courses, Course Videos, Quiz Question Bank, Quiz Configuration, Attempts & Results) · **Properties** (Locations, Compounds/Developments, Property Types, Unit Models, Property Media, Pricing) · **Sales** (Leads, Lead Assignments, Assignment History) · **Administration** (Users, Roles & Permissions, Reports, Audit Logs, System Settings)
- Each item declares its required permission. Items are filtered using the permissions from `/auth/me`.
- White top header: page title, breadcrumbs, notifications, account menu.
- Workspace on `background`. Content in white `surface` cards with `border` outlines.
- Below 1024 px the sidebar becomes an off-canvas drawer.

## 7. State patterns (all data views)

| State | Pattern |
|---|---|
| Loading | Skeleton matching the final layout (no spinners for whole pages) |
| Empty | EmptyState: icon, one-line explanation, primary next action if permitted |
| Error | ErrorState: plain-language message, Retry, request ID for support |
| Permission denied | Dedicated 403 screen. Navigation item hidden. |
| Success | Toast (non-blocking) or inline confirmation |

Browser `alert()` / `confirm()` are never used.

## 8. Language / direction (decided — Q-01, ADR-0003)

- Every surface is bilingual: **Arabic (RTL)** and **English (LTR)**, switchable by the user, with the choice persisted.
- No hardcoded user-facing strings. All copy comes from locale catalogues with identical keys in `en` and `ar`. A test fails on missing keys.
- Use logical layout only (`start`/`end`, `ms-`/`me-`, `ps-`/`pe-`; on React Native, `marginStart`/`paddingEnd`). Directional icons (arrows, chevrons) flip in RTL.
- Fonts: Inter (Latin) + **IBM Plex Sans Arabic** (Arabic), same weight scale.
- Dates, numbers and currency are formatted with `Intl` for the active locale. Currency codes are always shown explicitly.
- Mobile shares the same color tokens (`mobile/src/theme/tokens.ts` mirrors `globals.css` exactly).
