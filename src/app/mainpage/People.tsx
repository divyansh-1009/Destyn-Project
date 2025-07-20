"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  answers: Record<string, string>;
  // image?: string; // Uncomment if you have image URLs in DB
};

export default function People() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;
    setLoading(true);
    fetch("/api/get-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setCurrent(0);
        setLoading(false);
      });
  }, [session?.user?.email]);

  if (loading)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#fff",
          background: "#000",
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: "18px" }}>Loading people...</div>
      </div>
    );

  const user = users[current];

  if (!user) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#fff",
          background: "#000",
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: 16, opacity: 0.5 }}>
          👥
        </div>
        <div style={{ fontSize: "20px", marginBottom: 8 }}>
          No more people to show
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          Check back later for new profiles
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 500,
        margin: "0 auto",
        background: "#000",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 30,
          padding: "20px 0",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#fff",
            margin: "0 0 8px 0",
          }}
        >
          👥 Discover People
        </h1>
        <p
          style={{
            color: "#888",
            fontSize: "16px",
            margin: 0,
          }}
        >
          Swipe through profiles and find your match
        </p>
      </div>

      <div
        style={{
          border: "1px solid #333",
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
          textAlign: "center",
          background: "#111",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Placeholder for image */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#1a1a1a",
            margin: "0 auto 20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            color: "#666",
            border: "2px solid #333",
          }}
        >
          {/* If you have user.image, use <img src={user.image} ... /> */}
          <span>👤</span>
        </div>
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "600",
            margin: "0 0 8px 0",
            color: "#fff",
          }}
        >
          {user.name}
        </h3>
        <p
          style={{
            color: "#888",
            fontSize: "14px",
            margin: "0 0 24px 0",
          }}
        >
          {user.email}
        </p>

        <div
          style={{
            textAlign: "left",
            marginTop: 24,
            background: "#0a0a0a",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #333",
          }}
        >
          <h4
            style={{
              color: "#fff",
              margin: "0 0 16px 0",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            About {user.name}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {user.answers &&
              Object.entries(user.answers).map(([qid, ans]) => (
                <div
                  key={qid}
                  style={{
                    padding: "12px 16px",
                    background: "#111",
                    borderRadius: 8,
                    border: "1px solid #333",
                  }}
                >
                  <div
                    style={{
                      color: "#0070f3",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    {qid}
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  >
                    {ans}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 16 }}
      >
        <button
          style={{
            flex: 1,
            padding: "16px 0",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#45a049")}
          onMouseLeave={(e) => (e.target.style.background = "#4caf50")}
          onClick={async () => {
            await fetch("/api/like-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                currentUserEmail: session?.user?.email,
                likedUserEmail: user.email,
              }),
            });
            setCurrent((prev) => (prev + 1) % users.length);
          }}
        >
          ❤️ Like
        </button>
        <button
          style={{
            flex: 1,
            padding: "16px 0",
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#d32f2f")}
          onMouseLeave={(e) => (e.target.style.background = "#f44336")}
          onClick={() => setCurrent((prev) => (prev + 1) % users.length)}
        >
          ✖️ Pass
        </button>
      </div>
    </div>
  );
}
