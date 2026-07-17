"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import ReportModal from "./ReportModal";
import { useImageCompression } from "@/lib/useImageCompression";
import CompressionProgress from "@/components/CompressionProgress";

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
    <div className="relative inline-block">
      <button
        onClick={() => {
          setAnim(true);
          onClick();
          setTimeout(() => setAnim(false), 250);
        }}
        disabled={disabled}
        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-2xl md:rounded-full font-semibold transition-all duration-200 ${
          hasReacted
            ? "bg-primary text-primary-foreground border-2 border-primary shadow-md shadow-primary/20 outline outline-2 outline-primary"
            : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${
          anim ? "scale-125" : "scale-100"
        } z-10`}
        aria-label={`React with ${emoji}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <span className="text-sm md:text-base flex items-center">{emoji}</span>
        {count > 0 && (
          <span className="text-xs md:text-sm flex items-center">{count}</span>
        )}
      </button>
      {showTooltip && users.length > 0 && (
        <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 bg-card text-card-foreground border border-border px-3 py-1.5 rounded-lg text-xs shadow-xl whitespace-nowrap z-50">
          {users.length === 1 ? `1 person` : `${users.length} people`}
        </div>
      )}
    </div>
  );
}

interface Confession {
  _id: string;
  confession: string;
  imageUrl?: string;
  caption?: string;
  postType?: "text" | "image";
  createdAt: string;
  likes: number;
  comments: Array<{
    id: string;
    comment: string;
    userEmail: string;
    userName: string;
    createdAt: string;
    reactions?: string[];
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
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [postType, setPostType] = useState<"text" | "image">("text");
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const {
    compressSingleImage,
    state: compressionState,
    compressionInfo,
  } = useImageCompression({
    compressionOptions: {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      format: 'jpeg'
    },
    onError: (error) => {
      console.error('Compression error:', error);
      alert('Failed to compress image. Please try again.');
    }
  });

  useEffect(() => {
    if (!session?.user?.email) return;
    setLoading(true);
    fetch("/api/get-confessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        skip: 0,
        limit: PAGE_SIZE,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setConfessions(data.confessions || []);
        setTotal(data.total || 0);
        setHasMore((data.confessions?.length || 0) < (data.total || 0));
        setLoading(false);
      });
  }, [session?.user?.email]);

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
    if (fetchingMore || !hasMore || !session?.user?.email) return;
    setFetchingMore(true);
    const skip = confessions.length;
    const res = await fetch("/api/get-confessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        skip,
        limit: PAGE_SIZE,
      }),
    });
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

  const handleCommentReaction = async (confessionId: string, commentId: string, hasReacted: boolean) => {
    if (!session?.user?.email) return;
    const res = await fetch("/api/add-comment-reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confessionId,
        commentId,
        userEmail: session.user.email,
        action: hasReacted ? "remove" : "add",
      }),
    });
    const data = await res.json();
    setConfessions((prev) => prev.map(c => 
      c._id === confessionId 
        ? { 
            ...c, 
            comments: c.comments.map((comment: any) => 
              comment.id === commentId 
                ? { ...comment, reactions: data.reactions }
                : comment
            )
          }
        : c
    ));
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }
      try {
        const compressedImage = await compressSingleImage(file);
        setSelectedImage(compressedImage.file);
        setPostType("image");
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(compressedImage.file);
      } catch (error) {
        alert('Failed to process image. Please try again.');
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageCaption("");
    setPostType("text");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSubmitConfession = async () => {
    if (!session?.user?.email) return;
    if (postType === "text" && !newConfession.trim()) return;
    if (postType === "image" && !selectedImage) return;

    setLoading(true);
    try {
      let imageUrl = null;
      if (postType === "image" && selectedImage) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("userEmail", session.user.email);
        const uploadResponse = await fetch("/api/upload-feed-image", { method: "POST", body: formData });
        if (!uploadResponse.ok) throw new Error("Failed to upload image");
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
        setUploadingImage(false);
      }

      const response = await fetch("/api/create-confession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confession: newConfession.trim(),
          userEmail: session.user.email,
          imageUrl: imageUrl,
          caption: imageCaption.trim(),
          postType: postType,
        }),
      });

      if (response.ok) {
        setNewConfession("");
        setSelectedImage(null);
        setImagePreview(null);
        setImageCaption("");
        setPostType("text");
        if (imageInputRef.current) imageInputRef.current.value = "";
        
        fetch(`/api/get-confessions?skip=0&limit=${PAGE_SIZE}`)
          .then((res) => res.json())
          .then((data) => {
            setConfessions(data.confessions || []);
            setTotal(data.total || 0);
            setHasMore((data.confessions?.length || 0) < (data.total || 0));
          });
      }
    } catch (error) {
      setUploadingImage(false);
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
        }),
      });
      if (response.ok) {
        setCommentText("");
        setReplyingTo(null);
        fetch(`/api/get-confessions?skip=0&limit=${PAGE_SIZE}`)
          .then((res) => res.json())
          .then((data) => {
            setConfessions(data.confessions || []);
            setTotal(data.total || 0);
            setHasMore((data.confessions?.length || 0) < (data.total || 0));
          });
      }
    } catch (error) {}
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    if (diffInHours < 1) return `${Math.floor(diffInMinutes)}m ago`;
    else if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    else return date.toLocaleDateString();
  };

  const loadMoreComments = (confessionId: string) => {
    setCommentCounts(prev => ({ ...prev, [confessionId]: (prev[confessionId] || 3) + 3 }));
  };

  const showFewerComments = (confessionId: string) => {
    setCommentCounts(prev => {
      const updated = { ...prev };
      delete updated[confessionId];
      return updated;
    });
  };

  useEffect(() => {
    const adjustTextareaHeight = () => {
      const textarea = document.querySelector('textarea.gossip-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
      }
    };
    document.addEventListener('input', adjustTextareaHeight);
    setTimeout(adjustTextareaHeight, 100);
    return () => document.removeEventListener('input', adjustTextareaHeight);
  }, [newConfession, imageCaption]);

  return (
    <>
      <CompressionProgress 
        state={compressionState}
        compressionInfo={compressionInfo}
        showCompressionInfo={false}
      />
      
      <div
        ref={feedRef}
        className="max-w-2xl mx-auto px-4 md:px-0 py-6 h-[calc(100vh-60px)] md:h-full overflow-y-auto scroll-smooth"
      >
        <div className="text-3xl md:text-4xl font-black text-center mb-8 tracking-wide bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
           The Vibe Feed
        </div>

        {/* Post Input Fixed to Bottom */}
        <div className="fixed bottom-[60px] md:bottom-6 left-0 right-0 md:left-auto md:right-auto md:w-full md:max-w-2xl md:mx-auto z-40 bg-card/90 backdrop-blur-xl p-4 md:rounded-2xl border-t md:border border-border shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
          {imagePreview && (
            <div className="mb-3 relative rounded-xl overflow-hidden bg-background border border-border max-h-[300px] flex items-center justify-center">
              <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[300px] object-contain block" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-destructive transition-colors"
              >
                &times;
              </button>
            </div>
          )}

          <div className="flex items-end gap-3">
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-10 h-10 rounded-full bg-muted text-muted-foreground border border-border flex items-center justify-center hover:bg-secondary hover:text-foreground transition-colors shrink-0 mb-1"
            >
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              )}
            </button>

            <div className="relative flex-1 bg-background border border-border rounded-2xl overflow-hidden transition-colors focus-within:border-primary">
              <textarea
                className="gossip-textarea w-full min-h-[44px] max-h-[150px] p-3 text-sm bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none overflow-y-auto block"
                value={postType === "image" ? imageCaption : newConfession}
                onChange={(e) => {
                  if (postType === "image") setImageCaption(e.target.value);
                  else setNewConfession(e.target.value);
                }}
                placeholder={postType === "image" ? "Write a caption..." : "Spill the tea..."}
                maxLength={800}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if ((postType === "text" && newConfession.trim()) || (postType === "image" && selectedImage)) {
                      handleSubmitConfession();
                    }
                  }
                }}
              />
            </div>

            <button
              onClick={handleSubmitConfession}
              disabled={loading || uploadingImage || ((postType === "text" && !newConfession.trim()) || (postType === "image" && !selectedImage))}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mb-1 transition-all ${
                ((postType === "text" && newConfession.trim()) || (postType === "image" && selectedImage))
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {loading || uploadingImage ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
        </div>

        {/* Feed Content */}
        <div className="flex flex-col gap-6 pb-40">
          {confessions.length === 0 && !loading ? (
            <div className="text-center p-12 bg-card border border-border rounded-3xl">
              <div className="text-5xl mb-4 opacity-50">💭</div>
              <div className="text-xl font-semibold text-foreground mb-2">No posts yet</div>
              <div className="text-muted-foreground">Be the first to share something!</div>
            </div>
          ) : (
            confessions.map((confession) => {
              const reactions = confession.reactions || {};
              return (
                <div key={confession._id} className="bg-card border border-border rounded-3xl p-5 md:p-6 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="mb-4 w-full">
                    {confession.imageUrl && (
                      <div className="mb-4 rounded-2xl overflow-hidden bg-background border border-border">
                        <img 
                          src={confession.imageUrl} 
                          alt="Post image" 
                          className="w-full max-h-[400px] object-contain block"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center h-48 text-muted-foreground text-sm">Image failed to load</div>';
                            }
                          }}
                        />
                      </div>
                    )}
                    
                    {(confession.confession || confession.caption) && (
                      <p className="text-foreground text-base md:text-lg leading-relaxed mb-4 whitespace-pre-wrap break-words">
                        {confession.confession || confession.caption}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-muted-foreground text-xs font-medium bg-secondary px-2.5 py-1 rounded-full">
                        Anonymous • {formatTime(confession.createdAt)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs font-medium">
                          {confession.comments.length} comments
                        </span>
                        <button
                          className="text-muted-foreground hover:text-destructive text-xs font-medium transition-colors"
                          onClick={() => { setReportTarget(confession._id); setReportModalOpen(true); }}
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-5 flex-wrap w-full">
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

                  {confession.comments.length > 0 && (
                    <div className="border-t border-border pt-4 w-full">
                      <div className="flex flex-col gap-3 w-full">
                        {confession.comments
                          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, commentCounts[confession._id] || 3)
                          .map((comment: any) => (
                            <div key={comment.id} className="bg-secondary/50 rounded-2xl p-3.5 w-full">
                              <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                                <span className="text-primary text-xs font-bold truncate max-w-[70%]">
                                  {comment.userName}
                                </span>
                                <span className="text-muted-foreground text-[10px]">
                                  {formatTime(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-foreground text-sm leading-snug break-words">
                                {comment.comment}
                              </p>
                              
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => {
                                    const hasReacted = comment.reactions?.includes(session?.user?.email || '');
                                    handleCommentReaction(confession._id, comment.id, hasReacted || false);
                                  }}
                                  disabled={!session?.user?.email}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${
                                    comment.reactions?.includes(session?.user?.email || '')
                                      ? "bg-primary/20 text-primary"
                                      : "bg-background text-muted-foreground hover:bg-muted"
                                  }`}
                                >
                                  <span>➕</span>
                                  {(comment.reactions?.length || 0) > 0 && (
                                    <span className="font-medium">{comment.reactions?.length}</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                      
                        {confession.comments.length > (commentCounts[confession._id] || 3) ? (
                          <button
                            onClick={() => loadMoreComments(confession._id)}
                            className="text-primary text-xs font-medium hover:underline self-start px-2 py-1"
                          >
                            View {Math.min(3, confession.comments.length - (commentCounts[confession._id] || 3))} more comments
                          </button>
                        ) : (
                          commentCounts[confession._id] && commentCounts[confession._id] > 3 && (
                            <button
                              onClick={() => showFewerComments(confession._id)}
                              className="text-muted-foreground text-xs font-medium hover:underline self-start px-2 py-1"
                            >
                              Show fewer comments
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {replyingTo === confession._id ? (
                    <div className="border-t border-border pt-4 mt-4 w-full">
                      <textarea
                        className="w-full min-h-[80px] p-3 rounded-xl border border-border bg-background text-foreground text-sm resize-y outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mb-2"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        maxLength={400}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          className="px-4 py-2 rounded-lg bg-transparent text-muted-foreground hover:bg-muted text-sm font-medium transition-colors"
                          onClick={() => { setReplyingTo(null); setCommentText(""); }}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleAddComment(confession._id)}
                          disabled={!commentText.trim()}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium transition-colors w-full justify-center md:w-auto md:justify-start"
                      onClick={() => setReplyingTo(confession._id)}
                    >
                      <span>💬</span> Add Comment
                    </button>
                  )}
                </div>
              );
            })
          )}
          {fetchingMore && <div className="text-center text-muted-foreground py-4">Loading more posts...</div>}
          {!hasMore && confessions.length > 0 && <div className="text-center text-muted-foreground py-4">You've reached the end!</div>}
        </div>
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
    </>
  );
}
