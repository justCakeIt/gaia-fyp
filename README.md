# G.A.I.A. — Green AI Alchemy

*A supportive wellness guidance platform for post-diagnosis lifestyle management.*

---

## Project Overview

**G.A.I.A. (Green AI Alchemy)** is a full-stack wellness support application that helps users explore structured, supportive lifestyle guidance after receiving a health diagnosis.

Users can:

* search for a diagnosed condition
* review a curated wellness pathway
* save it as a personal plan
* optionally attach reminders

G.A.I.A. is **not a diagnostic tool** and does not replace professional medical advice. It focuses purely on **post-diagnosis lifestyle support**.

---

## MVP Scope

The MVP demonstrates one complete, polished pathway:

👉 **Fatty Liver / MASLD (Metabolic dysfunction-associated steatotic liver disease)**

The system is:

* **data-driven**
* **rule-based**
* powered by a structured MySQL knowledge base

❌ No machine learning is used in this version.

---

## Architecture

```
Browser
  └── Next.js (port 3001)
        ├── NextAuth (session)
        └── fetch → Express API (port 3000)
                        └── MySQL 8 (Docker)
```

---

## Technology Stack

### Frontend

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS 4
* NextAuth (credentials + Google OAuth)

### Backend

* Node.js + Express 4
* MySQL2 (connection pool)
* dotenv
* bcryptjs

### Database

* MySQL 8 (Docker)
* Schema + seed via `db-init/`

### Dev / CI

* Docker Compose (DB + phpMyAdmin)
* Jest + Supertest (38 tests)
* GitHub Actions (CI)

---

## Main User Flow

```
Entry
 → Login / Register
 → Search condition
 → Confirm match
 → View recommendations
 → Save plan
 → Add reminder
 → Manage in Profile
```

---

## Quick Start (LOCAL DEVELOPMENT)

### 1. Install

```bash
git clone <repo>
cd gaia-fyp

npm install

cd frontend
npm install
cd ..
```

---

### 2. Start system

#### Terminal 1 — Database

```bash
docker compose up -d db phpmyadmin
```

#### Terminal 2 — Backend

```bash
npm run dev
```

#### Terminal 3 — Frontend

```bash
cd frontend
npx next dev --hostname 0.0.0.0 --port 3001
```

---

## Access

### Laptop

```
http://localhost:3001
```

### Phone (same WiFi ONLY)

```
http://<YOUR_LAN_IP>:3001
```

Example:

```
http://192.168.1.231:3001
```

---

## Important (Phone Usage)

✔ Phone and laptop MUST be on the same network
✔ Backend must run on `0.0.0.0` (already configured)
✔ CORS must include your LAN IP

---

## Environment Variables

### Root `.env`

```env
DB_HOST=127.0.0.1
DB_PORT=3308
DB_NAME=gaia_db
DB_USER=admin
DB_PASSWORD=password

PORT=3000

CORS_ORIGIN=http://localhost:3001,http://127.0.0.1:3001,http://192.168.X.X:3001

AUTH_DEMO_USER_ENABLED=true
AUTH_DEMO_USER_EMAIL=demo@gaia.local
AUTH_DEMO_USER_PASSWORD=GaiaDemo123!
```

---

### Frontend `.env.local`

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<secure-random>

GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
```

⚠️ API base is dynamic — no manual configuration required.

---

## Database

### phpMyAdmin

```
http://localhost:8081
```

---

### Reset database

```bash
docker compose down -v
docker compose up -d db phpmyadmin
```

---

## Testing

```bash
docker compose up -d
npm test
```

✔ 38 integration tests
✔ Runs sequentially

---

## CI

Runs automatically on push:

* Backend tests
* Frontend build

---

## Useful Commands

```bash
docker compose ps

docker compose exec db mysql -uadmin -ppassword -D gaia_db -e "SELECT COUNT(*) FROM Conditions;"

Invoke-RestMethod "http://localhost:3000/health"
```

---

## Shutdown

```bash
Ctrl + C (frontend)
Ctrl + C (backend)

docker compose down
```

---

## Limitations

* Single fully polished condition (MASLD)
* Rule-based system (no ML)
* Reminders stored, not delivered
* Backend trusts `userID` (MVP simplification)
* No production deployment
* Not medical advice

---

## Future Work

* More conditions
* Real notification system
* Backend auth validation
* Personalisation
* Admin panel
* Deployment

---

## Demo Checklist

* [ ] Auth (login/register)
* [ ] Search condition
* [ ] Confirm match
* [ ] View recommendations
* [ ] Save plan
* [ ] Add reminder
* [ ] Profile management
* [ ] Delete plan/reminder
* [ ] Tests passing (38/38)

---

## License

MIT

---

## Contact

📧 [stadlerm@roehampton.ac.uk](mailto:stadlerm@roehampton.ac.uk)
