"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { FaCamera } from 'react-icons/fa';

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
          setProfile(data);
          if (Array.isArray(data.profilePhotos) && data.profilePhotos.length > 0) {
            setProfilePhoto(data.profilePhotos[0]);
          } else {
            setProfilePhoto(data.profilePhoto || null);
          }
        }
      } catch (error) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [session?.user?.email]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.email) return;
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
        setProfilePhoto(data.photoUrl);
        setProfile((prev: any) => ({ ...prev, profilePhoto: data.photoUrl }));
      }
    } finally {
      setUploading(false);
    }
  };

  // Helper: get age from birthdate string (YYYY-MM-DD)
  function getAge(birthdate?: string) {
    if (!birthdate) return undefined;
    const dob = new Date(birthdate);
    const diff = Date.now() - dob.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  }

  // Demo stats (replace with real data if available)
  const likes = 247;
  const matches = 42;
  const rating = 3.8;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '32px 0' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* Profile Card */}
        <div style={{
          borderRadius: 32,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(80,0,120,0.10)',
          background: '#fff',
            marginBottom: 32,
          position: 'relative',
        }}>
          <div style={{ position: 'relative', width: '100%', height: 340, background: '#222' }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, color: '#bbb', background: '#222' }}>👤</div>
            )}
            {/* Overlay name only (no age) */}
            <div style={{ position: 'absolute', left: 32, bottom: 32, color: '#fff', zIndex: 2 }}>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
                {profile?.name}
              </div>
          </div>
            {/* Camera icon for upload */}
            {/* In the profile photo card, remove the camera button and its input. Only show the profile photo (or placeholder). */}
          </div>
        </div>
        {/* About Me Section */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '28px 28px 18px 28px', marginBottom: 24, boxShadow: '0 2px 8px rgba(80,0,120,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8, color: '#222' }}>About Me</div>
          <div style={{ fontSize: 17, color: '#444', minHeight: 32 }}>
            {profile?.bio ? profile.bio : <span style={{ color: '#bbb' }}>Add a fun bio to tell others about yourself!</span>}
          </div>
              </div>
        {/* Interests Section */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '28px 28px 18px 28px', marginBottom: 24, boxShadow: '0 2px 8px rgba(80,0,120,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12, color: '#222' }}>My Interests</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 36 }}>
            {Array.isArray(profile?.interests) && profile.interests.length > 0 ? (
              profile.interests.map((interest: string, idx: number) => (
                <span key={idx} style={{ background: '#f3e8ff', color: '#a259f7', borderRadius: 16, padding: '8px 18px', fontSize: 16, fontWeight: 600, letterSpacing: 0.2, boxShadow: '0 1px 4px rgba(162,89,247,0.07)' }}>{interest}</span>
              ))
            ) : (
              <span style={{ color: '#bbb', fontSize: 16 }}>Add Your Interests</span>
            )}
          </div>
        </div>
      </div>
      {/* Gradient Edit Full Profile Button at the bottom */}
      <div style={{ maxWidth: 560, margin: '32px auto 0 auto', padding: '0 16px' }}>
        <button
          onClick={() => router.push('/mainpage/edit-profile')}
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #a259f7 0%, #f857a6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            padding: '22px 0',
            fontSize: 22,
            fontWeight: 700,
            boxShadow: '0 4px 24px rgba(162,89,247,0.10)',
            cursor: 'pointer',
            letterSpacing: 0.5,
            marginTop: 0,
            marginBottom: 32,
          }}
        >
          Edit Full Profile
        </button>
      </div>
    </div>
  );
}
