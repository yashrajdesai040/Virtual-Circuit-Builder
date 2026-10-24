import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import client from "../api/client";
import { ShareIcon, TrashIcon } from "./AnimatedIcon";

export default function ShareModal({ open, onClose, projectId }) {
  const [collaborators, setCollaborators] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    Promise.all([
      client.get(`/projects/${projectId}/collaborators`),
      client.get(`/projects/${projectId}/invites`),
    ])
      .then(([collabRes, inviteRes]) => {
        setCollaborators(collabRes.data.collaborators || []);
        setPendingInvites(inviteRes.data.invites || []);
      })
      .finally(() => setLoading(false));
  }, [open, projectId]);

  async function handleSend(e) {
    e.preventDefault();
    if (!username.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await client.post(`/projects/${projectId}/invites`, { username: username.trim() });
      setPendingInvites((inv) => [res.data.invite, ...inv.filter((i) => i.id !== res.data.invite.id)]);
      setUsername("");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't send that request.");
    } finally {
      setSending(false);
    }
  }

  async function handleRemove(collabId) {
    await client.delete(`/projects/${projectId}/collaborators/${collabId}`);
    setCollaborators((c) => c.filter((x) => x.id !== collabId));
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.cardGlow} />
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Collaboration
            </div>
            <h2 style={{ margin: "4px 0 8px", fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Share this circuit
            </h2>
            <p style={{ color: "var(--text-dim)", fontSize: 13, lineHeight: 1.55, margin: "0 0 18px" }}>
              Collaborators receive an invitation to inspect, modify, and simulate this circuit
              in real-time from their own workstation.
            </p>

            <form onSubmit={handleSend} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter collaborator username..."
                style={styles.input}
              />
              <button
                type="submit"
                disabled={sending || !username.trim()}
                className="btn-tactile-gold btn-shimmer"
                style={{ padding: "8px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <ShareIcon size={14} color="var(--color-ink)" />
                {sending ? "Sending…" : "Invite"}
              </button>
            </form>
            {error && <p style={{ color: "var(--danger)", fontSize: 12.5, margin: "-8px 0 14px" }}>{error}</p>}

            {loading && <p style={{ color: "var(--text-dim)", fontSize: 13, fontFamily: "var(--font-data)" }}>Loading collaborators…</p>}

            {!loading && pendingInvites.length > 0 && (
              <>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Pending Invitations
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                  {pendingInvites.map((i) => (
                    <div key={i.id} style={styles.collabRow}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{i.to_name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontFamily: "var(--font-data)" }}>@{i.to_username}</div>
                      </div>
                      <span className="telemetry-badge" style={{ fontSize: 10.5, borderColor: "rgba(229, 228, 226, 0.3)" }}>
                        <span className="telemetry-dot" />
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Active Access
            </div>
            {!loading && collaborators.length === 0 && (
              <p style={{ color: "var(--text-faint)", fontSize: 13, margin: "4px 0 14px" }}>
                Only you have access to this circuit.
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {collaborators.map((c) => (
                <div key={c.id} style={styles.collabRow}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontFamily: "var(--font-data)" }}>@{c.username}</div>
                  </div>
                  <button onClick={() => handleRemove(c.id)} className="btn-ghost-vibe" style={{ padding: "4px 10px", fontSize: 11.5 }}>
                    <TrashIcon size={12} color="var(--danger)" />
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, paddingTop: 14, borderTop: "1px solid var(--color-line)" }}>
              <span className="hotkey-badge">ESC to close</span>
              <button onClick={onClose} className="btn-ghost-vibe" style={{ padding: "8px 20px", fontSize: 13 }}>
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6, 8, 12, 0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    display: "grid",
    placeItems: "center",
    zIndex: 100,
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 460,
    background: "rgba(18, 20, 26, 0.82)",
    backdropFilter: "blur(24px) saturate(170%)",
    WebkitBackdropFilter: "blur(24px) saturate(170%)",
    border: "1px solid rgba(255, 255, 255, 0.14)",
    borderRadius: "var(--radius)",
    padding: "30px 28px",
    boxShadow: "0 28px 80px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.18), 0 0 36px rgba(229, 228, 226, 0.08)",
    overflow: "hidden",
    margin: "0 20px",
  },
  cardGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: "linear-gradient(90deg, transparent, rgba(229, 228, 226, 0.8), transparent)",
  },
  input: {
    flex: 1,
    background: "rgba(14, 16, 20, 0.65)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    color: "var(--color-paper)",
    fontFamily: "var(--font-body)",
    fontSize: 13.5,
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  collabRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
  },
};
