"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import ReportModal from "./ReportModal";

const REACTIONS = ["❤️", "😂", "😮", "😢", "👍"];
const PAGE_SIZE = 10;

function ReactionButton({
  emoji,
  count,
  hasReacted,
  onClick,
  users,
  disabled,
}: {
  emoji: string;
  count: number;
  hasReacted: boolean;
  onClick: () => void;
  users: string[];
  disabled?: boolean;
}) {
  const [anim, setAnim] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => {
          setAnim(true);
          onClick();
          setTimeout(() => setAnim(false), 250);
        }}
        disabled={disabled}
        style={{
          background: hasReacted ? "#0070f3" : "#222",
          color: hasReacted ? "#fff" : "#ccc",
          border: hasReacted ? "2px solid #0070f3" : "1px solid #333",
          borderRadius: 20,
          padding: "6px 14px",
          fontSize: 18,
          fontWeight: 600,
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: hasReacted ? "0 2px 8px #0070f355" : "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.2s",
          outline: hasReacted ? "2px solid #0070f3" : undefined,
          transform: anim ? "scale(1.2)" : "scale(1)",
          zIndex: 1,
        }}
        aria-label={`React with ${emoji}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {emoji} <span style={{ fontSize: 14, marginLeft: 4 }}>{count > 0 ? count : ""}</span>
      </button>
      {showTooltip && users.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "110%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {users.length === 1
            ? `1 person`
            : `${users.length} people`}
        </div>
      )}
    </div>
  );
}

interface Confession {
  _id: string;
  confession: string;
  createdAt: string;
  likes: number;
  comments: Array<{
    id: string;
    comment: string;
    userEmail: string;
    userName: string;
    createdAt: string;
  }>;
}

export default function Feed() {
  const { data: session } = useSession();
  const [confessions, setConfessions] = useState<any[]>([]);
  const [newConfession, setNewConfession] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [confessionPlaceholder, setConfessionPlaceholder] = useState("Tell us a gossip...");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setConfessionPlaceholder(window.innerWidth < 600 ? "Share gossip..." : "Tell us a gossip...");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetch(`/api/get-confessions?skip=0&limit=${PAGE_SIZE}`)
      .then((res) => res.json())
      .then((data) => {
        setConfessions(data.confessions || []);
        setTotal(data.total || 0);
        setHasMore((data.confessions?.length || 0) < (data.total || 0));
        setLoading(false);
      });
  }, []);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!feedRef.current || loading || fetchingMore || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        loadMore();
      }
    };
    const el = feedRef.current;
    if (el) el.addEventListener("scroll", handleScroll);
    return () => { if (el) el.removeEventListener("scroll", handleScroll); };
  }, [confessions, loading, fetchingMore, hasMore]);

  const loadMore = async () => {
    if (fetchingMore || !hasMore) return;
    setFetchingMore(true);
    const skip = confessions.length;
    const res = await fetch(`/api/get-confessions?skip=${skip}&limit=${PAGE_SIZE}`);
    const data = await res.json();
    setConfessions((prev) => [...prev, ...(data.confessions || [])]);
    setHasMore((skip + (data.confessions?.length || 0)) < (data.total || 0));
    setFetchingMore(false);
  };

  const handleReaction = async (confessionId: string, emoji: string, hasReacted: boolean) => {
    if (!session?.user?.email) return;
    const res = await fetch("/api/add-reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confessionId,
        emoji,
        userEmail: session.user.email,
        action: hasReacted ? "remove" : "add",
      }),
    });
    const data = await res.json();
    setConfessions((prev) => prev.map(c => c._id === confessionId ? { ...c, reactions: data.reactions } : c));
  };

  const handleSubmitConfession = async () => {
    if (!newConfession.trim() || !session?.user?.email) return;

    setLoading(true);
    try {
      const response = await fetch("/api/create-confession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confession: newConfession.trim(),
          userEmail: session.user.email,
        }),
      });

      if (response.ok) {
        setNewConfession("");
        fetch(`/api/get-confessions?skip=0&limit=${PAGE_SIZE}`) // Refresh the feed
          .then((res) => res.json())
          .then((data) => {
            setConfessions(data.confessions || []);
            setTotal(data.total || 0);
            setHasMore((data.confessions?.length || 0) < (data.total || 0));
          });
      }
    } catch (error) {
      console.error("Error creating confession:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (confessionId: string) => {
    if (!commentText.trim() || !session?.user?.email) return;

    try {
      const response = await fetch("/api/add-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confessionId,
          comment: commentText.trim(),
          userEmail: session.user.email,
          userName: session.user.name || session.user.email,
        }),
      });

      if (response.ok) {
        setCommentText("");
        setReplyingTo(null);
        fetch(`/api/get-confessions?skip=0&limit=${PAGE_SIZE}`) // Refresh the feed
          .then((res) => res.json())
          .then((data) => {
            setConfessions(data.confessions || []);
            setTotal(data.total || 0);
            setHasMore((data.confessions?.length || 0) < (data.total || 0));
          });
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const loadMoreComments = (confessionId: string) => {
    setCommentCounts(prev => {
      const currentCount = prev[confessionId] || 3; // Default is 3
      const newCount = currentCount + 3; // Add 3 more
      return { ...prev, [confessionId]: newCount };
    });
  };

  // Function to show fewer comments
  const showFewerComments = (confessionId: string) => {
    setCommentCounts(prev => {
      const updated = { ...prev };
      delete updated[confessionId]; // Reset to default (3)
      return updated;
    });
  };

  // Add a new useEffect to handle auto-resize of textarea
  useEffect(() => {
    const adjustTextareaHeight = () => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        // Reset height to auto first to shrink if text is removed
        textarea.style.height = 'auto';
        // Set height based on scrollHeight (with a maximum height)
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
      }
    };

    // Adjust on input changes
    document.addEventListener('input', adjustTextareaHeight);
    
    // Initial adjustment
    setTimeout(adjustTextareaHeight, 100);
    
    return () => {
      document.removeEventListener('input', adjustTextareaHeight);
    };
  }, [newConfession]);

  // Update the CSS styles in the main useEffect
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .char-count {
        position: absolute;
        bottom: 8px;
        right: 52px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
      }
      
      .char-count.near-limit {
        color: #ff9800;
      }
      
      .char-count.at-limit {
        color: #f44336;
      }
      
      .gossip-textarea {
        width: 100%;
        min-height: 48px;
        max-height: 150px;
        padding: 12px 100px 12px 16px;
        border-radius: 24px;
        border: 1px solid rgba(51, 51, 51, 0.7);
        background: rgba(17, 17, 17, 0.7);
        backdrop-filter: blur(10px);
        color: #fff;
        font-size: 14px;
        resize: none;
        outline: none;
        font-family: inherit;
        overflow-y: auto;
        box-sizing: border-box;
        transition: height 0.2s ease;
      }
      
      @media (max-width: 600px) {
        .gossip-text {
          font-size: 16px !important;
          line-height: 1.4 !important;
        }
        
        .comment-container {
          padding: 8px !important;
        }
        
        .comment-text {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }
        
        .user-name {
          font-size: 11px !important;
        }
        
        .time-text {
          font-size: 9px !important;
        }
        
        .action-button {
          padding: 6px 10px !important;
          font-size: 11px !important;
        }
        
        .char-count {
          bottom: 6px;
          right: 46px;
          font-size: 10px;
        }
        
        .gossip-textarea {
          padding: 10px 65px 10px 12px !important;
          font-size: 13px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      ref={feedRef}
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "20px",
        background: "#000",
        height: "calc(100vh - 60px)",
        overflowY: "auto",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Minimal Confession Input */}
      <div
        style={{
          position: "relative",
          marginBottom: 24,
        }}
      >
        <textarea
          className="gossip-textarea"
          value={newConfession}
          onChange={(e) => setNewConfession(e.target.value)}
          placeholder={confessionPlaceholder}
          maxLength={800}
        />
        {newConfession.length > 0 && (
          <div 
            className={`char-count ${
              newConfession.length > 700 ? "near-limit" : ""
            } ${newConfession.length > 750 ? "at-limit" : ""}`}
          >
            {newConfession.length}/800
          </div>
        )}
        <button
          style={{
            position: "absolute",
            top: "15px", // Fixed position from the top instead of 50%
            right: "12px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#667eea",
            color: "white",
            border: "none",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.2s",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
          }}
          onClick={handleSubmitConfession}
          disabled={loading || !newConfession.trim()}
        >
          {loading ? (
            <span style={{ fontSize: "12px" }}>...</span>
          ) : (
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "10px solid white",
                marginLeft: "3px",
              }}
            />
          )}
        </button>
      </div>

      {/* Confessions Feed */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 78, // Increased gap from 20 to 28px for better spacing
      }}>
        {confessions.length === 0 && !loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "#666",
              background: "#111",
              borderRadius: 16,
              border: "1px solid #333",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: 16, opacity: 0.5 }}>
              💭
            </div>
            <div style={{ fontSize: "18px", marginBottom: 8, color: "#fff" }}>
              No confessions yet
            </div>
            <div style={{ fontSize: "14px" }}>
              Be the first to share a confession!
            </div>
          </div>
        ) : (
          confessions.map((confession) => {
            const reactions = confession.reactions || {};
            return (
              <div
                key={confession._id}
                style={{
                  background: "#111",
                  borderRadius: 16,
                  padding: 24,
                  border: "1px solid #333",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  position: "relative",
                  width: "100%", // Ensure full width
                  boxSizing: "border-box", // Include padding in width calculation
                  overflow: "hidden", // Prevent horizontal overflow
                }}
              >
                {/* Vibrant gradient accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "4px",
                    background: "linear-gradient(90deg, #667eea, #764ba2, #fc5c7d)",
                    backgroundSize: "200% 100%",
                    animation: "gradientMove 3s ease infinite",
                  }}
                />

                {/* Confession Content */}
                <div style={{ marginBottom: 16, width: "100%" }}>
                  <p
                    className="gossip-text"
                    style={{
                      color: "#fff",
                      fontSize: "16px",
                      lineHeight: 1.6,
                      margin: "0 0 12px 0",
                      wordWrap: "break-word", // Allow breaking long words
                      overflowWrap: "break-word", // Ensure text wraps
                      whiteSpace: "pre-wrap", // Preserve whitespace but wrap text
                      maxWidth: "100%", // Restrict to container width
                    }}
                  >
                    {confession.confession}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#666", fontSize: "12px" }}>
                      Anonymous • {formatTime(confession.createdAt)}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#666", fontSize: "12px" }}>
                        {confession.comments.length} comments
                      </span>
                      <button
                        style={{ background: "#ff9800", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontWeight: 600, cursor: "pointer", fontSize: 12 }}
                        onClick={() => { setReportTarget(confession._id); setReportModalOpen(true); }}
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </div>
                {/* Reactions Row */}
                <div style={{ 
                  display: "flex", 
                  gap: 10, 
                  margin: "10px 0 16px 0", // Increased bottom margin
                  flexWrap: "wrap", // Allow wrapping on smaller screens
                  width: "100%"
                }}>
                  {REACTIONS.map((emoji) => {
                    const users = reactions[emoji] || [];
                    const hasReacted = session?.user?.email && users.includes(session.user.email);
                    return (
                      <ReactionButton
                        key={emoji}
                        emoji={emoji}
                        count={users.length}
                        hasReacted={!!hasReacted}
                        onClick={() => handleReaction(confession._id, emoji, hasReacted)}
                        users={users}
                        disabled={!session?.user?.email}
                      />
                    );
                  })}
                </div>
                {/* Comments Section */}
                {confession.comments.length > 0 && (
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      paddingTop: 16,
                      marginBottom: 16,
                      width: "100%",
                    }}
                  >
                    <h4
                      style={{
                        color: "#fff",
                        margin: "0 0 12px 0",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Comments
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        width: "100%",
                      }}
                    >
                      {/* Show limited number of comments based on the current count */}
                      {confession.comments
                        .slice(0, commentCounts[confession._id] || 3) // Show only the tracked number (default 3)
                        .map((comment: any) => (
                          <div
                            key={comment.id}
                            className="comment-container"
                            style={{
                              background: "rgba(10, 10, 10, 0.6)",
                              borderRadius: 12,
                              padding: 12,
                              border: "1px solid rgba(102, 126, 234, 0.2)",
                              backdropFilter: "blur(5px)",
                              width: "100%",
                              boxSizing: "border-box", // Add this to include padding in width
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 4,
                                flexWrap: "wrap", // Allow wrapping on small screens
                              }}
                            >
                              <span
                                className="user-name"
                                style={{
                                  color: "#667eea",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  maxWidth: "70%", // Prevent very long names from breaking layout
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {comment.userName}
                              </span>
                              <span
                                className="time-text"
                                style={{
                                  color: "rgba(255, 255, 255, 0.4)",
                                  fontSize: "10px",
                                }}
                              >
                                {formatTime(comment.createdAt)}
                              </span>
                            </div>
                            <p
                              className="comment-text"
                              style={{
                                color: "#fff",
                                fontSize: "14px",
                                margin: 0,
                                lineHeight: 1.4,
                                wordWrap: "break-word", // Add this to ensure text wraps properly
                                overflowWrap: "break-word", // Add this for better word breaking
                              }}
                            >
                              {comment.comment}
                            </p>
                          </div>
                        ))}
                      
                      {/* Show "View more comments" button if there are more comments to show */}
                      {confession.comments.length > (commentCounts[confession._id] || 3) ? (
                        <button
                          className="action-button"
                          onClick={() => loadMoreComments(confession._id)}
                          style={{
                            background: "rgba(102, 126, 234, 0.1)",
                            border: "1px solid rgba(102, 126, 234, 0.3)",
                            color: "#667eea",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            cursor: "pointer",
                            alignSelf: "center",
                            marginTop: "4px",
                            fontWeight: "500",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(102, 126, 234, 0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
                          }}
                        >
                          View {Math.min(3, confession.comments.length - (commentCounts[confession._id] || 3))} more comments
                        </button>
                      ) : (
                        // Show "Show less" button when all comments are displayed
                        commentCounts[confession._id] && commentCounts[confession._id] > 3 && (
                          <button
                            className="action-button"
                            onClick={() => showFewerComments(confession._id)}
                            style={{
                              background: "rgba(102, 126, 234, 0.1)",
                              border: "1px solid rgba(102, 126, 234, 0.3)",
                              color: "#667eea",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              fontSize: "12px",
                              cursor: "pointer",
                              alignSelf: "center",
                              marginTop: "4px",
                              fontWeight: "500",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(102, 126, 234, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
                            }}
                          >
                            Show fewer comments
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Add Comment */}
                {replyingTo === confession._id ? (
                  <div
                    style={{
                      borderTop: "1px solid #333",
                      paddingTop: 16,
                      width: "100%",
                    }}
                  >
                    <textarea
                      style={{
                        width: "100%",
                        minHeight: 60,
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #333",
                        background: "#0a0a0a",
                        color: "#fff",
                        fontSize: "14px",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                        marginBottom: 8,
                        boxSizing: "border-box", // Add this to include padding in width
                      }}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      maxLength={200}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                        flexWrap: "wrap", // Allow wrapping on very small screens
                      }}
                    >
                      <button
                        className="action-button"
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          background: "transparent",
                          color: "#888",
                          border: "1px solid #333",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        onClick={() => {
                          setReplyingTo(null);
                          setCommentText("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="action-button"
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          background: "#0070f3",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                        onClick={() => handleAddComment(confession._id)}
                        disabled={!commentText.trim()}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="action-button"
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "rgba(102, 126, 234, 0.2)",
                      color: "#fff",
                      border: "1px solid rgba(102, 126, 234, 0.4)",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onClick={() => setReplyingTo(confession._id)}
                  >
                    <span role="img" aria-label="comment">💬</span> Add Comment
                  </button>
                )}
              </div>
            );
          })
        )}
        {fetchingMore && (
          <div style={{ textAlign: "center", color: "#888", padding: 20 }}>
            Loading more confessions...
          </div>
        )}
        {!hasMore && confessions.length > 0 && (
          <div style={{ textAlign: "center", color: "#888", padding: 20 }}>
            No more confessions.
          </div>
        )}
      </div>
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={async (reason, details) => {
          setReportModalOpen(false);
          if (!session?.user?.email || !reportTarget) return;
          await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reporterEmail: session.user.email, confessionId: reportTarget, reason, details }),
          });
          alert("Report submitted. Thank you!");
        }}
        type="confession"
        targetId={reportTarget || ""}
      />
    </div>
  );
}
