import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PowerButton from "./PowerButton";
import { CloseIcon } from "./icons/PremiumIcons";

const TEMPLATES = [
  { name: "Blank Breadboard", desc: "Clean slate with empty circuit area", tag: "Blank" },
  { name: "LED & Resistor Circuit", desc: "Simple series circuit with power, current limit, and diode", tag: "Beginner" },
  { name: "555 Timer Astable Pulse", desc: "Classic square-wave oscillator circuit", tag: "Intermediate" },
  { name: "ESP32 Sensor Interface", desc: "Microcontroller node with GPIO sensors and logic", tag: "Embedded" },
];

export default function NewCircuitModal({ open, onClose, onCreate, creating, error }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!open) return;
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function applyTemplate(index) {
    setSelectedTemplate(index);
    if (index === 0) {
      setName("");
      setDescription("");
    } else {
      setName(TEMPLATES[index].name);
      setDescription(TEMPLATES[index].desc);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onCreate({ name: name.trim() || "Untitled Circuit", description: description.trim() });
  }

  function handleClose() {
    setName("");
    setDescription("");
    setSelectedTemplate(0);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            style={styles.card}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.cardHeader}>
              <div>
                <div className="eyebrow" style={{ color: "var(--primary)", fontSize: 11, marginBottom: 4 }}>
                  New Circuit
                </div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
                  What are you building?
                </h2>
              </div>
              <button type="button" onClick={handleClose} style={styles.closeBtn} aria-label="Close dialog">
                <CloseIcon size={14} color="var(--text-dim)" />
              </button>
            </div>

            {/* Quick Starter Templates */}
            <div style={{ marginBottom: 18 }}>
              <span style={styles.sectionLabel}>Quick Starters</span>
              <div style={styles.templateGrid}>
                {TEMPLATES.map((tmpl, idx) => {
                  const isSelected = selectedTemplate === idx;
                  return (
                    <motion.button
                      key={tmpl.name}
                      type="button"
                      onClick={() => applyTemplate(idx)}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        ...styles.templateCard,
                        borderColor: isSelected ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                        background: isSelected ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={styles.templateName}>{tmpl.name}</span>
                        <span style={styles.templateTag}>{tmpl.tag}</span>
                      </div>
                      <span style={styles.templateDesc}>{tmpl.desc}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <label style={styles.label}>
              <span style={styles.labelText}>Circuit Name</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dual-LED Emergency Torch"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              <span style={styles.labelText}>
                Description <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional)</span>
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this circuit do, and how does power flow?"
                rows={3}
                style={{ ...styles.input, resize: "vertical" }}
              />
            </label>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.error}
              >
                {error}
              </motion.p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 24 }}>
              <button type="button" onClick={handleClose} style={styles.cancelBtn}>
                Cancel
              </button>
              <div style={{ width: 190 }}>
                <PowerButton
                  type="submit"
                  status={creating ? "loading" : "idle"}
                >
                  Create & open builder
                </PowerButton>
              </div>
            </div>
          </motion.form>
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
    padding: 16,
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 520,
    background: "var(--surface)",
    backdropFilter: "blur(24px) saturate(170%)",
    WebkitBackdropFilter: "blur(24px) saturate(170%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "30px 28px",
    boxShadow: "var(--card-shadow)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    fontSize: 16,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    transition: "color 0.2s ease",
  },
  sectionLabel: {
    display: "block",
    fontSize: 11.5,
    fontFamily: "var(--font-display)",
    color: "var(--text-dim)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  templateCard: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    transition: "all 0.2s ease",
  },
  templateName: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--text)",
  },
  templateTag: {
    fontSize: 9.5,
    fontFamily: "var(--font-display)",
    color: "var(--text)",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    padding: "1px 5px",
    borderRadius: 4,
  },
  templateDesc: {
    fontSize: 11,
    color: "var(--text-dim)",
    lineHeight: 1.3,
  },
  label: {
    display: "block",
    marginBottom: 16,
  },
  labelText: {
    display: "block",
    fontSize: 12.5,
    color: "var(--text)",
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: "100%",
    background: "var(--surface-2)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    color: "var(--text)",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  error: {
    color: "var(--danger)",
    fontSize: 12.5,
    margin: "4px 0 14px",
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid var(--border-bright)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 18px",
    color: "var(--text-dim)",
    fontSize: 13.5,
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
};
