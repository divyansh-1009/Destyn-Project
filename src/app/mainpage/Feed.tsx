"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [newConfession, setNewConfession] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch confessions on mount
  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    try {
      const response = await fetch("/api/get-confessions");
      const data = await response.json();
      setConfessions(data.confessions || []);
    } catch (error) {
      console.error("Error fetching confessions:", error);
    }
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
        fetchConfessions(); // Refresh the feed
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
        fetchConfessions(); // Refresh the feed
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

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "20px",
        background: "#000",
        minHeight: "100vh",
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
          💭 Anonymous Confessions
        </h1>
        <p
          style={{
            color: "#888",
            fontSize: "16px",
            margin: 0,
          }}
        >
          Share your thoughts anonymously, comment with your identity
        </p>
      </div>

      {/* Create Confession */}
      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          border: "1px solid #333",
        }}
      >
        <h3
          style={{
            color: "#fff",
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Share Your Confession
        </h3>
        <textarea
          style={{
            width: "100%",
            minHeight: 100,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #333",
            background: "#0a0a0a",
            color: "#fff",
            fontSize: "14px",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
          }}
          value={newConfession}
          onChange={(e) => setNewConfession(e.target.value)}
          placeholder="Share your anonymous confession here..."
          maxLength={500}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <span style={{ color: "#666", fontSize: "12px" }}>
            {newConfession.length}/500 characters
          </span>
          <button
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              background: "#0070f3",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s",
            }}
            onClick={handleSubmitConfession}
            disabled={loading || !newConfession.trim()}
          >
            {loading ? "Posting..." : "Post Confession"}
          </button>
        </div>
      </div>

      {/* Confessions Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {confessions.length === 0 ? (
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
          confessions.map((confession) => (
            <div
              key={confession._id}
              style={{
                background: "#111",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #333",
              }}
            >
              {/* Confession Content */}
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    color: "#fff",
                    fontSize: "16px",
                    lineHeight: 1.6,
                    margin: "0 0 12px 0",
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
                  <span style={{ color: "#666", fontSize: "12px" }}>
                    {confession.comments.length} comments
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              {confession.comments.length > 0 && (
                <div
                  style={{
                    borderTop: "1px solid #333",
                    paddingTop: 16,
                    marginBottom: 16,
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
                    }}
                  >
                    {confession.comments.map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          background: "#0a0a0a",
                          borderRadius: 8,
                          padding: 12,
                          border: "1px solid #333",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              color: "#0070f3",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {comment.userName}
                          </span>
                          <span style={{ color: "#666", fontSize: "10px" }}>
                            {formatTime(comment.createdAt)}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "#fff",
                            fontSize: "14px",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment */}
              {replyingTo === confession._id ? (
                <div
                  style={{
                    borderTop: "1px solid #333",
                    paddingTop: 16,
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
                    }}
                  >
                    <button
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
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    background: "transparent",
                    color: "#0070f3",
                    border: "1px solid #0070f3",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                  onClick={() => setReplyingTo(confession._id)}
                >
                  💬 Add Comment
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
