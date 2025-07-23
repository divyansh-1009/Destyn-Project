"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState({
    bio: "",
    interests: "",
    birthdate: "",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/get-user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        if (response.ok) {
          const data = await response.json();
          setFields({
            bio: data.bio || "",
            interests: data.interests || "",
            birthdate: data.birthdate || "",
          });
        }
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session?.user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(files);
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handlePhotoUpload = async () => {
    if (!photoFiles.length || !session?.user?.email) return [];
    const uploadedUrls: string[] = [];
    for (const file of photoFiles) {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("userEmail", session.user.email);
      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        uploadedUrls.push(data.photoUrl);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          bio: fields.bio,
          interests: fields.interests,
          birthdate: fields.birthdate,
        }),
      });
      if (response.ok) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => router.push("/mainpage?tab=profile"), 1200);
      } else {
        const err = await response.json();
        setError(err.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#fff", background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", background: "#181818", color: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, textAlign: "center" }}>Edit Profile</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <label style={{ fontWeight: 600 }}>
          Bio
          <textarea
            name="bio"
            value={fields.bio}
            onChange={handleChange}
            rows={3}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #333", background: "#222", color: "#fff", marginTop: 6, resize: "vertical" }}
          />
        </label>
        <label style={{ fontWeight: 600 }}>
          Interests (comma separated)
          <input
            type="text"
            name="interests"
            value={fields.interests}
            onChange={handleChange}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #333", background: "#222", color: "#fff", marginTop: 6 }}
          />
        </label>
        <label style={{ fontWeight: 600 }}>
          Birthdate
          <input
            type="date"
            name="birthdate"
            value={fields.birthdate}
            onChange={handleChange}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #333", background: "#222", color: "#fff", marginTop: 6 }}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 10,
            padding: "14px 0",
            borderRadius: 10,
            background: submitting ? "#333" : "#0070f3",
            color: "white",
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            fontWeight: "700",
            fontSize: "16px",
            transition: "all 0.2s",
            opacity: submitting ? 0.7 : 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
        {error && <div style={{ color: "#f44336", marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: "#4caf50", marginTop: 10 }}>{success}</div>}
      </form>
      <button
        onClick={() => router.push("/mainpage/profile")}
        style={{ marginTop: 28, background: "none", color: "#0070f3", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 600 }}
      >
        ← Back to Profile
      </button>
    </div>
  );
} 