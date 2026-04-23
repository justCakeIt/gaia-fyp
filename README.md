# G.A.I.A. — Green AI Alchemy

*A supportive wellness guidance platform for post-diagnosis lifestyle management.*

---

## Project Overview

**G.A.I.A. (Green AI Alchemy)** is a full-stack wellness support application that helps users explore structured, supportive lifestyle guidance after receiving a health diagnosis.

Users search for a diagnosed condition, receive a curated pathway of herbs, recipes, herbal mixtures, and safety notes, and can save that pathway as a personal wellness plan with optional daily reminders.

G.A.I.A. is **not a diagnostic tool** and does not replace professional medical advice. It organises the lifestyle-supportive side of care — habits, routines, and reminders — in one calm, structured place.

---

## MVP Scope

The submitted MVP demonstrates one complete, polished end-to-end pathway: **Fatty Liver / MASLD (Metabolic dysfunction-associated steatotic liver disease)**.

The architecture is designed to support additional conditions, but the current submission focuses on the MASLD pathway as the primary demonstration of the full feature set.

Recommendation matching in the MVP is **data-driven and rule-based** — the system retrieves curated content from a structured MySQL knowledge base. There is no machine-learning model integrated at this stage.

---

## Architecture

```
Browser
  └── Next.js 16 (App Router, port 3001)
        ├── NextAuth v4 — session management (JWT)
        └── fetch() → Express REST API (port 3000)
                          └── MySQL 8 — knowledge base + user data
```

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.1.6 · React 19.2.3 · TypeScript · Tailwind CSS 4 |
| Auth/session | NextAuth v4.24.13 — local credentials + Google OAuth |
| Backend | Node.js + Express 4 · CommonJS · MySQL2 3.17.5 connection pool |
| Database | MySQL 8 — schema + seed via `db-init/` SQL files |
| Dev infrastructure | Docker Compose — MySQL 8 + phpMyAdmin |
| Testing | Jest 29 + Supertest 7 — 38 integration tests |
| CI | GitHub Actions — 2 parallel jobs (backend tests + frontend build) |

---

## Main User Flow

```
Splash / Entry
  → Register or log in (local credentials or Google OAuth)
  → Search: enter a diagnosed condition (e.g. "fatty liver")
  → Confirm: review the matched pathway
  → Results: view herbs, recipes, mixtures, and safety notes
  → Save plan (authenticated users only)
  → Optional: set a daily reminder
  → Profile dashboard: view plans, manage reminders, delete entries
```

Unauthenticated users can browse the overview and about pages and preview the condition search flow, but cannot save plans or reminders.

---

## Technology Stack

### Frontend — `frontend/`
- **Next.js 16.1.6** with App Router (`"use client"` components)
- **React 19.2.3** + **TypeScript 5**
- **Tailwind CSS 4** (PostCSS plugin build)
- **NextAuth v4.24.13** — JWT session strategy, local + Google OAuth providers

### Backend — root
- **Node.js** + **Express 4.22** — REST API, CommonJS (`"use strict"`)
- **MySQL2 3.17.5** — promise-based connection pool
- **bcryptjs 3** — password hashing
- **dotenv 16** — environment configuration

### Database
- **MySQL 8** — relational knowledge base
- Schema: `db-init/01-schema.sql`
- Seed data: `db-init/02-seed.sql`

### Dev / CI
- **Docker Compose** — MySQL 8 container (port 3308) + phpMyAdmin (port 8081)
- **Jest 29** + **Supertest 7** — backend integration tests
- **GitHub Actions** — CI on push and pull request

---

## Local Setup

### Prerequisites

- **Node.js 18+** — https://nodejs.org
- **Docker Desktop** — https://docs.docker.com/desktop

### 1. Clone and install

```bash
git clone https://github.com/yourusername/gaia-fyp
cd gaia-fyp

# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
# Root — database + server config
cp .env.example .env          # if example exists, otherwise create from the table below

# Frontend — NextAuth + API URLs
cp frontend/.env.local.example frontend/.env.local
```

See the **Environment Variables** section below for required keys.

### 3. Start the database

```bash
docker compose up -d
```

This starts MySQL 8 (port 3308) and phpMyAdmin (port 8081). On first run, Docker applies `db-init/01-schema.sql` and `db-init/02-seed.sql` automatically.

### 4. Start the backend

```bash
npm start          # production
# or
npm run dev        # hot-reload via supervisor
```

Backend available at: http://localhost:3000

### 5. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend available at: http://localhost:3001

### 6. Access phpMyAdmin

http://localhost:8081 — credentials from your `.env` file.

---

## Environment Variables

### Root `.env`

| Variable | Example | Purpose |
|----------|---------|---------|
| `DB_HOST` | `127.0.0.1` | MySQL host (local) |
| `DB_PORT` | `3308` | MySQL external port (Docker maps 3308→3306) |
| `DB_USER` | `admin` | MySQL user |
| `DB_PASSWORD` | `password` | MySQL password |
| `DB_NAME` | `gaia_db` | Database name |
| `PORT` | `3000` | Express server port |
| `MYSQL_ROOT_PASSWORD` | `password` | Docker MySQL root password |
| `MYSQL_DATABASE` | `gaia_db` | Docker MySQL database name |
| `MYSQL_USER` | `admin` | Docker MySQL user |
| `MYSQL_PASSWORD` | `password` | Docker MySQL user password |
| `AUTH_DEMO_USER_ENABLED` | `true` | Seed a demo login account on startup |
| `AUTH_DEMO_USER_EMAIL` | `demo@gaia.local` | Demo account email |
| `AUTH_DEMO_USER_PASSWORD` | `GaiaDemo123!` | Demo account password |

