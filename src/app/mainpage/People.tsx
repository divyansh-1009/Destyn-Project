"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ZodiacTag from "@/components/ZodiacTag";

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

function MatchNotification({ message, onClose }: { message: string, onClose: () => void }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  
  if (!message) return null;
  
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-500 text-white px-8 py-4 rounded-2xl shadow-[0_8px_30px_rgba(102,126,234,0.3)] z-[1000] font-bold text-lg text-center min-w-[320px] max-w-[90vw] border-2 border-primary/50 animate-in slide-in-from-top-4 fade-in duration-300">
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
  const [matches, setMatches] = useState<any[]>([]);
  const [matchNotification, setMatchNotification] = useState("");

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
      const likedUsersList = likedData.liked || [];
      
      let availableUsers = allUsers.filter((user: User) => 
        !likedUsersList.includes(user.email) && user.email !== session.user.email
      );
      
      const currentUserEmail = session.user.email.toLowerCase();
      
      // Filter logic (kept as is)
      if (currentUserEmail.startsWith("b22") && currentUserEmail.endsWith("@iitj.ac.in")) {
        availableUsers = availableUsers.filter((user: User) => {
          const email = user.email.toLowerCase();
          return !(
            email.startsWith("b23") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b24") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b25") && email.endsWith("@iitj.ac.in") ||
            email === "divyakumar16072006@gmail.com"
          );
        });
      } else if (currentUserEmail.startsWith("b23") && currentUserEmail.endsWith("@iitj.ac.in")) {
        availableUsers = availableUsers.filter((user: User) => {
          const email = user.email.toLowerCase();
          return !(
            email.startsWith("b22") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b24") && email.endsWith("@iitj.ac.in") || 
            email.startsWith("b25") && email.endsWith("@iitj.ac.in") ||
            email === "divyakumar16072006@gmail.com"
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
            email.startsWith("b24") && email.endsWith("@iitj.ac.in") ||
            email === "divyakumar16072006@gmail.com"
          );
        });
      } else if (currentUserEmail === "divyakumar16072006@gmail.com") {
        availableUsers = availableUsers.filter((user: User) => {
          const email = user.email.toLowerCase();
          return email.startsWith("b24") && email.endsWith("@iitj.ac.in");
        });
      }
      
      availableUsers = shuffleArray(availableUsers);
      
      setUsers(availableUsers);
      setLikedUsers(likedData.liked || []);
      setCurrent(0);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  useEffect(() => {
    if (session?.user?.email) {
      fetchUsers();
    }
  }, [session?.user?.email]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.email) {
        fetchUsers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.user?.email]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground text-xl">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = users[current];

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-10 flex flex-col items-center justify-center text-foreground text-center pb-24 md:pb-8">
        <div className="text-6xl mb-6 opacity-40">🔍</div>
        <div className="text-2xl font-bold mb-3 tracking-tight">You’ve swiped the town dry</div>
        <div className="text-muted-foreground mb-8 text-lg">Check back later for new profiles</div>
        <button
          onClick={fetchUsers}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-full font-bold transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 flex items-center gap-2"
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  const handleLike = async () => {
    try {
      const prevMatches = matches.map(m => m.email);
      await fetch("/api/like-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUserEmail: session?.user?.email,
          likedUserEmail: user.email,
        }),
      });
      
      setLikedUsers(prev => [...prev, user.email]);
      
      const newUsers = users.filter((_, index) => index !== current);
      setUsers(newUsers);
      
      if (current >= newUsers.length && newUsers.length > 0) {
        setCurrent(0);
      }
      
      if (newUsers.length === 0) {
        setTimeout(fetchUsers, 500);
      }
      
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
      }
    } catch (error) {}
  };

  const handlePass = () => {
    const nextIndex = (current + 1) % users.length;
    setCurrent(nextIndex);
    if (nextIndex === 0 && users.length > 1) {
      setTimeout(fetchUsers, 1000);
    }
  };

  function getAge(birthdate?: string) {
    if (!birthdate) return undefined;
    const dob = new Date(birthdate);
    const diff = Date.now() - dob.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }

  function getMajor(user: User) {
    return user.answers?.major || undefined;
  }

  function getDistance(user: User) {
    return user.answers?.distance || undefined;
  }

  function getSchool(user: User) {
    return user.answers?.school || undefined;
  }

  function getAbout(user: User) {
    if (user.bio) return user.bio;
    if (user.answers?.q1) return user.answers.q1;
    return undefined;
  }

  function getInterests(user: User) {
    if (user.interests) {
      return Array.isArray(user.interests)
        ? user.interests
        : user.interests.split(",").map((i) => i.trim()).filter(Boolean);
    }
    if (user.answers?.q2) {
      return Array.isArray(user.answers.q2)
        ? user.answers.q2
        : user.answers.q2.split(",").map((i) => i.trim()).filter(Boolean);
    }
    return [];
  }

  const profileImageUrl = Array.isArray(user.profilePhotos) && user.profilePhotos.length > 0 
    ? user.profilePhotos[0] 
    : user.profilePhoto;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center pb-24 md:pb-8">
      <MatchNotification message={matchNotification} onClose={() => setMatchNotification("")} />
      
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-[32px] overflow-hidden shadow-2xl border border-border relative">
          
          {/* Profile Photo */}
          <div className="relative w-full aspect-[4/5] bg-secondary group">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={user.name}
                className="w-full h-full object-cover block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avatar-placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[120px] text-muted-foreground bg-secondary">👤</div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* User Info Overlay */}
            <div className="absolute bottom-0 left-0 p-6 z-10 w-full text-white pointer-events-none">
              <div className="flex items-baseline gap-2 mb-2 drop-shadow-md">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight font-sans leading-none">
                  {user.name}
                </h2>
                {user.answers?.birthdate && (
                  <span className="text-2xl md:text-3xl font-normal opacity-90 leading-none">
                    , {getAge(user.answers.birthdate)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5 text-white/90 font-medium text-[15px] md:text-base drop-shadow-md">
                {getMajor(user) && (
                  <span className="flex items-center gap-2">
                    🎓 {getMajor(user)}
                  </span>
                )}
                {getDistance(user) && (
                  <span className="flex items-center gap-2">
                    📍 {getDistance(user)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 bg-card border-t border-border space-y-6">
            
            {/* About */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-foreground">About</h3>
                {user.answers?.birthdate && (
                  <ZodiacTag birthdate={user.answers.birthdate} size="small" />
                )}
              </div>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                {getAbout(user) || <span className="italic opacity-70">No bio provided.</span>}
              </p>
            </div>

            {/* Interests */}
            <div>
              <h3 className="font-bold text-lg text-foreground mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {getInterests(user).length > 0 ? (
                  getInterests(user).map((interest, idx) => (
                    <span
                      key={idx}
                      className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-[15px] italic">No interests listed</span>
                )}
              </div>
            </div>

            {/* School */}
            {getSchool(user) && (
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">School</h3>
                <p className="text-primary font-semibold text-[15px]">{getSchool(user)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <button
            onClick={handlePass}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all hover:scale-105 active:scale-95 text-3xl"
            aria-label="Pass"
          >
            ✖️
          </button>
          <button
            onClick={handleLike}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center text-primary hover:bg-primary/10 hover:border-primary/30 transition-all hover:scale-105 active:scale-95 text-3xl"
            aria-label="Like"
          >
            ❤️
          </button>
        </div>

        {/* Refresh button */}
        <div className="text-center mt-10">
          <button
            onClick={fetchUsers}
            className="px-6 py-2.5 bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground border border-border rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            🔄 Check for new people
          </button>
        </div>
      </div>
    </div>
  );
}
