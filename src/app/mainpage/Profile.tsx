"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { FaCamera } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useImageCompression } from "@/lib/useImageCompression";
import CompressionProgress from "@/components/CompressionProgress";
import ZodiacTag from "@/components/ZodiacTag";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    compressSingleImage,
    state: compressionState,
    compressionInfo,
  } = useImageCompression({
    compressionOptions: {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.8,
      format: 'jpeg'
    },
    onError: (error) => {
      console.error('Compression error:', error);
      alert('Failed to compress image. Please try again.');
    }
  });

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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.email) {
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
          } catch (error) {}
        };
        fetchProfile();
      }
    };

    const handleFocus = () => {
      if (session?.user?.email) {
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
          } catch (error) {}
        };
        fetchProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session?.user?.email]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.email) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    setUploading(true);
    try {
      const compressedImage = await compressSingleImage(file);
      
      const formData = new FormData();
      formData.append("photo", compressedImage.file);
      formData.append("userEmail", session.user.email);
      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const profileResponse = await fetch("/api/get-user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
          if (Array.isArray(profileData.profilePhotos) && profileData.profilePhotos.length > 0) {
            setProfilePhoto(profileData.profilePhotos[0]);
          } else {
            setProfilePhoto(profileData.profilePhoto || null);
          }
        }
      } else {
        alert('Failed to upload photo. Please try again.');
      }
    } catch (error) {
      alert('Error uploading photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      router.push('/');
    }
  };

  function getAge(birthdate?: string) {
    if (!birthdate) return undefined;
    try {
      const dob = new Date(birthdate);
      const diff = Date.now() - dob.getTime();
      const age = new Date(diff).getUTCFullYear() - 1970;
      return age > 0 ? age : undefined;
    } catch (error) {
      return undefined;
    }
  }

  const getUserPhotos = () => {
    if (Array.isArray(profile?.profilePhotos) && profile.profilePhotos.length > 0) {
      return profile.profilePhotos;
    }
    if (profile?.profilePhoto) {
      return [profile.profilePhoto];
    }
    return [];
  };

  const userPhotos = getUserPhotos();

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground text-xl">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 text-foreground pb-24 md:pb-8">
      <CompressionProgress 
        state={compressionState}
        compressionInfo={compressionInfo}
        showCompressionInfo={false}
      />
      
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Profile Card Container */}
        <div className="bg-card rounded-3xl p-6 md:p-8 shadow-2xl border border-border">
          
          {/* Profile Header */}
          <div className="flex items-center mb-8 gap-6">
            {/* Circular Profile Picture */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary bg-secondary shrink-0 overflow-hidden shadow-lg shadow-primary/20">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-secondary text-foreground text-4xl">👤</div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
              {/* Camera icon overlay */}
              <div 
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 md:bottom-2 md:right-2 bg-primary w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center cursor-pointer text-primary-foreground transition-transform hover:scale-110 shadow-lg border-2 border-card"
              >
                <FaCamera size={14} />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 text-foreground break-words leading-tight">
                {profile?.name || 'User Name'}
              </h1>
              <div className="text-lg md:text-xl text-muted-foreground mb-2">
                {profile?.birthdate ? `${getAge(profile.birthdate)} years old` : 'Age not set'}
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-base md:text-lg text-muted-foreground font-semibold capitalize">
                  {profile?.gender ? profile.gender : 'Gender not set'}
                </span>
                {profile?.birthdate && (
                  <ZodiacTag 
                    birthdate={profile.birthdate} 
                    size="medium"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-8">
            <h2 className="bg-muted rounded-xl px-4 py-2.5 mb-3 text-xl font-bold text-foreground inline-block">
              Bio
            </h2>
            <div className={`bg-secondary rounded-2xl p-5 text-secondary-foreground text-base md:text-lg leading-relaxed ${profile?.bio && profile.bio.length > 100 ? 'min-h-[120px]' : ''}`}>
              {profile?.bio ? profile.bio : (
                <span className="text-muted-foreground italic">
                  No bio added yet. Click "Edit Profile" to add your bio!
                </span>
              )}
            </div>
          </div>

          {/* Interests Section */}
          <div className="mb-8">
            <h2 className="bg-muted rounded-xl px-4 py-2.5 mb-3 text-xl font-bold text-foreground inline-block">
              Interests
            </h2>
            <div className="bg-secondary rounded-2xl p-5 min-h-[120px]">
              {Array.isArray(profile?.interests) && profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {profile.interests.map((interest: string, index: number) => (
                    <span key={index} className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm md:text-base font-semibold">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="bg-muted/50 rounded-full h-8 animate-pulse"></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Photos Section */}
          <div className="mb-8">
            <h2 className="bg-muted rounded-xl px-4 py-2.5 mb-3 text-xl font-bold text-foreground inline-block">
              Photos <span className="text-muted-foreground font-medium text-lg ml-1">({userPhotos.length})</span>
            </h2>
            <div className="grid grid-cols-3 gap-3 md:gap-4 auto-rows-fr aspect-[3/2]">
              {userPhotos.length > 0 ? (
                userPhotos.slice(0, 6).map((photo: string, index: number) => (
                  <div key={index} className="rounded-xl md:rounded-2xl border-2 border-primary/20 overflow-hidden relative bg-secondary aspect-square">
                    <img 
                      src={photo} 
                      alt={`Post ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.className = "flex flex-col items-center justify-center w-full h-full bg-secondary text-muted-foreground text-xs text-center p-2 rounded-xl border border-border";
                          parent.innerHTML = '<span>Photo Error</span>';
                        }
                      }}
                    />
                  </div>
                ))
              ) : (
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="bg-secondary rounded-xl md:rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs md:text-sm aspect-square">
                    Empty
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/mainpage/edit-profile')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
          >
            Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 rounded-2xl py-4 font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            <FiLogOut size={20} />
            Log Out
          </button>
        </div>

        {/* Hidden inputs & modals */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {uploading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
              <span className="text-foreground font-medium">Uploading photo...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
