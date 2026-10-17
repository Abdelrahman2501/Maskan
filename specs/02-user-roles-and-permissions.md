# 02 — User Roles and Permissions

Status: **Draft v0.1**

## 1. Model

ElSakka uses two independent dimensions. Keeping them separate prevents contradictory states (for example, a "trainee" role that no longer matches the applicant's real stage).

1. **Staff roles (RBAC).** Assigned by a Super Admin. Each role grants a set of named permissions. A user may hold several staff roles.
   `super_admin`, `recruiter`, `training_admin`, `sales_manager`, `property_manager`
2. **Agent lifecycle stage.** Derived from the applicant's application state (see `03-user-journeys.md`). It is not assigned by hand.
   `applicant` → `trainee` → `qualified_agent` (or `rejected` / `suspended`)

Agent-facing endpoints check the **stage**. Admin endpoints check **permissions**. Both checks always run in the backend.

## 2. Principles

- **AUTHZ-001** Deny by default: an endpoint without an explicit permission or stage dependency must fail review.
- **AUTHZ-002** Object-level checks (ownership, assignment) run on every request for a record by ID. This prevents insecure direct object references (IDOR).
- **AUTHZ-003** The frontend hides navigation the user cannot use. This is only a convenience and never the control.
- **AUTHZ-004** There is no hidden universal bypass. `super_admin` receives every permission explicitly through the same mechanism.
- **AUTHZ-005** Grants, revocations, and all actions marked 🔒 below are written to the audit log.
- **AUTHZ-006** The last active `super_admin` cannot be deactivated, demoted, or deleted.

## 3. Permission catalogue

| Permission | Description |
|---|---|
| `applicants.read` | List and view applicants and applications |
| `identity.review` 🔒 | View ID documents and decide identity reviews |
| `interviews.review` 🔒 | Watch interviews and record decisions |
| `applications.decide` 🔒 | Accept or reject applications; reopen interviews |
| `training.manage` | Create and edit courses and videos |
| `quiz.manage` 🔒 | Manage the question bank and quiz configuration |
| `quiz.results.read` | View attempts and qualification records |
| `properties.manage` | Manage locations, compounds, types, unit models, and media |
| `prices.manage` 🔒 | Create and update prices |
| `leads.manage` | Create and edit leads |
| `leads.assign` 🔒 | Assign and reassign leads |
| `leads.read_all` | View all leads and assignment history |
| `reports.read` | View reports and dashboard summaries |
| `users.manage` 🔒 | Manage user accounts and status |
| `roles.manage` 🔒 | Assign roles and edit role permissions |
| `audit.read` | View audit logs |
| `settings.manage` 🔒 | Edit system settings |

## 4. Role → permission matrix

| Permission | super_admin | recruiter | training_admin | sales_manager | property_manager |
|---|:-:|:-:|:-:|:-:|:-:|
| applicants.read | ✅ | ✅ | ✅ (read-only, trainees) | — | — |
| identity.review | ✅ | ✅ | — | — | — |
| interviews.review | ✅ | ✅ | — | — | — |
| applications.decide | ✅ | ✅ | — | — | — |
| training.manage | ✅ | — | ✅ | — | — |
| quiz.manage | ✅ | — | ✅ | — | — |
| quiz.results.read | ✅ | ✅ | ✅ | — | — |
| properties.manage | ✅ | — | — | — | ✅ |
| prices.manage | ✅ | — | — | — | ✅ |
| leads.manage | ✅ | — | — | ✅ | — |
| leads.assign | ✅ | — | — | ✅ | — |
| leads.read_all | ✅ | — | — | ✅ | — |
| reports.read | ✅ | ✅ (recruitment) | ✅ (training) | ✅ (sales) | ✅ (catalogue) |
| users.manage | ✅ | — | — | — | — |
| roles.manage | ✅ | — | — | — | — |
| audit.read | ✅ | — | — | — | — |
| settings.manage | ✅ | — | — | — | — |

Scoped report access (shown in parentheses) is applied by filtering report endpoints per permission.

## 5. Stage → capability matrix (agent side)

| Capability | applicant | trainee | qualified_agent | rejected | suspended |
|---|:-:|:-:|:-:|:-:|:-:|
| View and edit own profile | ✅ | ✅ | ✅ | view | view |
| Phone OTP | ✅ | — | — | — | — |
| Submit identity documents | ✅ (when allowed by state) | — | — | — | — |
| Submit interview | ✅ (when allowed by state) | — | — | — | — |
| View own application status | ✅ | ✅ | ✅ | ✅ | ✅ |
| View courses and track progress | — | ✅ | ✅ (proposed: keeps access) | — | — |
| Take quiz | — | ✅ (when eligible) | — | — | — |
| Property catalogue | — | — | ✅ | — | — |
| Own assigned leads (read, notes, status) | — | — | ✅ | — | — |

## 6. Object-level rules

| Resource | Rule |
|---|---|
| Identity documents | Owner may upload. Only `identity.review` holders may view, through short-lived signed URLs. |
| Interview recording | Owner may upload once. Only `interviews.review` holders may view. |
| Quiz attempt | Only the owner may answer, submit, or view the result. Staff with `quiz.results.read` may view. |
| Lead | An agent may access it only when the lead's **current** assignment is to that agent. Any other case returns `404` (not `403`) to avoid revealing that the lead exists. |
| Lead note | Created by the current assignee or `leads.manage`. Append-only. |
