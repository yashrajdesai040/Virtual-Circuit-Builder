import { motion } from "framer-motion";

/**
 * High-impact CTA button inspired by cta.gallery and Aceternity UI Shimmer Button.
 * Features an integrated continuity-tester LED, dynamic shimmer sweep,
 * tactile spring physics, and neon halo on hover.
 */
export default function PowerButton({
  status = "idle", // "idle" | "loading" | "error" | "success"
  children,
  style = {},
  variant = "primary", // "primary" | "secondary" | "danger" | "ghost"
  icon = null,
  ...props
}) {
  const isLoading = status === "loading";
  const isError = status === "error";

  const ledColor = isError
    ? "var(--danger)"
    : isLoading
    ? "var(--gold)"
    : variant === "danger"
    ? "var(--danger)"
    : "var(--primary)";

  const isPrimary = variant === "primary";

  return (
    <motion.button
      {...props}
      disabled={isLoading || props.disabled}
      whileHover={
        !isLoading && !props.disabled
          ? {
              y: -2,
              scale: 1.015,
              transition: { duration: 0.18, ease: "easeOut" },
            }
          : {}
      }
      whileTap={!isLoading && !props.disabled ? { scale: 0.975, y: 1 } : {}}
      style={{
        ...styles.base,
        ...(isPrimary ? styles.primary : styles.secondary),
        opacity: props.disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {/* Animated shimmer sweep (Magic UI / Aceternity style) */}
      {isPrimary && !isLoading && <div className="shimmer-effect" />}

      {/* Continuity LED status indicator */}
      <motion.span
        aria-hidden="true"
        style={{
          ...styles.led,
          background: ledColor,
        }}
        animate={
          isLoading
            ? {
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
                boxShadow: [
                  "0 0 0px var(--gold)",
                  "0 0 10px var(--gold), 0 0 20px var(--gold)",
                  "0 0 0px var(--gold)",
                ],
              }
            : isError
            ? {
                scale: [1, 1.25, 1],
                opacity: [1, 0.3, 1],
                boxShadow: [
                  "0 0 8px var(--danger)",
                  "0 0 0px var(--danger)",
                  "0 0 8px var(--danger)",
                ],
              }
            : {
                scale: 1,
                opacity: 1,
                boxShadow: isPrimary
                  ? "0 0 8px rgba(0, 0, 0, 0.4)"
                  : `0 0 8px ${ledColor}`,
              }
        }
        transition={{
          duration: isLoading ? 1.0 : isError ? 0.35 : 0.2,
          repeat: isLoading || isError ? Infinity : 0,
        }}
      />

      {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}

      <span style={{ position: "relative", zIndex: 2 }}>
        {isLoading ? "Connecting…" : children}
      </span>
    </motion.button>
  );
}

const styles = {
  base: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    fontWeight: 600,
    fontSize: 14,
    borderRadius: "var(--radius-sm)",
    padding: "11px 18px",
    cursor: "pointer",
    marginTop: 6,
    fontFamily: "var(--font-body)",
    letterSpacing: "0.01em",
    transition: "box-shadow 0.25s ease, border-color 0.25s ease, background 0.2s ease",
  },
  primary: {
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    fontWeight: 700,
    border: "1px solid var(--cta-border)",
    boxShadow: "var(--cta-shadow)",
  },
  secondary: {
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border-bright)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  led: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flexShrink: 0,
    position: "relative",
    zIndex: 2,
  },
};
