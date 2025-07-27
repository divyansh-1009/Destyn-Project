"use client";

import { FaArrowLeft, FaCamera, FaHeart } from 'react-icons/fa';
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

export default function EditProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<{
    name: string;
    age: string;
    bio: string;
    interests: string[];
    customInterest: string;
    birthdate: string;
  }>({
    name: "",
    age: "",
    bio: "",
    interests: [],
    customInterest: "",
    birthdate: "",
  });
  // Replace photoFiles and photoPreviews with a single array:
  const [photos, setPhotos] = useState<{ id: string, preview: string, fileOrUrl: File | string }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePhoto = photos.find(p => p.id === activeId) || null;

  // All 30 interests from the welcome page
  const ALL_INTERESTS = [
    "Music", "Movies", "Sports", "Travel", "Reading", "Cooking", "Dancing", "Gaming", "Art", "Photography", 
    "Fitness", "Yoga", "Meditation", "Technology", "Science", "Nature", "Animals", "Fashion", "Shopping", 
    "Writing", "Blogging", "Volunteering", "Gardening", "Hiking", "Cycling", "Swimming", "Board Games", 
    "Podcasts", "DIY", "Cars"
  ];

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
          const loadedPhotos = (data.profilePhotos || (data.profilePhoto ? [data.profilePhoto] : [])).map((url: string) => ({ id: uuidv4(), preview: url, fileOrUrl: url }));
          setPhotos(loadedPhotos);
          setFields({
            name: data.name || "",
            age: data.birthdate ? String(new Date().getFullYear() - new Date(data.birthdate).getFullYear()) : "",
            bio: data.bio || "",
            interests: Array.isArray(data.interests) ? data.interests : [],
            customInterest: "",
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

  // Add photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowed = Math.max(0, 6 - photos.length);
    const newFiles = files.slice(0, allowed);
    
    // Validate file sizes
    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }
    }
    
    if (photos.length + newFiles.length > 6) {
      alert('You can upload up to 6 photos.');
    }
    const newPhotoObjs = newFiles.map((file) => ({ id: uuidv4(), preview: URL.createObjectURL(file), fileOrUrl: file }));
    setPhotos(prev => [...prev, ...newPhotoObjs].slice(0, 6));
  };

  // Delete photo
  const handleDeletePhoto = async (id: string) => {
    const photoToDelete = photos.find(photo => photo.id === id);
    if (!photoToDelete) return;

    // If it's an existing photo URL (not a new file), delete from Cloudinary
    if (typeof photoToDelete.fileOrUrl === 'string' && photoToDelete.fileOrUrl.startsWith('http')) {
      try {
        const response = await fetch("/api/delete-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session?.user?.email,
            photoUrl: photoToDelete.fileOrUrl
          }),
        });

        if (!response.ok) {
          console.error("Failed to delete photo from Cloudinary");
        }
      } catch (error) {
        console.error("Error deleting photo:", error);
      }
    }

    // Remove from local state
    setPhotos(prev => prev.filter((photo) => photo.id !== id));
  };

  // Drag and drop reorder
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (active.id !== over.id) {
      setPhotos((prev) => {
        const oldIndex = prev.findIndex((photo) => photo.id === active.id);
        const newIndex = prev.findIndex((photo) => photo.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };
  const handleDragCancel = () => setActiveId(null);

  const handleAddCustomInterest = () => {
    if (fields.customInterest && !fields.interests.includes(fields.customInterest)) {
      setFields((prev) => ({ ...prev, interests: [...prev.interests, prev.customInterest], customInterest: "" }));
    }
  };

  const handleInterestClick = (interest: string) => {
    if (fields.interests.includes(interest)) {
      setFields((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== interest) }));
    } else {
      setFields((prev) => ({ ...prev, interests: [...prev.interests, interest] }));
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFields((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== interest) }));
  };

  // On save, upload new files and send ordered URLs
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      // Validate required fields
      if (!fields.bio.trim() || fields.bio.trim().length < 1) {
        setError("Bio must have at least 1 character");
        setSubmitting(false);
        return;
      }

      if (fields.interests.length === 0) {
        setError("Please select at least one interest");
        setSubmitting(false);
        return;
      }

      if (photos.length === 0) {
        setError("Please upload at least one profile photo");
        setSubmitting(false);
        return;
      }

      // Upload new photos and collect all photo URLs
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const item = photos[i].fileOrUrl;
        if (typeof item === 'string' && item.startsWith('http')) {
          // This is an existing photo URL
          uploadedUrls.push(item);
        } else if (item instanceof File) {
          // This is a new file that needs to be uploaded
          const formData = new FormData();
          formData.append("photo", item);
          formData.append("userEmail", session?.user?.email ?? "");
          
          const response = await fetch("/api/upload-photo", {
            method: "POST",
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            uploadedUrls.push(data.photoUrl);
          } else {
            const errorData = await response.json();
            throw new Error(`Failed to upload photo: ${errorData.error || 'Unknown error'}`);
          }
        }
      }

      // Update profile with all changes
      const updateResponse = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          bio: fields.bio.trim(),
          interests: fields.interests,
          profilePhotos: uploadedUrls,
          name: session?.user?.name || fields.name,
        }),
      });

      if (updateResponse.ok) {
        setSuccess("Profile updated successfully!");
        // Redirect after a short delay to show success message
        setTimeout(() => router.push("/mainpage?tab=profile"), 1200);
      } else {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#fff", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  return (
    <div className="edit-profile-root" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingBottom: 40 }}>
      <style jsx>{`
        .edit-profile-root > form {
          width: 100%;
          max-width: 540px;
          margin: 0 auto;
          padding: 0 12px;
        }
        @media (min-width: 900px) {
          .edit-profile-root > form {
            width: 80vw;
            max-width: 1100px;
            padding: 0 0;
          }
        }
      `}</style>
      {/* Top Navigation Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 64,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: 26, color: '#ffffff', cursor: 'pointer' }}><FaArrowLeft /></button>
        <div style={{ fontWeight: 700, fontSize: 26, color: '#ffffff', textAlign: 'center', flex: 1 }}>Edit Profile</div>
        <button
          onClick={handleSubmit}
          disabled={submitting || !fields.bio.trim() || fields.interests.length === 0 || photos.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            height: 44,
            borderRadius: 22,
            border: 'none',
            background: (submitting || !fields.bio.trim() || fields.interests.length === 0 || photos.length === 0) 
              ? 'linear-gradient(90deg, #666666 0%, #888888 100%)' 
              : 'linear-gradient(90deg, #4FC3F7 0%, #29B6F6 100%)',
            color: (submitting || !fields.bio.trim() || fields.interests.length === 0 || photos.length === 0) 
              ? '#999999' 
              : '#000000',
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(79,195,247,0.3)',
            cursor: (submitting || !fields.bio.trim() || fields.interests.length === 0 || photos.length === 0) 
              ? 'not-allowed' 
              : 'pointer',
            outline: 'none',
            margin: 0,
            width: 110,
            transition: 'all 0.3s ease',
          }}
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </div>
      {/* Add a spacer div after the nav bar to push content down */}
      <div style={{ height: 64 }} />
      <form id="edit-profile-form" onSubmit={handleSubmit}>
        {/* Photos Section */}
        <div style={{ background: '#000000', borderRadius: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28, margin: '32px 0 24px 0', border: '2px solid #4FC3F7' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 20, color: '#4FC3F7', marginBottom: 18, gap: 10 }}><FaCamera /> Photos <span style={{ color: '#ff4444', fontSize: '14px' }}>*</span></div>
          {/* In the photo area, just display the photos in a grid with delete buttons. Remove all drag-and-drop logic and components. */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 90px)',
            gridAutoRows: '110px',
            gap: 18,
            alignItems: 'center',
            marginBottom: 10,
            justifyContent: 'center',
            width: '100%',
            maxWidth: 350,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 20,
                  background: '#333',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(79,195,247,0.2)',
                  marginRight: 0,
                  marginBottom: 0,
                  border: idx === 0 ? '2px solid #4FC3F7' : '2px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src={photo.preview} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: 20, objectFit: 'cover', pointerEvents: 'none' }} />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); e.preventDefault(); handleDeletePhoto(photo.id); }}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: '#000000',
                    color: '#4FC3F7',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    fontWeight: 700,
                    fontSize: 20,
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(79,195,247,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                  }}
                  aria-label="Delete photo"
                >
                  ×
                </button>
                {idx === 0 && (
                  <div style={{ position: 'absolute', left: 0, bottom: 0, background: 'linear-gradient(90deg, #4FC3F7 0%, #29B6F6 100%)', color: '#000000', fontSize: 11, fontWeight: 700, borderRadius: '0 12px 0 20px', padding: '2px 10px', letterSpacing: 0.5 }}>Profile</div>
                )}
              </div>
            ))}
            {photos.length < 6 && (
              <label style={{ width: 90, height: 90, border: '2px dashed #4FC3F7', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, color: '#4FC3F7', cursor: 'pointer', background: '#1a1a1a' }}>
                +
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoChange} />
              </label>
            )}
          </div>
          <div style={{ color: '#cccccc', fontSize: 15, marginTop: 6 }}>
            Add up to 6 photos. First photo will be your main profile picture.
            {photos.length === 0 && <span style={{ color: '#ff4444', display: 'block', marginTop: 4 }}>• At least one photo required</span>}
          </div>
        </div>
        {/* About Me Section */}
        <div style={{ background: '#000000', borderRadius: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28, marginBottom: 24, border: '2px solid #4FC3F7' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 20, color: '#4FC3F7', marginBottom: 18, gap: 10 }}><FaHeart /> About Me</div>
          <label style={{ fontWeight: 600, color: '#ffffff', marginBottom: 8, display: 'block' }}>
            Bio <span style={{ color: '#ff4444', fontSize: '14px' }}>*</span>
          </label>
          <textarea name="bio" value={fields.bio} onChange={handleChange} maxLength={500} rows={3} style={{ width: '100%', padding: 16, borderRadius: 16, border: '1px solid #333', fontSize: 17, marginTop: 6, background: '#1a1a1a', color: '#ffffff', resize: 'vertical' }} />
          <div style={{ textAlign: 'right', color: '#cccccc', fontSize: 14 }}>
            {fields.bio.length}/500 {!fields.bio.trim() && <span style={{ color: '#ff4444' }}>• Minimum 1 character required</span>}
          </div>
        </div>
        {/* Interests Section */}
        <div style={{ background: '#000000', borderRadius: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: 28, marginBottom: 24, border: '2px solid #4FC3F7' }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#4FC3F7', marginBottom: 12 }}>Interests</div>
          <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: 8 }}>
            Your Interests ({fields.interests.length} selected) <span style={{ color: '#ff4444', fontSize: '14px' }}>*</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {fields.interests.map((interest, idx) => (
              <span key={idx} style={{ background: 'linear-gradient(90deg, #4FC3F7 0%, #29B6F6 100%)', color: '#000000', borderRadius: 16, padding: '8px 18px', fontSize: 16, fontWeight: 600, letterSpacing: 0.2, display: 'flex', alignItems: 'center', gap: 8 }}>
                {interest}
                <button type="button" onClick={() => handleRemoveInterest(interest)} style={{ background: 'none', border: 'none', color: '#000000', fontSize: 18, marginLeft: 4, cursor: 'pointer' }}>&times;</button>
              </span>
            ))}
          </div>
          {fields.interests.length === 0 && (
            <div style={{ color: '#ff4444', fontSize: 14, marginBottom: 8 }}>• At least one interest required</div>
          )}
          <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: 8 }}>All Interests</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ALL_INTERESTS.map((interest, idx) => (
              <button key={idx} type="button" onClick={() => handleInterestClick(interest)} style={{ background: fields.interests.includes(interest) ? 'linear-gradient(90deg, #4FC3F7 0%, #29B6F6 100%)' : '#1a1a1a', color: fields.interests.includes(interest) ? '#000000' : '#4FC3F7', border: 'none', borderRadius: 16, padding: '8px 18px', fontSize: 16, fontWeight: 600, letterSpacing: 0.2, cursor: 'pointer' }}>+ {interest}</button>
            ))}
          </div>
        </div>
        {error && <div style={{ color: '#ff4444', marginTop: 12 }}>{error}</div>}
        {success && <div style={{ color: '#4caf50', marginTop: 12 }}>{success}</div>}
      </form>
    </div>
  );
}

