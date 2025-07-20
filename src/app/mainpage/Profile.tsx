"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

const INTEREST_OPTIONS = [
  "Music",
  "Movies",
  "Sports",
  "Travel",
  "Art",
  "Tech",
  "Food",
  "Fitness",
  "Books",
  "Gaming",
];

export default function Profile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    interests: [] as string[],
    profilePhotos: [] as string[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's profile on component mount
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
          setProfile(data);
          setForm({
            name: data.name || "",
            bio: data.bio || "",
            interests: data.interests || [],
            profilePhotos:
              data.profilePhotos ||
              (data.profilePhoto ? [data.profilePhoto] : []),
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.email]);

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.email) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("userEmail", session.user.email);

      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setForm((prev) => ({
          ...prev,
          profilePhotos: [...prev.profilePhotos, data.photoUrl],
        }));
        setProfile((prev) => ({
          ...prev,
          profilePhotos: [...(prev?.profilePhotos || []), data.photoUrl],
        }));
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (photoUrl: string) => {
    setForm((prev) => ({
      ...prev,
      profilePhotos: prev.profilePhotos.filter((url) => url !== photoUrl),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const saveProfile = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          ...form,
        }),
      });

      if (response.ok) {
        setProfile((prev) => ({ ...prev, ...form }));
        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#fff",
          background: "#000",
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: "18px" }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "20px",
        background: "#000",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 30,
          padding: "20px 0",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#fff",
            margin: "0 0 8px 0",
          }}
        >
          👤 Profile
        </h1>
        <p
          style={{
            color: "#888",
            fontSize: "16px",
            margin: 0,
          }}
        >
          Manage your profile and photos
        </p>
      </div>

      {/* Profile Card */}
      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
          border: "1px solid #333",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {!editMode ? (
          // View Mode
          <>
            {/* User Info */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  margin: "0 0 8px 0",
                  color: "#fff",
                }}
              >
                {profile?.name || session?.user?.name || "User"}
              </h2>
              <p
                style={{
                  color: "#888",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                {session?.user?.email}
              </p>
            </div>

            {/* Photo Gallery */}
            <div
              style={{
                marginBottom: 32,
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: "0 0 20px 0",
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                Photos ({form.profilePhotos.length})
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {form.profilePhotos.map((photo, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "2px solid #333",
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Profile photo ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div
                style={{
                  marginBottom: 24,
                  padding: "20px",
                  background: "#0a0a0a",
                  borderRadius: "12px",
                  border: "1px solid #333",
                }}
              >
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0 0 12px 0",
                    color: "#fff",
                  }}
                >
                  About Me
                </h4>
                <p
                  style={{
                    color: "#ccc",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Interests */}
            {profile?.interests && profile.interests.length > 0 && (
              <div
                style={{
                  marginBottom: 24,
                }}
              >
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    margin: "0 0 12px 0",
                    color: "#fff",
                  }}
                >
                  Interests
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {profile.interests.map((interest: string) => (
                    <span
                      key={interest}
                      style={{
                        padding: "6px 12px",
                        background: "#0070f3",
                        color: "#fff",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Button */}
            <div
              style={{
                textAlign: "center",
                marginTop: 32,
              }}
            >
              <button
                onClick={() => setEditMode(true)}
                style={{
                  padding: "12px 24px",
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
                onMouseLeave={(e) => (e.target.style.background = "#0070f3")}
              >
                ✏️ Edit Profile
              </button>
            </div>
          </>
        ) : (
          // Edit Mode
          <>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                margin: "0 0 24px 0",
                color: "#fff",
                textAlign: "center",
              }}
            >
              Edit Profile
            </h3>

            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#0a0a0a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                }}
                placeholder="Enter your name"
              />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleInputChange}
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#0a0a0a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  resize: "vertical",
                }}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Photo Management */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                Photos ({form.profilePhotos.length}/6)
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {form.profilePhotos.map((photo, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "2px solid #333",
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Profile photo ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      onClick={() => removePhoto(photo)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "#f44336",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {form.profilePhotos.length < 6 && (
                  <button
                    onClick={triggerFileInput}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      background: "#0a0a0a",
                      border: "2px dashed #333",
                      borderRadius: "8px",
                      color: "#666",
                      fontSize: "24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
                disabled={uploading}
              />
            </div>

            {/* Interests */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                Interests
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: form.interests.includes(interest)
                        ? "2px solid #0070f3"
                        : "1px solid #333",
                      background: form.interests.includes(interest)
                        ? "#0070f3"
                        : "#0a0a0a",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Save/Cancel Buttons */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
              }}
            >
              <button
                onClick={saveProfile}
                disabled={uploading}
                style={{
                  padding: "12px 24px",
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
                onMouseLeave={(e) => (e.target.style.background = "#0070f3")}
              >
                💾 Save Changes
              </button>

              <button
                onClick={() => setEditMode(false)}
                style={{
                  padding: "12px 24px",
                  background: "#333",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#444")}
                onMouseLeave={(e) => (e.target.style.background = "#333")}
              >
                ❌ Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
