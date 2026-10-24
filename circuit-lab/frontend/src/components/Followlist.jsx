import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import AppShell from "../components/AppShell";
import KineticHeadline from "./KineticHeadline";
import client from "../api/client";

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Renders at both /u/:username/followers and /u/:username/following
export default function FollowList() {
  const { username } = useParams();
  const location = useLocation();
  const mode = location.pathname.endsWith("/following") ? "following" : "followers";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client
      .get(`/users/${username}/${mode}`)
      .then((res) => setUsers(res.data.users || []))
      .finally(() => setLoading(false));
  }, [username, mode]);

  const titleText = mode === "followers" ? `@${username}'s followers` : `@${username} is following`;

  return (
    <AppShell>
      <div style={{ padding: "40px 6vw 60px", maxWidth: 600 }}>
        <Link to={`/u/${username}`} style={{ color: "var(--color-accent)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          ← Back to profile
        </Link>
        
        <div style={{ margin: "16px 0 24px" }}>
          <KineticHeadline
            text={titleText}
            as="h1"
            style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          />
        </div>

        {loading && <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-data)" }}>Loading network…</p>}

        {!loading && users.length === 0 && (
          <div style={styles.empty}>
            {mode === "followers" ? "No followers yet." : "Not following anyone yet."}
          </div>
        )}

        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {users.map((u) => (
              <Link key={u.id} to={`/u/${u.username}`} style={styles.row}>
                <div style={styles.avatar}>{initials(u.name)}</div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-paper)", fontFamily: "var(--font-display)" }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-data)" }}>@{u.username}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

const styles = {
  empty: {
    border: "1px dashed var(--color-line)",
    borderRadius: "var(--radius)",
    padding: "36px",
    color: "var(--text-dim)",
    textAlign: "center",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 14px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(28, 28, 28, 0.4)",
    border: "1px solid var(--color-line)",
    textDecoration: "none",
    transition: "background 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(229, 228, 226, 0.2), var(--color-ink-soft))",
    border: "1px solid var(--color-accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-accent)",
    flexShrink: 0,
  },
};
