import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import soundFX from "../utils/soundEffects";
import {
  SearchIcon,
  ToolIcon,
  PackageIcon,
  ChartIcon,
  GraduationIcon,
  GlobeIcon,
  AudioOnIcon,
  AudioMutedIcon,
  BoltIcon,
  ChipIcon,
} from "./icons/PremiumIcons";
import client from "../api/client";

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [catalog, setCatalog] = useState([]);
  const [soundMuted, setSoundMuted] = useState(soundFX.isMuted());
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load components for universal quick lookup
  useEffect(() => {
    client.get("/components").then((res) => {
      if (res.data?.components) setCatalog(res.data.components);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      soundFX.playBlip(600);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const defaultActions = useMemo(() => [
    { id: "nav-builder", label: "Open 3D Circuit Builder", category: "Navigation", icon: <ToolIcon size={14} color="#FFFFFF" />, path: "/builder" },
    { id: "nav-components", label: "Browse 93 Component Catalog (3D)", category: "Navigation", icon: <PackageIcon size={14} color="#FFFFFF" />, path: "/components" },
    { id: "nav-dashboard", label: "Go to Dashboard", category: "Navigation", icon: <ChartIcon size={14} color="#FFFFFF" />, path: "/dashboard" },
    { id: "nav-tutorials", label: "Interactive Electronics Tutorials", category: "Navigation", icon: <GraduationIcon size={14} color="#FFFFFF" />, path: "/tutorials" },
    { id: "nav-share", label: "Community Circuits & Showcase", category: "Navigation", icon: <GlobeIcon size={14} color="#FFFFFF" />, path: "/share" },
    {
      id: "cmd-audio",
      label: soundMuted ? "Unmute Laboratory Sound FX" : "Mute Laboratory Sound FX",
      category: "Laboratory",
      icon: soundMuted ? <AudioMutedIcon size={14} color="#94A3B8" /> : <AudioOnIcon size={14} color="#FFFFFF" />,
      action: () => {
        const next = soundFX.toggleMute();
        setSoundMuted(next);
      },
    },
    {
      id: "cmd-new-circuit",
      label: "Start New Circuit Simulation",
      category: "Action",
      icon: <BoltIcon size={14} color="#FFFFFF" fill="#FFFFFF" />,
      action: () => {
        navigate("/builder");
        onClose();
      },
    },
  ], [soundMuted, navigate, onClose]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return defaultActions;

    const matchedActions = defaultActions.filter(
      (a) => a.label.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );

    const matchedComponents = catalog
      .filter((c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.key.toLowerCase().includes(q))
      .slice(0, 12)
      .map((c) => ({
        id: `part-${c.key}`,
        label: c.name,
        category: `Part • ${c.category.toUpperCase()}`,
        icon: <ChipIcon size={14} color="#94A3B8" />,
        action: () => {
          navigate(`/components?select=${c.key}`);
          onClose();
        },
      }));

    return [...matchedActions, ...matchedComponents];
  }, [query, defaultActions, catalog, navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(1, filteredItems.length));
        soundFX.playBlip(900);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
        soundFX.playBlip(800);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item) {
          soundFX.playSwitch();
          if (item.action) item.action();
          else if (item.path) {
            navigate(item.path);
            onClose();
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.overlay} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -16 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div style={styles.searchRow}>
              <span style={styles.searchIcon}>
                <SearchIcon size={16} color="#94A3B8" />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search components, commands, circuits, or tools... (↑↓ to select)"
                style={styles.input}
              />
              <span style={styles.escBadge} onClick={onClose}>ESC</span>
            </div>

            {/* Results List */}
            <div style={styles.resultsList}>
              {filteredItems.length === 0 ? (
                <div style={styles.emptyState}>No matching components or commands found</div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        soundFX.playSwitch();
                        if (item.action) item.action();
                        else if (item.path) {
                          navigate(item.path);
                          onClose();
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      style={{
                        ...styles.item,
                        background: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
                        borderColor: isSelected ? "rgba(229, 228, 226, 0.24)" : "transparent",
                      }}
                    >
                      <div style={styles.itemLeft}>
                        <span style={styles.itemIcon}>{item.icon}</span>
                        <span style={{ ...styles.itemLabel, color: isSelected ? "#fff" : "var(--color-paper)" }}>
                          {item.label}
                        </span>
                      </div>
                      <span style={styles.categoryBadge}>{item.category}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Command Palette Footer */}
            <div style={styles.footer}>
              <div style={styles.shortcutHints}>
                <span><kbd style={styles.kbd}>↑↓</kbd> Navigate</span>
                <span><kbd style={styles.kbd}>↵</kbd> Select</span>
                <span><kbd style={styles.kbd}>ESC</kbd> Close</span>
              </div>
              <span style={styles.telemetryTag}>CIRCUITLAB CORE v2.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(6, 8, 12, 0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "14vh",
  },
  modal: {
    width: "100%",
    maxWidth: 620,
    background: "var(--surface)",
    backdropFilter: "blur(24px) saturate(170%)",
    WebkitBackdropFilter: "blur(24px) saturate(170%)",
    borderRadius: 16,
    border: "1px solid var(--border)",
    boxShadow: "var(--card-shadow)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 18px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface-2)",
  },
  searchIcon: {
    fontSize: 16,
    color: "var(--text-dim)",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontSize: 15,
    fontFamily: "var(--font-display)",
    outline: "none",
  },
  escBadge: {
    fontSize: 10,
    fontFamily: "var(--font-data)",
    padding: "2px 7px",
    borderRadius: 4,
    background: "var(--surface)",
    color: "var(--text-dim)",
    border: "1px solid var(--border)",
    cursor: "pointer",
  },
  resultsList: {
    maxHeight: 380,
    overflowY: "auto",
    padding: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  emptyState: {
    padding: "32px 16px",
    textAlign: "center",
    color: "var(--text-dim)",
    fontSize: 13,
    fontFamily: "var(--font-body)",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "background 0.12s ease",
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  itemIcon: {
    fontSize: 14,
  },
  itemLabel: {
    fontSize: 13.5,
    fontFamily: "var(--font-display)",
    fontWeight: 500,
  },
  categoryBadge: {
    fontSize: 10,
    fontFamily: "var(--font-data)",
    padding: "2px 6px",
    borderRadius: 4,
    background: "var(--surface-2)",
    color: "var(--text-dim)",
    border: "1px solid var(--border)",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 18px",
    background: "var(--surface)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderTop: "1px solid var(--border)",
  },
  shortcutHints: {
    display: "flex",
    gap: 14,
    fontSize: 11,
    color: "var(--text-dim)",
    fontFamily: "var(--font-data)",
  },
  kbd: {
    background: "var(--surface-2)",
    padding: "1px 5px",
    borderRadius: 3,
    border: "1px solid var(--border)",
    color: "var(--text)",
  },
  telemetryTag: {
    fontSize: 9.5,
    fontFamily: "var(--font-data)",
    color: "rgba(109, 113, 46, 0.9)",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
};
