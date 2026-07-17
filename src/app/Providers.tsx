"use client";

/**
 * Providers — client-only wrapper for NextAuth's SessionProvider.
 *
 * The root layout must NOT be a client component because that opts the entire
 * app out of server-side rendering. This thin wrapper isolates the client
 * boundary to just the session context.
 */

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
