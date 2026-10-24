import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AppShell from "../components/AppShell";
import KineticHeadline from "../components/KineticHeadline";
import SpotlightCard from "../components/SpotlightCard";
import { HeartIcon } from "../components/AnimatedIcon";
import { CommentIcon } from "../components/icons/PremiumIcons";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

const STATUS_LABEL = {
  complete: "Working",
  open: "Open circuit",
  short: "Short circuit",
  no_source: "No power",
};
const STATUS_COLOR = {
  complete: "var(--color-green)",
  open: "var(--gold)",
  short: "var(--danger)",
  no_source: "var(--text-faint)",
};

const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Profile() {
  const { username } = useParams();
  const { user: viewer } = useAuth();

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  function load() {
    setLoading(true);
    setNotFound(false);
    Promise.all([
      client.get(`/users/${username}`),
      client.get(`/users/${username}/projects`),
    ])
      .then(([profileRes, projectsRes]) => {
        setProfile(profileRes.data.user);
        setProjects(projectsRes.data.projects);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  async function toggleFollow() {
    if (!viewer) return;
    setFollowLoading(true);
    try {
      const res = await client.post(`/users/${username}/follow`);
      setProfile((p) => ({
        ...p,
        is_following: res.data.following,
        follower_count: res.data.follower_count,
      }));
    } finally {
      setFollowLoading(false);
    }
  }

  function startEditBio() {
    setBioDraft(profile.bio || "");
    setEditingBio(true);
  }

  async function saveBio() {
    setSavingBio(true);
    try {
      await client.patch("/users/me/bio", { bio: bioDraft });
      setProfile((p) => ({ ...p, bio: bioDraft }));
      setEditingBio(false);
    } finally {
      setSavingBio(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: "60px 6vw", color: "var(--text-dim)", fontFamily: "var(--font-data)" }}>Loading profile…</div>
      </AppShell>
    );
  }

  if (notFound || !profile) {
    return (
      <AppShell>
        <div style={{ padding: "60px 6vw", maxWidth: 480 }}>
          <div style={styles.empty}>
            No profile found for <strong>@{username}</strong>.
          </div>
          <Link to="/people" style={{ color: "var(--color-accent)", fontSize: 13.5, display: "inline-block", marginTop: 14 }}>
            ← Search for someone else
          </Link>
        </div>
      </AppShell>
    );
  }

  const isMe = profile.is_me;

  return (
    <AppShell>
      <div style={{ padding: "40px 6vw 60px" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={styles.header}
        >
          <div style={styles.avatar}>{initials(profile.name)}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <KineticHeadline
                text={profile.name}
                as="h1"
                style={styles.name}
              />
              {!isMe && viewer && (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={profile.is_following ? "btn-ghost-vibe" : "btn-tactile-gold btn-shimmer"}
                  style={{ padding: "6px 16px", fontSize: 12.5 }}
                >
                  {profile.is_following ? "Following" : "+ Follow"}
                </button>
              )}
            </div>
            <div style={styles.username}>@{profile.username}</div>

            {editingBio ? (
              <div style={{ marginTop: 12 }}>
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  maxLength={280}
                  rows={3}
                  style={styles.bioInput}
                  placeholder="Tell people what you build…"
                />
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    onClick={saveBio}
                    disabled={savingBio}
                    className="btn-tactile-gold btn-shimmer"
                    style={{ padding: "6px 16px", fontSize: 12.5 }}
                  >
                    {savingBio ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingBio(false)}
                    className="btn-ghost-vibe"
                    style={{ padding: "6px 14px", fontSize: 12.5 }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p style={styles.bio}>
                {profile.bio || (isMe ? "No bio yet." : "")}
                {isMe && (
                  <button onClick={startEditBio} style={styles.editBioBtn}>
                    {profile.bio ? "Edit" : "Add a bio"}
                  </button>
                )}
              </p>
            )}

            <div style={styles.statsRow}>
              <Link to={`/u/${profile.username}/followers`} style={styles.stat}>
                <strong style={{ color: "var(--color-accent)", fontFamily: "var(--font-data)" }}>{profile.follower_count}</strong> followers
              </Link>
              <Link to={`/u/${profile.username}/following`} style={styles.stat}>
                <strong style={{ color: "var(--color-accent)", fontFamily: "var(--font-data)" }}>{profile.following_count}</strong> following
              </Link>
              <span style={styles.stat}>
                <strong style={{ color: "var(--color-accent)", fontFamily: "var(--font-data)" }}>{profile.project_count}</strong> public circuits
              </span>
            </div>
          </div>
        </motion.div>

        <h2 style={styles.sectionTitle}>Public circuits</h2>

        {projects.length === 0 && (
          <div style={styles.empty}>
            {isMe ? "You haven't shared any circuits yet." : `${profile.name} hasn't shared any circuits yet.`}
          </div>
        )}

        {projects.length > 0 && (
          <motion.div style={styles.grid} variants={gridVariants} initial="hidden" animate="show">
            {projects.map((p) => (
              <motion.div key={p.id} variants={cardVariants}>
                <SpotlightCard style={{ padding: 0, height: "100%", overflow: "hidden" }}>
                  <Link to={`/circuits/${p.id}`} style={styles.card}>
                    <div style={styles.cardTop}>
                      <span style={styles.cardName}>{p.name}</span>
                      {p.last_run_status && (
                        <span
                          className="telemetry-badge"
                          style={{
                            fontSize: 10,
                            padding: "2px 8px",
                            color: STATUS_COLOR[p.last_run_status],
                            borderColor: "currentColor",
                          }}
                        >
                          <span
                            className={p.last_run_status === "complete" ? "telemetry-dot telemetry-dot-green" : "telemetry-dot"}
                          />
                          {STATUS_LABEL[p.last_run_status]}
                        </span>
                      )}
                    </div>
                    {p.description && <p style={styles.cardDesc}>{p.description}</p>}
                    <div style={styles.cardFooter}>
                      <span style={styles.metaIcon}>
                        <HeartIcon size={13} color="var(--danger)" filled />
                        <span style={{ fontFamily: "var(--font-data)", fontSize: 11.5 }}>{p.like_count}</span>
                      </span>
                      <span style={styles.metaIcon}>
                        <CommentIcon size={12} color="currentColor" />
                        <span style={{ fontFamily: "var(--font-data)", fontSize: 11.5 }}>{p.comment_count}</span>
                      </span>
                      <span style={{ ...styles.metaIcon, fontFamily: "var(--font-data)", fontSize: 11.5 }}>
                        {p.component_count} parts
                      </span>
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
  header: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
    paddingBottom: 30,
    marginBottom: 30,
    borderBottom: "1px solid var(--color-line)",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(229, 228, 226, 0.2), var(--color-ink-soft))",
    border: "2px solid var(--color-accent)",
    boxShadow: "0 0 24px rgba(229, 228, 226, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: 26,
    fontWeight: 700,
    color: "var(--color-accent)",
    flexShrink: 0,
  },
  name: { fontSize: 26, fontWeight: 700, margin: 0, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" },
  username: { color: "var(--text-faint)", fontSize: 13.5, marginTop: 2, fontFamily: "var(--font-data)" },
  bio: { color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 520 },
  editBioBtn: {
    background: "transparent",
    border: "none",
    color: "var(--color-accent)",
    cursor: "pointer",
    fontSize: 12.5,
    marginLeft: 10,
    padding: 0,
    textDecoration: "underline",
  },
  bioInput: {
    width: "100%",
    maxWidth: 460,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 13.5,
    fontFamily: "var(--font-body)",
    resize: "vertical",
    outline: "none",
  },
  statsRow: { display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" },
  stat: { color: "var(--text-dim)", fontSize: 13, textDecoration: "none" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 16px",
    fontFamily: "var(--font-display)",
    letterSpacing: "-0.01em",
  },
  empty: {
    border: "1px dashed var(--color-line)",
    borderRadius: "var(--radius)",
    padding: "36px",
    color: "var(--text-dim)",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "20px 22px",
    textDecoration: "none",
    height: "100%",
  },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  cardName: { fontSize: 16, fontWeight: 700, color: "var(--color-paper)", fontFamily: "var(--font-display)" },
  cardDesc: {
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 1.5,
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    marginTop: "auto",
    paddingTop: 12,
    display: "flex",
    gap: 14,
    color: "var(--text-faint)",
    fontSize: 12,
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    alignItems: "center",
  },
  metaIcon: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  },
};
