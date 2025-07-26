import React from "react";

interface FeedbackProps {
  onClose: () => void;
}

const INSTAGRAM_URL = "https://instagram.com/destyn_official"; 

const Feedback: React.FC<FeedbackProps> = ({ onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#222",
          color: "#fff",
          borderRadius: "16px",
          padding: "32px 24px",
          maxWidth: "90vw",
          width: "350px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "20px",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h2 style={{ marginBottom: 16, fontWeight: 700, fontSize: 22 }}>
          Feedback & Bug Report
        </h2>
        <p style={{ marginBottom: 24, fontSize: 16 }}>
          For any feedback or to report bugs, please contact us on our Instagram handle.
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #f58529 0%, #dd2a7b 50%, #8134af 100%)",
            color: "#fff",
            fontWeight: 600,
            padding: "12px 24px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "16px",
            transition: "background 0.2s",
            boxShadow: "0 2px 8px rgba(221,42,123,0.15)",
          }}
        >
          Go to Instagram
        </a>
      </div>
    </div>
  );
};

export default Feedback;