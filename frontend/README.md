# G.A.I.A. — Frontend

This is the **Next.js frontend** for the G.A.I.A. (Green AI Alchemy) platform.

It provides the user interface for:

* authentication (credentials + Google OAuth)
* condition search and confirmation
* viewing recommendations (herbs, recipes, mixtures)
* saving wellness plans
* managing reminders and profile data

The frontend communicates with the Express backend via REST API.

---

## Tech Stack

* **Next.js 16** (App Router)
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**
* **NextAuth v4** (JWT session strategy)

---

## Running the Frontend

From the `frontend/` directory:

```bash
npm install
npx next dev --hostname 0.0.0.0 --port 3001
```

App runs on:

```bash
http://localhost:3001
```

---

## Access from Phone (LAN Mode)

To test on a phone:

1. Connect phone and laptop to the **same WiFi**
2. Start frontend with `--hostname 0.0.0.0`
3. Open on phone:

```bash
http://<YOUR_LAN_IP>:3001
```

Example:

```bash
http://192.168.1.231:3001
```

⚠️ Notes:

* Google OAuth will **NOT work** in LAN mode (Google restriction)
* Use **email/password login** instead

---

## Environment Variables

Create `frontend/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<long-random-secret>

GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
```

### Important

* API base is **automatically resolved at runtime**
* No need to define `API_BASE` or `NEXT_PUBLIC_API_BASE`
* The frontend dynamically uses the same host as the browser (works for localhost, LAN, hotspot, etc.)

---

## Authentication (NextAuth)

### Providers

* Credentials (email + password)
* Google OAuth (optional)

### Session Strategy

* JWT-based session (no database session storage)

---

## Google OAuth Setup (Optional)

To enable **Continue with Google**:

1. Open **Google Cloud Console**
2. Create **OAuth 2.0 Web Client**
3. Add:

**Authorized JavaScript origin**

```
http://localhost:3001
```

**Authorized redirect URI**

```
http://localhost:3001/api/auth/callback/google
```

4. Add to `.env.local`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

5. Restart frontend

---

## Project Structure (Simplified)

```
frontend/
├── app/                # App Router pages
├── components/         # UI components
├── lib/
│   └── api.ts          # API layer (fetch logic)
├── styles/             # Tailwind/global styles
└── public/             # Static assets
```

---

## API Communication

All requests go through:

```
frontend/lib/api.ts
```

Key features:

* Dynamic API base resolution (no hardcoded URLs)
* Query normalization (important for mobile input)
* Safe error handling (prevents UI crashes)

---

## Development Notes

* Always restart the frontend after changing `.env.local`
* Use `localhost` for laptop testing
* Use LAN IP for phone testing
* Backend must be running on port **3000**

---

## Common Issues

### 1. Phone cannot connect

* Ensure same WiFi
* Use correct LAN IP
* Backend running on `0.0.0.0`

---

### 2. Google login fails

* Works only on `localhost`
* Not supported on LAN / phone mode

---

### 3. API errors / no data

* Check backend is running
* Verify CORS includes your IP
* Test:

```
http://localhost:3000/health
```

---

## Build (Production Check)

```bash
npm run build
```

---

## Notes

This frontend is designed for:

* clarity
* stability
* smooth UX across laptop and mobile testing environments

It intentionally avoids over-complex patterns to keep the MVP robust and maintainable.

---

## Part of G.A.I.A.

This frontend works together with:

* Express backend (port 3000)
* MySQL database (Docker)

See root README for full system setup.