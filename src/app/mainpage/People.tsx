"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import React from "react";

// First, update the User type to ensure bio and interests are properly typed
type User = {
  name: string;
  email: string;
  answers: Record<string, string>;
  profilePhoto?: string;
  profilePhotos?: string[];
  bio?: string;
  interests?: string[] | string;
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

// Styled notification component
function MatchNotification({ message, onClose }: { message: string, onClose: () => void }) {
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div style={{
      position: "fixed",
      top: 30,
      left: "50%",
      transform: "translateX(-50%)",
      background: "linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)",
      color: "#333",
      padding: "18px 32px",
      borderRadius: 16,
      boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      zIndex: 1000,
      fontWeight: 600,
      fontSize: 18,
      textAlign: "center",
      minWidth: 320,
      maxWidth: "90vw",
      border: "2px solid #ffb88c",
    }}>
      {message}
    </div>
  );
}

export default function People() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  // Add state to track previous matches
  const [matches, setMatches] = useState<any[]>([]);
  const [matchNotification, setMatchNotification] = useState("");

  // Function to fetch fresh data
  const fetchUsers = async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    
    try {
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
      const likedUsers = likedData.likedUsers || [];
      
      // Filter out already liked users and current user
      let availableUsers = allUsers.filter((user: User) => 
        !likedUsers.includes(user.email) && user.email !== session.user.email
      );
      
      // Apply batch-based filtering rules
      const currentUserEmail = session.user.email.toLowerCase();
      if (currentUserEmail.startsWith("b22") && currentUserEmail.endsWith("@iitj.ac.in")) {
        availableUsers = availableUsers.filter((user: User) => {
          const email = user.email.toLowerCase();
          return !(
            email.startsWith("b23") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b24") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b25") && email.endsWith("@iitj.ac.in")
          );
        });
      } else if (currentUserEmail.startsWith("b23") && currentUserEmail.endsWith("@iitj.ac.in")) {
        availableUsers = availableUsers.filter((user: User) => {
          const email = user.email.toLowerCase();
          return !(
            email.startsWith("b22") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b24") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b25") && email.endsWith("@iitj.ac.in")
          );
        });
      } else if (currentUserEmail.startsWith("b24") && currentUserEmail.endsWith("@iitj.ac.in")) {
        availableUsers = availableUsers.filter((user: User) => {
          const email = user.email.toLowerCase();
          return !(
            email.startsWith("b22") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b23") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b25") && email.endsWith("@iitj.ac.in")
          );
        });
      } else if (currentUserEmail.startsWith("b25") && currentUserEmail.endsWith("@iitj.ac.in")) {
        availableUsers = availableUsers.filter((user: User) => {
          const email = user.email.toLowerCase();
          return !(
            email.startsWith("b22") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b23") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b24") && email.endsWith("@iitj.ac.in")
          );
        });
      }
      
      // Shuffle the available users array
      availableUsers = shuffleArray(availableUsers);
      
      setUsers(availableUsers);
      setLikedUsers(likedData.likedUsers || []);
      setCurrent(0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fisher-Yates shuffle
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

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

  // Fetch matches on mount and when session changes
  const fetchMatches = async () => {
    if (!session?.user?.email) return;
    const res = await fetch("/api/get-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    });
    const data = await res.json();
    setMatches(data.matches || []);
  };

  useEffect(() => {
    fetchMatches();
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
        <div style={{ fontSize: "14px", marginBottom: 20 }}>
          Check back later for new profiles
        </div>
        <button
          onClick={fetchUsers}
          style={{
            padding: "12px 24px",
            background: "#23232b", 
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#353542")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background = "#23232b")
          }
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  const handleLike = async () => {
    try {
      // Store previous matches
      const prevMatches = matches.map(m => m.email);
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
      // Fetch new matches and check for new match
      await fetchMatches();
      const res = await fetch("/api/get-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const data = await res.json();
      const newMatch = (data.matches || []).find((m: any) => !prevMatches.includes(m.email));
      if (newMatch) {
        let msg = `✨ You and ${(newMatch.name || newMatch.email)} just matched! ✨`;
        setMatchNotification(msg);
        // TODO: To notify the other user in real-time, implement socket or push notification logic.
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

  // Helper: get age from birthdate string (YYYY-MM-DD)
  function getAge(birthdate?: string) {
    if (!birthdate) return undefined;
    const dob = new Date(birthdate);
    const diff = Date.now() - dob.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  }

  // Helper: get major (if present)
  function getMajor(user: User) {
    if (user.answers && user.answers.major) return user.answers.major;
    return undefined;
  }

  // Helper: get distance (if present)
  function getDistance(user: User) {
    if (user.answers && user.answers.distance) return user.answers.distance;
    return undefined;
  }

  // Helper: get school (if present)
  function getSchool(user: User) {
    if (user.answers && user.answers.school) return user.answers.school;
    return undefined;
  }

  // Helper: get about (if present) 
  function getAbout(user: User) {
    console.log('Getting about for user:', user.email);
    console.log('User data:', {
      bio: user.bio,
      answers: user.answers,
      q1: user.answers?.q1
    });
    
    if (user.bio) {
      console.log('Using bio:', user.bio);
      return user.bio;
    }
    if (user.answers?.q1) {
      console.log('Using answers.q1:', user.answers.q1);
      return user.answers.q1;
    }
    console.log('No bio or q1 found');
    return undefined;
  }

  // Helper: get interests as array
  function getInterests(user: User) {
    // First check for interests field directly 
    if (user.interests) {
      return Array.isArray(user.interests)
        ? user.interests
        : user.interests.split(",").map((i) => i.trim()).filter(Boolean);
    }
    // Finally fall back to answers.q2
    if (user.answers?.q2) {
      return Array.isArray(user.answers.q2)
        ? user.answers.q2
        : user.answers.q2.split(",").map((i) => i.trim()).filter(Boolean);
    }
    return [];
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 480,
        margin: "0 auto",
        background: "transparent",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <MatchNotification message={matchNotification} onClose={() => setMatchNotification("")} />
      <div
        style={{
          borderRadius: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          background: "#fff",
          overflow: "hidden",
          margin: "0 auto",
          maxWidth: 440,
        }}
      >
        {/* Profile Photo with overlay */}
        <div style={{ position: "relative", width: "100%", height: 400, background: "#eee" }}>
          {(Array.isArray(user.profilePhotos) && user.profilePhotos.length > 0 ? user.profilePhotos[0] : user.profilePhoto) ? (
            <img
              src={Array.isArray(user.profilePhotos) && user.profilePhotos.length > 0 ? user.profilePhotos[0] : user.profilePhoto}
              alt={user.name}
              style={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                display: "block",
                background: "#eee",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avatar-placeholder.svg";
              }}
            />
          ) : (
            <div style={{ width: "100%", height: 400, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, color: "#bbb", background: "#eee" }}>👤</div>
          )}
          {/* Overlay name and info (bottom left, always visible) */}
          <div style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            zIndex: 10,
            color: "#fff",
            fontSize: 36,
            fontWeight: 800,
            textShadow: "0 1px 8px rgba(0,0,0,0.18)",
            letterSpacing: 0.5,
            lineHeight: 1.1,
            pointerEvents: "none",
            textAlign: "left",
            fontFamily: "Montserrat, Mont, 'Montserrat', Arial, sans-serif",
          }}>
            {user.name}
            {user.answers?.birthdate && (
              <span style={{ fontWeight: 400, fontSize: 28, marginLeft: 8 }}>
                , {getAge(user.answers.birthdate)}
              </span>
            )}
            <div style={{
              marginTop: 10,
              fontSize: 20,
              fontWeight: 400,
              color: "#fff",
              textShadow: "0 1px 4px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              fontFamily: "Montserrat, Mont, 'Montserrat', Arial, sans-serif",
            }}>
              {getMajor(user) && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span role="img" aria-label="major">🎓</span> {getMajor(user)}
                </span>
              )}
              {getDistance(user) && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span role="img" aria-label="distance">📍</span> {getDistance(user)}
                </span>
              )}
            </div>
          </div>
          {/* Overlay gradient for readability */}
          <div style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 60,
            background: "linear-gradient(0deg, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0.01) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }} />
        </div>
        {/* Card Details */}
        <div style={{ padding: "28px 24px 18px 24px", color: "#222" }}>
          {/* About/Bio section always visible */}
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>About</div>
          <div style={{ fontSize: 15, marginBottom: 18, color: "#444" }}>
            {getAbout(user) || <span style={{ color: "#bbb" }}>No bio provided.</span>}
          </div>
          {/* Interests section below bio */}
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Interests</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18, minHeight: 36 }}>
            {getInterests(user).length > 0 ? (
              getInterests(user).map((interest, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "#f3e8ff",
                    color: "#8e24aa",
                    borderRadius: 16,
                    padding: "6px 16px",
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: 0.2,
                    boxShadow: "0 1px 4px rgba(142,36,170,0.07)",
                  }}
                >
                  {interest}
                </span>
              ))
            ) : (
              <span style={{ color: "#bbb", fontSize: 15 }}>No interests listed</span>
            )}
          </div>
          {/* School */}
          {getSchool(user) && (
            <>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>School</div>
              <div style={{ fontSize: 15, marginBottom: 18, color: "#8e24aa", fontWeight: 600 }}>{getSchool(user)}</div>
            </>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 64, marginTop: 32 }}>
        <button
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#fff",
            border: "none",
            boxShadow: "0 2px 12px rgba(244,67,54,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#f44336",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={handlePass}
          aria-label="Pass"
        >
          ✖️
        </button>
        <button
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
            border: "none",
            boxShadow: "0 2px 12px rgba(248,87,166,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={handleLike}
          aria-label="Like"
        >
          ♥
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
