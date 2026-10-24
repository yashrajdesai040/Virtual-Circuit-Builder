import { motion } from "framer-motion";

/**
 * Inspired by iconcreator.dev & kinetics.colorion.co:
 * Precision vector SVG micro-icons with hover-triggered micro-interactions.
 */

export function ZapIcon({ size = 16, color = "currentColor", animate = true }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={animate ? { scale: 1.25, rotate: [0, -10, 10, 0] } : {}}
      transition={{ duration: 0.3 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </motion.svg>
  );
}

export function ChipIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ scale: 1.15 }}
      transition={{ duration: 0.2 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </motion.svg>
  );
}

export function SearchIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ scale: 1.2, rotate: 15 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

export function BellIcon({ size = 16, color = "currentColor", hasAlert = false }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={hasAlert ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
      transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.5 }}
      whileHover={{ scale: 1.15, rotate: 12 }}
      style={{ display: "inline-block", verticalAlign: "middle", transformOrigin: "top center" }}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </motion.svg>
  );
}

export function PlayIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ scale: 1.25 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 14 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </motion.svg>
  );
}

export function SparkIcon({ size = 16, color = "var(--color-accent)" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke="none"
      animate={{ rotate: 360, scale: [1, 1.15, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
    </motion.svg>
  );
}

export function TrashIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ y: -2, rotate: -8 }}
      transition={{ type: "spring", stiffness: 350, damping: 12 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </motion.svg>
  );
}

export function CopyIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ scale: 1.15, x: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </motion.svg>
  );
}

export function ShareIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ scale: 1.2, rotate: 12 }}
      transition={{ type: "spring", stiffness: 400, damping: 14 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </motion.svg>
  );
}

export function SaveIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ scale: 1.18, y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 14 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </motion.svg>
  );
}

export function UndoIcon({ size = 15, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ rotate: -25, scale: 1.15 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </motion.svg>
  );
}

export function RedoIcon({ size = 15, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ rotate: 25, scale: 1.15 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </motion.svg>
  );
}

export function CheckIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <polyline points="20 6 9 17 4 12" />
    </motion.svg>
  );
}

export function HeartIcon({ size = 16, color = "currentColor", filled = false }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ scale: 1.25 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 12 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </motion.svg>
  );
}

export function TrophyIcon({ size = 16, color = "currentColor" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      whileHover={{ scale: 1.2, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 14 }}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
      <path d="M6 4h12v7a6 6 0 0 1-12 0V4Z" />
    </motion.svg>
  );
}
