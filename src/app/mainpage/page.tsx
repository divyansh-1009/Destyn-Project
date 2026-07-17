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
import { useSearchParams } from "next/navigation";
// Removed import of TypographyWhiteImage
import { motion, AnimatePresence } from "framer-motion";

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
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (session?.user?.email) {
      checkProfileCompletion();
    }
  }, [session, status, router]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
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
        router.push("/welcome");
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      router.push("/welcome");
    }
  };

  const handleTopNavClick = (key: string) => {
    if (key === "About Us") setShowAboutUs(true);
    else if (key === "Guidelines") setShowGuidelines(true);
    else if (key === "Privacy") setShowPrivacy(true);
    else if (key === "FAQs") setShowFAQs(true);
    else if (key === "Feedback") setShowFeedback(true);
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

  const renderNavItems = () => {
    return NAV_OPTIONS.map((opt) => (
      <button
        key={opt.key}
        onClick={() => setActive(opt.key)}
        className={`relative flex items-center justify-center w-full px-4 py-3 md:py-4 transition-all duration-200 group md:rounded-xl md:mb-3 ${
          active === opt.key ? "text-primary font-bold md:bg-primary/10" : "text-muted-foreground hover:text-foreground font-medium md:hover:bg-muted"
        }`}
      >
        <span className="text-sm md:text-base z-10">{opt.label}</span>
        {active === opt.key && isMobile && (
          <motion.div
            layoutId="mobile-nav-indicator"
            className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-b-full"
          />
        )}
      </button>
    ));
  };

  if (isLoading || status === "loading") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img
            src="/Typography_white.png"
            alt="Destyn Logo"
            className="h-6 md:h-7 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActive("feed")}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -mr-2 text-foreground hover:bg-muted rounded-full transition-colors md:hidden"
          >
            <span className="text-xl leading-none">&#9776;</span>
          </button>

          <div className="hidden md:flex gap-2">
            {TOP_NAV_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleTopNavClick(opt.key)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 md:hidden"
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl py-2 z-50 md:hidden"
                >
                  {TOP_NAV_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleTopNavClick(opt.key)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-[200px] border-r border-border bg-card/30 flex flex-col pt-6 px-4 shrink-0 overflow-y-auto">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-4">Menu</div>
            {renderNavItems()}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-background scroll-smooth">
          <div className="pb-24 md:pb-8 h-full max-w-5xl mx-auto w-full">
            {Component}
          </div>
        </div>
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

      {/* Mobile Bottom Navbar */}
      {isMobile && (
        <nav className="flex justify-around border-t border-border bg-background/90 backdrop-blur-xl pb-safe pt-1 fixed bottom-0 left-0 right-0 z-50">
          {renderNavItems()}
        </nav>
      )}
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-muted-foreground">Loading...</p>
      </div>
    }>
      <MainPageContent />
    </Suspense>
  );
}
