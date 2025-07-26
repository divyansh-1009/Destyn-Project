// src/app/api/auth/[...nextauth]/route.ts

// NOTE: This is a server-only file. Do NOT use React context, hooks, or components here.
// If you see "React Context is unavailable in Server Components", make sure you only use
// useSession/SessionProvider in client components, not in server components or API routes.

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

import { Session } from "next-auth";

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

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After Google authentication, redirect to /welcome
      if (url.includes('/api/auth/callback/google')) {
        return `${baseUrl}/welcome`;
      }
      
      // Default redirect behavior for other cases
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
