"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="fixed top-0 w-full bg-black bg-opacity-90 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-white">Destyn</div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-white hover:text-gray-300 transition-colors">About</a>
              <a href="#services" className="text-white hover:text-gray-300 transition-colors">Services</a>
              <a href="#faq" className="text-white hover:text-gray-300 transition-colors">F.A.Q</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.cdn-files-a.com/ready_uploads/media/8115971/2000_605e19e75fc0c.jpg')",
            backgroundPosition: "center center",
            opacity: 0.5
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ fontSize: "49px" }}>
            Destyn
          </h1>
          <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          <h2 className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto" style={{ fontSize: "19px" }}>
            Experience the joy of meaningful student relationships with Destyn, your trusted companion for love and friendship.
          </h2>
          
          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg max-w-md mx-auto">
              <p className="text-red-200 text-sm font-medium mb-2">{error}</p>
              <p className="text-red-300 text-xs">
                We're talking: <span className="font-bold">iitj.ac.in, nlujodhpur.ac.in, mbm.ac.in, nift.ac.in, jietjodhpur.ac.in, aiimsjodhpur.edu.in</span>
              </p>
              <p className="text-red-300 text-xs mt-1">
                Your session's been wiped for safety.<br/>
                Wanna try again? Use a legit college email.
              </p>
            </div>
          )}

          {/* Login Button */}
          <button
            className="group flex items-center justify-center w-full max-w-xs px-8 py-4 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={handleSignIn}
            disabled={isSigningIn}
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-4 transition-transform duration-300 group-hover:rotate-12">
              <FcGoogle size={24} />
            </div>
            <span className="text-lg">
              {isSigningIn ? "Signing in..." : "Login"}
            </span>
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-900">
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
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Services</h2>
            <div className="w-24 h-1 bg-white mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Verified Community</h3>
              <p className="text-gray-300">Ensuring authenticity through exclusive college email ID verification.</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                <span className="text-4xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Safe Environment</h3>
              <p className="text-gray-300">Safe Environment ensures your physical and digital spaces remain secure, promoting peace of mind, love, and healthy dating.</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-4xl">💝</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Emotional Support</h3>
              <p className="text-gray-300">Find your best match and focus on respectful communication and mental well-being.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">F.A.Q</h2>
            <div className="w-24 h-1 bg-white mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">What is Destyn?</h3>
              <p className="text-gray-300">
                Destyn is a student-centric dating and connection platform designed exclusively for college students. We aim to help you find real, meaningful relationships — be it romantic, emotional, or supportive — with people from your city and nearby top-tier colleges.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Who can join Destyn?</h3>
              <p className="text-gray-300">
                Only verified college students are allowed on the platform. We use your college ID and email verification to ensure authenticity and create a trusted student-only community.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Is Destyn a dating app or a social app?</h3>
              <p className="text-gray-300">
                It's both — but with heart. While dating is a major feature, Destyn is also a space for emotional connection, friendship, and self-discovery. It's for those who want to connect deeply — not just swipe mindlessly.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">How does Destyn verify users?</h3>
              <p className="text-gray-300">
                We require:<br/>
                • A valid college ID or email for verification<br/>
                • Basic personal details for age and identity confirmation<br/>
                This ensures that only genuine students enter the platform, creating a respectful and safe space for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className="text-xl font-bold mb-2">Destyn</div>
              <div className="text-gray-400">Copyright © 2025 All rights reserved</div>
            </div>
            <div className="flex space-x-6">
              <a href="#about" className="text-white hover:text-gray-300 transition-colors">About</a>
              <a href="#services" className="text-white hover:text-gray-300 transition-colors">Services</a>
              <a href="#faq" className="text-white hover:text-gray-300 transition-colors">F.A.Q</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
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
