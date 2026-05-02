# G.A.I.A. — Presentation Startup Checklist

## Prerequisites
- Docker Desktop must be running
- Laptop and phone must be on the **same Wi-Fi network or hotspot**
- Windows Firewall must allow Node.js / private network access (allow when prompted)

---

## Step-by-step startup

### 1. Start Docker services (database + phpMyAdmin)
```
docker compose up -d db phpmyadmin
```

### 2. Start the backend (from repo root)
```
npm run dev
```
Expected output: `G.A.I.A. API — running` + `Database connection: OK`

### 3. Start the frontend (in a second terminal, from repo root)
```
cd frontend
npm run dev
```
Expected output: `Ready on http://0.0.0.0:3001`

### 4. Find your laptop's LAN IP
```
ipconfig
```
Look for **IPv4 Address** under your active adapter (Wi-Fi or Ethernet), e.g. `192.168.1.45`

---

## Access URLs

| Device   | URL                              |
|----------|----------------------------------|
| Laptop   | http://localhost:3001            |
| Laptop   | http://\<laptop-ip\>:3001          |
| Phone    | http://\<laptop-ip\>:3001          |
| API health | http://\<laptop-ip\>:3000/api/health |

---

## Presentation flow to demo

### Laptop localhost
- [ ] Open http://localhost:3001 → splash → entry
- [ ] Log in with credentials
- [ ] Search "Fat" or "fatty liver"
- [ ] Confirm matched condition
- [ ] Open results page — view herbs, mixtures, recipes
- [ ] Click a botanical mixture → detail page loads (name, ingredients, instructions)
- [ ] Save wellness path
- [ ] Create reminder → "Quick demo — 1 min from now" button
- [ ] Wait for reminder toast to appear (should fire within 1s of the minute)
- [ ] Log out → lands on entry page (not localhost redirect)

### Laptop LAN IP
- [ ] Open http://\<laptop-ip\>:3001
- [ ] Repeat search and mixture page checks

### Phone LAN IP
- [ ] Open http://\<laptop-ip\>:3001 in Safari or Chrome
- [ ] Log in (Google OAuth will NOT work on LAN — use email/password)
- [ ] Search "fatty liver"
- [ ] Confirm and open results
- [ ] Open a botanical mixture detail page
- [ ] Log out → returns to entry (no redirect to localhost)
- [ ] In browser dev tools (optional): confirm no API calls go to localhost

---

## Warnings

- **Google OAuth only works on localhost** (Google restricts OAuth to registered origins). Use email/password on phone.
- **Firewall**: Windows may ask to allow Node.js. Click "Allow access" for private networks.
- **NEXTAUTH_URL** in `frontend/.env.local` is set to `http://localhost:3001`. This is fine for phone use — only the logout redirect was affected, and that is now fixed.
- **Docker DB** must be running before starting the backend. If the backend starts without DB, reload after `docker compose up -d db`.
