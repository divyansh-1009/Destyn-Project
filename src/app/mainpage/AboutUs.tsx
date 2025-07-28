import React from "react";

export default function AboutUs({ onClose }: { onClose: () => void }) {
  return (
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
            About Destyn
          </h1>
          <p
            style={{
              color: "#888",
              fontSize: "14px",
              margin: "0",
              fontStyle: "italic",
            }}
          >
            Dil se Date tak...
          </p>
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
          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fff",
              }}
            >
              1. Who We Are
            </h2>
            <p>
              We are a group of students and dreamers from India's top colleges, who
              know exactly how lonely life can get between labs, lectures, and
              late-night deadlines. While academic excellence is celebrated,
              emotional well-being often goes unnoticed. We're here to change that.
              <br /> Our platform is built for students, by students—to foster
              genuine connections, shared dreams, and late-night heart-to-hearts.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fff",
              }}
            >
              2. Our Mission
            </h2>
            <p>
              To help students across India’s most competitive institutions find not
              just intellectual matches, but emotional companions.
              <br /> We believe that love, friendship, and mental support are as
              essential to student life as learning and growth.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fff",
              }}
            >
              3. What makes us different.
            </h2>
            <ul style={{ paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Verified College Network:</strong>{" "}
                Only real students. No fake profiles, no spam.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}> Personality-Based Matching:</strong>{" "}
                It’s not just looks. We match on values, energy, depth.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Real Conversations:</strong> Built-in
                icebreakers, confessions, and mood-based chats.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}> Safe, Consent-First Platform:</strong>{" "}
                You’re in control. Every step is built for your comfort.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}> Designed for Busy Students:</strong>{" "}
                Study mode. Exam focus. Emotional check-ins.
              </li>
            </ul>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fff",
              }}
            >
              4. Why We Built This
            </h2>
            <p>
              We saw how even the smartest people struggled to express love, find the
              right person, or simply connect emotionally.
              <br /> Other dating apps were either too superficial, full of noise, or
              didn’t understand the silent emotional battles of academic life. So we
              created a space that respects your time, your values, and your emotional
              needs.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fff",
              }}
            >
              5. Our Belief
            </h2>
            <p>
              You are more than your CGPA, more than your resume, and more than your
              social anxiety. You deserve a connection that celebrates who you are, in
              all your awkward, ambitious, nerdy brilliance.
              <br />
              And maybe, just maybe—love can be the best project you ever work on.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fff",
              }}
            >
              6. Currently Serving
            </h2>
            <p>
              IIT J, NIFT, MBM, JIET, and select colleges across Jodhpur. Coming soon
              to other campuses across India.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fff",
              }}
            >
              7. Meet The Team
            </h2>
            <p>
              We are four friends — Aditya Rathod, Divyansh Yadav, Harshil Agrawal,
              and Himkesh Tak — who came together to build something students truly
              need. As students ourselves, we understand the silent battles behind
              bright grades and tired smiles. That’s why Destyn isn’t just an app — it’s
              a movement toward emotionally stronger, more connected, and more fulfilled
              student lives. We’re here for your heart as much as your head — because
              everyone deserves a chance at love, even in the busiest years of their
              life.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#fff",
              }}
            >
              8. Get In Touch
            </h2>
            <p>
              Give feedback and ideas on our feedback section. You can also reach us
              directly at:{" "}
              <a
                href="mailto:destyn4sup@gmail.com"
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                }}
              >
                destyn4sup@gmail.com
              </a>
            </p>
          </section>

          <div
            style={{
              marginTop: "32px",
              textAlign: "center",
              padding: "16px",
              borderTop: "1px solid #333",
            }}
          >
            <p
              style={{
                margin: "0",
                color: "#888",
                fontSize: "14px",
              }}
            >
              © 2025 Destyn. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}