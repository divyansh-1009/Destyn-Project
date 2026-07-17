"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";
import { motion } from "framer-motion";
import FAQs from "./mainpage/FAQs";
import Privacy from "./mainpage/Privacy";
import Guidelines from "./mainpage/Guidelines";
import AboutUs from "./mainpage/AboutUs";

const clearAuthCookies = async () => {
  document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
  document.cookie = "__Secure-next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
  document.cookie = "__Secure-next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
  document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "user-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "G_AUTHUSER_H=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "SID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "SSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "APISID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "SAPISID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  try {
    await fetch('/api/clear-cookies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error calling server-side cookie clearing:', error);
  }
};

function useScrollSpy(sectionIds: string[]) {
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

const SERVICES = [
  {
    icon: "✓",
    title: "Verified Community",
    desc: "Ensuring authenticity through exclusive college email ID verification.",
    image: "/verified.avif"
  },
  {
    icon: "🛡️",
    title: "Safe Environment",
    desc: "Ensures your physical and digital spaces remain secure, promoting peace of mind, love, and healthy dating.",
    image: "/security.jpg"
  },
  {
    icon: "💝",
    title: "Emotional Support",
    desc: "Find your best match and focus on respectful communication and mental well-being.",
    image: "/connection.jpg"
  }
];

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== "loading") setHasInitialized(true);
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'AccessDenied' && !hasProcessedError) {
      setError('Access Denied. Only verified college emails are permitted.');
      setHasProcessedError(true);
      setIsClearingSession(true);
      clearAuthCookies().then(() => {
        signOut({ redirect: false });
        setIsClearingSession(false);
      });
    } else if (errorParam && !hasProcessedError) {
      setError('Authentication failed. Please try again.');
      setHasProcessedError(true);
      setIsClearingSession(true);
      clearAuthCookies().then(() => {
        signOut({ redirect: false });
        setIsClearingSession(false);
      });
    }
  }, [searchParams, hasProcessedError]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email && !isClearingSession) {
      const emailDomain = session.user.email.split('@')[1]?.toLowerCase();
      const ALLOWED_DOMAINS = ['iitj.ac.in', 'nlujodhpur.ac.in', 'mbm.ac.in', 'nift.ac.in', 'jietjodhpur.ac.in', 'aiimsjodhpur.edu.in'];
      
      if (!ALLOWED_DOMAINS.includes(emailDomain)) {
        setIsClearingSession(true);
        signOut({ redirect: false });
        setError('Access Denied. Only verified college emails are permitted.');
        clearAuthCookies().then(() => setIsClearingSession(false));
        return;
      }
      
      setError(null);
      setHasProcessedError(false);
      setIsRedirecting(true);
      
      fetch("/api/user-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) router.push("/mainpage");
          else router.push("/welcome");
        })
        .catch(() => {
          setIsRedirecting(false);
          setIsSigningIn(false);
        });
    }
  }, [status, session, router, isClearingSession]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    setHasProcessedError(false);
    
    if (error) {
      try {
        await fetch('/api/force-signout', { method: 'POST' });
        await signOut({ redirect: false });
        await clearAuthCookies();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
    
    try {
      await signIn("google", { callbackUrl: "/welcome" });
    } catch (error) {
      setIsSigningIn(false);
      setError('Authentication failed. Please try again.');
      clearAuthCookies();
    }
  };

  if (isSigningIn || isRedirecting || (status === "loading" && hasInitialized)) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center text-foreground z-[9999]">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2">
          {isRedirecting ? "Redirecting..." : "Authenticating..."}
        </h2>
        <p className="text-muted-foreground">
          {isRedirecting ? "Taking you to your dashboard" : "Please wait while we sign you in"}
        </p>
      </div>
    );
  }

  if (isClearingSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <img src="/Typography_white.png" alt="Destyn Logo" className="h-12 md:h-16 mb-4 object-contain" />
          <div className="p-4 bg-muted/30 border border-border rounded-xl max-w-md text-center">
            <p className="text-foreground font-medium">Resetting your session...</p>
            <p className="text-muted-foreground text-sm mt-2">Please wait while we clear your previous login attempt.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasInitialized) return null;

  return (
    <ParallaxProvider>
      <div className="min-h-screen bg-background text-foreground font-sans">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <img src="/Typography_white.png" alt="Destyn" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-8 text-sm font-medium">
                {sectionIds.map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`relative px-1 py-2 transition-colors ${
                      activeSection === id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{id === "faq" ? "FAQ" : id.charAt(0).toUpperCase() + id.slice(1)}</span>
                    {activeSection === id && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </a>
                ))}
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
                >
                  <span className="text-xl leading-none">&#9776;</span>
                </button>
                {moreOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-xl shadow-2xl py-2 z-50">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted" onClick={() => { setModal("faq"); setMoreOpen(false); }}>FAQ</button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted" onClick={() => { setModal("privacy"); setMoreOpen(false); }}>Privacy Policy</button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted" onClick={() => { setModal("guidelines"); setMoreOpen(false); }}>Guidelines</button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted" onClick={() => { setModal("aboutus"); setMoreOpen(false); }}>About Us</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {modal === "faq" && <FAQs onClose={() => setModal(null)} onShowPrivacy={() => { setModal("privacy"); }} />}
        {modal === "privacy" && <Privacy onClose={() => setModal(null)} />}
        {modal === "guidelines" && <Guidelines onClose={() => setModal(null)} />}
        {modal === "aboutus" && <AboutUs onClose={() => setModal(null)} />}

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <Parallax speed={-15} className="absolute inset-0 w-full h-full pointer-events-none">
            <div
              className="w-full h-full bg-cover bg-center opacity-20 mix-blend-luminosity"
              style={{ backgroundImage: "url('https://images.cdn-files-a.com/ready_uploads/media/8115971/2000_605e19e75fc0c.jpg')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
          </Parallax>
          
          <motion.div
            className="relative z-10 text-center px-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img src="/Typography_white.png" alt="Destyn Logo" className="mx-auto mb-10 h-16 md:h-20 w-auto object-contain drop-shadow-xl" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground leading-tight">
              Dil se <span className="text-primary">Date</span> tak...
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience the joy of meaningful student relationships with Destyn, your trusted companion for love and friendship.
            </p>
            
            {error && (
              <motion.div
                className="mb-10 p-5 bg-destructive/10 border border-destructive/30 rounded-xl text-left max-w-md mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-destructive font-semibold mb-1">Access Restricted</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Only verified college emails are permitted (e.g., iitj.ac.in, nlujodhpur.ac.in). Please log in with an authorized student account.
                </p>
              </motion.div>
            )}
            
            <motion.button
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full overflow-hidden transition-all hover:bg-primary/90 focus:ring-4 focus:ring-primary/30"
              onClick={handleSignIn}
              disabled={isSigningIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full mr-4 text-black">
                <FcGoogle size={20} />
              </div>
              <span className="text-lg">{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
            </motion.button>
          </motion.div>
        </section>

        {/* Discover Connections */}
        <section className="py-24 px-6 border-t border-border bg-card/30 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              className="w-full md:w-1/2 space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Discover<br/><span className="text-primary">Connections</span></h2>
              <div className="w-16 h-1 bg-primary rounded-full"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe every student deserves emotional support and someone to love. Build memories in your college because grades won't be remembered. Stay connected to your college community and make genuine connections.
              </p>
            </motion.div>
            
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                <img src="/discover-connection.png" alt="Connections" className="w-full h-auto object-cover opacity-90" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 px-6 border-t border-border">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">About Destyn</h2>
              <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-10"></div>
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                At Destyn, we provide a platform exclusively for college students to foster genuine connections. Developed by students for students, our focus is on creating a safe and respectful environment that enhances campus life through meaningful relationships and promotes mental well-being.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 px-6 border-t border-border bg-card/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Services</h2>
              <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {SERVICES.map((service, idx) => (
                <motion.div
                  key={service.title}
                  className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-16 h-16 rounded-xl bg-muted mb-6 flex items-center justify-center overflow-hidden border border-border/50">
                    {service.image ? (
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <span className="text-2xl">{service.icon}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-6 border-t border-border">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">F.A.Q</h2>
              <div className="w-16 h-1 bg-primary rounded-full mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { q: "What is Destyn?", a: "Destyn is a student-centric dating and connection platform designed exclusively for college students. We aim to help you find real, meaningful relationships with people from top-tier colleges." },
                { q: "Who can join Destyn?", a: "Only verified college students are allowed on the platform. We use your college ID and email verification to ensure authenticity." },
                { q: "Is Destyn a dating app or a social app?", a: "It's both — but with heart. While dating is a major feature, Destyn is also a space for emotional connection, friendship, and self-discovery." },
                { q: "How does Destyn verify users?", a: "We require a valid college email for verification. This ensures that only genuine students enter the platform, creating a respectful and safe space for all." }
              ].map((faq, idx) => (
                <motion.div 
                  key={idx} 
                  className="bg-card border border-border p-6 rounded-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h3 className="text-lg font-semibold mb-3 text-foreground">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-12 px-6">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <img src="/Typography_white.png" alt="Destyn Logo" className="h-8 w-auto mb-4 opacity-80" />
              <p className="text-muted-foreground text-sm">Connecting hearts, building memories.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">© 2025 Destyn. All rights reserved.</p>
            </div>
            
            <div className="flex items-center space-x-6 text-muted-foreground">
              {/* Social links SVG paths remain mostly the same but styled cleanly */}
              <a href="https://instagram.com/destyn_official" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://x.com/destyn_official" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/destyn4" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=destyn4sup@gmail.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.819L12 10.91l9.545-7.089h.819c.904 0 1.636.732 1.636 1.636z"/></svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </ParallaxProvider>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
