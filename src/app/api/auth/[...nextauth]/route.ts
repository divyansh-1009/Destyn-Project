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

// Allowed email domains
const ALLOWED_DOMAINS = [
  'iitj.ac.in',
  'nlujodhpur.ac.in',
  'mbm.ac.in',
  'nift.ac.in',
  'jietjodhpur.ac.in',
  'aiimsjodhpur.edu.in'
];

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
    async signIn({ user, account, profile }) {
      // Check if the user's email domain is allowed
      if (user.email) {
        const emailDomain = user.email.split('@')[1]?.toLowerCase();
        
        if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
          console.log(`Access denied for email: ${user.email} (domain: ${emailDomain})`);
          // Return false to prevent session creation and redirect to error page
          return false;
        }
        
        console.log(`Access granted for email: ${user.email} (domain: ${emailDomain})`);
        return true; // Allow access
      }
      
      // If no email, deny access
      console.log('Access denied: No email provided');
      return false;
    },
    async session({ session, user }) {
      // Add null checks to prevent session errors
      if (session.user && user) {
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
  pages: {
    signIn: '/', // Redirect to home page if sign in fails
    error: '/?error=AccessDenied', // Redirect to home page with error parameter
  },
  events: {
    async signOut() {
      // Clear all NextAuth cookies on sign out
      console.log('User signed out - cookies cleared');
    },
    async signIn() {
      console.log('User signed in successfully');
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
