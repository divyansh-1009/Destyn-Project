"use client";

import { useState, useEffect } from "react";
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
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkTheme(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      isDarkTheme ? "dark" : "light"
    );
  }, [isDarkTheme]);

  // Push notification setup
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        console.log("Service Worker registered");
      });
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted");
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: isDarkTheme ? "#000" : "#fff",
        color: isDarkTheme ? "#fff" : "#000",
        overflow: "hidden",
      }}
    >
      {/* Header with theme toggle and notifications */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${isDarkTheme ? "#333" : "#ddd"}`,
          background: isDarkTheme ? "#111" : "#f8f9fa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            margin: 0,
            color: isDarkTheme ? "#fff" : "#000",
          }}
        >
          💕 Dating App
        </h1>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: `1px solid ${isDarkTheme ? "#333" : "#ddd"}`,
              background: isDarkTheme ? "#222" : "#fff",
              color: isDarkTheme ? "#fff" : "#000",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = isDarkTheme ? "#333" : "#f0f0f0")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = isDarkTheme ? "#222" : "#fff")
            }
          >
            {isDarkTheme ? "🌙" : "☀️"} {isDarkTheme ? "Dark" : "Light"}
          </button>

          {/* Notification Permission */}
          <button
            onClick={requestNotificationPermission}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: `1px solid ${isDarkTheme ? "#333" : "#ddd"}`,
              background: isDarkTheme ? "#222" : "#fff",
              color: isDarkTheme ? "#fff" : "#000",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = isDarkTheme ? "#333" : "#f0f0f0")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = isDarkTheme ? "#222" : "#fff")
            }
          >
            🔔 Notifications
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>{Component}</div>

      <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          borderTop: `1px solid ${isDarkTheme ? "#333" : "#ddd"}`,
          padding: "16px 0",
          background: isDarkTheme ? "#111" : "#f8f9fa",
          backdropFilter: "blur(10px)",
          boxShadow: `0 -4px 20px ${
            isDarkTheme ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"
          }`,
          position: "sticky",
          bottom: 0,
          zIndex: 1000,
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
              color:
                active === opt.key ? "#0070f3" : isDarkTheme ? "#888" : "#666",
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
                e.target.style.color = isDarkTheme ? "#fff" : "#000";
              }
            }}
            onMouseLeave={(e) => {
              if (active !== opt.key) {
                e.target.style.color = isDarkTheme ? "#888" : "#666";
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
