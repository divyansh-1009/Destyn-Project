"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch("/api/get-user-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, [email]);

  // Helper: get age from birthdate string (YYYY-MM-DD)
  function getAge(birthdate?: string) {
    if (!birthdate) return undefined;
    const dob = new Date(birthdate);
    const diff = Date.now() - dob.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  }

  let morePhotos: string[] = [];
  if (Array.isArray(profile?.profilePhotos)) {
    morePhotos = profile.profilePhotos.filter((url: string) => url && url !== profile.profilePhoto);
  }

  const handleMessage = () => {
    // Go back to chat and select this user
    router.push("/mainpage?tab=chat&email=" + encodeURIComponent(email || ""));
  };

  const handleBlock = () => {
    // Implement block logic or open block modal
    // For now, just toggle state
    setIsBlocked((prev) => !prev);
  };

  const handleReport = () => {
    // Implement report logic or open report modal
    alert("Report functionality coming soon.");
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7ff", color: "#888" }}>Loading profile...</div>;
  }
  if (error || !profile) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7ff", color: "#f44336" }}>{error || "Profile not found"}</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: 0 }}>
      <div style={{ maxWidth: 480, margin: "0 auto", background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(80,0,120,0.10)", overflow: "hidden", position: "relative", marginTop: 32 }}>
        {/* Back button */}
        <button onClick={() => router.back()} style={{ position: "absolute", top: 18, left: 18, background: "#fff", border: "1px solid #eee", borderRadius: 12, fontSize: 20, padding: "4px 14px", cursor: "pointer", zIndex: 2 }}>←</button>
        {/* Profile Photo */}
        <div style={{ width: "100%", height: 260, background: "#eee", position: "relative" }}>
          {profile.profilePhoto ? (
            <img src={profile.profilePhoto} alt="Profile" style={{ width: "100%", height: 260, objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, color: "#bbb" }}>👤</div>
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
        {/* Message, Block, Report Buttons */}
        <div style={{ display: "flex", gap: 12, padding: "0 24px 24px 24px", marginTop: 10 }}>
          <button
            onClick={handleMessage}
            style={{ flex: 2, background: "linear-gradient(90deg, #a259f7 0%, #f857a6 100%)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
          >
            Message
          </button>
          <button
            onClick={handleBlock}
            style={{ flex: 1, background: isBlocked ? "#0070f3" : "#f44336", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
          >
            {isBlocked ? "Unblock" : "Block"}
          </button>
          <button
            onClick={handleReport}
            style={{ flex: 1, background: "#ff9800", color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
} 