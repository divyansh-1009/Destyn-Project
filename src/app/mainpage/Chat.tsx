"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import BlockConfirmModal from "./BlockConfirmModal";
import ReportModal from "./ReportModal";

const SOCKET_URL = typeof window !== "undefined" ? window.location.origin : "";

export default function Chat() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sentMessagesRef = useRef<Set<string>>(new Set());

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch matches on mount
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/get-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMatches(data.matches || []);
      });
  }, [session?.user?.email]);

  // Fetch blocked users on mount and after blocking
  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`/api/block-user?blockerEmail=${encodeURIComponent(session.user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setBlockedUsers(data.blocked || []);
      });
  }, [session?.user?.email]);

  // Determine if selected user is blocked
  const isBlocked = selected && blockedUsers.includes(selected.email);

  // Setup socket connection and listeners
  useEffect(() => {
    if (!session?.user?.email || !selected) return;
    if (isBlocked) return; // Do not set up socket if blocked

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    // Join a unique room for this chat (sorted emails for consistency)
    const room = [session.user.email, selected.email].sort().join("--");
    socket.emit("join", room);

    socket.on("chat message", (msg) => {
      // Only add messages for this room and not already sent by this user
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

  // Fetch chat history when a match is selected
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

  const sendMessage = () => {
    if (!input.trim() || !session?.user?.email || !selected) return;
    const room = [session.user.email, selected.email].sort().join("--");
    const msg = {
      room,
      sender: session.user.email,
      receiver: selected.email,
      message: input,
      timestamp: new Date().toISOString(),
    };

    // Mark this message as sent to prevent duplicates
    sentMessagesRef.current.add(`${msg.timestamp}-${msg.message}`);

    socketRef.current?.emit("chat message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 120px)",
        maxWidth: 800,
        margin: "0 auto",
        border: "1px solid #333",
        borderRadius: 12,
        overflow: "hidden",
        background: "#0a0a0a",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Sidebar with matches */}
      <div
        style={{
          width: 250,
          borderRight: "1px solid #333",
          background: "#111",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid #333",
            background: "#000",
            color: "#fff",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            💬 Matches
          </h3>
        </div>
        <div
          style={{
            padding: 12,
            flex: 1,
            overflowY: "auto",
          }}
        >
          {matches.length === 0 && (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "#666",
                fontSize: "14px",
              }}
            >
              No matches yet. Start liking people to see them here!
            </div>
          )}
          {matches.map((user: any, index: number) => (
            <div
              key={`${user.email}-${index}`}
              style={{
                padding: 16,
                margin: "8px 0",
                borderRadius: 10,
                background:
                  selected?.email === user.email ? "#1a1a1a" : "#0a0a0a",
                cursor: "pointer",
                border:
                  selected?.email === user.email
                    ? "2px solid #0070f3"
                    : "1px solid #333",
                transition: "all 0.2s",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
              onClick={() => setSelected(user)}
            >
              {/* Profile Photo */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #333",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={`${user.name || user.email}'s profile`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "16px", color: "#666" }}>👤</span>
                )}
              </div>

              {/* User Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name || user.email}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
        }}
      >
        {selected ? (
          <>
            <div
              style={{
                padding: 20,
                borderBottom: "1px solid #333",
                background: "#111",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: "600", fontSize: "16px", marginBottom: 4 }}>
                  💬 Chat with {selected.name || selected.email}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>{selected.email}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {isBlocked ? (
                  <button
                    style={{ background: "#0070f3", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}
                    onClick={async () => {
                      setBlockModalOpen(false);
                      if (!session?.user?.email || !selected?.email) return;
                      await fetch("/api/block-user", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ blockerEmail: session.user.email, blockedEmail: selected.email, action: "unblock" }),
                      });
                      // Refetch blocked users after unblocking
                      const res = await fetch(`/api/block-user?blockerEmail=${encodeURIComponent(session.user.email)}`);
                      const data = await res.json();
                      setBlockedUsers(data.blocked || []);
                    }}
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}
                    onClick={() => setBlockModalOpen(true)}
                  >
                    Block
                  </button>
                )}
                <button
                  style={{ background: "#ff9800", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => setReportModalOpen(true)}
                >
                  Report
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                background: "#0a0a0a",
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            >
              {loading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: "#666",
                    fontSize: "14px",
                  }}
                >
                  Loading chat history...
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={`${msg.timestamp}-${idx}`}
                  style={{ margin: "12px 0" }}
                >
                  <div
                    style={{
                      textAlign:
                        msg.sender === session?.user?.email ? "right" : "left",
                      maxWidth: "70%",
                      margin:
                        msg.sender === session?.user?.email
                          ? "0 0 0 auto"
                          : "0 auto 0 0",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: 18,
                        background:
                          msg.sender === session?.user?.email
                            ? "#0070f3"
                            : "#1a1a1a",
                        color:
                          msg.sender === session?.user?.email
                            ? "white"
                            : "#fff",
                        border:
                          msg.sender === session?.user?.email
                            ? "none"
                            : "1px solid #333",
                        display: "inline-block",
                        wordBreak: "break-word",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      {msg.message}
                    </div>

                    {/* Message Reactions - Always show existing reactions */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          marginTop: "8px",
                          flexWrap: "wrap",
                          justifyContent:
                            msg.sender === session?.user?.email
                              ? "flex-end"
                              : "flex-start",
                        }}
                      >
                        {Object.entries(msg.reactions).map(
                          ([reaction, count]) => (
                            <span
                              key={reaction}
                              style={{
                                background: "rgba(0,0,0,0.7)",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.1)",
                              }}
                            >
                              {reaction} {String(count)}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    {/* Reaction Buttons - Only show on hover */}
                    {/* This block was removed from the parent branch, so it's removed here. */}

                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        marginTop: 6,
                        textAlign:
                          msg.sender === session?.user?.email
                            ? "right"
                            : "left",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div
              style={{
                padding: 20,
                borderTop: "1px solid #333",
                background: "#111",
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <input
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    borderRadius: 25,
                    border: "1px solid #333",
                    background: "#0a0a0a",
                    color: "#fff",
                    outline: "none",
                    fontSize: "14px",
                    transition: "border-color 0.2s",
                  }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isBlocked) sendMessage();
                  }}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      "#0070f3")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor = "#333")
                  }
                  placeholder={isBlocked ? "You have blocked this user. You cannot send messages." : "Type a message..."}
                  disabled={isBlocked}
                />
                <button
                  style={{
                    padding: "14px 24px",
                    borderRadius: 25,
                    background: isBlocked ? "#333" : "#0070f3",
                    color: "white",
                    border: "none",
                    cursor: isBlocked ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "background 0.2s",
                    opacity: isBlocked ? 0.6 : 1,
                  }}
                  onClick={() => { if (!isBlocked) sendMessage(); }}
                  disabled={isBlocked}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.background =
                      isBlocked ? "#333" : "#0056b3")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.background =
                      isBlocked ? "#333" : "#0070f3")
                  }
                >
                  Send
                </button>
              </div>
            </div>
            <BlockConfirmModal
              open={blockModalOpen}
              onClose={() => setBlockModalOpen(false)}
              onConfirm={async () => {
                setBlockModalOpen(false);
                if (!session?.user?.email || !selected?.email) return;
                await fetch("/api/block-user", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ blockerEmail: session.user.email, blockedEmail: selected.email, action: "block" }),
                });
                // Refetch blocked users after blocking
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
                  body: JSON.stringify({ reporterEmail: session.user.email, reportedUserEmail: selected.email, reason, details }),
                });
                alert("Report submitted. Thank you!");
                // Instantly remove the match and clear chat
                setMatches((prev) => prev.filter((u) => u.email !== selected.email));
                setSelected(null);
              }}
              type="user"
              targetEmail={selected?.email || ""}
            />
          </>
        ) : (
          <div
            style={{
              padding: 40,
              color: "#888",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              background: "#0a0a0a",
            }}
          >
            <div
              style={{
                fontSize: "64px",
                marginBottom: 20,
                opacity: 0.5,
              }}
            >
              💬
            </div>
            <div
              style={{
                fontSize: "20px",
                marginBottom: 12,
                color: "#fff",
                fontWeight: "600",
              }}
            >
              Select a match to start chatting
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                maxWidth: 300,
              }}
            >
              Your conversations will appear here once you have mutual matches
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
