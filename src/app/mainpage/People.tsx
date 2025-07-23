"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  answers: Record<string, string>;
  profilePhoto?: string;
  profilePhotos?: string[];
};

const QUESTION_LABELS = {
  "q1": "Activities together",
  "q2": "Comfort activity",
  "q3": "Reading preference",
  "q4": "Response to compliments",
  "q5": "Music vibe",
  "q6": "Relationship experience",
  "q7": "Snack preference",
  "q8": "Food vibe",
  "q9": "Personality",
  "q10": "Attracted to",
  "q11": "When liking someone",
  "q12": "Personal space",
  "q13": "Relationship vibe",
  "q14": "Showing interest"
};

export default function People() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);

  // Function to fetch fresh data
  const fetchUsers = async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    
    try {
      // Fetch users and liked users simultaneously
      const [usersResponse, likedResponse] = await Promise.all([
        fetch("/api/get-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        }),
        fetch("/api/get-liked-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        })
      ]);

      const usersData = await usersResponse.json();
      const likedData = await likedResponse.json();
      
      const allUsers = usersData.users || [];
      const liked = likedData.liked || [];
      
      // Filter out already liked users and current user
      const availableUsers = allUsers.filter((user: User) => 
        !liked.includes(user.email) && user.email !== session.user.email
      );
      
      setUsers(availableUsers);
      setLikedUsers(liked);
      setCurrent(0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on mount and when session changes
  useEffect(() => {
    fetchUsers();
  }, [session?.user?.email]);

  // Add visibility change listener to refresh when user comes back to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.email) {
        fetchUsers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.user?.email]);

  if (loading)
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#fff",
          background: "transparent", // Changed from #000 to transparent
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: "18px" }}>Loading people...</div>
      </div>
    );

  const user = users[current];

  if (!user) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#fff",
          background: "transparent", // Changed from #000 to transparent
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: 16, opacity: 0.5 }}>
          👥
        </div>
        <div style={{ fontSize: "20px", marginBottom: 8 }}>
          No more people to show
        </div>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: 20 }}>
          Check back later for new profiles
        </div>
        <button
          onClick={fetchUsers}
          style={{
            padding: "12px 24px",
            background: "#667eea",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#5a6fd8")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#667eea")
          }
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  const handleLike = async () => {
    try {
      await fetch("/api/like-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUserEmail: session?.user?.email,
          likedUserEmail: user.email,
        }),
      });
      
      // Update liked users list locally
      setLikedUsers(prev => [...prev, user.email]);
      
      // Remove this user from the list
      const newUsers = users.filter((_, index) => index !== current);
      setUsers(newUsers);
      
      // Adjust current index if needed
      if (current >= newUsers.length && newUsers.length > 0) {
        setCurrent(0);
      }
      
      // If no more users, try to fetch fresh data
      if (newUsers.length === 0) {
        setTimeout(fetchUsers, 500); // Small delay to allow DB update
      }
    } catch (error) {
      console.error("Error liking user:", error);
    }
  };

  const handlePass = () => {
    // Move to next user without liking
    const nextIndex = (current + 1) % users.length;
    setCurrent(nextIndex);
    
    // If we've gone through all users, fetch fresh data
    if (nextIndex === 0 && users.length > 1) {
      setTimeout(fetchUsers, 1000);
    }
  };

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 500,
        margin: "0 auto",
        background: "transparent", // Changed from #000 to transparent
        color: "#fff",
      }}
    >
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
        <div
          style={{
            color: "#666",
            fontSize: "12px",
            marginTop: 8,
          }}
        >
          {current + 1} of {users.length} • {users.length} people available
        </div>
      </div>

      <div
        style={{
          border: "1px solid #333",
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
          textAlign: "center",
          background: "#111",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Profile Photo */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#1a1a1a",
            margin: "0 auto 20px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            color: "#666",
            border: "2px solid #333",
            overflow: "hidden",
          }}
        >
          {(user.profilePhotos && user.profilePhotos.length > 0) || user.profilePhoto ? (
            <img
              src={user.profilePhotos?.[0] || user.profilePhoto}
              alt={`${user.name}'s profile`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                console.error("Error loading image:", e);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span>👤</span>
          )}
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
            margin: "0 0 24px 0",
          }}
        >
          {user.email}
        </p>

        <div
          style={{
            textAlign: "left",
            marginTop: 24,
            background: "#0a0a0a",
            borderRadius: 12,
            padding: 20,
            border: "1px solid #333",
            maxHeight: "300px",
            overflowY: "auto"
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
                    {QUESTION_LABELS[qid as keyof typeof QUESTION_LABELS] || qid}
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      lineHeight: "1.4"
                    }}
                  >
                    {ans}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 16 }}
      >
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
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#45a049")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#4caf50")
          }
          onClick={handleLike}
        >
          ❤️ Like
        </button>
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
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#d32f2f")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#f44336")
          }
          onClick={handlePass}
        >
          ✖️ Pass
        </button>
      </div>
      
      {/* Refresh button at bottom */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          onClick={fetchUsers}
          style={{
            padding: "8px 16px",
            background: "transparent",
            color: "#666",
            border: "1px solid #333",
            borderRadius: 6,
            fontSize: 12,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.color = "#fff";
            (e.target as HTMLButtonElement).style.borderColor = "#666";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.color = "#666";
            (e.target as HTMLButtonElement).style.borderColor = "#333";
          }}
        >
          🔄 Check for new people
        </button>
      </div>
    </div>
  );
}
