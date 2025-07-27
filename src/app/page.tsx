"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import TypographyImage from "../assets/Typography.png"; // Import the image

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
              <img
                src={TypographyImage.src}
                alt="Destyn Logo"
                className="w-48 md:w-64 lg:w-72 object-contain"
              />
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
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#8A2BE2] via-[#6A1B9A] to-[#4A148C] flex flex-col items-center justify-center p-4 font-sans">
      {/* Background shapes */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-50">
        <svg
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[250px]"
        >
          <path
            fill="#9C27B0"
            fillOpacity="0.5"
            d="M0,224L40,213.3C80,203,160,181,240,186.7C320,192,400,224,480,240C560,256,640,256,720,234.7C800,213,880,171,960,149.3C1040,128,1120,128,1200,149.3C1280,171,1360,213,1400,234.7L1440,256L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
          ></path>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-40">
        <svg
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            fill="#AB47BC"
            fillOpacity="0.6"
            d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,240C1248,245,1344,203,1392,181.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center justify-center text-white text-center flex-grow">
        <div className="flex items-center mb-8 -mt-50 md:mt-0">
          <div>
            {/* Replace the text "DESTYN" with the image */}
            <img
              src={TypographyImage.src}
              alt="Destyn Logo"
              className="w-48 md:w-64 lg:w-72 object-contain"
            />
            <p className="text-xl md:text-2xl font-light tracking-widest">
              Dil se Date tak...
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-400 rounded-lg max-w-md">
            <p className="text-red-200 text-sm font-medium">{error}</p>
            <p className="text-red-300 text-xs mt-2">
            We're talking : 
            <span className="font-bold"> iitj.ac.in, nlujodhpur.ac.in, mbm.ac.in, nift.ac.in, jietjodhpur.ac.in, aiimsjodhpur.edu.in</span>
            </p>
            <p className="text-red-300 text-xs mt-1">
            Your session’s been wiped for safety.<br/>
            Wanna try again? Use a legit college email.
            </p>
          </div>
        )}

        <button
          className=" md:mt-0 group flex items-center justify-center w-full max-w-xs px-6 py-4 mt-8 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300"
          onClick={handleSignIn}
          disabled={isSigningIn}
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-4 transition-transform duration-300 group-hover:rotate-12">
            <FcGoogle size={24} />
          </div>
          <span className="text-lg">
            {isSigningIn ? "Signing in..." : "Sign in with Google"}
          </span>
        </button>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#8A2BE2] via-[#6A1B9A] to-[#4A148C] flex flex-col items-center justify-center p-4 font-sans">
        <div className="z-10 flex flex-col items-center justify-center text-white text-center flex-grow">
          <div className="flex items-center mb-8 -mt-50 md:mt-0">
            <div>
              <img
                src={TypographyImage.src}
                alt="Destyn Logo"
                className="w-48 md:w-64 lg:w-72 object-contain"
              />
              <p className="text-xl md:text-2xl font-light tracking-widest">
                Dil se Date tak...
              </p>
            </div>
          </div>
          <div className="mt-8">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-white">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
