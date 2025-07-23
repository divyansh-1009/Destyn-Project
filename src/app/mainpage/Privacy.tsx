import React from "react";

export default function Privacy({ onClose }: { onClose: () => void }) {
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
            Privacy Policy
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
            <span>🔒</span> Your Data, Your Control
          </h2>
          <p style={{ color: "#ccc", fontSize: "16px", margin: "16px 0" }}>
            Last updated: July 24, 2025
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
              At Destyn, we believe in transparency about how we collect, use, and share information about you. This Privacy Policy is designed to help you understand what information we collect, why we collect it, and how you can update, manage, and delete your information.
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
              Information We Collect
            </h2>
            
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#e0e0e0" }}>
              Information You Provide
            </h3>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Account Information:</strong> When you register, we collect your name, email, password, and college/university affiliation.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Profile Information:</strong> Information you add to your profile such as photos, bio, interests, and preferences.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Communications:</strong> Messages you exchange with other users through our platform.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Content:</strong> Posts, comments, reactions, and other content you share on Destyn.
              </li>
            </ul>

            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "20px 0 12px 0", color: "#e0e0e0" }}>
              Automatically Collected Information
            </h3>
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Usage Data:</strong> Information about how you use Destyn, such as features you use, pages you visit, and actions you take.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Device Information:</strong> Hardware model, operating system, unique device identifiers, and mobile network information.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Location Data:</strong> With your permission, we may collect precise location data to help you connect with nearby users.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#fff" }}>Cookies and Similar Technologies:</strong> Information collected through cookies and similar technologies about your browsing behavior.
              </li>
            </ul>
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
              How We Use Your Information
            </h2>
            
            <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Provide and Improve Our Services:</strong> To operate Destyn, develop new features, and enhance your experience.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Personalization:</strong> To customize content, recommendations, and features to match your preferences and interests.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Communication:</strong> To facilitate communication between users, send service updates, and respond to your inquiries.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Safety and Security:</strong> To verify accounts, prevent fraud, and ensure the security of our platform.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Research and Analytics:</strong> To understand how users interact with our platform and improve our services.
              </li>
            </ul>
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
              Information Sharing and Disclosure
            </h2>
            
            <p>We share your information in the following ways:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "12px" }}>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>With Other Users:</strong> Information in your profile is visible to other Destyn users according to your privacy settings.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Service Providers:</strong> We share information with vendors who help us provide services (e.g., cloud storage, analytics).
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Legal Requirements:</strong> We may disclose information if required by law or to protect the rights, property, or safety of Destyn, our users, or others.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Business Transfers:</strong> If Destyn is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </li>
            </ul>
            <p>
              <strong style={{ color: "#fff" }}>We do not sell your personal information to third parties.</strong>
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
              Your Choices and Rights
            </h2>
            
            <p>You have several choices regarding your information:</p>
            <ul style={{ paddingLeft: "20px", marginTop: "12px" }}>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Account Information:</strong> You can update, correct, or delete your account information at any time through your account settings.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Profile Privacy:</strong> You can control who sees your profile and what information is visible to others.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Communications:</strong> You can opt out of receiving promotional communications from us.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Location Data:</strong> You can enable or disable location services through your device settings.
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#fff" }}>Account Deletion:</strong> You can delete your account at any time, which will remove your profile and most of your information from our systems.
              </li>
            </ul>
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
              Data Security
            </h2>
            
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, accidental loss, alteration, or destruction. However, no internet transmission is ever completely secure, so we encourage you to take care when disclosing personal information online.
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
              Data Retention
            </h2>
            
            <p>
              We retain your information for as long as your account is active or as needed to provide you services. We may retain certain information even after you delete your account if necessary to comply with legal obligations, resolve disputes, or enforce our agreements.
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
              Changes to This Policy
            </h2>
            
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top. We encourage you to review this Privacy Policy periodically.
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
              Contact Us
            </h2>
            
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p style={{ 
              margin: "16px 0", 
              fontWeight: "600",
              color: "#e0e0e0",
              textAlign: "center" 
            }}>
              privacy@destyn.com
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
              © 2023-2025 Destyn. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}