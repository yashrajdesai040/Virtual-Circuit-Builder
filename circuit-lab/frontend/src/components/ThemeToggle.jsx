import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon } from "./icons/PremiumIcons";
import soundFX from "../utils/soundEffects";

export default function ThemeToggle({ className = "", style = {} }) {
  const { theme, toggleTheme, isDark } = useTheme();

  function handleClick() {
    soundFX.playSwitch(isDark ? 1.2 : 0.85);
    toggleTheme();
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      style={{
        ...styles.button,
        ...style,
      }}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? "Switch to Light Mode (Platinum & Black)" : "Switch to Dark Mode (Black & Platinum)"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={styles.iconWrap}
      >
        {isDark ? (
          <SunIcon size={14} color="var(--color-paper)" />
        ) : (
          <MoonIcon size={14} color="var(--color-paper)" />
        )}
      </motion.span>
      <span style={styles.label}>
        {isDark ? "Platinum" : "Obsidian"}
      </span>
    </motion.button>
  );
}

const styles = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: "var(--radius-full)",
    background: "var(--surface)",
    border: "1px solid var(--color-line)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    fontSize: 11.5,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    letterSpacing: "0.02em",
  },
};
