"use client";
import { useState } from "react";

export default function ReportModal({ open, onClose, onSubmit, type, targetId, targetEmail }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  type: 'user' | 'confession';
  targetId?: string;
  targetEmail?: string;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  if (!open) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#222", borderRadius: 12, padding: 28, minWidth: 320, color: "#fff", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
        <h2 style={{ marginBottom: 16 }}>Report {type === 'user' ? 'User' : 'Confession'}</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit(reason, details); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            Reason
            <select value={reason} onChange={e => setReason(e.target.value)} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #333", background: "#181818", color: "#fff", marginTop: 4 }}>
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="abuse">Abusive or inappropriate</option>
              <option value="fake">Fake profile/content</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Details (optional)
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={2} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #333", background: "#181818", color: "#fff", marginTop: 4 }} />
          </label>
          <button type="submit" style={{ marginTop: 10, padding: "10px 0", borderRadius: 8, background: "#f44336", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Submit Report</button>
        </form>
      </div>
    </div>
  );
} 