import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppShell from "../components/AppShell";
import SpotlightCard from "../components/SpotlightCard";
import client from "../api/client";
import { CloseIcon, HeartIcon, CommentIcon, ChipIcon } from "../components/icons/PremiumIcons";

const STATUS_LABEL = {
  complete: "Working",
  open: "Open circuit",
  short: "Short circuit",
  no_source: "No power",
};
const STATUS_COLOR = {
  complete: "var(--primary)",
  open: "var(--gold)",
  short: "var(--danger)",
  no_source: "var(--text-faint)",
};

const gridVariants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
};

const DEMO_PROJECTS = [
  {
    id: "demo-yash11-1",
    name: "Dual-LED Emergency Torch",
    description: "A 9V battery drives two LEDs in series, each protected by its own current-limiting resistor, switched on/off with a toggle — a simple, real emergency flashlight circuit.",
    owner_name: "Yash_11",
    last_run_status: "complete",
    liked_by_me: false,
    like_count: 132,
    comment_count: 18,
    component_count: 5,
    circuit_json: {
      nodes: [
        {
          id: "y1",
          key: "battery_9v",
          name: "9V Battery",
          category: "power",
          unit: "V",
          default_value: 9,
          component_id: 101,
          modelType: "battery",
          x: -1.8,
          z: 0,
        },
        {
          id: "y2",
          key: "switch",
          name: "Toggle Switch",
          category: "control",
          unit: null,
          default_value: null,
          component_id: 102,
          modelType: "switch",
          on: true,
          x: -0.9,
          z: 0,
        },
        {
          id: "y3",
          key: "resistor_1",
          name: "Resistor 1",
          category: "passive",
          unit: "Ω",
          default_value: 220,
          component_id: 103,
          modelType: "resistor",
          x: 0,
          z: 0,
        },
        {
          id: "y4",
          key: "led_1",
          name: "LED 1",
          category: "output",
          unit: null,
          default_value: null,
          component_id: 104,
          modelType: "led",
          x: 0.9,
          z: 0,
        },
        {
          id: "y5",
          key: "resistor_2",
          name: "Resistor 2",
          category: "passive",
          unit: "Ω",
          default_value: 220,
          component_id: 103,
          modelType: "resistor",
          x: 1.8,
          z: 0,
        },
        {
          id: "y6",
          key: "led_2",
          name: "LED 2",
          category: "output",
          unit: null,
          default_value: null,
          component_id: 104,
          modelType: "led",
          x: 2.7,
          z: 0,
        },
      ],
      edges: [
        { id: "ye1", sourceId: "y1", sourceTerminal: "a", targetId: "y2", targetTerminal: "a" },
        { id: "ye2", sourceId: "y2", sourceTerminal: "b", targetId: "y3", targetTerminal: "a" },
        { id: "ye3", sourceId: "y3", sourceTerminal: "b", targetId: "y4", targetTerminal: "a" },
        { id: "ye4", sourceId: "y4", sourceTerminal: "b", targetId: "y5", targetTerminal: "a" },
        { id: "ye5", sourceId: "y5", sourceTerminal: "b", targetId: "y6", targetTerminal: "a" },
        { id: "ye6", sourceId: "y6", sourceTerminal: "b", targetId: "y1", targetTerminal: "b" },
      ],
    },
  },
];

