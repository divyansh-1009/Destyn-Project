import React from "react";

export default function Guidelines({ onClose }: { onClose: () => void }) {
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
            Safety and Guidelines
          </h1>
          <h2 
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: "24px 0 8px 0",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}
          >
            <span>🛡️</span> Destyn Safety Guidelines
          </h2>
          <p style={{ color: "#ccc", fontSize: "16px", margin: "16px 0" }}>
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
            <p>
              At Destyn, we're all about creating meaningful connections between students from different colleges or campuses within the same city. But before the chemistry starts flowing, it's important to prioritize your safety — both online and offline.
            </p>
          </section>

          <div style={{ 
            width: "100%", 
            height: "4px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "2px",
            margin: "12px 0"
          }} />

          <section>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#fff",
              }}
            >
              Online Safety: Smart Starts Here
            </h2>
            
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#e0e0e0" }}>
              Don't Share Money or Financial Details
            </h3>
            <p>
              It doesn't matter how close you feel — never send money or share banking, UPI, or card info. Scammers may claim emergencies, but money requests are a huge red flag. Always report them.
            </p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Protect Your Personal Life
            </h3>
            <p>Avoid sharing:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>Exact class schedules</li>
              <li style={{ marginBottom: "8px" }}>College ID numbers or addresses</li>
              <li style={{ marginBottom: "8px" }}>Location of your hostel or PG</li>
              <li style={{ marginBottom: "8px" }}>Private social media handles too early</li>
            </ul>
            <p>Wait until trust is built.</p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Stick to Destyn Chats
            </h3>
            <p>
              Keeping the conversation on Destyn helps us keep you safe. People with bad intentions usually try to move to WhatsApp or Instagram quickly. If they do — slow down.
            </p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Look Out for Red Flags
            </h3>
            <p>Be alert if:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>They avoid video calls</li>
              <li style={{ marginBottom: "8px" }}>They make emotional moves too fast</li>
              <li style={{ marginBottom: "8px" }}>They refuse to meet in person</li>
            </ul>
            <p>If it feels off — it probably is.</p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Report & Block
            </h3>
            <p>Help us protect the community. Report anyone who:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>Sends offensive or creepy messages</li>
              <li style={{ marginBottom: "8px" }}>Pretends to be someone else</li>
              <li style={{ marginBottom: "8px" }}>Shares suspicious links</li>
              <li style={{ marginBottom: "8px" }}>Asks for money or inappropriate favors</li>
              <li style={{ marginBottom: "8px" }}>Tries to sell anything</li>
            </ul>
            <p>Reporting is easy — just tap the flag icon on their profile or chat.</p>
          </section>

          <div style={{ 
            width: "100%", 
            height: "4px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "2px",
            margin: "12px 0"
          }} />

          <section>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#fff",
              }}
            >
              Meeting IRL (In Real Life): Be Safe, Not Sorry
            </h2>
            
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#e0e0e0" }}>
              Take Your Time
            </h3>
            <p>
              Before you meet someone, get to know them through chats and video calls. Don't feel rushed.
            </p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Meet in Public Spots
            </h3>
            <p>
              Choose a café, food court, library, or any crowded place — especially for the first few meetups. Never agree to meet in PGs, dorms, or isolated places early on.
            </p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Let Someone Know
            </h3>
            <p>Tell a trusted friend:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>Who you're meeting</li>
              <li style={{ marginBottom: "8px" }}>Where and when</li>
              <li style={{ marginBottom: "8px" }}>When to expect a check-in</li>
            </ul>
            <p>It's smart. Not paranoid.</p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Control Your Ride
            </h3>
            <p>
              Use your own transport, or trusted options like campus shuttles or verified cabs. If things go south, you should be able to leave instantly.
            </p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Guard Your Drink, Phone & Bag
            </h3>
            <p>
              Only accept drinks directly from staff at known venues. Don't leave them unattended. Keep your phone and essentials with you at all times.
            </p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Walk Away If It Feels Wrong
            </h3>
            <p>
              Feel uncomfortable? Trust your gut and leave. You don't owe anyone your time or explanation.
            </p>
          </section>

          <div style={{ 
            width: "100%", 
            height: "4px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "2px",
            margin: "12px 0"
          }} />

          <section>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#fff",
              }}
            >
              LGBTQ+ Connections
            </h2>
            <p>
              Destyn welcomes all orientations and gender identities. Still, in certain environments or cities, visibility can carry risks.
              Here's how to stay cautious:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Use a discreet profile photo if needed</li>
              <li style={{ marginBottom: "8px" }}>Hide your orientation if unsure about safety</li>
              <li style={{ marginBottom: "8px" }}>Meet in LGBTQ+ friendly or public spaces</li>
              <li style={{ marginBottom: "8px" }}>Avoid outing yourself too soon</li>
            </ul>
            <p>
              Explore <a 
                href="https://ilga.org" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                  borderBottom: "1px dotted #667eea",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "#764ba2";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "#667eea";
                }}
              >ILGA World</a> for updated info on LGBTQ+ rights in your region.
            </p>
          </section>

          <div style={{ 
            width: "100%", 
            height: "4px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "2px",
            margin: "12px 0"
          }} />

          <section>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#fff",
              }}
            >
              Consent & Sexual Health
            </h2>
            
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#e0e0e0" }}>
              Consent Is a Must
            </h3>
            <p>
              Consent means clear, ongoing, and mutual agreement.
              It can be withdrawn at any time. If someone is unsure, tired, or intoxicated — that's a no.
            </p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Talk About Health
            </h3>
            <p>Before becoming intimate:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>Discuss sexual history</li>
              <li style={{ marginBottom: "8px" }}>Share STI status honestly</li>
              <li style={{ marginBottom: "8px" }}>Use protection</li>
            </ul>
            <p>It's not awkward. It's respect.</p>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Get Tested
            </h3>
            <p>
              Some STIs show no symptoms. Regular testing protects both you and your partner. Most colleges have nearby clinics or health services — use them.
            </p>
          </section>

          <div style={{ 
            width: "100%", 
            height: "4px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "2px",
            margin: "12px 0"
          }} />

          <section>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#fff",
              }}
            >
              If You Need Help
            </h2>
            <p>
              Even when you're careful, things can go wrong. If something feels off or you've had a bad experience, you're not alone:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Report the user to Destyn right away</li>
              <li style={{ marginBottom: "8px" }}>Reach out to a college counselor or helpline</li>
              <li style={{ marginBottom: "8px" }}>Use campus security or local emergency numbers if in danger</li>
              <li style={{ marginBottom: "8px" }}>Explore resources like RAINN or ThroughLine</li>
            </ul>
          </section>

          <div style={{ 
            width: "100%", 
            height: "4px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
            borderRadius: "2px",
            margin: "20px 0"
          }} />

          <section style={{ textAlign: "center", marginTop: "16px" }}>
            <p>
              Destyn exists to help college students connect confidently.
              So don't just protect your heart — preserve your peace of mind, too.
            </p>
            <p style={{ 
              marginTop: "24px", 
              fontSize: "18px", 
              fontWeight: "600",
              color: "#e0e0e0" 
            }}>
              Your vibe. Your people. Your Destyn. 💙
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
            <p style={{ margin: "0", color: "#888", fontSize: "14px" }}>
              © 2025 Destyn. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}