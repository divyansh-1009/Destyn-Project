/**
 * API Authentication Helper
 *
 * Provides a single, reusable function that validates the current session
 * on every API route.
 *
 * Usage in an API route:
 *
 *   const session = await requireAuth();
 *   if (session instanceof NextResponse) return session; // 401
 *   // session.user.email is now guaranteed to be a non-null string
 */

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/config/authOptions";

export type AuthenticatedSession = {
  user: {
    id: string;
    name?: string | null;
    email: string; // guaranteed non-null after requireAuth()
    image?: string | null;
  };
};

/**
 * Validates the current request's session.
 *
 * Returns the validated session on success.
 * Returns a NextResponse 401 on failure — the caller must `return` it.
 *
 * @example
 * const authResult = await requireAuth();
 * if (authResult instanceof NextResponse) return authResult;
 * const { email } = authResult.user;
 */
export async function requireAuth(): Promise<
  AuthenticatedSession | NextResponse
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return session as AuthenticatedSession;
}

/**
 * Higher-Order Function wrapper for API Routes.
 * Enforces Zero-Trust Access Control before executing the route handler.
 */
export function withAuth(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ...args);
  };
}
