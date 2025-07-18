"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      // Check if user exists in DB
      fetch("/api/user-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) {
            router.push("/mainpage");
          } else {
            router.push("/welcome");
          }
        });
    }
  }, [status, session, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Login with Google</h1>
      <button
        onClick={() => signIn("google")}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
