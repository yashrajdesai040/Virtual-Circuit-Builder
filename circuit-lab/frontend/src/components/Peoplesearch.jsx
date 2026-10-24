import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AppShell from "./AppShell";
import KineticHeadline from "./KineticHeadline";
import SpotlightCard from "./SpotlightCard";
import { SearchIcon } from "./AnimatedIcon";
import client from "../api/client";

const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PeopleSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      client
        .get("/users/search", { params: { q: query.trim() } })
        .then((res) => setUsers(res.data.users || []))
        .finally(() => {
          setLoading(false);
          setSearched(true);
        });
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <AppShell>
      <div style={{ padding: "40px 6vw 60px" }}>
        <div style={{ maxWidth: 680, marginBottom: 28 }}>
          <div className="eyebrow">Community</div>
          <KineticHeadline
            text="Find Fellow Builders"
            as="h1"
            style={styles.heroTitle}
          />
          <p style={{ color: "var(--text-dim)", fontSize: 15, lineHeight: 1.6, margin: "10px 0 0" }}>
            Search by username to view public workspaces, saved circuits, and collaborative boards.
          </p>
        </div>

        <div style={styles.searchWrapper}>
          <SearchIcon size={16} color="var(--text-faint)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or handle…"
            style={styles.search}
            autoFocus
          />
          <span className="hotkey-badge" style={{ marginLeft: "auto" }}>Search</span>
        </div>

        {loading && <p style={{ color: "var(--text-dim)", marginTop: 20, fontFamily: "var(--font-data)" }}>Scanning user database…</p>}

        {!loading && searched && users.length === 0 && (
          <div style={styles.empty}>No builders match "{query}".</div>
        )}

        {!loading && users.length > 0 && (
          <motion.div style={styles.grid} variants={gridVariants} initial="hidden" animate="show">
            {users.map((u) => (
              <motion.div key={u.id} variants={cardVariants}>
                <SpotlightCard style={{ padding: 0 }}>
                  <Link to={`/u/${u.username}`} style={styles.card}>
                    <div style={styles.avatar}>{initials(u.name)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.name}>{u.name}</div>
                      <div style={styles.username}>@{u.username}</div>
                    </div>
                  </Link>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}

const styles = {
  heroTitle: {
    margin: "6px 0 0",
    fontSize: "clamp(28px, 3.4vw, 40px)",
    fontWeight: 700,
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    maxWidth: 480,
    background: "var(--color-ink-soft)",
    border: "1px solid var(--color-line)",
    borderRadius: "var(--radius-sm)",
    padding: "4px 14px",
    marginBottom: 28,
  },
  search: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "var(--color-paper)",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    outline: "none",
    padding: "8px 0",
  },
  empty: {
    border: "1px dashed var(--color-line)",
    borderRadius: "var(--radius)",
    padding: "40px",
    color: "var(--text-dim)",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 14,
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 18px",
    textDecoration: "none",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(229, 228, 226, 0.2), var(--color-ink-soft))",
    border: "1px solid var(--color-accent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-accent)",
    flexShrink: 0,
  },
  name: { fontSize: 14.5, fontWeight: 600, color: "var(--color-paper)", fontFamily: "var(--font-display)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  username: { fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-data)" },
};
