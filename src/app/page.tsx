"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { motion } from "framer-motion";
import { useRef } from "react";
import FAQs from "./mainpage/FAQs";
import Privacy from "./mainpage/Privacy";
import Guidelines from "./mainpage/Guidelines";
import AboutUs from "./mainpage/AboutUs";

// Function to clear all authentication-related cookies
const clearAuthCookies = async () => {
  // Clear client-side cookies
  document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
  document.cookie = "__Secure-next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
  document.cookie = "__Secure-next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
  
  // Clear any other potential auth cookies
  document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Clear Google OAuth cookies
  document.cookie = "G_AUTHUSER_H=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "SID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "SSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "APISID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "SAPISID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Also call server-side endpoint for more secure cookie clearing
  try {
    await fetch('/api/clear-cookies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error calling server-side cookie clearing:', error);
  }
  
  console.log('All authentication cookies cleared');
};

function useScrollSpy(sectionIds: string[]) {
  // Custom hook to track which section is in view
  const [activeId, setActiveId] = useState(sectionIds[0]);
  useEffect(() => {
    const handleScroll = () => {
      let found = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) found = id;
        }
      }
      setActiveId(found);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionIds]);
  return activeId;
}

// Service card data
const SERVICES = [
  {
    icon: "✓",
    title: "Verified Community",
    desc: "Ensuring authenticity through exclusive college email ID verification.",
    color: "from-blue-600 to-purple-600"
  },
  {
    icon: "🛡️",
    title: "Safe Environment",
    desc: "Safe Environment ensures your physical and digital spaces remain secure, promoting peace of mind, love, and healthy dating.",
    color: "from-green-600 to-blue-600"
  },
  {
    icon: "💝",
    title: "Emotional Support",
    desc: "Find your best match and focus on respectful communication and mental well-being.",
    color: "from-purple-600 to-pink-600"
  }
];

