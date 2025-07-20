"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

const SOCKET_URL = typeof window !== "undefined" ? window.location.origin : "";
const reactions = ["❤️", "👍", "😊", "😂", "🔥", "😮"];

export default function Chat() {
  const { data: session } = useSession();
  const [matches, setMatches] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<any | null>(null);
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

  // Setup socket connection and listeners
  useEffect(() => {
    if (!session?.user?.email || !selected) return;

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
        // Mark as read if we're the receiver
        if (msg.receiver === session.user.email) {
          markMessageAsRead(msg._id || `${msg.timestamp}-${msg.message}`);
        }
      }
    });

    // Listen for reaction updates from other users
    socket.on("reaction added", (data) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const msgId = msg._id || `${msg.timestamp}-${msg.message}`;
          if (msgId === data.messageId) {
            return {
              ...msg,
              reactions: {
                ...msg.reactions,
                [data.reaction]: (msg.reactions?.[data.reaction] || 0) + 1,
              },
            };
          }
          return msg;
        })
      );
    });

    // Typing indicators
    socket.on("typing", (data) => {
      if (data.user !== session.user.email) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    socket.on("stop typing", (data) => {
      if (data.user !== session.user.email) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [session?.user?.email, selected]);

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
      status: "sent", // sent, delivered, read
      replyTo: replyTo
        ? {
            messageId: replyTo._id || replyTo.timestamp,
            message: replyTo.message,
            sender: replyTo.sender,
          }
        : null,
    };

    // Mark this message as sent to prevent duplicates
    sentMessagesRef.current.add(`${msg.timestamp}-${msg.message}`);

    socketRef.current?.emit("chat message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
    setReplyTo(null); // Clear reply after sending
  };

  const handleTyping = () => {
    if (!session?.user?.email || !selected) return;

    const room = [session.user.email, selected.email].sort().join("--");
    socketRef.current?.emit("typing", { room, user: session.user.email });

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      socketRef.current?.emit("stop typing", {
        room,
        user: session.user.email,
      });
    }, 1000);

    setTypingTimeout(timeout);
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await fetch("/api/mark-message-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const addReaction = async (messageId: string, reaction: string) => {
    try {
      // Update local state immediately for better UX
      setMessages((prev) =>
        prev.map((msg) => {
          const msgId = msg._id || `${msg.timestamp}-${msg.message}`;
          if (msgId === messageId) {
            return {
              ...msg,
              reactions: {
                ...msg.reactions,
                [reaction]: (msg.reactions?.[reaction] || 0) + 1,
              },
            };
          }
          return msg;
        })
      );

      // Send to API
      await fetch("/api/add-reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          reaction,
          userEmail: session?.user?.email,
        }),
      });

      // Emit socket event for real-time updates
      if (socketRef.current && selected) {
        const room = [session?.user?.email, selected.email].sort().join("--");
        socketRef.current.emit("add reaction", {
          messageId,
          reaction,
          room,
        });
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
      alert("Failed to add reaction. Please try again.");
    }
  };

  const handleReply = (message: any) => {
    setReplyTo(message);
    // Focus on input
    const inputElement = document.querySelector(
      'input[placeholder="Type a message..."]'
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
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
                {user.profilePhotos?.[0] || user.profilePhoto ? (
                  <img
                    src={user.profilePhotos?.[0] || user.profilePhoto}
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
              }}
            >
              <div
                style={{ fontWeight: "600", fontSize: "16px", marginBottom: 4 }}
              >
                💬 Chat with {selected.name || selected.email}
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {selected.email}
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
                  onMouseEnter={() =>
                    setHoveredMessage(`${msg.timestamp}-${idx}`)
                  }
                  onMouseLeave={() => setHoveredMessage(null)}
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
                    {/* Reply Preview */}
                    {msg.replyTo && (
                      <div
                        style={{
                          background: "rgba(0,0,0,0.2)",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          fontSize: "12px",
                          color: "#888",
                          borderLeft: "3px solid #0070f3",
                        }}
                      >
                        <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                          {msg.replyTo.sender === session?.user?.email
                            ? "You"
                            : selected.name}
                        </div>
                        <div style={{ color: "#ccc" }}>
                          {msg.replyTo.message.length > 50
                            ? msg.replyTo.message.substring(0, 50) + "..."
                            : msg.replyTo.message}
                        </div>
                      </div>
                    )}

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
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={() => handleReply(msg)}
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
                              {reaction} {count}
                            </span>
                          )
                        )}
                      </div>
                    )}

                    {/* Reaction Buttons - Only show on hover */}
                    {hoveredMessage === `${msg.timestamp}-${idx}` && (
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                          marginTop: "8px",
                          justifyContent:
                            msg.sender === session?.user?.email
                              ? "flex-end"
                              : "flex-start",
                          background: "rgba(0,0,0,0.8)",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          maxWidth: "fit-content",
                        }}
                      >
                        {reactions.map((reaction) => (
                          <button
                            key={reaction}
                            onClick={() =>
                              addReaction(
                                msg._id || `${msg.timestamp}-${msg.message}`,
                                reaction
                              )
                            }
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "16px",
                              padding: "4px",
                              borderRadius: "4px",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "28px",
                              height: "28px",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background =
                                "rgba(255,255,255,0.1)";
                              e.target.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "transparent";
                              e.target.style.transform = "scale(1)";
                            }}
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: "10px",
                        color: "#666",
                        marginTop: 6,
                        textAlign:
                          msg.sender === session?.user?.email
                            ? "right"
                            : "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        justifyContent:
                          msg.sender === session?.user?.email
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.sender === session?.user?.email && (
                        <span style={{ fontSize: "12px" }}>
                          {msg.status === "read"
                            ? "✓✓"
                            : msg.status === "delivered"
                            ? "✓✓"
                            : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div
                  style={{
                    textAlign: "left",
                    margin: "12px 0",
                    padding: "12px 16px",
                    background: "#1a1a1a",
                    borderRadius: 18,
                    border: "1px solid #333",
                    display: "inline-block",
                    maxWidth: "70%",
                  }}
                >
                  <div style={{ display: "flex", gap: "4px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#666",
                        borderRadius: "50%",
                        animation: "typing 1.4s infinite ease-in-out",
                      }}
                    />
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#666",
                        borderRadius: "50%",
                        animation: "typing 1.4s infinite ease-in-out 0.2s",
                      }}
                    />
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "#666",
                        borderRadius: "50%",
                        animation: "typing 1.4s infinite ease-in-out 0.4s",
                      }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyTo && (
              <div
                style={{
                  padding: "12px 20px",
                  background: "#1a1a1a",
                  borderTop: "1px solid #333",
                  borderBottom: "1px solid #333",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#0070f3",
                        marginBottom: "4px",
                      }}
                    >
                      Replying to{" "}
                      {replyTo.sender === session?.user?.email
                        ? "yourself"
                        : selected.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#ccc" }}>
                      {replyTo.message.length > 50
                        ? replyTo.message.substring(0, 50) + "..."
                        : replyTo.message}
                    </div>
                  </div>
                  <button
                    onClick={cancelReply}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "4px",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

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
                  onChange={(e) => {
                    setInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0070f3")}
                  onBlur={(e) => (e.target.style.borderColor = "#333")}
                  placeholder={
                    replyTo ? "Reply to message..." : "Type a message..."
                  }
                />
                <button
                  style={{
                    padding: "14px 24px",
                    borderRadius: 25,
                    background: "#0070f3",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "background 0.2s",
                  }}
                  onClick={sendMessage}
                  onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
                  onMouseLeave={(e) => (e.target.style.background = "#0070f3")}
                >
                  Send
                </button>
              </div>
            </div>
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

      <style jsx>{`
        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