### `frontend/.env.local`

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXTAUTH_URL` | `http://localhost:3001` | NextAuth canonical URL |
| `NEXTAUTH_SECRET` | `<long-random-string>` | JWT signing secret |
| `GOOGLE_CLIENT_ID` | `<from Google Console>` | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | `<from Google Console>` | Google OAuth (optional) |
| `API_BASE` | `http://localhost:3000/api` | Server-side API base URL |
| `NEXT_PUBLIC_API_BASE` | `http://localhost:3000/api` | Client-side API base URL |

Google OAuth is optional — local credential login works without it.

---

## Testing

The backend has a full integration test suite (Jest 29 + Supertest 7).

**Requirement:** the MySQL Docker container must be running first.

```bash
docker compose up -d
npm test
```

Tests run sequentially (`--runInBand`) because later suites depend on state (userID → planID → reminderID) created by earlier ones. The `afterAll` block cleans up all test-created rows in FK-safe order.

**Coverage:** 38 tests across 6 suites — health, conditions, auth, plans, reminders, plan deletion.

---

## Continuous Integration

Every push and pull request runs two parallel GitHub Actions jobs:

| Job | What it checks |
|-----|----------------|
| **Backend – integration tests** | Spins up MySQL 8, applies schema + seed, runs `npm test` (38 tests) |
| **Frontend – lint & build** | Runs `npm run lint` (ESLint / Next.js rules) then `npm run build` (13 routes) |

Run the same checks locally:

```bash
# Backend
docker compose up -d
npm test

# Frontend
cd frontend
npm run lint
npm run build
```

---

## Limitations

The following are honest limitations of the current MVP submission:

| Limitation | Detail |
|------------|--------|
| **Single polished pathway** | The MASLD / Fatty Liver pathway is the fully curated and tested pathway. Other conditions may be present in the database in varying states of completeness. |
| **Rule-based matching** | Condition-to-recommendation mapping is data-driven, not ML-based. There is no trained model; the system queries curated relational data. |
| **Reminders are stored, not delivered** | Reminder labels, times, and days are saved to the database, but there is no push notification, email, or OS alert delivery mechanism. |
| **Backend ownership via query param** | The backend verifies plan/reminder ownership using a `userID` passed as a query parameter from the client session. There is no JWT bearer token validation on the Express layer — this is appropriate for an MVP but would require hardening in production. |
| **No production deployment** | The repository is configured for local development. No cloud hosting, reverse proxy, or production Docker Compose is included. |
| **Not medical advice** | G.A.I.A. is a supportive wellness tool. It does not diagnose, treat, or replace professional medical care. All content is educational and lifestyle-supportive only. |

---

## Future Work

Realistic next steps beyond the MVP:

- **Broader condition library** — extend the knowledge base and curated seed data to cover additional conditions (e.g. Type 2 Diabetes, Hypertension) with the same polish applied to MASLD.
- **Reminder delivery** — integrate a notification service (e.g. email via SendGrid, web push via a service worker) to actually deliver scheduled reminders.
- **Server-side token validation** — add Bearer token or cookie-based authentication verification on the Express API layer so the backend can independently validate requests without trusting client-supplied userIDs.
- **User preference personalisation** — incorporate dietary preferences, known allergies, and medication flags (already scaffolded in the `UserPreferences` schema table) into the recommendation filtering logic.
- **Progress and history tracking** — record when users view or interact with their plan so the dashboard can show meaningful activity over time.
- **Admin knowledge base management** — a simple admin interface to add, edit, and publish conditions, herbs, recipes, and mixtures without direct database access.
- **Production deployment** — Dockerfile for the backend, environment-specific Next.js config, and a deployment guide (e.g. Railway, Render, or self-hosted VPS).
- **Accessibility and mobile review** — formal accessibility audit and responsive layout testing across device sizes.

---

## Demo Evidence Checklist

The following features can be demonstrated for the submission report and viva:

- [ ] Splash screen and animated entry
- [ ] Registration (local credentials)
- [ ] Login (local credentials)
- [ ] Google OAuth sign-in (requires `GOOGLE_CLIENT_ID` configured)
- [ ] Condition search — "fatty liver", "MASLD", "nafld"
- [ ] Confirm pathway page
- [ ] Results page — herbs, recipes, mixtures, safety notes
- [ ] Save plan (authenticated user)
- [ ] Duplicate save warning
- [ ] Reminder creation on plan save flow
- [ ] Profile dashboard — saved plans list, reminders list
- [ ] Delete plan (inline confirmation)
- [ ] Delete reminder (inline confirmation)
- [ ] View saved plan (`?saved=1` hides re-save section)
- [ ] Guest / overview page (unauthenticated)
- [ ] About page
- [ ] Backend: `docker compose up`, phpMyAdmin at :8081
- [ ] Backend: `npm test` — 38/38 passing
- [ ] CI: GitHub Actions — backend + frontend jobs green

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Contact

📧 stadlerm@roehampton.ac.uk
