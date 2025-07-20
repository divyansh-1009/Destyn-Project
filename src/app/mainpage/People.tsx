"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";

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

type User = {
  name: string;
  email: string;
  answers: Record<string, string>;
  profilePhotos?: string[];
  bio?: string;
  interests?: string[];
  age?: number;
  location?: string;
};

export default function People() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: [18, 99],
    location: "",
    interests: [] as string[],
  });
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    setLoading(true);
    fetchUsers();
  }, [session?.user?.email, filters]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/get-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          ...filters,
        }),
      });
      const data = await response.json();
      setUsers(data.users || []);
      setCurrent(0);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!users[current]) return;

    try {
      await fetch("/api/like-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUserEmail: session?.user?.email,
          likedUserEmail: users[current].email,
        }),
      });

      // Show like animation
      setSwipeDirection("right");
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % users.length);
        setSwipeDirection(null);
      }, 300);
    } catch (error) {
      console.error("Error liking user:", error);
    }
  };

  const handlePass = () => {
    setSwipeDirection("left");
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % users.length);
      setSwipeDirection(null);
    }, 300);
  };

  const handleBlock = async () => {
    if (!users[current]) return;

    try {
      await fetch("/api/block-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUserEmail: session?.user?.email,
          blockedUserEmail: users[current].email,
        }),
      });

      // Remove from list and move to next
      setUsers((prev) => prev.filter((_, index) => index !== current));
      if (current >= users.length - 1) {
        setCurrent(0);
      }
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleReport = async () => {
    if (!users[current]) return;

    const reason = prompt("Please enter the reason for reporting this user:");
    if (!reason) return;

    try {
      await fetch("/api/report-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUserEmail: session?.user?.email,
          reportedUserEmail: users[current].email,
          reason,
        }),
      });

      alert("User reported successfully");
      handlePass(); // Move to next user
    } catch (error) {
      console.error("Error reporting user:", error);
    }
  };

  // Touch/Mouse handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX - dragStart.x;
    const y = e.touches[0].clientY - dragStart.y;
    setDragOffset({ x, y });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        handleLike();
      } else {
        handlePass();
      }
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const x = e.clientX - dragStart.x;
    const y = e.clientY - dragStart.y;
    setDragOffset({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        handleLike();
      } else {
        handlePass();
      }
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAgeChange = (idx: number, value: number) => {
    const newRange = [...filters.ageRange] as [number, number];
    newRange[idx] = value;
    setFilters({ ...filters, ageRange: newRange });
  };

  const toggleInterest = (interest: string) => {
    setFilters((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
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
        <div style={{ fontSize: "18px" }}>Loading people...</div>
      </div>
    );
  }

  const user = users[current];

  if (!user) {
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
        <div style={{ fontSize: "48px", marginBottom: 16, opacity: 0.5 }}>
          👥
        </div>
        <div style={{ fontSize: "20px", marginBottom: 8 }}>
          No more people to show
        </div>
        <div style={{ fontSize: "14px", color: "#666" }}>
          Check back later for new profiles
        </div>
      </div>
    );
  }

  const cardTransform = `translate(${dragOffset.x}px, ${
    dragOffset.y
  }px) rotate(${dragOffset.x * 0.1}deg)`;
  const cardOpacity = 1 - Math.abs(dragOffset.x) / 200;

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 500,
        margin: "0 auto",
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
          👥 Discover People
        </h1>
        <p
          style={{
            color: "#888",
            fontSize: "16px",
            margin: 0,
          }}
        >
          Swipe through profiles and find your match
        </p>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {showFilters ? "Hide" : "Show"} Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div
          style={{
            marginBottom: 24,
            background: "#111",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #333",
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Filters</h3>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontSize: "14px" }}
            >
              Age Range:
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number"
                min={18}
                max={99}
                value={filters.ageRange[0]}
                onChange={(e) => handleAgeChange(0, Number(e.target.value))}
                style={{
                  width: 60,
                  padding: "4px 8px",
                  background: "#222",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: 4,
                }}
              />
              <span>to</span>
              <input
                type="number"
                min={18}
                max={99}
                value={filters.ageRange[1]}
                onChange={(e) => handleAgeChange(1, Number(e.target.value))}
                style={{
                  width: 60,
                  padding: "4px 8px",
                  background: "#222",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: 4,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontSize: "14px" }}
            >
              Location:
            </label>
            <input
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Enter location..."
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "#222",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: 4,
              }}
            />
          </div>

          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontSize: "14px" }}
            >
              Interests:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 16,
                    border: filters.interests.includes(interest)
                      ? "2px solid #0070f3"
                      : "1px solid #333",
                    background: filters.interests.includes(interest)
                      ? "#0070f3"
                      : "#222",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Swipe Card */}
      <div
        ref={cardRef}
        style={{
          border: "1px solid #333",
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
          textAlign: "center",
          background: "#111",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          transform: cardTransform,
          opacity: cardOpacity,
          transition: swipeDirection ? "all 0.3s ease" : "none",
          cursor: "grab",
          userSelect: "none",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Photo Gallery */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {(user.profilePhotos || [user.profilePhoto])
            .slice(0, 3)
            .map((photo, idx) => (
              <div
                key={idx}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #333",
                  overflow: "hidden",
                }}
              >
                {photo ? (
                  <img
                    src={photo}
                    alt={`${user.name}'s profile`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "24px", color: "#666" }}>👤</span>
                )}
              </div>
            ))}
        </div>

        <h3
          style={{
            fontSize: "24px",
            fontWeight: "600",
            margin: "0 0 8px 0",
            color: "#fff",
          }}
        >
          {user.name}
        </h3>

        <p
          style={{
            color: "#888",
            fontSize: "14px",
            margin: "0 0 16px 0",
          }}
        >
          {user.email}
        </p>

        {/* Bio */}
        {user.bio && (
          <p
            style={{
              color: "#fff",
              fontSize: "14px",
              margin: "0 0 16px 0",
              lineHeight: 1.4,
            }}
          >
            {user.bio}
          </p>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            {user.interests.map((interest) => (
              <span
                key={interest}
                style={{
                  padding: "4px 8px",
                  background: "#0070f3",
                  color: "#fff",
                  borderRadius: 12,
                  fontSize: "12px",
                }}
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* User Info */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginBottom: 16,
            fontSize: "12px",
            color: "#888",
          }}
        >
          {user.age && <span>Age: {user.age}</span>}
          {user.location && <span>📍 {user.location}</span>}
        </div>

        {/* Answers */}
        <div
          style={{
            textAlign: "left",
            marginTop: 24,
            background: "#0a0a0a",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #333",
          }}
        >
          <h4
            style={{
              color: "#fff",
              margin: "0 0 16px 0",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            About {user.name}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {user.answers &&
              Object.entries(user.answers).map(([qid, ans]) => (
                <div
                  key={qid}
                  style={{
                    padding: "12px 16px",
                    background: "#111",
                    borderRadius: 8,
                    border: "1px solid #333",
                  }}
                >
                  <div
                    style={{
                      color: "#0070f3",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    {qid}
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  >
                    {ans}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
      >
        <button
          style={{
            flex: 1,
            padding: "16px 0",
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#d32f2f")}
          onMouseLeave={(e) => (e.target.style.background = "#f44336")}
          onClick={handlePass}
        >
          ✖️ Pass
        </button>

        <button
          style={{
            flex: 1,
            padding: "16px 0",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#45a049")}
          onMouseLeave={(e) => (e.target.style.background = "#4caf50")}
          onClick={handleLike}
        >
          ❤️ Like
        </button>
      </div>

      {/* Additional Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 16,
        }}
      >
        <button
          style={{
            padding: "8px 16px",
            background: "#ff9800",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={handleBlock}
        >
          🚫 Block
        </button>

        <button
          style={{
            padding: "8px 16px",
            background: "#9c27b0",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={handleReport}
        >
          ⚠️ Report
        </button>
      </div>
    </div>
  );
}
