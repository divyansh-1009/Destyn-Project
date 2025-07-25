"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlockConfirmModal from "../BlockConfirmModal";
import ReportModal from "../ReportModal";
import { useSession } from "next-auth/react";

export default function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const email = searchParams.get("email");
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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

  // Check if this user is blocked by the current user
  useEffect(() => {
    if (!session?.user?.email || !email) return;
    fetch(`/api/block-user?blockerEmail=${encodeURIComponent(session.user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setIsBlocked(data.blocked?.includes(email));
      });
  }, [session?.user?.email, email]);

  const handleMessage = () => {
    router.push("/mainpage?tab=chat&email=" + encodeURIComponent(email || ""));
  };

  const handleBlock = async () => {
    if (!session?.user?.email || !email) return;
    await fetch("/api/block-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockerEmail: session.user.email,
        blockedEmail: email,
        action: "block",
      }),
    });
    setIsBlocked(true);
    setSuccessMsg("User blocked successfully.");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleUnblock = async () => {
    if (!session?.user?.email || !email) return;
    await fetch("/api/block-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockerEmail: session.user.email,
        blockedEmail: email,
        action: "unblock",
      }),
    });
    setIsBlocked(false);
    setSuccessMsg("User unblocked.");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleReport = async (reason: string, details: string) => {
    if (!session?.user?.email || !email) return;
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reporterEmail: session.user.email,
        reportedUserEmail: email,
        reason,
        details,
      }),
    });
    setSuccessMsg("Report submitted. Thank you!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7ff", color: "#888" }}>Loading profile...</div>;
  }
  if (error || !profile) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7ff", color: "#f44336" }}>{error || "Profile not found"}</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 900, margin: "40px auto 0 auto", background: "#fff", borderRadius: 28, boxShadow: "0 8px 32px rgba(80,0,120,0.13)", overflow: "hidden", position: "relative", paddingBottom: 24 }}>
        {/* Back button */}
        <button onClick={() => router.back()} style={{ position: "absolute", top: 18, left: 18, background: "#fff", border: "1.5px solid #a259f7", borderRadius: 10, fontSize: 18, padding: "4px 14px", cursor: "pointer", zIndex: 10, boxShadow: '0 2px 8px #e0d7fa', fontWeight: 700, color: '#a259f7', transition: 'all 0.2s' }}>←</button>
        {/* Profile Photo */}
        <div style={{ width: "100%", height: 220, background: "#eee", position: "relative" }}>
          {profile.profilePhoto ? (
            <img src={profile.profilePhoto} alt="Profile" style={{ width: "100%", height: 220, objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, color: "#bbb" }}>👤</div>
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
                  style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: "1px solid #eee", flexShrink: 0, boxShadow: '0 2px 8px #eee' }}
                />
              ))}
            </div>
          </div>
        )}
        {/* Name, Age, Bio */}
        <div style={{ padding: "24px 32px 0 32px" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#222", marginBottom: 4, letterSpacing: 0.5 }}>
            {profile.name}
            {profile.birthdate && (
              <span style={{ fontWeight: 500, color: "#666", fontSize: 22, marginLeft: 10 }}>
                {getAge(profile.birthdate)}
              </span>
            )}
          </div>
          {profile.bio && (
            <div style={{ color: "#444", fontSize: 18, margin: "14px 0 24px 0", lineHeight: 1.5 }}>{profile.bio}</div>
          )}
          {/* Interests */}
          {Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: "#a259f7", fontSize: 15, marginBottom: 7 }}>Interests</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {profile.interests.map((interest: string, idx: number) => (
                  <span key={idx} style={{ background: "#f3e8ff", color: "#a259f7", borderRadius: 12, padding: "7px 16px", fontSize: 15, fontWeight: 600, letterSpacing: 0.2, boxShadow: '0 1px 4px rgba(162,89,247,0.07)' }}>{interest}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Message, Block, Report Buttons */}
        <div style={{ display: "flex", gap: 18, padding: "0 32px 0 32px", marginTop: 18 }}>
          <button
            onClick={handleMessage}
            style={{ flex: 2, background: "linear-gradient(90deg, #a259f7 0%, #f857a6 100%)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 18, cursor: "pointer", boxShadow: '0 2px 8px #eee', letterSpacing: 0.2 }}
          >
            Message
          </button>
          {isBlocked ? (
            <button
              onClick={handleUnblock}
              style={{ flex: 1, background: "#0070f3", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 18, cursor: "pointer", boxShadow: '0 2px 8px #eee', letterSpacing: 0.2 }}
            >
              Unblock
            </button>
          ) : (
            <button
              onClick={() => setBlockModalOpen(true)}
              style={{ flex: 1, background: "#f44336", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 18, cursor: "pointer", boxShadow: '0 2px 8px #eee', letterSpacing: 0.2 }}
            >
              Block
            </button>
          )}
          <button
            onClick={() => setReportModalOpen(true)}
            style={{ flex: 1, background: "#ff9800", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 18, cursor: "pointer", boxShadow: '0 2px 8px #eee', letterSpacing: 0.2 }}
          >
            Report
          </button>
        </div>
        {successMsg && (
          <div style={{ textAlign: 'center', color: '#19d86b', fontWeight: 700, fontSize: 16, marginTop: 18 }}>{successMsg}</div>
        )}
      </div>
      {/* Block and Report Modals */}
      <BlockConfirmModal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={handleBlock}
        userEmail={email || ""}
      />
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleReport}
        type="user"
        targetEmail={email || ""}
      />
    </div>
  );
} 