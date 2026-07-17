import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/config/mongodb";
import { isEmailAllowed } from "@/config/constants";

// ---------------------------------------------------------------------------
// Type augmentation — adds `id` to the session user object.
// ---------------------------------------------------------------------------
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// ---------------------------------------------------------------------------
// Auth options (exported so getServerSession can be used in API routes)
// ---------------------------------------------------------------------------
export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Validate that the authenticating email is from an allowed college
      // domain (or is an env-configured admin address).
      if (!user.email || !isEmailAllowed(user.email)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[auth] Access denied for: ${user.email}`);
        }
        return false;
      }
      return true;
    },

    async session({ session, user }) {
      if (session.user && user?.id) {
        session.user.id = user.id;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // After Google OAuth callback always land on the welcome / onboarding flow.
      if (url.includes("/api/auth/callback/google")) {
        return `${baseUrl}/welcome`;
      }
      // Standard relative / same-origin redirect handling.
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/",
    error: "/?error=AccessDenied",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};
