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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>{Component}</div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          borderTop: "1px solid #ccc",
          padding: "10px 0",
          background: "#fafafa",
        }}
      >
        {NAV_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setActive(opt.key)}
            style={{
              background: "none",
              border: "none",
              fontWeight: active === opt.key ? "bold" : "normal",
              color: active === opt.key ? "#0070f3" : "#333",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </nav>
    </div>
  );
}