export default function Share() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  function openProject(e, p) {
    if (String(p.id).startsWith("demo-")) {
      e.preventDefault();
      navigate("/builder", {
        state: {
          fromShared: true,
          projectName: p.name,
          ownerName: p.owner_name,
          circuit: p.circuit_json,
        },
      });
    }
  }

  function matchesQuery(p, q) {
    if (!q) return true;
    const needle = q.toLowerCase();
    return p.name.toLowerCase().includes(needle) || (p.description || "").toLowerCase().includes(needle);
  }

  function load(q = "") {
    setLoading(true);
    client
      .get("/community/projects", { params: q ? { q } : {} })
      .then((res) => {
        const demo = DEMO_PROJECTS.filter((p) => matchesQuery(p, q));
        setProjects([...demo, ...res.data.projects]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  async function toggleLike(e, projectId) {
    e.preventDefault();
    e.stopPropagation();
    if (String(projectId).startsWith("demo-")) {
      setProjects((ps) =>
        ps.map((p) =>
          p.id === projectId
            ? { ...p, liked_by_me: !p.liked_by_me, like_count: p.like_count + (p.liked_by_me ? -1 : 1) }
            : p
        )
      );
      return;
    }
    const res = await client.post(`/community/projects/${projectId}/like`);
    setProjects((ps) =>
      ps.map((p) => (p.id === projectId ? { ...p, liked_by_me: res.data.liked, like_count: res.data.like_count } : p))
    );
  }

  return (
    <AppShell>
      <div style={{ padding: "40px 6vw 60px" }}>
        <div style={{ maxWidth: 680, marginBottom: 26 }}>
          <div className="tech-badge" style={{ marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} className="neon-active" />
            COMMUNITY HARDWARE REGISTRY
          </div>
          <h1 style={styles.heroTitle}>
            Explore <span className="gradient-text">Public Circuits</span>
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: 14.5, lineHeight: 1.6, margin: "10px 0 0" }}>
            Explore verified circuits designed by the CircuitLab community. Fork, simulate, or learn how components interact.
          </p>
        </div>

        <div style={{ position: "relative", maxWidth: 480, marginBottom: 26 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shared circuits by title or components…"
            style={styles.search}
          />
          {query && (
            <button onClick={() => setQuery("")} style={styles.clearBtn} aria-label="Clear search">
              <CloseIcon size={12} color="var(--text-dim)" />
            </button>
          )}
        </div>

        {loading && <p style={{ color: "var(--text-dim)", marginTop: 20 }}>Loading shared circuits…</p>}

        {!loading && projects.length === 0 && (
          <div style={styles.empty}>
            {query ? `No shared circuits match "${query}".` : "No public circuits yet — be the first to share one!"}
          </div>
        )}

        {!loading && projects.length > 0 && (
          <motion.div style={styles.grid} variants={gridVariants} initial="hidden" animate="show">
            {projects.map((p) => (
              <motion.div key={p.id} variants={cardVariants}>
                <Link
                  to={`/circuits/${p.id}`}
                  onClick={(e) => openProject(e, p)}
                  style={{ textDecoration: "none" }}
                >
                  <SpotlightCard
                    spotlightColor="rgba(109, 113, 46, 0.14)"
                    borderColor="rgba(47, 62, 80, 0.6)"
                    style={{ padding: "20px 22px", height: "100%", display: "flex", flexDirection: "column" }}
                  >
                    <div style={styles.cardTop}>
                      <span style={styles.cardName}>{p.name}</span>
                      {p.last_run_status && (
                        <span style={{ ...styles.statusPill, color: STATUS_COLOR[p.last_run_status] }}>
                          ● {STATUS_LABEL[p.last_run_status]}
                        </span>
                      )}
                    </div>

                    {p.description && <p style={styles.cardDesc}>{p.description}</p>}

                    <div style={styles.cardFooter}>
                      <div style={styles.authorBadge}>
                        <div style={styles.authorAvatar}>
                          {p.owner_name ? p.owner_name[0].toUpperCase() : "U"}
                        </div>
                        <span style={styles.owner}>@{p.owner_name}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <motion.button
                          whileTap={{ scale: 1.3 }}
                          onClick={(e) => toggleLike(e, p.id)}
                          style={{ ...styles.likeBtn, color: p.liked_by_me ? "var(--danger)" : "var(--text-dim)" }}
                        >
                          <HeartIcon size={13} filled={!!p.liked_by_me} color={p.liked_by_me ? "var(--danger)" : "currentColor"} />
                          <span>{p.like_count}</span>
                        </motion.button>
                        <span style={styles.metaIcon}>
                          <CommentIcon size={12} color="currentColor" />
                          <span>{p.comment_count}</span>
                        </span>
                        <span style={styles.metaIcon}>
                          <ChipIcon size={12} color="currentColor" />
                          <span>{p.component_count || 0}</span>
                        </span>
                      </div>
                    </div>
                  </SpotlightCard>
                </Link>
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
    fontSize: "clamp(26px, 3.4vw, 38px)",
    fontWeight: 800,
    fontFamily: "var(--font-body)",
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },
  search: {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 13.5,
    outline: "none",
    display: "block",
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    cursor: "pointer",
    fontSize: 11,
  },
  empty: {
    border: "1px dashed var(--border-bright)",
    borderRadius: "var(--radius)",
    padding: "48px 24px",
    color: "var(--text-dim)",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text)",
    letterSpacing: "-0.01em",
  },
  statusPill: {
    fontFamily: "var(--font-display)",
    fontSize: 10,
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    flexShrink: 0,
    background: "rgba(0, 0, 0, 0.3)",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    border: "1px solid currentColor",
  },
  cardDesc: {
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 1.5,
    margin: "8px 0 16px",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardFooter: {
    marginTop: "auto",
    paddingTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(47, 62, 80, 0.4)",
  },
  authorBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "var(--surface-2)",
    border: "1px solid var(--border-bright)",
    display: "grid",
    placeItems: "center",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--text-dim)",
  },
  owner: {
    fontSize: 12,
    color: "var(--text-dim)",
    fontFamily: "var(--font-display)",
  },
  likeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 12.5,
    fontFamily: "var(--font-display)",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    transition: "transform 0.15s ease",
  },
  metaIcon: {
    fontSize: 12,
    color: "var(--text-faint)",
    fontFamily: "var(--font-display)",
  },
};