// Separate component that uses useSearchParams
function LoginPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [hasProcessedError, setHasProcessedError] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [modal, setModal] = useState<null | "faq" | "privacy" | "guidelines" | "aboutus">(null);
  const sectionIds = ["about", "services", "faq"];
  const activeSection = useScrollSpy(sectionIds);

  useEffect(() => {
    if (status !== "loading") {
      setHasInitialized(true);
    }
  }, [status]);

  useEffect(() => {
    // Check for authentication error in URL parameters
    const error = searchParams.get('error');
    if (error === 'AccessDenied' && !hasProcessedError) {
      setError('HOLD UP! You are not on the list. Only folks with verified college emails can vibe with this app.');
      setHasProcessedError(true);
      // Clear all authentication cookies when access is denied
      setIsClearingSession(true);
      clearAuthCookies().then(() => {
        // Force sign out to clear any existing session
        signOut({ redirect: false });
        setIsClearingSession(false);
      });
    } else if (error && !hasProcessedError) {
      setError('Authentication failed. Please try again.');
      setHasProcessedError(true);
      // Clear cookies for any authentication error
      setIsClearingSession(true);
      clearAuthCookies().then(() => {
        signOut({ redirect: false });
        setIsClearingSession(false);
      });
    }
  }, [searchParams, hasProcessedError]);

  useEffect(() => {
    // Only redirect if user is authenticated AND has a valid session AND not clearing session
    if (status === "authenticated" && session?.user?.email && !isClearingSession) {
      // Double-check the email domain before redirecting
      const emailDomain = session.user.email.split('@')[1]?.toLowerCase();
      const ALLOWED_DOMAINS = [
        'iitj.ac.in',
        'nlujodhpur.ac.in',
        'mbm.ac.in',
        'nift.ac.in',
        'jietjodhpur.ac.in',
        'aiimsjodhpur.edu.in'
      ];
      
      if (!ALLOWED_DOMAINS.includes(emailDomain)) {
        // If somehow a user with unauthorized domain got authenticated, sign them out
        console.log('Unauthorized domain detected in session, signing out');
        setIsClearingSession(true);
        signOut({ redirect: false });
        setError(' HOLD UP! You are not on the list. Only folks with verified college emails can vibe with this app.');
        clearAuthCookies().then(() => {
          setIsClearingSession(false);
        });
        return;
      }
      
      // Clear any previous errors since we have a valid session
      setError(null);
      setHasProcessedError(false);
      
      setIsRedirecting(true); // Set redirecting state immediately
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
        })
        .catch((error) => {
          console.error("Error checking user existence:", error);
          setIsRedirecting(false);
          setIsSigningIn(false);
        });
    }
  }, [status, session, router, isClearingSession]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null); // Clear any previous errors
    setHasProcessedError(false); // Reset error processing flag
    
    // Only clear session if there was a previous error
    if (error) {
      try {
        await fetch('/api/force-signout', { method: 'POST' });
        await signOut({ redirect: false });
        await clearAuthCookies();
        
        // Add a small delay to ensure cookies are cleared
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
    
    try {
      // Force a fresh authentication flow
      await signIn("google", { callbackUrl: "/welcome" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
      setError('Authentication failed. Please try again.');
      // Clear cookies on sign-in error
      clearAuthCookies();
    }
  };

  // Show loading screen during authentication OR redirecting (but not on initial load)
  if (isSigningIn || isRedirecting || (status === "loading" && hasInitialized)) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(255,255,255,0.3)",
            borderTop: "4px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px",
          }}
        ></div>
        <h2
          style={{
            margin: "10px 0",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          {isRedirecting ? "Redirecting..." : "Authenticating..."}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            opacity: 0.8,
          }}
        >
          {isRedirecting
            ? "Taking you to your dashboard"
            : "Please wait while we sign you in"}
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
    );
  }

  // Show clearing session message if clearing session is active
  if (isClearingSession) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#8A2BE2] via-[#6A1B9A] to-[#4A148C] flex flex-col items-center justify-center p-4 font-sans">
        <div className="z-10 flex flex-col items-center justify-center text-white text-center flex-grow">
          <div className="flex items-center mb-8 -mt-50 md:mt-0">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Destyn</h1>
              <p className="text-xl md:text-2xl font-light tracking-widest">
                Dil se Date tak...
              </p>
            </div>
          </div>
          <div className="mb-6 p-4 bg-blue-500 bg-opacity-20 border border-blue-400 rounded-lg max-w-md">
            <p className="text-blue-200 text-sm font-medium">Resetting your session...</p>
            <p className="text-blue-300 text-xs mt-2">
              Please wait while we clear your previous login attempt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything until session has initialized
  if (!hasInitialized) {
    return null;
  }

  return (
    <ParallaxProvider>
      <div className="min-h-screen bg-black text-white">
        {/* Header with interactive nav */}
        <nav className="fixed top-0 w-full bg-black bg-opacity-90 backdrop-blur-sm z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-white flex items-center">
                <img src="/Typography_white.png" alt="Destyn Logo" className="h-10 w-auto object-contain" style={{filter: 'drop-shadow(0 1px 4px #34398c)'}} />
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex space-x-8">
                  {sectionIds.map((id) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={`relative text-white transition-colors duration-200 px-2 py-1 ${
                        activeSection === id ? "font-bold text-blue-400" : "hover:text-blue-300"
                      }`}
                    >
                      <span>{id.charAt(0).toUpperCase() + id.slice(1)}</span>
                      {/* Animated underline */}
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-0 right-0 -bottom-1 h-0.5 bg-blue-400 rounded"
                        style={{
                          opacity: activeSection === id ? 1 : 0,
                          transition: "opacity 0.2s"
                        }}
                      />
                    </a>
                  ))}
                </div>
                {/* Hamburger/More menu */}
                <div className="ml-4 relative">
                  <button
                    aria-label="More options"
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-800 focus:outline-none"
                    onClick={() => setMoreOpen((v) => !v)}
                  >
                    {/* Hamburger icon */}
                    <span style={{ display: 'inline-block', fontSize: 28, lineHeight: 1 }}>&#9776;</span>
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black border border-gray-700 rounded-lg shadow-lg z-50">
                      <button className="block w-full text-left px-4 py-3 text-white hover:bg-gray-800" onClick={() => { setModal("faq"); setMoreOpen(false); }}>FAQ</button>
                      <button className="block w-full text-left px-4 py-3 text-white hover:bg-gray-800" onClick={() => { setModal("privacy"); setMoreOpen(false); }}>Privacy Policy</button>
                      <button className="block w-full text-left px-4 py-3 text-white hover:bg-gray-800" onClick={() => { setModal("guidelines"); setMoreOpen(false); }}>Guidelines</button>
                      <button className="block w-full text-left px-4 py-3 text-white hover:bg-gray-800" onClick={() => { setModal("aboutus"); setMoreOpen(false); }}>About Us</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
        {/* Modals for More menu */}
        {modal === "faq" && <FAQs onClose={() => setModal(null)} onShowPrivacy={() => { setModal("privacy"); }} />}
        {modal === "privacy" && <Privacy onClose={() => setModal(null)} />}
        {modal === "guidelines" && <Guidelines onClose={() => setModal(null)} />}
        {modal === "aboutus" && <AboutUs onClose={() => setModal(null)} />}

        {/* Hero Section with Parallax */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <Parallax speed={-20} className="absolute inset-0 w-full h-full">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('https://images.cdn-files-a.com/ready_uploads/media/8115971/2000_605e19e75fc0c.jpg')",
                backgroundPosition: "center center",
                opacity: 0.5,
                width: "100%",
                height: "100%",
              }}
            ></div>
          </Parallax>
          <motion.div
            className="relative z-10 text-center px-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <img src="/Typography_white.png" alt="Destyn Logo" className="mx-auto mb-6 h-16 md:h-24 w-auto object-contain" style={{filter: 'drop-shadow(0 1px 4px #34398c)'}} />
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
            <h2 className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto" style={{ fontSize: "19px" }}>
              Experience the joy of meaningful student relationships with Destyn, your trusted companion for love and friendship.
            </h2>
            {error && (
              <motion.div
                className="mb-8 p-6 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-red-200 text-sm font-medium mb-2">{error}</p>
                <p className="text-red-300 text-xs">
                  We're talking: <span className="font-bold">iitj.ac.in, nlujodhpur.ac.in, mbm.ac.in, nift.ac.in, jietjodhpur.ac.in, aiimsjodhpur.edu.in</span>
                </p>
                <p className="text-red-300 text-xs mt-1">
                  Your session's been wiped for safety.<br />
                  Wanna try again? Use a legit college email.
                </p>
              </motion.div>
            )}
            <motion.button
              className="group flex items-center justify-center w-full max-w-xs px-8 py-4 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
              onClick={handleSignIn}
              disabled={isSigningIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-4 transition-transform duration-300 group-hover:rotate-12">
                <FcGoogle size={24} />
              </div>
              <span className="text-lg">
                {isSigningIn ? "Signing in..." : "Login"}
              </span>
            </motion.button>
          </motion.div>
        </section>

        {/* Discover Connections Section */}
        <motion.section
          className="relative flex flex-col md:flex-row items-center justify-center py-16 px-4 md:px-0 min-h-[60vh]"
          style={{
            background: `linear-gradient(120deg, #fbb040 0%, #6a1b9a 100%), radial-gradient(circle at 60% 40%, #fbb04033 0%, #6a1b9a22 80%)`,
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          {/* Blurred background image layer */}
          <img
            src="/discover-connection.png"
            alt="Blurred background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(32px) brightness(0.7)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          {/* Left: Text */}
          <div className="md:w-1/2 w-full flex flex-col items-start justify-center px-4 md:px-16 mb-10 md:mb-0 relative z-10">
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight text-[#34398c]">Discover<br/>Connections</h2>
            <div className="w-24 h-1 bg-[#34398c] mb-8"></div>
            <p className="font-serif text-xl md:text-2xl leading-relaxed text-[#34398c]">
              We believe every student deserves emotional support and someone to love. Build memories in your college because grades won't be remembered. Stay connected to your college community and make connections.
            </p>
          </div>
          {/* Right: Image with overlay */}
          <div className="md:w-1/2 w-full flex items-center justify-center relative z-10">
            <div className="absolute rounded-xl shadow-2xl w-[90%] h-[90%] bg-[#34398c] opacity-20 z-0" style={{filter:'blur(12px)'}}></div>
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 8px 40px 0 #fbb04055, 0 2px 24px 0 #6a1b9a44',
                background: 'rgba(255,255,255,0.05)',
                maxWidth: 400,
                margin: '0 auto',
              }}
            >
              <img
                src="/discover-connection.png"
                alt="Discover Connections"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '24px',
                }}
              />
            </div>
          </div>
        </motion.section>

        {/* About Section with Parallax and Animation */}
        <Parallax speed={10}>
          <motion.section
            id="about"
            className="py-20 bg-gray-900"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="container mx-auto px-4">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold mb-8" style={{ fontSize: "73px" }}>
                  About Destyn
                </h2>
                <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
                <p className="text-xl md:text-2xl leading-relaxed" style={{ fontSize: "25px" }}>
                  At Destyn, we provide a platform exclusively for college students to foster genuine connections. Developed by students for students, our focus is on creating a safe and respectful environment that enhances campus life through meaningful relationships and promotes mental well-being.
                </p>
              </div>
            </div>
          </motion.section>
        </Parallax>

        {/* Services Section with Animated Cards */}
        <motion.section
          id="services"
          className="py-20 bg-black"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-8">Services</h2>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.15 } }
              }}
            >
              {SERVICES.map((service, idx) => (
                <motion.div
                  key={service.title}
                  className={`text-center cursor-pointer group rounded-2xl p-8 bg-gray-800 hover:bg-gradient-to-br ${service.color} shadow-lg transition-all duration-300`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-white bg-opacity-10 group-hover:bg-opacity-30 transition-all duration-300 overflow-hidden">
                    {service.title === "Verified Community" && (
                      <img src="/verified.avif" alt="Verified Community" className="w-full h-full object-cover" />
                    )}
                    {service.title === "Safe Environment" && (
                      <img src="/security.jpg" alt="Safe Environment" className="w-full h-full object-cover" />
                    )}
                    {service.title === "Emotional Support" && (
                      <img src="/connection.jpg" alt="Emotional Support" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors duration-200">{service.title}</h3>
                  <p className="text-gray-300 group-hover:text-white transition-colors duration-200">{service.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ Section with Animation */}
        <motion.section
          id="faq"
          className="py-20 bg-gray-900"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-8">F.A.Q</h2>
              <div className="w-24 h-1 bg-white mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <motion.div className="bg-gray-800 p-6 rounded-lg" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
                <h3 className="text-xl font-bold mb-4">What is Destyn?</h3>
                <p className="text-gray-300">
                  Destyn is a student-centric dating and connection platform designed exclusively for college students. We aim to help you find real, meaningful relationships — be it romantic, emotional, or supportive — with people from your city and nearby top-tier colleges.
                </p>
              </motion.div>
              <motion.div className="bg-gray-800 p-6 rounded-lg" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                <h3 className="text-xl font-bold mb-4">Who can join Destyn?</h3>
                <p className="text-gray-300">
                  Only verified college students are allowed on the platform. We use your college ID and email verification to ensure authenticity and create a trusted student-only community.
                </p>
              </motion.div>
              <motion.div className="bg-gray-800 p-6 rounded-lg" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
                <h3 className="text-xl font-bold mb-4">Is Destyn a dating app or a social app?</h3>
                <p className="text-gray-300">
                  It's both — but with heart. While dating is a major feature, Destyn is also a space for emotional connection, friendship, and self-discovery. It's for those who want to connect deeply — not just swipe mindlessly.
                </p>
              </motion.div>
              <motion.div className="bg-gray-800 p-6 rounded-lg" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
                <h3 className="text-xl font-bold mb-4">How does Destyn verify users?</h3>
                <p className="text-gray-300">
                  We require:<br />
                  • A valid college ID or email for verification<br />
                  • Basic personal details for age and identity confirmation<br />
                  This ensures that only genuine students enter the platform, creating a respectful and safe space for all.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="bg-black py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <div className="text-xl font-bold mb-2 flex items-center">
                  <img src="/Typography_white.png" alt="Destyn Logo" className="h-8 w-auto object-contain" style={{filter: 'drop-shadow(0 1px 4px #34398c)'}} />
                </div>
                <div className="text-gray-400">Copyright © 2025 All rights reserved</div>
              </div>
              <div className="flex space-x-6">
                {sectionIds.map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`text-white hover:text-gray-300 transition-colors scroll-smooth ${activeSection === id ? "font-bold text-blue-400" : ""}`}
                  >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ParallaxProvider>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Destyn</h1>
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
