import React from "react";
import { useRouter } from "next/navigation";

export default function FAQs({
  onClose,
  onShowPrivacy,
}: {
  onClose: () => void;
  onShowPrivacy: () => void;
}) {
  const router = useRouter();

  const faqData = [
    {
      question: "What is Destyn?",
      answer: "Destyn is a student-centric dating and connection platform designed exclusively for college students. We aim to help you find real, meaningful relationships — be it romantic, emotional, or supportive — with people from your city and nearby top-tier colleges."
    },
    {
      question: "Who can join Destyn?",
      answer: "Only verified college students are allowed on the platform. We use your college ID and email verification to ensure authenticity and create a trusted student-only community."
    },
    {
      question: "Is Destyn a dating app or a social app?",
      answer: "It's both — but with heart. While dating is a major feature, Destyn is also a space for emotional connection, friendship, and self-discovery. It's for those who want to connect deeply — not just swipe mindlessly."
    },
    {
      question: "How does Destyn verify users?",
      answer: "We require a valid college ID or email for verification, along with basic personal details for age and identity confirmation. This ensures that only genuine students enter the platform, creating a respectful and safe space for all."
    },
    {
      question: "Is my data safe on Destyn?",
      answer: "Absolutely. Your privacy is our top priority. We never sell or share your personal data with third parties without your explicit consent. All data is encrypted, stored securely, and governed by our Privacy Policy."
    },
    {
      question: "Is Destyn free to use?",
      answer: "Yes, Destyn is free for all verified students. Basic features — like finding and chatting with matches — will always remain free."
    },
    {
      question: "What makes Destyn different from other dating apps?",
      answer: "College-only community, emotional well-being focus, safe curated matches, same-city and same-vibe connections, and zero tolerance for disrespect or toxicity."
    },
    {
      question: "Can I use Destyn outside my city or after graduating?",
      answer: "Right now, Destyn is built for active college students within your city. After graduation, you can still stay connected to the people you met, but new matches will be limited as we maintain a verified student-only network."
    },
    {
      question: "What are the safety features of the app?",
      answer: "Automatic profile verification, in-app reporting and blocking, no external contact sharing without consent, and emotionally aware onboarding and conduct guidelines. We want you to feel safe, heard, and respected at every step."
    },
    {
      question: "What kind of relationships can I find on Destyn?",
      answer: "You define it — love, companionship, understanding, friendship, or deep conversations. Destyn gives you the tools and space to find what matters most to you."
    },
    {
      question: "Can I report bad behavior or fake accounts?",
      answer: "Yes, and we take it very seriously. You can report any profile or conversation directly through the app. We investigate all reports and take swift action, including warnings, suspensions, or permanent bans."
    },
    {
      question: "I'm facing a technical issue. How can I get help?",
      answer: "Contact us on Instagram through the feedback. Our team is here to ensure you have a smooth experience."
    },
    {
      question: "How do I delete my account if I want to leave?",
      answer: "You can delete your account anytime through the settings. All personal data will be deleted in accordance with our Privacy Policy, unless legally required otherwise."
    },
    {
      question: "Is Destyn inclusive of all gender identities and orientations?",
      answer: "100%. Destyn is a space for everyone. We welcome all students, regardless of gender identity, sexual orientation, background, or preferences."
    },
    {
      question: "Why is it called Destyn?",
      answer: "Because everyone has a love story written in their destiny — and college is a beautiful chapter where hearts find each other. Destyn is where that journey begins."
    }
  ];

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(5px)",
          zIndex: 2000,
          overflowY: "auto",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            background: "#111",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            border: "1px solid #333",
            color: "#fff",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "sticky",
              top: "20px",
              right: "20px",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              color: "#888",
              fontSize: "24px",
              cursor: "pointer",
              padding: "8px 12px",
              transition: "all 0.2s",
              zIndex: 10,
              float: "right",
              marginBottom: "20px",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#888";
            }}
          >
            ✕
          </button>
          
          <div style={{ marginBottom: "40px", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "700",
                margin: "0 0 12px 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Frequently Asked Questions
            </h1>
            <p style={{ color: "#888", fontSize: "16px", margin: 0 }}>
              Everything you need to know about Destyn
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {faqData.map((faq, index) => (
              <div
                key={index}
                style={{
                  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  borderRadius: "12px",
                  padding: "24px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.2)";
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.border = "1px solid rgba(102, 126, 234, 0.2)";
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    margin: "0 0 12px 0",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "#fff",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "600",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  {faq.question}
                </h3>
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.6",
                    color: "#ccc",
                    margin: "0 0 0 40px",
                  }}
                >
                  {faq.question === "Is my data safe on Destyn?" ? (
                    <>
                      Absolutely. Your privacy is our top priority.
                      <br />
                      We never sell or share your personal data with third parties
                      without your explicit consent. All data is encrypted, stored
                      securely, and governed by our{" "}
                      <span
                        style={{
                          color: "#667eea",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={onShowPrivacy}
                      >
                        Privacy Policy
                      </span>
                    </>
                  ) : (
                    faq.answer
                  )}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
              padding: "20px",
              borderTop: "1px solid #333",
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "0", color: "#888", fontSize: "14px" }}>
              © 2025 Destyn. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}