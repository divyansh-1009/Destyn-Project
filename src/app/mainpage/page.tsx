"use client";

import { useState, useEffect } from "react";
import Feed from "./Feed";
import People from "./People";
import Chat from "./Chat";
import Profile from "./Profile";
import Link from "next/link";

const NAV_OPTIONS = [
  { key: "feed", label: "Feed" },
  { key: "people", label: "People" },
  { key: "chat", label: "Chat" },
  { key: "profile", label: "Profile" },
];

// Different options for the top navbar
const TOP_NAV_OPTIONS = [
  { key: "search", label: "Search" },
  { key: "notifications", label: "Notifications" },
  { key: "settings", label: "Settings" },
  { key: "help", label: "Help" },
];

export default function MainPage() {
  const [active, setActive] = useState("feed");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if the viewport is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
        background: "#000",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid #333",
          background: "#111",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo and name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Replace with your actual logo */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#0070f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            D
          </div>
          <span style={{ fontWeight: "700", fontSize: "20px" }}>Destyn</span>
        </div>

        {/* Different navigation options for top navbar */}
        {isMobile ? (
          <div style={{ position: "relative" }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "24px",
                cursor: "pointer",
                padding: "8px",
              }}
            >
              ☰
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  background: "#222",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                  marginTop: "8px",
                  width: "150px",
                }}
              >
                {TOP_NAV_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      // Placeholder for future functionality
                      console.log(`Clicked ${opt.key}`);
                      setMenuOpen(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fff",
                      fontSize: "14px",
                      cursor: "pointer",
                      padding: "12px 16px",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            {TOP_NAV_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  // Placeholder for future functionality
                  console.log(`Clicked ${opt.key}`);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ccc",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "#ccc";
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div style={{ flex: 1, overflow: "auto" }}>{Component}</div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          borderTop: "1px solid #333",
          padding: "16px 0",
          background: "#111",
          backdropFilter: "blur(10px)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
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
                (e.target as HTMLElement).style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (active !== opt.key) {
                (e.target as HTMLElement).style.color = "#888";
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
