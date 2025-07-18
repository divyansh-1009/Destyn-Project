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

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!users.length) return <div style={{ padding: 24 }}>No more people to show.</div>;

  const user = users[current];

  return (
    <div style={{ padding: 24, maxWidth: 400, margin: "0 auto" }}>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        {/* Placeholder for image */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "#eee",
            margin: "0 auto 16px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#bbb",
          }}
        >
          {/* If you have user.image, use <img src={user.image} ... /> */}
          <span>🖼️</span>
        </div>
        <h3>{user.name}</h3>
        <div style={{ textAlign: "left", marginTop: 16 }}>
          <strong>Answers:</strong>
          <ul>
            {user.answers &&
              Object.entries(user.answers).map(([qid, ans]) => (
                <li key={qid}>
                  <strong>{qid}:</strong> {ans}
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          style={{
            flex: 1,
            marginRight: 8,
            padding: "10px 0",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer",
          }}
          onClick={() => setCurrent((prev) => prev + 1)}
          disabled={current >= users.length - 1}
        >
          Correct
        </button>
        <button
          style={{
            flex: 1,
            marginLeft: 8,
            padding: "10px 0",
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            cursor: "pointer",
          }}
          onClick={() => setCurrent((prev) => prev + 1)}
          disabled={current >= users.length - 1}
        >
          Wrong
        </button>
      </div>
      {current >= users.length - 1 && (
        <div style={{ marginTop: 24, textAlign: "center" }}>No more people to show.</div>
      )}
    </div>
  );
}