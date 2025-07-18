"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome, {session?.user?.name}!</h1>
      <img
        src={session?.user?.image || ""}
        alt="Profile"
        style={{ borderRadius: "50%", width: "100px", margin: "20px" }}
      />
      <p>{session?.user?.email}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