// Sortable photo item component
function SortablePhoto({ id, url, onDelete, isProfile, isDragging = false, dragging = false }: { id: string, url: string, onDelete: () => void, isProfile: boolean, isDragging?: boolean, dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        width: 90,
        height: 90,
        borderRadius: 20,
        background: '#333',
        position: 'relative',
        boxShadow: isDragging ? '0 0 0 4px #4FC3F7, 0 12px 32px rgba(79,195,247,0.3)' : hovered ? '0 4px 16px rgba(79,195,247,0.3)' : '0 2px 8px rgba(79,195,247,0.2)',
        transform: `${CSS.Transform.toString(transform)}${isDragging ? ' scale(1.10)' : hovered ? ' scale(1.04)' : ''}`,
        transition: 'box-shadow 0.18s, transform 0.18s, opacity 0.18s',
        marginRight: 0,
        marginBottom: 0,
        border: isProfile ? '2px solid #4FC3F7' : hovered ? '2px solid #29B6F6' : '2px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hovered ? 'grab' : 'default',
        opacity: dragging && !isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1000 : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      aria-label={isProfile ? 'Profile photo' : 'Photo'}
    >
      <img src={url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: 20, objectFit: 'cover', pointerEvents: 'none' }} />
      <button
        type="button"
        onClick={e => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          background: '#000000',
          color: '#4FC3F7',
          border: 'none',
          borderRadius: '50%',
          width: 28,
          height: 28,
          fontWeight: 700,
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: '0 1px 4px rgba(79,195,247,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
        }}
        aria-label="Delete photo"
      >
        ×
      </button>
      {isProfile && (
        <div style={{ position: 'absolute', left: 0, bottom: 0, background: 'linear-gradient(90deg, #4FC3F7 0%, #29B6F6 100%)', color: '#000000', fontSize: 11, fontWeight: 700, borderRadius: '0 12px 0 20px', padding: '2px 10px', letterSpacing: 0.5 }}>Profile</div>
      )}
    </div>
  );
}