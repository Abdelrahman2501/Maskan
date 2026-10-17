# Maskan — Getting Started

This guide explains **what has been built so far** and **how to run each part** on your computer.

---

## 1. What Maskan is made of

Maskan has **two apps** plus a small public website:

| Part | Who uses it | Where it runs | Folder |
|---|---|---|---|
| **Mobile app** | Agents (applicants → trainees → qualified agents) | iPhone / Android (also viewable in a browser) | `mobile/` |
| **Web admin** | Maskan staff (recruiters, training, property, sales managers, super admin) | Computer browser | `frontend/` |
| **Public website** | Visitors | Browser | `frontend/` (home page) |
| **Backend (server)** | Used by both apps to save real data | Server | `backend/` |
| **Specifications** | The team | Documents | `specs/` |

---

## 2. What is done so far

| Part | Status | Notes |
|---|---|---|
| Plan & specifications | ✅ Done | Requirements, roles, journeys, design system, database, API, security, roadmap — in `specs/` |
| Mobile app screens | ✅ Prototype | All screens, Arabic + English, clickable, sample data |
| Web admin screens | ✅ Prototype | All modules, Arabic + English, clickable, sample data |
| Public website | ✅ Done | Arabic + English |
| Backend | 🟡 Foundation only | Server skeleton, health check, database setup, tests |
| Real login, WhatsApp codes, ID checking (OCR), video upload | ⬜ Not started | Needs the backend features + provider accounts |
| Connecting the apps to the backend | ⬜ Not started | Screens currently use sample data |
| App Store / Google Play publishing | ⬜ Not started | Needs Apple and Google developer accounts |

> **What "prototype" means:** every screen exists and you can click through everything, but it uses **sample data**. Nothing is saved (refreshing resets it), no real WhatsApp messages are sent, and the interview camera is simulated. It is meant for reviewing the design and flow with the client.

### Mobile app — screens built

- **Joining:** welcome, sign up, WhatsApp code, national ID + photo upload, ID review status
- **Interview:** instructions, recording (simulated), submitted, accepted / rejected
- **Training:** courses, video player with progress, quiz rules, timed quiz, result, "qualified" screen
- **Agent workspace:** home, properties (locations → compounds → units with prices), leads (notes, status changes), profile & language

### Web admin — modules built

- **Dashboard:** key numbers, recruitment funnel, recent activity
- **Recruitment:** applicants, identity reviews, interviews, decisions
- **Training:** courses, course videos, quiz question bank, quiz settings, attempts & results
- **Properties:** locations, compounds, property types, unit models, media, pricing (multi-currency)
- **Sales:** leads, assigning leads to agents, assignment history
- **Administration:** users, roles & permissions, reports, audit log, system settings
- **Staff sign-in page**

---

## 3. One-time setup

Install these once:

1. **Node.js 22+** — https://nodejs.org
2. **Python 3.12+** — https://www.python.org (only needed for the backend)
3. **Docker Desktop** — https://www.docker.com/products/docker-desktop (only needed for the backend database)
4. **Expo Go** app on your phone (only to try the mobile app on a real phone) — from the App Store / Google Play

Then get the code and install dependencies (from the project folder):

```bash
git clone https://github.com/Abdelrahman2501/Maskan.git
cd Maskan

cd frontend && npm install && cd ..
cd mobile && npm install && cd ..
```

---

## 4. How to run each part

> The **web admin** and the **mobile app** run on their own — the backend is **not needed** to see the prototype.

### A. Web admin + public website

```bash
cd frontend
npm run dev
```

Then open:

- Public website → http://localhost:3000
- Web admin → http://localhost:3000/admin
- Staff sign-in → http://localhost:3000/login (or click **"Continue without signing in"**)

If port 3000 is already used on your computer: `npm run dev -- -p 3010` and use `localhost:3010` instead.

### B. Mobile app — in your browser (quickest)

```bash
cd mobile
npx expo start --web
```

It opens automatically (usually http://localhost:8081). For a phone-sized view, open your browser's developer tools and turn on the device/phone view.

### C. Mobile app — on your real phone

```bash
cd mobile
npx expo start
```

- A **QR code** appears in the terminal.
- **Android:** open **Expo Go** and scan it.
- **iPhone:** scan it with the **Camera** app.
- Your phone and computer must be on the **same Wi-Fi**.
- If it can't connect, try `npx expo start --tunnel`.

### D. Backend (server) — optional for now

Only needed by developers working on the backend.

```bash
# 1. Start the database (Docker Desktop must be running)
cp .env.example .env
docker compose up -d db

# 2. Install and run the server
cd backend
python -m venv .venv
.venv/Scripts/python -m pip install -e ".[dev]"     # macOS/Linux: .venv/bin/python
.venv/Scripts/python -m alembic upgrade head
.venv/Scripts/python -m uvicorn app.main:app --reload
```

Check it works: http://localhost:8000/api/v1/health should show `"status": "ok"`.
API documentation: http://localhost:8000/api/v1/docs

---

## 5. Tips for exploring the prototype

| I want to… | How |
|---|---|
| Switch Arabic / English | **Web:** language button (globe icon) in the top bar. **Mobile:** globe button on the welcome / sign-in screens, or **Profile → Language**. Arabic flips the layout right-to-left. |
| Skip sign-in on mobile | Welcome screen → **"Explore without signing in"** (opens the agent workspace) |
| Skip sign-in on web | Go straight to `/admin`, or on `/login` click **"Continue without signing in"** |
| Jump to any stage of the agent journey (mobile) | Welcome screen → tap **"Prototype · sample data"** at the bottom → pick a stage |
| See what each staff role can access (web) | Bottom of the admin sidebar → **"View as role"** |
| Pass the WhatsApp code screen | Enter any 6 digits (except `000000`, which simulates a wrong code) |
| Reach the quiz quickly | Training screen → **"Mark all videos watched"** link |
| Start over | Refresh the page (mobile web / web admin) or use **"Reset prototype"** in the mobile prototype menu |

---

## 6. Running the checks (for developers)

```bash
# Web admin
cd frontend
npm run check        # lint + design-token check + type check + tests
npm run build

# Mobile
cd mobile
npx tsc --noEmit     # type check
npx jest             # tests (incl. Arabic/English translation completeness)

# Backend (database must be running)
cd backend
.venv/Scripts/python -m pytest -q
```

---

## 7. What comes next

1. **Review the prototype with the client** and collect feedback.
2. **Answer the open business questions** in `specs/open-questions.md` (quiz rules, lead statuses, etc.).
3. **Build the backend features one by one**, starting with real sign-in and user roles, then WhatsApp codes, ID verification, interviews, training, properties and leads.
4. **Connect each screen** of both apps to the backend as its feature is finished.
5. **Set up hosting**, then publish the mobile app to the App Store and Google Play.

The detailed live status is always in [`specs/implementation-status.md`](specs/implementation-status.md).
