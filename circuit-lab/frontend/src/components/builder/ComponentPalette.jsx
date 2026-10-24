import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PartIcon from "../PartIcon";
import { CATEGORY_COLOR } from "../../constants/categoryColors";
import { CloseIcon } from "../icons/PremiumIcons";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

const STARTER_KEYS = ["esp32", "pir_motion_sensor", "humidity_sensor", "soil_moisture_sensor", "led", "resistor"];

const CATEGORY_LABEL = {
  passive: "Passive",
  active: "Active",
  ic: "ICs",
  source: "Power",
  control: "Control",
  output: "Output",
  sensor: "Sensors",
  board: "Boards",
  display: "Displays",
};

export default function ComponentPalette({ components, loading, onAdd }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  function onDragStart(e, component) {
    e.dataTransfer.setData("application/circuitlab-component", JSON.stringify(component));
    e.dataTransfer.effectAllowed = "move";
  }

  const categories = useMemo(() => {
    const counts = {};
    for (const c of components) counts[c.category] = (counts[c.category] || 0) + 1;
    return Object.keys(counts)
      .sort()
      .map((cat) => ({ key: cat, label: CATEGORY_LABEL[cat] || cat, count: counts[cat] }));
  }, [components]);

  const isSearching = query.trim().length > 0;

  const starterParts = useMemo(
    () => (isSearching ? [] : STARTER_KEYS.map((k) => components.find((c) => c.key === k)).filter(Boolean)),
    [components, isSearching]
  );

  const filtered = components.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === "all" || c.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  function renderCard(c) {
    const catColor = CATEGORY_COLOR[c.category] || "var(--primary)";
    return (
      <div
        key={c.key}
        draggable
        onDragStart={(e) => onDragStart(e, c)}
        onClick={() => onAdd?.(c)}
        style={{ cursor: "pointer" }}
        title="Click to place or drag onto workbench"
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.025, borderColor: catColor, x: -3, boxShadow: `0 4px 12px -2px ${catColor}33` }}
          whileTap={{ scale: 0.96, cursor: "grabbing" }}
          transition={{ duration: 0.15 }}
          style={styles.item}
        >
          <div style={{ flexShrink: 0 }}>
            <PartIcon category={c.category} size={28} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
            <span style={styles.itemName}>{c.name}</span>
            <span style={{ ...styles.itemCategory, color: catColor }}>{c.category}</span>
          </div>
          <span style={styles.dragHandle}>⋮⋮</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.paletteHeader}>
        <div>
          <div className="eyebrow" style={{ fontSize: 10, color: "var(--primary)" }}>
            Parts Palette
          </div>
          <p style={{ color: "var(--text-faint)", fontSize: 11.5, margin: "2px 0 0" }}>
            Click or drag onto workbench
          </p>
        </div>
      </div>

      <div style={{ position: "relative", margin: "10px 0 12px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parts…"
          style={styles.search}
        />
        {query && (
          <button onClick={() => setQuery("")} style={styles.clearBtn} aria-label="Clear search">
            <CloseIcon size={12} color="var(--text-dim)" />
          </button>
        )}
      </div>

      {!isSearching && (
        <div style={styles.categoryRow}>
          <button
            onClick={() => setActiveCategory("all")}
            style={{
              ...styles.categoryPill,
              ...(activeCategory === "all" ? styles.categoryPillActive : {}),
            }}
          >
            All
          </button>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            const color = CATEGORY_COLOR[cat.key] || "var(--primary)";
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  ...styles.categoryPill,
                  ...(isActive ? { borderColor: color, color: color, background: "rgba(0,0,0,0.3)" } : {}),
                }}
              >
                {cat.label} <span style={styles.categoryCount}>{cat.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading && <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 12 }}>Loading components…</p>}

      {starterParts.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div className="eyebrow" style={{ fontSize: 9.5, color: "var(--text-faint)", marginBottom: 6 }}>
            IoT Starter Kit
          </div>
          <motion.div style={styles.list} variants={listVariants} initial="hidden" animate="show">
            {starterParts.map(renderCard)}
          </motion.div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <div className="eyebrow" style={{ fontSize: 9.5, color: "var(--text-faint)", marginBottom: 6 }}>
          {activeCategory === "all" ? "All Components" : CATEGORY_LABEL[activeCategory] || activeCategory}
        </div>

        <motion.div style={styles.list} variants={listVariants} initial="hidden" animate="show">
          {filtered.map(renderCard)}
          {!loading && filtered.length === 0 && (
            <p style={{ color: "var(--text-faint)", fontSize: 12.5, textAlign: "center", padding: "16px 0" }}>
              No parts match "{query}"
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    width: 250,
    flexShrink: 0,
    borderLeft: "1px solid var(--border)",
    background: "var(--surface)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    padding: "18px 14px",
    height: "100%",
    overflowY: "auto",
    boxShadow: "var(--card-shadow)",
  },
  paletteHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  search: {
    width: "100%",
    background: "var(--surface-2)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "7px 10px",
    color: "var(--text)",
    fontSize: 12,
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.15)",
  },
  clearBtn: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "var(--text-faint)",
    fontSize: 10,
    cursor: "pointer",
  },
  categoryRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },
  categoryPill: {
    background: "var(--surface-2)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "3px 8px",
    fontSize: 10.5,
    color: "var(--text-dim)",
    cursor: "pointer",
    fontFamily: "var(--font-display)",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  categoryPillActive: {
    borderColor: "var(--border-bright)",
    color: "var(--text)",
    background: "var(--surface)",
    boxShadow: "0 0 12px var(--primary-glow)",
  },
  categoryCount: {
    opacity: 0.6,
    fontSize: 9,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  item: {
    padding: "7px 9px",
    background: "var(--surface-2)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    cursor: "grab",
    display: "flex",
    alignItems: "center",
    gap: 8,
    userSelect: "none",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: "border-color 0.2s ease, background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
  },
  itemCategory: {
    fontFamily: "var(--font-display)",
    fontSize: 8.5,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  itemName: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dragHandle: {
    fontSize: 11,
    color: "var(--text-faint)",
    opacity: 0.5,
  },
};
