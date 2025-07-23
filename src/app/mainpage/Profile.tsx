"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's profile photo on component mount
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchProfilePhoto = async () => {
      try {
        const response = await fetch("/api/get-user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.profilePhoto) {
            setProfilePhoto(data.profilePhoto);
          }
        }
      } catch (error) {
        console.error("Error fetching profile photo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePhoto();
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
    setUploadSuccess(false);

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
        setProfilePhoto(data.photoUrl);
        setUploadSuccess(true);

        // Reset success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
          Manage your profile and upload photos
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
            {session?.user?.name || "User"}
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

        {/* Profile Photo Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 20px 0",
              color: "#fff",
            }}
          >
            Profile Photo
          </h3>

          {/* Photo Display */}
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              margin: "0 auto 20px auto",
              overflow: "hidden",
              border: "3px solid #333",
              background: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {loading ? (
              <div
                style={{
                  fontSize: "24px",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ⏳
              </div>
            ) : profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: "48px",
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                👤
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={triggerFileInput}
              disabled={uploading}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                background: uploading ? "#333" : "#0070f3",
                color: "white",
                border: "none",
                cursor: uploading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                transition: "all 0.2s",
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? "Uploading..." : "📷 Upload Photo"}
            </button>

            {uploadSuccess && (
              <div
                style={{
                  padding: "8px 16px",
                  background: "#4caf50",
                  color: "white",
                  borderRadius: 6,
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                ✅ Photo uploaded successfully!
              </div>
            )}

            <p
              style={{
                color: "#666",
                fontSize: "12px",
                margin: "8px 0 0 0",
              }}
            >
              Supported formats: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
          />
        </div>

        {/* Profile Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #333",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0070f3",
                marginBottom: 4,
              }}
            >
              0
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#888",
              }}
            >
              Matches
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0070f3",
                marginBottom: 4,
              }}
            >
              0
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#888",
              }}
            >
              Likes Given
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0070f3",
                marginBottom: 4,
              }}
            >
              0
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#888",
              }}
            >
              Likes Received
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #333",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            margin: "0 0 16px 0",
            color: "#fff",
          }}
        >
          Account Settings
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: "transparent",
              color: "#0070f3",
              border: "1px solid #0070f3",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#0070f3")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.background = "transparent")
            }
            onClick={() => router.push("/mainpage/edit-profile")}
          >
            🔧 Edit Profile
          </button>

          <button
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: "transparent",
              color: "#f44336",
              border: "1px solid #f44336",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#f44336")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLButtonElement).style.background = "transparent")
            }
            onClick={() => {}}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
