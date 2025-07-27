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

  return (
    <>
      <head>
        <meta name="description" content="Find answers to frequently asked questions about Destyn, the leading event booking platform in Jodhpur. Learn how to plan and book events online, and get support for your event planning journey." />
      </head>
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
            maxWidth: "800px",
            margin: "0 auto",
            background: "#111",
            borderRadius: "12px",
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
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "none",
              border: "none",
              color: "#888",
              fontSize: "24px",
              cursor: "pointer",
              padding: "8px",
              transition: "color 0.2s",
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
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "700",
                margin: "0 0 8px 0",
                background: "linear-gradient(90deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              FAQs
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#ccc",
            }}
          >
            <ol style={{ paddingLeft: "20px" }}>
              <li>
                <strong>What is Destyn?</strong>
                <p>
                  Destyn is a student-centric dating and connection platform
                  designed exclusively for college students. We aim to help you find
                  real, meaningful relationships — be it romantic, emotional, or
                  supportive — with people from your city and nearby top-tier
                  colleges.
                </p>
              </li>
              <li>
                <strong>Who can join Destyn?</strong>
                <p>
                  Only verified college students are allowed on the platform. We
                  use your college ID and email verification to ensure authenticity
                  and create a trusted student-only community.
                </p>
              </li>
              <li>
                <strong>Is Destyn a dating app or a social app?</strong>
                <p>
                  It’s both — but with heart. While dating is a major feature,
                  Destyn is also a space for emotional connection, friendship, and
                  self-discovery. It’s for those who want to connect deeply — not
                  just swipe mindlessly.
                </p>
              </li>
              <li>
                <strong>How does Destyn verify users?</strong>
                <p>We require:</p>
                <ul>
                  <li>A valid college ID or email for verification</li>
                  <li>Basic personal details for age and identity confirmation</li>
                </ul>
                <p>
                  This ensures that only genuine students enter the platform,
                  creating a respectful and safe space for all.
                </p>
              </li>
              <li>
                <strong>Is my data safe on Destyn?</strong>
                <p>
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
                  </span>{" "}
                </p>
              </li>
              <li>
                <strong>Is Destyn free to use?</strong>
                <p>
                  Yes, Destyn is free for all verified students. Basic features —
                  like finding and chatting with matches — will always remain free.
                </p>
              </li>
              <li>
                <strong>What makes Destyn different from other dating apps?</strong>
                <ul>
                  <li>College-only community</li>
                  <li>Emotional well-being focus</li>
                  <li>Safe, curated matches</li>
                  <li>Same-city and same-vibe connections</li>
                  <li>Zero tolerance for disrespect or toxicity</li>
                </ul>
              </li>
              <li>
                <strong>Can I use Destyn outside my city or after graduating?</strong>
                <p>
                  Right now, Destyn is built for active college students within
                  your city. After graduation, you can still stay connected to the
                  people you met, but new matches will be limited as we maintain a
                  verified student-only network.
                </p>
              </li>
              <li>
                <strong>What are the safety features of the app?</strong>
                <ul>
                  <li>Automatic profile verification</li>
                  <li>In-app reporting and blocking</li>
                  <li>No external contact sharing without consent</li>
                  <li>Emotionally aware onboarding and conduct guidelines</li>
                </ul>
                <p>We want you to feel safe, heard, and respected at every step.</p>
              </li>
              <li>
                <strong>What kind of relationships can I find on Destyn?</strong>
                <p>
                  You define it — love, companionship, understanding, friendship, or
                  deep conversations. Destyn gives you the tools and space to find
                  what matters most to you.
                </p>
              </li>
              <li>
                <strong>Can I report bad behavior or fake accounts?</strong>
                <p>
                  Yes, and we take it very seriously. You can report any profile or
                  conversation directly through the app. We investigate all reports
                  and take swift action, including warnings, suspensions, or
                  permanent bans.
                </p>
              </li>
              <li>
                <strong>I’m facing a technical issue. How can I get help?</strong>
                <p>
                  Contact us on Instagram through the feedback. Our team is here to
                  ensure you have a smooth experience.
                </p>
              </li>
              <li>
                <strong>How do I delete my account if I want to leave?</strong>
                <p>
                  You can delete your account anytime through the settings. All
                  personal data will be deleted in accordance with our Privacy
                  Policy, unless legally required otherwise.
                </p>
              </li>
              <li>
                <strong>Is Destyn inclusive of all gender identities and
                orientations?</strong>
                <p>
                  100%. Destyn is a space for everyone. We welcome all students,
                  regardless of gender identity, sexual orientation, background, or
                  preferences.
                </p>
              </li>
              <li>
                <strong>Why is it called Destyn?</strong>
                <p>
                  Because everyone has a love story written in their destiny — and
                  college is a beautiful chapter where hearts find each other.
                  <br />
                  Destyn is where that journey begins.
                </p>
              </li>
            </ol>
          </div>
          <div
            style={{
              marginTop: "32px",
              textAlign: "center",
              padding: "16px",
              borderTop: "1px solid #333",
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