"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (status !== "loading") {
      setHasInitialized(true);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
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
  }, [status, session, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("google");
    } catch (error) {
      console.error("Sign in error:", error);
      setIsSigningIn(false);
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
          className="w-full h-full"
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
        <div className="flex items-center mb-8">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-200 rounded-full mr-4 shadow-lg"></div>
          <div>
            <h1
              className="text-6xl md:text-7xl font-bold tracking-wider"
              style={{
                fontFamily: "'Nunito Sans', sans-serif",
                fontWeight: 900,
              }}
            >
              DESTYN
            </h1>
            <p className="text-xl md:text-2xl font-light tracking-widest">
              tagline
            </p>
          </div>
        </div>

        <button
          className="group flex items-center justify-center w-full max-w-xs px-6 py-4 mt-8 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300"
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
