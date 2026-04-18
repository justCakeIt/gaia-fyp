## Frontend Setup

Run the frontend:

```bash
npm run dev
```

The app runs on `http://localhost:3001`.

## Required Environment Variables

Create/update your env file with:

```bash
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<long-random-secret>
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
API_BASE=http://localhost:3000/api
```

## Google OAuth Setup

To enable `Continue with Google`:

1. In Google Cloud Console, create an OAuth 2.0 Web Client.
2. Add authorized redirect URI:
   - `http://localhost:3001/api/auth/callback/google`
3. Set:

```bash
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

4. Restart the frontend server.

If Google keys are missing, the button remains clickable and shows a setup error message in the UI.