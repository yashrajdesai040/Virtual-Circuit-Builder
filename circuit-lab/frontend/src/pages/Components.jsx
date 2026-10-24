import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "../components/AppShell";
import PartViewer from "../components/3d/PartViewer";
import PartIcon from "../components/PartIcon";
import SpotlightCard from "../components/SpotlightCard";
import KineticHeadline from "../components/KineticHeadline";
import BorderBeam from "../components/BorderBeam";
import LiquidMetalButton from "../components/LiquidMetalButton";
import { CATEGORY_COLOR } from "../constants/categoryColors";
import { ERA_STAGES } from "../constants/eraTints";
import { DEFAULT_COMPONENTS } from "../constants/defaultComponents";
import client from "../api/client";
import soundFX from "../utils/soundEffects";
import { CloseIcon, BoltIcon, CubeIcon } from "../components/icons/PremiumIcons";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
};

const CATEGORIES = [
  { id: "all", label: "All Parts" },
  { id: "passive", label: "Passives" },
  { id: "active", label: "Actives" },
  { id: "power", label: "Power" },
  { id: "ic", label: "ICs" },
  { id: "control", label: "Control" },
  { id: "output", label: "Output" },
  { id: "sensor", label: "Sensors" },
  { id: "board", label: "Boards" },
];

