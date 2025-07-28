"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Feed from "./Feed";
import People from "./People";
import Chat from "./Chat";
import Profile from "./Profile";
import AboutUs from "./AboutUs";
import Guidelines from "./Guidelines";
import Privacy from "./Privacy";
import FAQs from "./FAQs";
import Feedback from "./Feedback";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TypographyWhiteImage from "../../assets/Typography_white.png";

const NAV_OPTIONS = [
  { key: "feed", label: "Feed" },
  { key: "people", label: "People" },
  { key: "chat", label: "Chat" },
  { key: "profile", label: "Profile" },
];

const TOP_NAV_OPTIONS = [
  { key: "Guidelines", label: "Guidelines" },
  { key: "FAQs", label: "FAQs" },
  { key: "Privacy", label: "Privacy" },
  { key: "About Us", label: "About Us" },
  { key: "Feedback", label: "Feedback" },
];

// Component that uses useSearchParams
function MainPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [active, setActive] = useState(tabParam || "feed");
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (tabParam && NAV_OPTIONS.some((opt) => opt.key === tabParam)) {
      setActive(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    // Handle unauthenticated users
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    // Check if profile is complete when session is available
    if (session?.user?.email) {
      checkProfileCompletion();
    }
  }, [session, status, router]);

  useEffect(() => {
    // Function to check screen width
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkProfileCompletion = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/check-profile-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });

      const data = await response.json();

      if (!response.ok || !data.isComplete) {
        // Profile is incomplete, redirect to welcome page
        router.push("/welcome");
        return;
      }

      // Profile is complete, allow access to main page
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      // On error, redirect to welcome page to be safe
      router.push("/welcome");
    }
  };

  const handleTopNavClick = (key: string) => {
    console.log(`Clicked ${key}`);
    if (key === "About Us") {
      setShowAboutUs(true);
    } else if (key === "Guidelines") {
      setShowGuidelines(true);
    } else if (key === "Privacy") {
      setShowPrivacy(true);
    } else if (key === "FAQs") {
      setShowFAQs(true);
    } else if (key === "Feedback") {
      setShowFeedback(true);
    }
    setMenuOpen(false);
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

  // Render navigation items
  const renderNavItems = () => {
    return NAV_OPTIONS.map((opt) => (
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
          textAlign: "left",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 0,
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
    ));
  };

  if (isLoading || status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", // Changed to match other screens
          color: "#fff", // Changed to white for contrast
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid rgba(255,255,255,0.3)",
              borderTop: "4px solid #fff",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            Loading your profile...
          </p>

          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
          padding: "6px 16px",
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
          {/* Logo */}
          <img
            src={TypographyWhiteImage.src}
            alt="Destyn Logo"
            style={{
              height: "23px",
              width: "auto",
              objectFit: "contain"
            }}
          />
        </div>

        {/* Different navigation options for top navbar */}
        {true ? (
          <div style={{ position: "relative" }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
                padding: "6px",
              }}
            >
              ☰
            </button>

            {/* Dropdown menu and overlay */}
            {menuOpen && (
              <>
                {/* Overlay to close menu when clicking outside */}
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 999, // less than dropdown
                  }}
                />
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
                    zIndex: 1000,
                  }}
                >
                  {TOP_NAV_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleTopNavClick(opt.key)}
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
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.background = "#333";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.background = "none";
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: "12px" }}>
            {TOP_NAV_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleTopNavClick(opt.key)}
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

      {/* Main content area with flexible layout based on screen size */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          overflow: "hidden",
        }}
      >
        {/* Side navigation for desktop */}
        {!isMobile && (
          <div
            style={{
              width: "90px", // Reduced from 120px to 90px (75% of current width)
              borderRight: "1px solid #333",
              background: "#111",
              padding: "32px 8px",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              alignItems: "center",
            }}
          >
            {NAV_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setActive(opt.key)}
                style={{
                  background: "none",
                  border: "none",
                  fontWeight: active === opt.key ? "700" : "500",
                  color: active === opt.key ? "#0070f3" : "#bbb",
                  fontSize: "16px", // Reduced from 20px to 16px
                  fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'Liberation Sans', sans-serif",
                  letterSpacing: "0.5px",
                  cursor: "pointer",
                  padding: "14px 0",
                  borderRadius: "10px",
                  transition: "all 0.2s",
                  textAlign: "center",
                  width: "100%",
                  marginBottom: "14px", // 60% of previous 24px
                }}
                onMouseEnter={(e) => {
                  if (active !== opt.key) {
                    (e.target as HTMLElement).style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (active !== opt.key) {
                    (e.target as HTMLElement).style.color = "#bbb";
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Main content */}
        <div style={{ 
          flex: 1, 
          overflow: "auto",
          paddingBottom: isMobile ? "calc(80px + env(safe-area-inset-bottom))" : "0"
        }}>{Component}</div>
      </div>

      {/* Modals */}
      {showAboutUs && <AboutUs onClose={() => setShowAboutUs(false)} />}
      {showGuidelines && <Guidelines onClose={() => setShowGuidelines(false)} />}
      {showPrivacy && <Privacy onClose={() => setShowPrivacy(false)} />}
      {showFAQs && (
        <FAQs
          onClose={() => setShowFAQs(false)}
          onShowPrivacy={() => {
            setShowFAQs(false);
            setShowPrivacy(true);
          }}
        />
      )}
      {showFeedback && <Feedback onClose={() => setShowFeedback(false)} />}

      {/* Bottom navigation for mobile */}
      {isMobile && (
        <nav
          style={{
            display: "flex",
            justifyContent: "space-around",
            borderTop: "1px solid #333",
            padding: "12px 0",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
            background: "#111",
            backdropFilter: "blur(10px)",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          {renderNavItems()}
        </nav>
      )}
    </div>
  );
}

// Main component with Suspense wrapper
export default function MainPage() {
  return (
    <>
      <Suspense fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid rgba(255,255,255,0.3)",
                borderTop: "4px solid #fff",
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p
              style={{
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Loading...
            </p>

            <style jsx>{`
              @keyframes spin {
                0% {
                  transform: rotate(0deg);
                }
                100% {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        </div>
      }>
        <MainPageContent />
      </Suspense>
    </>
  );
}
