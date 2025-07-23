"use client";
export default function BlockConfirmModal({ open, onClose, onConfirm, userEmail }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
}) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#222", borderRadius: 12, padding: 28, minWidth: 320, color: "#fff", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
        <h2 style={{ marginBottom: 16 }}>Block User</h2>
        <p>Are you sure you want to block <b>{userEmail}</b>? You will no longer see their profile, messages, or confessions.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button onClick={onClose} style={{ padding: "10px 0", borderRadius: 8, background: "#333", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", flex: 1 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "10px 0", borderRadius: 8, background: "#f44336", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", flex: 1 }}>Block</button>
        </div>
      </div>
    </div>
  );
} 