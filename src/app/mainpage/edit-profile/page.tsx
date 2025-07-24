"use client";

import { FaArrowLeft, FaCamera, FaHeart } from 'react-icons/fa';
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

export default function EditProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState({
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

  // Example popular interests
  const POPULAR_INTERESTS = [
    "Photography", "Music", "Travel", "Food", "Movies", "Books", "Gaming", "Sports"
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
    if (photos.length + newFiles.length > 6) {
      alert('You can upload up to 6 photos.');
    }
    const newPhotoObjs = newFiles.map((file) => ({ id: uuidv4(), preview: URL.createObjectURL(file), fileOrUrl: file }));
    setPhotos(prev => [...prev, ...newPhotoObjs].slice(0, 6));
  };

  // Delete photo
  const handleDeletePhoto = (id: string) => {
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
    if (fields.customInterest && fields.interests.length < 10 && !fields.interests.includes(fields.customInterest)) {
      setFields((prev) => ({ ...prev, interests: [...prev.interests, prev.customInterest], customInterest: "" }));
    }
  };

  const handleInterestClick = (interest: string) => {
    if (fields.interests.includes(interest)) {
      setFields((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== interest) }));
    } else if (fields.interests.length < 10) {
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
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const item = photos[i].fileOrUrl;
        if (typeof item === 'string' && item.startsWith('http')) {
          uploadedUrls.push(item);
        } else if (item instanceof File) {
          const formData = new FormData();
          formData.append("photo", item);
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
      }
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          bio: fields.bio,
          interests: fields.interests,
          profilePhotos: uploadedUrls,
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
    return <div style={{ color: "#fff", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', paddingBottom: 40 }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 12px 24px', background: '#fff', borderBottom: '1px solid #eee', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: 26, color: '#333', cursor: 'pointer' }}><FaArrowLeft /></button>
        <div style={{ fontWeight: 700, fontSize: 26, color: '#222' }}>Edit Profile</div>
        <button type="submit" form="edit-profile-form" style={{ background: 'linear-gradient(90deg, #a259f7 0%, #f857a6 100%)', color: '#fff', border: 'none', borderRadius: 20, padding: '10px 28px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px rgba(162,89,247,0.10)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><FaCamera style={{ fontSize: 18 }} /> Save</button>
      </div>
      <form id="edit-profile-form" onSubmit={handleSubmit} style={{ maxWidth: 540, margin: '0 auto', padding: '0 12px' }}>
        {/* Photos Section */}
        <div style={{ background: '#fff', borderRadius: 28, boxShadow: '0 4px 24px rgba(80,0,120,0.07)', padding: 28, margin: '32px 0 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 20, color: '#a259f7', marginBottom: 18, gap: 10 }}><FaCamera /> Photos</div>
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={[restrictToParentElement]}
          >
            <SortableContext items={photos.map((photo) => photo.id)} strategy={horizontalListSortingStrategy}>
              <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 10, overflowX: 'auto', minHeight: 110 }}>
                {photos.map((photo, idx) => (
                  <SortablePhoto
                    key={photo.id}
                    id={photo.id}
                    url={photo.preview}
                    onDelete={() => handleDeletePhoto(photo.id)}
                    isProfile={idx === 0}
                    isDragging={activeId === photo.id}
                    dragging={!!activeId}
                  />
                ))}
                {photos.length < 6 && (
                  <label style={{ width: 90, height: 90, border: '2px dashed #a259f7', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, color: '#a259f7', cursor: 'pointer', background: '#faf7ff' }}>
                    +
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoChange} />
                  </label>
                )}
              </div>
            </SortableContext>
            <DragOverlay style={{ pointerEvents: 'none' }}>
              {activePhoto ? (
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 20,
                    background: '#eee',
                    boxShadow: '0 0 0 4px #a259f7, 0 12px 32px rgba(80,0,120,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <img
                    src={activePhoto.preview}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 20,
                      objectFit: 'cover',
                      pointerEvents: 'none',
                      margin: 0,
                      padding: 0,
                      display: 'block',
                    }}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          <div style={{ color: '#888', fontSize: 15, marginTop: 6 }}>Add up to 6 photos. First photo will be your main profile picture.</div>
        </div>
        {/* About Me Section */}
        <div style={{ background: '#fff', borderRadius: 28, boxShadow: '0 4px 24px rgba(80,0,120,0.07)', padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 20, color: '#a259f7', marginBottom: 18, gap: 10 }}><FaHeart /> About Me</div>
          <label style={{ fontWeight: 600, color: '#222', marginBottom: 8, display: 'block' }}>Bio
            <textarea name="bio" value={fields.bio} onChange={handleChange} maxLength={500} rows={3} style={{ width: '100%', padding: 16, borderRadius: 16, border: '1px solid #eee', fontSize: 17, marginTop: 6, background: '#faf7ff', color: '#222', resize: 'vertical' }} />
          </label>
          <div style={{ textAlign: 'right', color: '#888', fontSize: 14 }}>{fields.bio.length}/500</div>
        </div>
        {/* Interests Section */}
        <div style={{ background: '#fff', borderRadius: 28, boxShadow: '0 4px 24px rgba(80,0,120,0.07)', padding: 28, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#a259f7', marginBottom: 12 }}>Interests</div>
          <div style={{ fontWeight: 600, color: '#222', marginBottom: 8 }}>Your Interests ({fields.interests.length}/10)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {fields.interests.map((interest, idx) => (
              <span key={idx} style={{ background: 'linear-gradient(90deg, #a259f7 0%, #f857a6 100%)', color: '#fff', borderRadius: 16, padding: '8px 18px', fontSize: 16, fontWeight: 600, letterSpacing: 0.2, display: 'flex', alignItems: 'center', gap: 8 }}>
                {interest}
                <button type="button" onClick={() => handleRemoveInterest(interest)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, marginLeft: 4, cursor: 'pointer' }}>&times;</button>
              </span>
            ))}
          </div>
          <div style={{ fontWeight: 600, color: '#222', marginBottom: 8 }}>Popular Interests</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {POPULAR_INTERESTS.map((interest, idx) => (
              <button key={idx} type="button" onClick={() => handleInterestClick(interest)} style={{ background: fields.interests.includes(interest) ? 'linear-gradient(90deg, #a259f7 0%, #f857a6 100%)' : '#faf7ff', color: fields.interests.includes(interest) ? '#fff' : '#a259f7', border: 'none', borderRadius: 16, padding: '8px 18px', fontSize: 16, fontWeight: 600, letterSpacing: 0.2, cursor: 'pointer' }}>+ {interest}</button>
            ))}
          </div>
        </div>
        {error && <div style={{ color: '#f44336', marginTop: 12 }}>{error}</div>}
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
      style={{
        width: 90,
        height: 90,
        borderRadius: 20,
        objectFit: 'cover',
        background: '#eee',
        position: 'relative',
        boxShadow: isDragging ? '0 0 0 4px #a259f7, 0 12px 32px rgba(80,0,120,0.18)' : hovered ? '0 4px 16px rgba(162,89,247,0.18)' : '0 2px 8px rgba(80,0,120,0.07)',
        transform: `${CSS.Transform.toString(transform)}${isDragging ? ' scale(1.10)' : hovered ? ' scale(1.04)' : ''}`,
        transition: 'box-shadow 0.18s, transform 0.18s, opacity 0.18s',
        marginRight: 8,
        marginBottom: 8,
        border: isProfile ? '2px solid #a259f7' : hovered ? '2px solid #c3a6f7' : '2px solid transparent',
        cursor: hovered ? 'pointer' : 'default',
        opacity: dragging && !isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1000 : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      aria-label={isProfile ? 'Profile photo' : 'Photo'}
    >
      <img src={url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: 20, objectFit: 'cover', pointerEvents: 'none' }} />
      {/* Drag handle (6 dots) */}
      <div
        {...listeners}
        style={{
          position: 'absolute',
          left: 6,
          top: 6,
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: isDragging ? 'rgba(162,89,247,0.25)' : hovered ? 'rgba(162,89,247,0.13)' : 'rgba(255,255,255,0.01)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          zIndex: 2,
          opacity: hovered || isDragging ? 1 : 0.7,
          transition: 'background 0.18s, opacity 0.18s',
          boxShadow: isDragging ? '0 2px 8px #a259f7aa' : undefined,
        }}
        aria-label="Drag to reorder"
        title="Drag to reorder"
      >
        <svg width="28" height="28" viewBox="0 0 18 18">
          <circle cx="4" cy="5" r="2" fill="#a259f7" />
          <circle cx="4" cy="13" r="2" fill="#a259f7" />
          <circle cx="9" cy="5" r="2" fill="#a259f7" />
          <circle cx="9" cy="13" r="2" fill="#a259f7" />
          <circle cx="14" cy="5" r="2" fill="#a259f7" />
          <circle cx="14" cy="13" r="2" fill="#a259f7" />
        </svg>
      </div>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          background: hovered ? 'linear-gradient(90deg, #f857a6 0%, #a259f7 100%)' : '#fff',
          color: hovered ? '#fff' : '#a259f7',
          border: 'none',
          borderRadius: '50%',
          width: 28,
          height: 28,
          fontWeight: 700,
          fontSize: 20,
          cursor: 'pointer',
          boxShadow: hovered ? '0 2px 8px #a259f7aa' : '0 1px 4px rgba(162,89,247,0.10)',
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
        <div style={{ position: 'absolute', left: 0, bottom: 0, background: 'linear-gradient(90deg, #a259f7 0%, #f857a6 100%)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: '0 12px 0 20px', padding: '2px 10px', letterSpacing: 0.5 }}>Profile</div>
      )}
    </div>
  );
} 