export default function Components() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [eraIndex, setEraIndex] = useState(null);

  useEffect(() => {
    client
      .get("/components")
      .then((res) => {
        const comps = res.data?.components?.length ? res.data.components : DEFAULT_COMPONENTS;
        setItems(comps);
        const params = new URLSearchParams(window.location.search);
        const selectParam = params.get("select");
        if (selectParam && comps.some((c) => c.key === selectParam)) {
          setSelectedKey(selectParam);
        } else if (comps.length) {
          setSelectedKey(comps[0].key);
        }
      })
      .catch(() => {
        setItems(DEFAULT_COMPONENTS);
        const params = new URLSearchParams(window.location.search);
        const selectParam = params.get("select");
        if (selectParam && DEFAULT_COMPONENTS.some((c) => c.key === selectParam)) {
          setSelectedKey(selectParam);
        } else if (DEFAULT_COMPONENTS.length) {
          setSelectedKey(DEFAULT_COMPONENTS[0].key);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((c) => {
      const matchCat = activeCategory === "all" || c.category === activeCategory;
      const matchSearch =
        !search.trim() ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, search]);

  const selected = items.find((c) => c.key === selectedKey);
  const catColor = selected ? (CATEGORY_COLOR[selected.category] || "var(--primary)") : "var(--primary)";

  return (
    <AppShell>
      <div style={{ padding: "36px 6vw" }}>
        {/* Header with Title and Search */}
        <div style={styles.header}>
          <div>
            <div className="tech-badge" style={{ marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)" }} className="neon-active" />
              PHYSICAL HARDWARE SPECIFICATIONS
            </div>
            <KineticHeadline
              lines={["3D Component", "Catalog"]}
              style={styles.title}
              uppercase
              tracking="-0.03em"
            />
            <p style={styles.subtitle}>
              Browse through authentic interactive 3D components, inspect pinouts, ratings, and physical models.
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components…"
              style={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={styles.clearBtn} aria-label="Clear search">
                <CloseIcon size={12} color="var(--text-dim)" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters with Sliding Active Pill */}
        <div style={styles.filterBar}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  ...styles.catBtn,
                  color: isActive ? "var(--text)" : "var(--text-dim)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="comp-cat-pill"
                    style={{ ...styles.activeCatPill, willChange: "transform" }}
                    transition={{ type: "spring", stiffness: 440, damping: 32, mass: 0.7 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 2 }}>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {error && <p style={{ color: "var(--danger)", margin: "20px 0" }}>{error}</p>}
        {loading && <p style={{ color: "var(--text-dim)", margin: "20px 0" }}>Loading 3D catalog…</p>}

        {!loading && !error && (
          <div style={styles.layout}>
            {/* Grid of Components */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-display)" }}>
                  SHOWING {filteredItems.length} {filteredItems.length === 1 ? "PART" : "PARTS"}
                </span>
              </div>

              <motion.div style={styles.grid} variants={gridVariants} initial="hidden" animate="show" layout>
                {filteredItems.map((c) => {
                  const isSelected = c.key === selectedKey;
                  const itemColor = CATEGORY_COLOR[c.category] || "var(--primary)";

                  return (
                    <motion.div
                      key={c.key}
                      variants={cardVariants}
                      layout
                      style={{ cursor: "pointer", height: "100%" }}
                    >
                      <SpotlightCard
                        spotlightColor={`${itemColor}28`}
                        borderColor={isSelected ? itemColor : "var(--color-line)"}
                        onClick={() => {
                      soundFX.playBlip(780);
                      setSelectedKey(c.key);
                    }}
                        style={{
                          height: "100%",
                          background: isSelected ? "rgba(28, 28, 28, 0.95)" : "rgba(22, 22, 22, 0.8)",
                          boxShadow: isSelected ? `0 0 20px -2px ${itemColor}44` : "0 4px 16px rgba(0,0,0,0.3)",
                        }}
                        contentStyle={{
                          padding: "14px 12px 12px",
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          {/* Top Row: Icon + Category Badge */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <PartIcon category={c.category} size={32} />
                            <span
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 9.5,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                padding: "2px 7px",
                                borderRadius: 12,
                                background: `${itemColor}15`,
                                border: `1px solid ${itemColor}45`,
                                color: itemColor,
                                fontWeight: 700,
                              }}
                            >
                              {c.category}
                            </span>
                          </div>

                          {/* Component Title */}
                          <div style={styles.cardName}>{c.name}</div>
                        </div>

                        {/* Bottom Row: Rating / Spec Value */}
                        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          {c.unit ? (
                            <span style={styles.cardValuePill}>
                              {c.default_value} {c.unit}
                            </span>
                          ) : (
                            <span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-data)" }}>
                              {c.spec?.pins?.length ? `${c.spec.pins.length} pins` : "component"}
                            </span>
                          )}

                          {isSelected && (
                            <span style={{ fontSize: 9.5, color: itemColor, fontWeight: 700, fontFamily: "var(--font-data)", letterSpacing: "0.04em" }}>
                              INSPECTING
                            </span>
                          )}
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Sticky 3D Detail Panel */}
            <div style={styles.detailPanel}>
              <div style={styles.viewerFrame}>
                <BorderBeam
                  size={340}
                  duration={9}
                  colorFrom={eraIndex !== null ? ERA_STAGES[eraIndex].tint : "#FFFFFF"}
                  colorTo="#94A3B8"
                />
                {/* 3D Canvas */}
                <div style={styles.viewer}>
                  <AnimatePresence mode="wait">
                    {selected && (
                      <motion.div
                        key={selected.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <PartViewer
                          modelType={selected.model_type}
                          partKey={selected.key}
                          eraTint={eraIndex !== null ? ERA_STAGES[eraIndex].tint : null}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* HUD badges over 3D Canvas */}
                  <div style={styles.hudOverlay}>
                    {selected && (
                      <span style={{ ...styles.viewerChip, color: catColor, borderColor: `${catColor}55` }}>
                        ● {selected.category}
                      </span>
                    )}
                    <span style={styles.controlHint}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <CubeIcon size={12} color="currentColor" /> Orbit 3D · Drag space · Scroll zoom
                      </span>
                    </span>
                  </div>
                </div>

                {/* Section 3.2 Era Scrubber */}
                <div style={styles.eraBar}>
                  <div style={styles.eraTopRow}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--color-accent)", textTransform: "uppercase" }}>
                      3D Era Tint
                    </span>
                    {eraIndex !== null && (
                      <button onClick={() => setEraIndex(null)} style={styles.eraReset}>
                        Reset Tint
                      </button>
                    )}
                  </div>
                  <div style={styles.eraTrack}>
                    {ERA_STAGES.map((st, i) => {
                      const isCur = eraIndex === i;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setEraIndex(isCur ? null : i)}
                          style={{
                            ...styles.eraPill,
                            borderColor: isCur ? st.tint : "var(--color-line)",
                            background: isCur ? `${st.tint}33` : "var(--surface-2)",
                            color: isCur ? "var(--color-paper)" : "var(--text-dim)",
                          }}
                          title={`${st.name} (${st.range}) - ${st.mood}`}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.tint, flexShrink: 0 }} />
                          <span className="mono" style={{ fontSize: 10 }}>{st.id}</span>
                          <span style={{ fontSize: 10.5, fontWeight: isCur ? 700 : 400 }}>{st.name.split("-")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                  {eraIndex !== null && (
                    <div style={styles.eraInfo}>
                      <span className="mono" style={{ color: ERA_STAGES[eraIndex].tint, fontWeight: 700 }}>
                        Stage {ERA_STAGES[eraIndex].id}: {ERA_STAGES[eraIndex].name}
                      </span>
                      <span className="mono" style={{ color: "var(--text-dim)", marginLeft: 6 }}>
                        ({ERA_STAGES[eraIndex].range})
                      </span>
                      <div style={{ color: "var(--text-faint)", fontSize: 11, marginTop: 2 }}>
                        Mood: {ERA_STAGES[eraIndex].mood} · Audio: {ERA_STAGES[eraIndex].ambientSound}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selected && (
                <div style={styles.specCard}>
                  <div style={styles.breadcrumb}>
                    Catalog <span style={{ margin: "0 6px", color: "var(--border-bright)" }}>/</span>
                    <span style={{ color: catColor, textTransform: "capitalize", fontWeight: 600 }}>
                      {selected.category}
                    </span>
                  </div>

                  <h2 style={{ margin: "8px 0 10px", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
                    {selected.name}
                  </h2>
                  <p style={{ color: "var(--text-dim)", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 20px" }}>
                    {selected.description}
                  </p>

                  {selected.unit && (
                    <div style={styles.ratingRow}>
                      <div>
                        <div className="mono" style={{ fontSize: 24, color: "var(--primary)", fontWeight: 700 }}>
                          {selected.default_value} {selected.unit}
                        </div>
                        <div style={{ color: "var(--text-faint)", fontSize: 11.5, marginTop: 2 }}>
                          Standard default electrical rating
                        </div>
                      </div>
                      <div className="tech-badge">
                        ACTIVE RATING
                      </div>
                    </div>
                  )}

                  <div className="eyebrow" style={{ margin: "20px 0 10px", fontSize: 11 }}>
                    Hardware Pinouts & Spec
                  </div>

                  <div style={styles.specTable}>
                    <Spec label="Terminal Count" value={`${selected.terminal_count} pins`} idx={0} />
                    {Object.entries(selected.spec || {}).map(([k, v], i) => (
                      <Spec key={k} label={k.replace(/_/g, " ")} value={String(v)} idx={i + 1} />
                    ))}
                  </div>

                  <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--color-line)" }}>
                    <LiquidMetalButton
                      variant="platinum"
                      size="md"
                      onClick={() => navigate("/builder")}
                      icon={<BoltIcon size={14} color="#0A0A0D" fill="#0A0A0D" />}
                    >
                      Open in Circuit Builder
                    </LiquidMetalButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Spec({ label, value, idx }) {
  return (
    <div style={{ ...styles.specRow, background: idx % 2 === 0 ? "rgba(20, 28, 38, 0.4)" : "transparent" }}>
      <span style={{ color: "var(--text-dim)", fontSize: 12.5, textTransform: "capitalize" }}>{label}</span>
      <span className="mono" style={{ color: "var(--text)", fontSize: 12.5, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 26,
  },
  title: {
    fontSize: "clamp(24px, 3vw, 32px)",
    margin: "4px 0 6px",
    fontFamily: "var(--font-body)",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "var(--text-dim)",
    fontSize: 14,
    margin: 0,
    maxWidth: 580,
  },
  searchInput: {
    background: "var(--surface)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: 13,
    padding: "9px 14px",
    outline: "none",
    width: 220,
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  clearBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    cursor: "pointer",
    fontSize: 11,
  },
  filterBar: {
    display: "flex",
    gap: 6,
    overflowX: "auto",
    paddingBottom: 14,
    marginBottom: 16,
  },
  catBtn: {
    position: "relative",
    background: "var(--surface)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-full)",
    padding: "6px 14px",
    fontSize: 12.5,
    fontFamily: "var(--font-display)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    transition: "color 0.2s ease",
  },
  activeCatPill: {
    position: "absolute",
    inset: 0,
    borderRadius: "var(--radius-full)",
    background: "var(--surface-2)",
    border: "1px solid var(--border-bright)",
    boxShadow: "0 2px 12px var(--primary-glow)",
    zIndex: 1,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 470px",
    gap: 30,
    alignItems: "start",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
    gap: 12,
  },
  cardName: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "var(--color-paper)",
    lineHeight: 1.35,
    fontFamily: "var(--font-display)",
    wordBreak: "break-word",
  },
  cardValuePill: {
    fontFamily: "var(--font-data)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-accent)",
    padding: "2px 7px",
    borderRadius: 4,
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(229, 228, 226, 0.22)",
    letterSpacing: "0.02em",
  },
  categoryChip: {
    fontFamily: "var(--font-display)",
    fontSize: 9.5,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    padding: "2px 8px",
    borderRadius: 20,
    background: "rgba(0, 0, 0, 0.3)",
    border: "1px solid",
    marginTop: 6,
    fontWeight: 600,
  },
  cardValue: {
    fontFamily: "var(--font-display)",
    fontSize: 11,
    color: "var(--text-faint)",
    marginTop: 5,
  },
  detailPanel: {
    position: "sticky",
    top: 86,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  viewerFrame: {
    position: "relative",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    border: "1px solid var(--border)",
    boxShadow: "var(--card-shadow)",
    background: "var(--surface)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
  },
  viewer: {
    position: "relative",
    height: 380,
    background: "var(--bg)",
  },
  hudOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pointerEvents: "none",
  },
  viewerChip: {
    fontFamily: "var(--font-display)",
    fontSize: 10.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: 20,
    background: "var(--surface-2)",
    backdropFilter: "blur(6px)",
    border: "1px solid var(--border)",
    fontWeight: 600,
  },
  controlHint: {
    fontFamily: "var(--font-display)",
    fontSize: 10,
    color: "var(--text-faint)",
    background: "var(--surface)",
    padding: "4px 8px",
    borderRadius: 6,
    backdropFilter: "blur(4px)",
    border: "1px solid var(--border)",
  },
  specCard: {
    background: "var(--surface)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "22px 24px",
    boxShadow: "var(--card-shadow)",
  },
  breadcrumb: {
    fontFamily: "var(--font-display)",
    fontSize: 11,
    color: "var(--text-faint)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderTop: "1px solid var(--border)",
  },
  specTable: {
    display: "flex",
    flexDirection: "column",
    borderRadius: "var(--radius-sm)",
    overflow: "hidden",
    border: "1px solid var(--border)",
  },
  specRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "9px 12px",
  },
  eraBar: {
    padding: "12px 14px",
    background: "var(--color-ink-soft)",
    borderTop: "1px solid var(--color-line)",
  },
  eraTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eraReset: {
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 10,
    cursor: "pointer",
    fontFamily: "var(--font-data)",
    textDecoration: "underline",
    padding: 0,
  },
  eraTrack: {
    display: "flex",
    gap: 6,
    overflowX: "auto",
  },
  eraPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    border: "1px solid",
    borderRadius: "var(--radius-full)",
    padding: "3px 8px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  eraInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    fontSize: 11.5,
  },
};
