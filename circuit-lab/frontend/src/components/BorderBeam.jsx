import { motion } from "framer-motion";

/**
 * Inspired by beam.jakubantalik.com (border-beam):
 * Hardware-accelerated traveling laser beam effect along the container's border.
 * Uses dual-layer CSS mask-composite to keep the beam strictly on the 1.5px border
 * without overflowing or occluding interior content.
 */
export default function BorderBeam({
  size = 240,
  duration = 8,
  delay = 0,
  colorFrom = "var(--color-accent)",
  colorTo = "var(--color-green)",
  borderWidth = 1.5,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        pointerEvents: "none",
        border: `${borderWidth}px solid transparent`,
        maskImage: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        WebkitMaskImage: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        maskClip: "padding-box, border-box",
        WebkitMaskClip: "padding-box, border-box",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
        overflow: "hidden",
        zIndex: 2,
        ...style,
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          aspectRatio: "1/1",
          width: size,
          transform: "translate(-50%, -50%)",
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${colorFrom} 60deg, ${colorTo} 120deg, transparent 180deg)`,
          filter: "blur(4px)",
          opacity: 1,
        }}
        animate={{
          top: ["0%", "0%", "100%", "100%", "0%"],
          left: ["0%", "100%", "100%", "0%", "0%"],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Super-bright white-hot core laser point */}
      <motion.div
        style={{
          position: "absolute",
          aspectRatio: "1/1",
          width: Math.max(size * 0.65, 100),
          transform: "translate(-50%, -50%)",
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, #FFFFFF 40deg, ${colorFrom} 80deg, transparent 140deg)`,
          opacity: 0.95,
        }}
        animate={{
          top: ["0%", "0%", "100%", "100%", "0%"],
          left: ["0%", "100%", "100%", "0%", "0%"],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
