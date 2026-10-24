import { motion } from "framer-motion";
import CircuitBackground from "./CircuitBackground";
import KineticHeadline from "./KineticHeadline";

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="auth-page-container" style={styles.page}>
      <CircuitBackground />

      {/* Floating color blobs with smooth breathing motion */}
      <motion.div
        style={{ ...styles.blob, width: 380, height: 380, top: "-10%", left: "4%", background: "var(--color-accent)" }}
        animate={{ x: [0, 35, 0], y: [0, 25, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ ...styles.blob, width: 340, height: 340, bottom: "-12%", left: "25%", background: "var(--color-ink-soft)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div style={styles.brandPanel}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="tech-badge" style={{ marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)" }} className="neon-active" />
            VIRTUAL CIRCUIT LAB
          </div>

          <KineticHeadline
            lines={["Build circuits.", "Watch them live."]}
            style={styles.brandTitle}
          />

          <p style={styles.brandSub}>
            Interactive breadboard simulation in real 3D. Wire resistors, LEDs,
            microcontrollers, and sensors with instant mathematical nodal analysis
            and real-time live telemetry.
          </p>

          <div style={styles.badgeRow}>
            <div style={styles.specBadge}>
              <span style={styles.specVal}>28+</span>
              <span style={styles.specLabel}>3D Parts</span>
            </div>
            <div style={styles.specBadge}>
              <span style={styles.specVal}>MNA</span>
              <span style={styles.specLabel}>Matrix Solver</span>
            </div>
            <div style={styles.specBadge}>
              <span style={styles.specVal}>0ms</span>
              <span style={styles.specLabel}>CORS Proxy</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        style={styles.cardWrap}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div className="eyebrow" style={{ color: "var(--primary)", fontSize: 11 }}>
              {eyebrow}
            </div>
            <div style={styles.pcbTraceCorner} />
          </div>

          <h2 style={styles.cardTitle}>{title}</h2>
          {subtitle && <p style={styles.cardSub}>{subtitle}</p>}

          <div style={{ marginTop: 20 }}>
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr",
    alignItems: "center",
    padding: "0 7vw",
    gap: 48,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(110px)",
    opacity: 0.14,
    zIndex: 0,
    pointerEvents: "none",
  },
  brandPanel: {
    position: "relative",
    zIndex: 1,
    maxWidth: 480,
  },
  brandTitle: {
    fontFamily: "var(--font-body)",
    fontWeight: 800,
    fontSize: "clamp(30px, 3.8vw, 46px)",
    lineHeight: 1.12,
    margin: "0 0 20px",
    color: "var(--text)",
    letterSpacing: "-0.02em",
  },
  brandSub: {
    color: "var(--text-dim)",
    fontSize: 15,
    lineHeight: 1.6,
    margin: "0 0 28px",
  },
  badgeRow: {
    display: "flex",
    gap: 14,
  },
  specBadge: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "10px 16px",
    borderRadius: "var(--radius-sm)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
  },
  specVal: {
    fontFamily: "var(--font-display)",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--text)",
  },
  specLabel: {
    fontSize: 11,
    color: "var(--text-faint)",
    letterSpacing: "0.02em",
  },
  cardWrap: {
    position: "relative",
    zIndex: 2,
    maxWidth: 430,
    width: "100%",
  },
  card: {
    position: "relative",
    background: "var(--surface)",
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "34px 30px",
    boxShadow: "var(--card-shadow)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pcbTraceCorner: {
    width: 20,
    height: 8,
    borderRight: "2px solid var(--color-accent)",
    borderTop: "2px solid var(--color-accent)",
    opacity: 0.8,
  },
  cardTitle: {
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    fontSize: 24,
    margin: "0 0 6px",
    color: "var(--text)",
    letterSpacing: "-0.01em",
  },
  cardSub: {
    color: "var(--text-dim)",
    fontSize: 13.5,
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
};
