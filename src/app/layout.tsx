// src/app/layout.tsx
"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/vercel.svg" type="image/svg+xml" />
        <title>Destyn - Dil se Date tak...</title>
        <meta name="description" content="Event booking in Jodhpur made easy. Plan and book venues, vendors, and events online with Destyn. Your one-stop solution for seamless event planning. Explore now!" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
