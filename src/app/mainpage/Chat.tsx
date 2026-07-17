"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BlockConfirmModal from "./BlockConfirmModal";
import ReportModal from "./ReportModal";

const SOCKET_URL = typeof window !== "undefined" ? window.location.origin : "";

export default function Chat() {
  const { data: session } = useSession();
  const [newMatches, setNewMatches] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'chats'>('new');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sentMessagesRef = useRef<Set<string>>(new Set());
  const [lastMessages, setLastMessages] = useState<Record<string, any>>({});

  const router = useRouter();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages]);

  useEffect(() => {
    if (selected) scrollToBottom("auto");
  }, [selected]);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/get-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        setNewMatches(data.newMatches || []);
        setActiveChats(data.activeChats || []);
      });
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`/api/block-user?blockerEmail=${encodeURIComponent(session.user.email)}`)
      .then((res) => res.json())
      .then((data) => setBlockedUsers(data.blocked || []));
  }, [session?.user?.email]);

  useEffect(() => {
    if (!selected?.email) {
      setSelectedProfile(null);
      return;
    }
    fetch("/api/get-user-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: selected.email }),
    })
      .then((res) => res.json())
      .then((data) => setSelectedProfile(data));
  }, [selected]);

  const isBlocked = selected && blockedUsers.includes(selected.email);

  useEffect(() => {
    if (!session?.user?.email || !selected || isBlocked) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    const room = [session.user.email, selected.email].sort().join("--");
    socket.emit("join", room);

    socket.on("chat message", (msg) => {
      if (
        [msg.sender, msg.receiver].includes(session.user.email) &&
        [msg.sender, msg.receiver].includes(selected.email) &&
        !sentMessagesRef.current.has(`${msg.timestamp}-${msg.message}`)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [session?.user?.email, selected, isBlocked]);

  useEffect(() => {
    if (!session?.user?.email || !selected) return;

    setLoading(true);
    fetch("/api/get-chat-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail: session.user.email,
        otherUserEmail: selected.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => {
        setMessages([]);
        setLoading(false);
      });
  }, [selected, session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email || activeChats.length === 0) return;
    const fetchLastMessages = async () => {
      const results: Record<string, any> = {};
      await Promise.all(
        activeChats.map(async (user: any) => {
          const res = await fetch("/api/get-chat-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail: session.user.email, otherUserEmail: user.email, limit: 1, sort: -1 }),
          });
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            results[user.email] = data.messages[data.messages.length - 1];
          }
        })
      );
      setLastMessages(results);
    };
    fetchLastMessages();
  }, [activeChats, session?.user?.email]);

  const sendMessage = async () => {
    if (!input.trim() || !session?.user?.email || !selected) return;
    
    const room = [session.user.email, selected.email].sort().join("--");
    const msg = {
      room,
      sender: session.user.email,
      receiver: selected.email,
      message: input,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/save-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });

      if (!response.ok) throw new Error("Failed to save message");

      sentMessagesRef.current.add(`${msg.timestamp}-${msg.message}`);
      socketRef.current?.emit("chat message", msg);
      setMessages((prev) => [...prev, msg]);
      setInput("");

      setTimeout(() => {
        fetch("/api/get-matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        })
          .then((res) => res.json())
          .then((data) => {
            setNewMatches(data.newMatches || []);
            setActiveChats(data.activeChats || []);
          });
      }, 1000);
    } catch (error) {
      alert("Failed to send message. Please try again.");
    }
  };

  const getCurrentList = () => activeTab === 'new' ? newMatches : activeChats;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] w-full max-w-5xl mx-auto bg-background md:border border-border md:rounded-3xl shadow-2xl overflow-hidden mt-0 md:mt-4">
      
      {/* Sidebar / Match List */}
      {(!isMobile || (isMobile && !selected)) && (
        <div className="w-full md:w-80 flex flex-col bg-card border-r border-border shrink-0">
          <div className="p-5 border-b border-border bg-card text-foreground flex items-center justify-between">
            <h3 className="text-xl font-bold m-0 flex items-center gap-2">
              <span className="text-primary text-2xl">💬</span> Matches
            </h3>
          </div>

          <div className="flex border-b border-border bg-background">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${activeTab === 'new' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              New ({newMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${activeTab === 'chats' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              Chats ({activeChats.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {getCurrentList().length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm font-medium">
                {activeTab === 'new' 
                  ? "Still a lil dry in here, go like some cuties..."
                  : "Still waiting on that first “hey 👋” — go make a move!"
                }
              </div>
            )}
            
            {getCurrentList().map((user: any, index: number) => (
              <div
                key={`${user.email}-${index}`}
                onClick={() => setSelected(user)}
                className={`flex items-center gap-4 p-3 mb-2 rounded-2xl cursor-pointer transition-all ${
                  selected?.email === user.email 
                    ? "bg-primary/10 border-2 border-primary shadow-sm shadow-primary/10" 
                    : "bg-secondary border border-transparent hover:border-border hover:bg-secondary/80"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden shrink-0">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl text-muted-foreground">👤</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] text-foreground truncate">
                    {user.name || user.email}
                  </div>
                  {activeTab === 'new' && (
                    <div className="text-xs font-semibold text-primary mt-0.5 flex items-center gap-1">
                      ✨ New match!
                    </div>
                  )}
                  {activeTab === 'chats' && lastMessages[user.email] && (
                    <div className={`text-xs mt-0.5 truncate ${
                        lastMessages[user.email].sender !== session?.user?.email && !lastMessages[user.email].read
                          ? 'font-bold text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {lastMessages[user.email].sender === session?.user?.email ? 'You: ' : ''}
                      {lastMessages[user.email].message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Area */}
      {(!isMobile || (isMobile && selected)) && (
        <div className="flex-1 flex flex-col bg-background relative h-full">
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 md:p-5 border-b border-border bg-card text-foreground flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      onClick={() => setSelected(null)}
                      className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center -ml-2 hover:bg-muted transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  
                  <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => {
                      if (selected?.email) {
                        router.push(`/mainpage/user-profile?email=${encodeURIComponent(selected.email)}`);
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary border border-border overflow-hidden shrink-0 group-hover:border-primary transition-colors">
                      {selectedProfile?.profilePhoto ? (
                        <img src={selectedProfile.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-muted-foreground">👤</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-base truncate group-hover:text-primary transition-colors">{selected.name}</div>
                      {newMatches.find(match => match.email === selected.email) && (
                        <div className="text-xs text-primary font-medium">✨ New match</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 md:pb-4">
                {messages.find((msg) => msg.sender === 'system') && (
                  <div className="bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-950 p-4 rounded-2xl mx-auto text-center italic font-semibold max-w-sm text-sm shadow-md mb-6 whitespace-pre-line">
                    {messages.find((msg) => msg.sender === 'system')?.message}
                  </div>
                )}
                
                {loading && (
                  <div className="text-center p-4 text-muted-foreground text-sm font-medium">Loading chat history...</div>
                )}

                {messages.filter((msg, idx) => msg.sender !== 'system' || idx !== messages.findIndex(m => m.sender === 'system')).map((msg, idx, arr) => {
                  const currentSender = msg.sender;
                  const currentDate = new Date(msg.timestamp);
                  const currentMinute = currentDate.getHours() + ':' + currentDate.getMinutes();
                  const nextMsg = arr[idx + 1];
                  let showTime = !nextMsg || nextMsg.sender !== currentSender || (new Date(nextMsg.timestamp).getHours() + ':' + new Date(nextMsg.timestamp).getMinutes()) !== currentMinute;
                  
                  const isMe = msg.sender === session?.user?.email;

                  return (
                    <div key={`${msg.timestamp}-${idx}`} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed break-words max-w-full ${
                          isMe 
                            ? "bg-primary text-primary-foreground rounded-br-sm" 
                            : "bg-secondary text-secondary-foreground border border-border rounded-bl-sm"
                        }`}
                      >
                        {msg.message}
                      </div>
                      
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {Object.entries(msg.reactions).map(([reaction, count]) => (
                            <span key={reaction} className="bg-card text-foreground px-2 py-0.5 rounded-full text-xs border border-border shadow-sm">
                              {reaction} {String(count)}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {showTime && (
                        <div className="text-[10px] text-muted-foreground mt-1 px-1 font-medium">
                          {currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="absolute md:static bottom-0 left-0 right-0 p-3 md:p-5 bg-card/90 backdrop-blur-md border-t border-border z-10 pb-safe">
                <div className="flex gap-2.5 items-end max-w-4xl mx-auto">
                  <div className="flex-1 bg-input border border-border rounded-3xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                    <input
                      className="w-full px-5 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm md:text-base"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !isBlocked) sendMessage(); }}
                      placeholder={isBlocked ? "You have ghosted this user." : "Type a message..."}
                      disabled={isBlocked}
                    />
                  </div>
                  <button
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isBlocked || !input.trim() 
                        ? "bg-muted text-muted-foreground cursor-not-allowed" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:-translate-y-0.5 shadow-lg shadow-primary/25"
                    }`}
                    onClick={() => { if (!isBlocked && input.trim()) sendMessage(); }}
                    disabled={isBlocked || !input.trim()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-card md:bg-background">
              <div className="text-6xl md:text-7xl mb-6 opacity-40">💬</div>
              <div className="text-xl md:text-2xl font-bold text-foreground mb-3 tracking-tight">
                Your next fav convo is one tap away
              </div>
              <div className="text-sm md:text-base text-muted-foreground max-w-xs leading-relaxed">
                Your chats will pop up once the vibes are mutual...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <BlockConfirmModal
        open={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={async () => {
          setBlockModalOpen(false);
          if (!session?.user?.email || !selected?.email) return;
          await fetch("/api/block-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              blockerEmail: session.user.email,
              blockedEmail: selected.email,
              action: "block",
            }),
          });
          const res = await fetch(`/api/block-user?blockerEmail=${encodeURIComponent(session.user.email)}`);
          const data = await res.json();
          setBlockedUsers(data.blocked || []);
          setSelected(null);
        }}
        userEmail={selected?.email || ""}
      />

      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={async (reason, details) => {
          setReportModalOpen(false);
          if (!session?.user?.email || !selected?.email) return;
          await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reporterEmail: session.user.email,
              reportedUserEmail: selected.email,
              reason,
              details,
            }),
          });
          alert("Report submitted. Thank you!");
          setNewMatches((prev) => prev.filter((u) => u.email !== selected.email));
          setActiveChats((prev) => prev.filter((u) => u.email !== selected.email));
          setSelected(null);
        }}
        type="user"
        targetEmail={selected?.email || ""}
      />
    </div>
  );
}
