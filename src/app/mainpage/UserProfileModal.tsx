"use client";

import React from "react";

export default function UserProfileModal({
  open,
  onClose,
  profile,
  isBlocked,
  onBlock,
  onReport,
}: {
  open: boolean;
  onClose: () => void;
  profile: any;
  isBlocked: boolean;
  onBlock: () => void;
  onReport: () => void;
}) {
  if (!open || !profile) return null;

  // Helper: get age from birthdate string (YYYY-MM-DD)
  function getAge(birthdate?: string) {
    if (!birthdate) return undefined;
    const dob = new Date(birthdate);
    const diff = Date.now() - dob.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  }

  // Collect additional photos (excluding the main profile photo)
  let morePhotos: string[] = [];
  if (Array.isArray(profile.profilePhotos)) {
    morePhotos = profile.profilePhotos.filter((url: string) => url && url !== profile.profilePhoto);
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: "#fff", borderRadius: 20, maxWidth: 420, width: "100%", boxShadow: "0 8px 32px rgba(80,0,120,0.18)", overflow: "hidden", position: "relative" }}>
        {/* Close button */}
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", color: "#333", fontSize: 28, cursor: "pointer", zIndex: 2 }}>×</button>
        {/* Profile Photo */}
        <div style={{ width: "100%", height: 260, background: "#eee", position: "relative" }}>
          {profile.profilePhoto ? (
            <img src={profile.profilePhoto} alt="Profile" style={{ width: "100%", height: 260, objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, color: "#bbb" }}>👤</div>
          )}
          {/* Online badge (if available) */}
          {profile.online && (
            <span style={{ position: "absolute", top: 18, right: 18, background: "#19d86b", color: "#fff", borderRadius: 12, padding: "4px 14px", fontWeight: 700, fontSize: 15 }}>Online</span>
          )}
        </div>
        {/* More Photos */}
        {morePhotos.length > 0 && (
          <div style={{ padding: "16px 24px 0 24px" }}>
            <div style={{ fontWeight: 700, color: "#a259f7", fontSize: 16, marginBottom: 8 }}>More Photos</div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
              {morePhotos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Profile extra ${idx + 1}`}
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: "1px solid #eee", flexShrink: 0 }}
                />
              ))}
            </div>
          </div>
        )}
        {/* Name, Age, Bio */}
        <div style={{ padding: "24px 24px 0 24px" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#222", marginBottom: 2 }}>
            {profile.name}
            {profile.birthdate && (
              <span style={{ fontWeight: 500, color: "#666", fontSize: 22, marginLeft: 8 }}>
                {getAge(profile.birthdate)}
              </span>
            )}
          </div>
          {profile.bio && (
            <div style={{ color: "#444", fontSize: 16, margin: "10px 0 18px 0" }}>{profile.bio}</div>
          )}
          {/* Interests */}
          {Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 700, color: "#a259f7", fontSize: 16, marginBottom: 6 }}>Interests</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile.interests.map((interest: string, idx: number) => (
                  <span key={idx} style={{ background: "#f3e8ff", color: "#a259f7", borderRadius: 16, padding: "6px 16px", fontSize: 15, fontWeight: 600 }}>{interest}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Block/Report Buttons */}
        <div style={{ display: "flex", gap: 12, padding: "0 24px 24px 24px", marginTop: 10 }}>
          <button
            onClick={onBlock}
            style={{ flex: 1, background: isBlocked ? "#0070f3" : "#f44336", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
          >
            {isBlocked ? "Unblock" : "Block"}
          </button>
          <button
            onClick={onReport}
            style={{ flex: 1, background: "#ff9800", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
} 