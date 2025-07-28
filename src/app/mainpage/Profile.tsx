"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { FaCamera } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { useImageCompression } from "@/lib/useImageCompression";
import CompressionProgress from "@/components/CompressionProgress";

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image compression hook
  const {
    compressSingleImage,
    state: compressionState,
    compressionInfo,
    isCompressing
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
          console.log('Profile data received:', data); // Debug log
          setProfile(data);
          // Set the first photo as profile photo, or use the single profilePhoto if no array
          if (Array.isArray(data.profilePhotos) && data.profilePhotos.length > 0) {
            setProfilePhoto(data.profilePhotos[0]);
          } else {
            setProfilePhoto(data.profilePhoto || null);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      }
    };
    fetchProfile();
  }, [session?.user?.email]);

  // Add effect to refresh data when component becomes visible (e.g., after returning from edit profile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.email) {
        // Refresh profile data when page becomes visible
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
            console.error("Error refreshing profile:", error);
          }
        };
        fetchProfile();
      }
    };

    const handleFocus = () => {
      if (session?.user?.email) {
        // Refresh profile data when window gains focus
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
            console.error("Error refreshing profile:", error);
          }
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
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    setUploading(true);
    try {
      // Compress image before upload
      const compressedImage = await compressSingleImage(file);
      
      const formData = new FormData();
      formData.append("photo", compressedImage.file);
      formData.append("userEmail", session.user.email);
      const response = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        // Refresh the profile data to get updated photos
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
      console.error("Error uploading photo:", error);
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
      console.error("Error during logout:", error);
      router.push('/');
    }
  };

  // Helper: get age from birthdate string (YYYY-MM-DD)
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

  // Get all user photos (profilePhotos array or fallback to single profilePhoto)
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

  // Show loading state while session is loading
  if (!session) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '20px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      padding: '20px',
      color: '#ffffff'
    }}>
      {/* Compression Progress Overlay */}
      <CompressionProgress 
        state={compressionState}
        compressionInfo={compressionInfo}
        showCompressionInfo={false}
      />
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        
        {/* Black Card Container */}
        <div style={{
          background: '#000000',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          marginBottom: '20px'
        }}>
          
          {/* Profile Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '32px',
            gap: '16px'
          }}>
          {/* Circular Profile Picture */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px solid #4FC3F7',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {profilePhoto ? (
              <img 
                src={profilePhoto} 
                alt="Profile" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #333; color: white; font-size: 32px;">👤</div>';
                  }
                }}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                👤
              </div>
            )}
            {/* Camera icon overlay */}
            <div 
              onClick={triggerFileInput}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: '#4FC3F7',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#000',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = '#29B6F6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#4FC3F7';
              }}
            >
              <FaCamera />
            </div>
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '30px', 
              fontWeight: 'bold', 
              marginBottom: '4px',
              color: '#ffffff',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              lineHeight: '1.2'
            }}>
              {profile?.name || 'User Name'}
            </div>
            <div style={{ 
              fontSize: '20px', 
              color: '#cccccc',
              marginBottom: '2px'
            }}>
              {profile?.birthdate ? `${getAge(profile.birthdate)} years old` : 'Age not set'}
            </div>
            <div style={{ 
              fontSize: '19px', 
              color: '#999999',
              fontWeight: '600'
            }}>
              {profile?.gender ? profile.gender : 'Gender not set'}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '12px',
            fontSize: '25px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            Bio
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '20px',
            color: '#ffffff',
            fontSize: '18px',
            lineHeight: '1.5',
            minHeight: profile?.bio && profile.bio.length > 100 ? '120px' : 'auto'
          }}>
            {profile?.bio ? profile.bio : (
              <span style={{ color: '#cccccc', fontStyle: 'italic' }}>
                No bio added yet. Click "Edit Profile" to add your bio!
              </span>
            )}
          </div>
        </div>

        {/* Interests Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '12px',
            fontSize: '25px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            Interests
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '20px',
            minHeight: '120px'
          }}>
            {Array.isArray(profile?.interests) && profile.interests.length > 0 ? (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {profile.interests.map((interest: string, index: number) => (
                  <div key={index} style={{
                    background: '#cccccc',
                    color: '#333',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    {interest}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                gridTemplateRows: 'repeat(2, 1fr)',
                height: '80px'
              }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} style={{
                    background: '#cccccc',
                    borderRadius: '8px',
                    height: '32px'
                  }}></div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '12px',
            fontSize: '25px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            Posts ({userPhotos.length} photos)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            gridTemplateRows: 'repeat(2, 1fr)',
            height: '300px'
          }}>
            {userPhotos.length > 0 ? (
              userPhotos.slice(0, 6).map((photo: string, index: number) => (
                <div key={index} style={{
                  borderRadius: '12px',
                  border: '2px solid #4FC3F7',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#333'
                }}>
                  <img 
                    src={photo} 
                    alt={`Post ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      // Handle image load errors
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.style.background = '#ff4444';
                        parent.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 12px;">Photo Error</div>';
                      }
                    }}
                  />
                </div>
              ))
            ) : (
              Array.from({ length: 6 }, (_, i) => (
                <div key={i} style={{
                  background: '#333',
                  borderRadius: '12px',
                  border: '2px solid #4FC3F7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  No Photo
                </div>
              ))
            )}
          </div>
        </div>

        </div>

        {/* Buttons */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => router.push('/mainpage/edit-profile')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              border: '2px solid #4FC3F7',
              borderRadius: '12px',
              padding: '16px 0',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Edit profile
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ff4444 0%, #ff6b6b 100%)',
              color: '#ffffff',
              border: '2px solid #ff6b6b',
              borderRadius: '12px',
              padding: '16px 0',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 68, 68, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FiLogOut size={20} />
            Log Out
          </button>
        </div>

        {/* Hidden file input for photo upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />

        {/* Uploading indicator */}
        {uploading && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 1000
          }}>
            Uploading photo...
          </div>
        )}
      </div>
    </div>
  );
}
