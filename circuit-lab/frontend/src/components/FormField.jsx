import { motion, AnimatePresence } from "framer-motion";

export default function FormField({
  label,
  error,
  icon = null,
  rightSlot = null,
  labelRight = null,
  ...inputProps
}) {
  return (
    <div style={{ display: "block", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        {label && <label htmlFor={inputProps.id} style={styles.label}>{label}</label>}
        {labelRight}
      </div>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={styles.iconWrap}>
            {icon}
          </span>
        )}
        <input
          {...inputProps}
          style={{
            ...styles.input,
            paddingLeft: icon ? 36 : 12,
            paddingRight: rightSlot ? 38 : 12,
            ...(error ? styles.inputError : {}),
            ...inputProps.style,
          }}
        />
        {rightSlot && (
          <div style={styles.rightSlot}>
            {rightSlot}
          </div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4, x: -4 }}
            animate={{ opacity: 1, y: 0, x: [0, -3, 3, -2, 2, 0] }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={styles.error}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  label: {
    display: "block",
    fontSize: 12.5,
    fontWeight: 500,
    color: "var(--text-dim)",
    letterSpacing: "0.01em",
    margin: 0,
  },
  iconWrap: {
    position: "absolute",
    left: 11,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-faint)",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
  },
  rightSlot: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    color: "var(--text)",
    fontSize: 14,
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease",
  },
  inputError: {
    borderColor: "var(--danger) !important",
    boxShadow: "0 0 0 2px rgba(255, 71, 87, 0.18) !important",
  },
  error: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "var(--danger)",
    fontSize: 12,
    marginTop: 6,
    fontWeight: 500,
  },
};
