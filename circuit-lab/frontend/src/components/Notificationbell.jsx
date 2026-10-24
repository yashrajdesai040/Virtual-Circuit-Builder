import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import client from "../api/client";
import { CheckIcon } from "./icons/PremiumIcons";

const POLL_MS = 30000;

export default function NotificationBell() {
  const [invites, setInvites] = useState([]);
  const [open, setOpen] = useState(false);
  const [respondingId, setRespondingId] = useState(null);

  function load() {
    client
      .get("/invites")
      .then((res) => {
        if (Array.isArray(res.data?.invites)) {
          setInvites(res.data.invites);
        } else {
          setInvites([]);
        }
      })
      .catch(() => setInvites([]));
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  async function respond(inviteId, action) {
    setRespondingId(inviteId);
    try {
      await client.post(`/invites/${inviteId}/${action}`);
      setInvites((inv) => (Array.isArray(inv) ? inv.filter((i) => i.id !== inviteId) : []));
      if (action === "accept") {
        window.dispatchEvent(new Event("project-invite-accepted"));
      }
    } catch {
      setInvites((inv) => (Array.isArray(inv) ? inv.filter((i) => i.id !== inviteId) : []));
    } finally {
      setRespondingId(null);
    }
  }

  const safeInvites = Array.isArray(invites) ? invites : [];
  const hasPending = safeInvites.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={styles.bellBtn}
        title="Share requests & notifications"
      >
        <motion.div
          animate={hasPending ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          style={{ display: "grid", placeItems: "center" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
        </motion.div>

        {hasPending && (
          <span style={styles.badgeWrap}>
            <span style={styles.badgePing} />
            <span style={styles.badgeDot}>{safeInvites.length}</span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div style={styles.clickCatcher} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={styles.panel}
            >
              <div style={styles.panelHeader}>
                <span className="eyebrow" style={{ fontSize: 11 }}>
                  Notifications
                </span>
                {hasPending && (
                  <span style={styles.pendingChip}>
                    {safeInvites.length} pending
                  </span>
                )}
              </div>

              {safeInvites.length === 0 && (
                <div style={styles.emptyWrap}>
                  <div style={styles.emptyIcon}>
                    <CheckIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
                  </div>
                  <p style={{ color: "var(--text-dim)", fontSize: 13, margin: 0 }}>
                    You're all caught up!
                  </p>
                  <span style={{ color: "var(--text-faint)", fontSize: 11.5 }}>
                    No pending circuit collaboration invites.
                  </span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {safeInvites.map((inv) => (
                  <motion.div
                    key={inv.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={styles.inviteRow}
                  >
                    <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.45 }}>
                      <strong style={{ color: "var(--text)" }}>{inv.from_name}</strong> wants to collaborate on{" "}
                      <span style={{ color: "var(--primary)", fontWeight: 600 }}>{inv.project_name}</span>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => respond(inv.id, "accept")}
                        disabled={respondingId === inv.id}
                        style={styles.acceptBtn}
                      >
                        {respondingId === inv.id ? "…" : "Accept"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => respond(inv.id, "decline")}
                        disabled={respondingId === inv.id}
                        style={styles.declineBtn}
                      >
                        Decline
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  bellBtn: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    width: 34,
    height: 34,
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-dim)",
    cursor: "pointer",
    transition: "border-color 0.2s ease, color 0.2s ease",
  },
  badgeWrap: {
    position: "absolute",
    top: -4,
    right: -4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badgePing: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "var(--accent)",
    opacity: 0.75,
    animation: "neon-glow-pulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
  },
  badgeDot: {
    position: "relative",
    zIndex: 1,
    minWidth: 16,
    height: 16,
    padding: "0 4px",
    borderRadius: 8,
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    fontSize: 10,
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  clickCatcher: {
    position: "fixed",
    inset: 0,
    zIndex: 90,
  },
  panel: {
    position: "absolute",
    right: 0,
    top: 44,
    width: 320,
    background: "var(--surface)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "16px",
    boxShadow: "var(--card-shadow)",
    zIndex: 100,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pendingChip: {
    fontFamily: "var(--font-display)",
    fontSize: 10,
    color: "var(--gold)",
    background: "rgba(255, 201, 77, 0.12)",
    border: "1px solid rgba(255, 201, 77, 0.3)",
    padding: "2px 7px",
    borderRadius: "var(--radius-full)",
  },
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "20px 0 10px",
    gap: 4,
  },
  emptyIcon: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(109, 113, 46, 0.18)",
    color: "var(--primary)",
    display: "grid",
    placeItems: "center",
    fontSize: 14,
    marginBottom: 6,
  },
  inviteRow: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "12px",
  },
  acceptBtn: {
    flex: 1,
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    border: "1px solid var(--cta-border)",
    boxShadow: "var(--cta-shadow)",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  declineBtn: {
    flex: 1,
    background: "transparent",
    color: "var(--text-dim)",
    border: "1px solid var(--border-bright)",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    cursor: "pointer",
  },
};
