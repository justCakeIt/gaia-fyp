import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const AUTH_API_BASE =
  process.env.API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:3000/api";

const providers: NextAuthOptions["providers"] = [];
providers.push(
  CredentialsProvider({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email || "").trim();
      const password = String(credentials?.password || "");

      if (!email || !password) {
        return null;
      }

      try {
        const response = await fetch(`${AUTH_API_BASE}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const payload = (await response.json()) as
          | {
              ok: true;
              data: { userID: number; email: string; userName: string };
            }
          | { ok: false; error: string };

        if (!response.ok || !payload.ok) {
          return null;
        }

        return {
          id: String(payload.data.userID),
          email: payload.data.email,
          name: payload.data.userName,
          authProvider: "credentials",
        };
      } catch {
        return null;
      }
    },
  })
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/entry",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      try {
        const response = await fetch(`${AUTH_API_BASE}/auth/google-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name || "Gaia Member",
          }),
        });

        const payload = (await response.json()) as
          | {
              ok: true;
              data: { userID: number; email: string; userName: string };
            }
          | { ok: false; error: string };

        if (!response.ok || !payload.ok) return false;

        user.id = String(payload.data.userID);
        user.name = payload.data.userName;
        user.email = payload.data.email;
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user?.id) token.userID = user.id;
      if (account?.provider) token.provider = account.provider;
      if (user?.name) token.name = user.name;
      if (user?.email) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.userID === "string") {
          (session.user as { id?: string }).id = token.userID;
        }
        if (typeof token.provider === "string") {
          (session.user as { provider?: string }).provider = token.provider;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/profile`;
    },
  },
};
