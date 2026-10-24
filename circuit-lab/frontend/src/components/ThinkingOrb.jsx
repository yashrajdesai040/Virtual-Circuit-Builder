import { motion } from "framer-motion";

/**
 * Inspired by orbs.jakubantalik.com (thinking-orbs):
 * Theme-aware dotted particle orbit + fluid chromatic dispersion nucleus.
 * Perfectly reflects AI agent cognition states:
 * - 'idle': Gentle breathing luminescence & slow orbital rotation
 * - 'thinking': Rapid multi-axis acceleration & turbulent fluid flare
 * - 'complete': Serene #6D712E emerald-gold resonance
 * - 'fault': Crackling short-circuit fault pulse
 */
export default function ThinkingOrb({
  state = "idle", // 'idle' | 'thinking' | 'complete' | 'fault'
  size = 48,
  showLabel = false,
  label = "",
  className = "",
  style = {},
  onClick,
}) {
  const isThinking = state === "thinking";
  const isComplete = state === "complete";
  const isFault = state === "fault";

  const colorMap = {
    idle: {
      aura: "rgba(229, 228, 226, 0.32)",
      core1: "#FFFFFF",
      core2: "#94A3B8",
      highlight: "#FFFFFF",
      dot: "#FFFFFF",
      label: "AI Copilot Ready",
    },
    thinking: {
      aura: "rgba(229, 228, 226, 0.45)",
      core1: "#FFFFFF",
      core2: "#94A3B8",
      highlight: "#FFFFFF",
      dot: "#38bdf8",
      label: "Computing Nodal Mesh…",
    },
    complete: {
      aura: "rgba(109, 113, 46, 0.45)",
      core1: "#6D712E",
      core2: "#A3AA3E",
      highlight: "#E8F0A2",
      dot: "#6D712E",
      label: "Circuit Stable",
    },
    fault: {
      aura: "rgba(255, 71, 87, 0.45)",
      core1: "#ff4757",
      core2: "#ff9f43",
      highlight: "#ffeaa7",
      dot: "#ff4757",
      label: "Fault Detected",
    },
  };

  const current = colorMap[state] || colorMap.idle;
  const displayLabel = label || current.label;

  // 8 Orbital satellite dots (signature Jakub Antalik dotted orb style)
  const orbitalDots = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * 360,
    delay: (i / 8) * 1.5,
  }));

  return (
    <div
      onClick={onClick}
      className={`thinking-orb-wrap ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {/* Layer 1: Ambient Breathing Luminescence */}
        <motion.div
          style={{
            position: "absolute",
            inset: -size * 0.28,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${current.aura} 0%, transparent 70%)`,
            filter: "blur(7px)",
          }}
          animate={
            isThinking
              ? { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
              : { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }
          }
          transition={{
            duration: isThinking ? 1.2 : 3.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 2: Dotted Orbital Ring (Jakub Antalik benchmark signature) */}
        <motion.div
          style={{
            position: "absolute",
            inset: -size * 0.16,
            borderRadius: "50%",
            pointerEvents: "none",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: isThinking ? 3.5 : 12,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {orbitalDots.map((dot, idx) => (
            <motion.div
              key={idx}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: size * 0.08,
                height: size * 0.08,
                borderRadius: "50%",
                background: current.dot,
                boxShadow: `0 0 6px ${current.dot}`,
                transform: `rotate(${dot.angle}deg) translate(${size * 0.58}px) rotate(-${dot.angle}deg)`,
              }}
              animate={
                isThinking
                  ? { scale: [0.7, 1.3, 0.7], opacity: [0.4, 1, 0.4] }
                  : { scale: [0.85, 1.1, 0.85], opacity: [0.5, 0.9, 0.5] }
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: dot.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Layer 3: Outer Chromatic Energy Ring */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `conic-gradient(from 0deg, ${current.core1}, ${current.core2}, ${current.highlight}, ${current.core1})`,
            filter: "blur(2.5px)",
            opacity: 0.88,
          }}
          animate={{
            rotate: -360,
            scale: isThinking ? [1, 1.12, 1] : [1, 1.03, 1],
          }}
          transition={{
            rotate: {
              duration: isThinking ? 2 : 8,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: isThinking ? 1 : 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Layer 4: High-Density Fluid Volumetric Nucleus */}
        <motion.div
          style={{
            position: "absolute",
            inset: size * 0.12,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${current.highlight} 0%, ${current.core1} 45%, ${current.core2} 85%, #0E0E0E 100%)`,
            boxShadow: `inset 0 0 10px rgba(0,0,0,0.65), 0 0 14px ${current.aura}`,
          }}
          animate={
            isThinking
              ? {
                  borderRadius: [
                    "50% 50% 50% 50%",
                    "46% 54% 58% 42%",
                    "54% 46% 42% 58%",
                    "50% 50% 50% 50%",
                  ],
                  scale: [1, 0.95, 1.05, 1],
                }
              : { scale: [1, 1.02, 1] }
          }
          transition={{
            duration: isThinking ? 1.5 : 3.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 5: Glossy Specular Crescent */}
        <motion.div
          style={{
            position: "absolute",
            top: size * 0.16,
            left: size * 0.2,
            width: size * 0.34,
            height: size * 0.22,
            borderRadius: "50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 100%)",
            filter: "blur(0.5px)",
            transform: "rotate(-28deg)",
            pointerEvents: "none",
          }}
          animate={isThinking ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.88 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {showLabel && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-paper)",
              letterSpacing: "-0.01em",
            }}
          >
            {displayLabel}
          </span>
          <span
            style={{
              fontFamily: "var(--font-data)",
              fontSize: 10,
              color: "var(--text-faint)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {state}
          </span>
        </div>
      )}
    </div>
  );
}
