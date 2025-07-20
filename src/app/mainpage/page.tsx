"use client";

import { useState } from "react";
import Feed from "./Feed";
import People from "./People";
import Chat from "./Chat";
import Profile from "./Profile";

const NAV_OPTIONS = [
  { key: "feed", label: "Feed" },
  { key: "people", label: "People" },
  { key: "chat", label: "Chat" },
  { key: "profile", label: "Profile" },
];

export default function MainPage() {
  const [active, setActive] = useState("feed");

  let Component;
  switch (active) {
    case "feed":
      Component = <Feed />;
      break;
    case "people":
      Component = <People />;
      break;
    case "chat":
      Component = <Chat />;
      break;
    case "profile":
      Component = <Profile />;
      break;
    default:
      Component = <Feed />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#000",
        color: "#fff",
      }}
    >
      <div style={{ flex: 1 }}>{Component}</div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          borderTop: "1px solid #333",
          padding: "16px 0",
          background: "#111",
          backdropFilter: "blur(10px)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {NAV_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setActive(opt.key)}
            style={{
              background: "none",
              border: "none",
              fontWeight: active === opt.key ? "600" : "400",
              color: active === opt.key ? "#0070f3" : "#888",
              fontSize: "14px",
              cursor: "pointer",
              padding: "8px 16px",
              borderRadius: "8px",
              transition: "all 0.2s",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              if (active !== opt.key) {
                e.target.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (active !== opt.key) {
                e.target.style.color = "#888";
              }
            }}
          >
            {opt.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
