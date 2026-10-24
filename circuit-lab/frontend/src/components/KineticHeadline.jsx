import { motion } from "framer-motion";

/**
 * Editorial Kinetic Headline Component (Section 3.3).
 * Headlines reveal line-by-line using masked vertical slide-up.
 * Avoids chaotic letter-by-letter spam; delivers clean, impactful editorial reveals.
 */
export default function KineticHeadline({
  lines = [],
  as: Component = "h1",
  style = {},
  className = "",
  uppercase = false,
  tracking = "-0.03em",
  delay = 0,
}) {
  const lineArray = Array.isArray(lines) ? lines : [lines];

  return (
    <Component
      className={`kinetic-headline ${className}`}
      style={{
        margin: 0,
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        letterSpacing: tracking,
        textTransform: uppercase ? "uppercase" : "none",
        ...style,
      }}
    >
      {lineArray.map((line, idx) => (
        <span
          key={idx}
          style={{
            display: "block",
            overflow: "hidden",
            lineHeight: 1.08,
            paddingBottom: "0.08em",
          }}
        >
          <motion.span
            style={{
              display: "block",
              willChange: "transform, opacity",
            }}
            initial={{ y: "115%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + idx * 0.12,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
