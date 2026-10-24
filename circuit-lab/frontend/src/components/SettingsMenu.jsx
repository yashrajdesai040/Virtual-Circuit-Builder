import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import soundFX from "../utils/soundEffects";
import {
  SettingsIcon,
  SunIcon,
  MoonIcon,
  AudioOnIcon,
  AudioMutedIcon,
  UserIcon,
  SearchIcon,
  LogoutIcon,
  CheckIcon,
} from "./icons/PremiumIcons";

export default function SettingsMenu({ onOpenCommandPalette }) {
  const { user, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => soundFX.isMuted());
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Esc key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleToggleOpen() {
    soundFX.playBlip(isOpen ? 650 : 850);
    setIsOpen((prev) => !prev);
  }

  function handleSelectTheme(targetTheme) {
    if (theme !== targetTheme) {
      soundFX.playSwitch(targetTheme === "dark" ? 0.9 : 1.25);
      setTheme(targetTheme);
    }
  }

  function handleToggleAudio() {
    const next = soundFX.toggleMute();
    setSoundMuted(next);
  }

  function handleOpenPalette() {
    setIsOpen(false);
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    }
  }

  function handleLogout() {
    soundFX.playSwitch(0.7);
    setIsOpen(false);
    logout();
  }

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Settings SVG Trigger Button */}
      <motion.button
        type="button"
        onClick={handleToggleOpen}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={{
          ...styles.triggerBtn,
          borderColor: isOpen ? "var(--border-highlight)" : "var(--border)",
          background: isOpen ? "var(--surface-2)" : "var(--glass-surface)",
        }}
        title="Settings & Workspace Preferences"
        aria-label="Settings"
        aria-expanded={isOpen}
      >
        <motion.span
          animate={{ rotate: isOpen ? 60 : 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
          style={styles.iconCenter}
        >
          <SettingsIcon size={16} color="var(--text)" />
        </motion.span>
      </motion.button>

      {/* Popover Settings Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={styles.dropdown}
          >
            {/* 1. Operator Account Header */}
            <div style={styles.userHeader}>
              <div style={styles.avatarWrap}>
                <div style={styles.avatar}>
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span style={styles.onlinePing} />
              </div>
              <div style={styles.userMeta}>
                <div style={styles.userName}>{user?.name || "Operator"}</div>
                <div style={styles.userHandle}>
                  {user?.username ? `@${user.username}` : "Authenticated Session"}
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            {/* 2. Appearance & Theme Selection */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Appearance & Theme</div>
              <div style={styles.themeGrid}>
                {/* Dark Theme Option */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme("dark")}
                  style={{
                    ...styles.themeOptionBtn,
                    borderColor: isDark ? "var(--border-highlight)" : "var(--border)",
                    background: isDark ? "var(--surface-2)" : "var(--surface)",
                  }}
                >
                  <div style={styles.themeOptionLeft}>
                    <div style={{ ...styles.themeSwatch, background: "#09090B", border: "1px solid #27272A" }}>
                      <MoonIcon size={12} color="#F1F5F9" />
                    </div>
                    <div style={styles.themeLabels}>
                      <span style={styles.themeOptionTitle}>Obsidian</span>
                      <span style={styles.themeOptionSub}>Black & Platinum</span>
                    </div>
                  </div>
                  {isDark && <CheckIcon size={13} color="var(--text)" strokeWidth={3} />}
                </button>

                {/* Light Theme Option */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme("light")}
                  style={{
                    ...styles.themeOptionBtn,
                    borderColor: !isDark ? "var(--border-highlight)" : "var(--border)",
                    background: !isDark ? "var(--surface-2)" : "var(--surface)",
                  }}
                >
                  <div style={styles.themeOptionLeft}>
                    <div style={{ ...styles.themeSwatch, background: "#ECEEF2", border: "1px solid #CFD4DC" }}>
                      <SunIcon size={12} color="#09090B" />
                    </div>
                    <div style={styles.themeLabels}>
                      <span style={styles.themeOptionTitle}>Brushed</span>
                      <span style={styles.themeOptionSub}>Platinum & Black</span>
                    </div>
                  </div>
                  {!isDark && <CheckIcon size={13} color="var(--text)" strokeWidth={3} />}
                </button>
              </div>
            </div>

            <div style={styles.divider} />

            {/* 3. Audio & Sensory Preferences */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Lab Audio & FX</div>
              <button
                type="button"
                onClick={handleToggleAudio}
                style={styles.menuRowBtn}
              >
                <div style={styles.menuRowLeft}>
                  <div style={styles.menuRowIconWrap}>
                    {soundMuted ? (
                      <AudioMutedIcon size={14} color="var(--text-faint)" />
                    ) : (
                      <AudioOnIcon size={14} color="var(--text)" />
                    )}
                  </div>
                  <div>
                    <div style={styles.menuRowLabel}>Synthesized Audio FX</div>
                    <div style={styles.menuRowDesc}>
                      {soundMuted ? "Sound muted" : "Relay clicks & beeps enabled"}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.togglePill,
                    background: soundMuted ? "var(--surface-2)" : "var(--surface-3)",
                    color: soundMuted ? "var(--text-faint)" : "var(--text)",
                    borderColor: "var(--border)",
                  }}
                >
                  {soundMuted ? "Muted" : "Active"}
                </span>
              </button>
            </div>

            <div style={styles.divider} />

            {/* 4. Quick Actions / Shortcuts */}
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Workspace Quick Actions</div>

              {user?.username && (
                <Link
                  to={`/u/${user.username}`}
                  onClick={() => setIsOpen(false)}
                  style={styles.menuRowLink}
                >
                  <div style={styles.menuRowLeft}>
                    <div style={styles.menuRowIconWrap}>
                      <UserIcon size={14} color="var(--text-dim)" />
                    </div>
                    <span style={styles.menuRowLabel}>View Profile & Circuits</span>
                  </div>
                  <span style={styles.navArrow}>→</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleOpenPalette}
                style={styles.menuRowBtn}
              >
                <div style={styles.menuRowLeft}>
                  <div style={styles.menuRowIconWrap}>
                    <SearchIcon size={14} color="var(--text-dim)" />
                  </div>
                  <span style={styles.menuRowLabel}>Command Palette</span>
                </div>
                <kbd style={styles.kbd}>Ctrl K</kbd>
              </button>
            </div>

            <div style={styles.divider} />

            {/* 5. Session Actions (Logout) */}
            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutBtn}
            >
              <LogoutIcon size={14} color="var(--danger)" />
              <span>Sign out of session</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  triggerBtn: {
    display: "grid",
    placeItems: "center",
    width: 34,
    height: 34,
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--glass-surface)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "border-color 0.18s ease, background 0.18s ease",
  },
  iconCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    position: "absolute",
    top: 42,
    right: 0,
    width: 310,
    background: "var(--glass-bg-elevated)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "16px 14px",
    boxShadow: "var(--card-shadow)",
    zIndex: 150,
  },
  userHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "4px 4px 10px",
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)",
    color: "#09090B",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontSize: 14,
    fontFamily: "var(--font-display)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  onlinePing: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "var(--color-green)",
    border: "2px solid var(--surface)",
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  userName: {
    fontSize: 13.5,
    fontWeight: 700,
    color: "var(--text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userHandle: {
    fontSize: 11,
    color: "var(--text-dim)",
    fontFamily: "var(--font-mono)",
  },
  divider: {
    height: 1,
    background: "var(--border)",
    margin: "8px 0",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "2px 0",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "var(--font-data)",
    color: "var(--text-faint)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 4,
    paddingLeft: 4,
  },
  themeGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  themeOptionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  themeOptionLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  themeSwatch: {
    width: 22,
    height: 22,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
  },
  themeLabels: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
  },
  themeOptionTitle: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "var(--text)",
    lineHeight: 1.2,
  },
  themeOptionSub: {
    fontSize: 8.5,
    color: "var(--text-dim)",
    whiteSpace: "nowrap",
  },
  menuRowBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "transparent",
    border: "none",
    padding: "8px 6px",
    borderRadius: "var(--radius-sm)",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.12s ease",
  },
  menuRowLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textDecoration: "none",
    padding: "8px 6px",
    borderRadius: "var(--radius-sm)",
    transition: "background 0.12s ease",
  },
  menuRowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  menuRowIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    display: "grid",
    placeItems: "center",
  },
  menuRowLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--text)",
  },
  menuRowDesc: {
    fontSize: 10.5,
    color: "var(--text-dim)",
  },
  togglePill: {
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "var(--radius-full)",
    border: "1px solid",
  },
  navArrow: {
    fontSize: 12,
    color: "var(--text-faint)",
    paddingRight: 4,
  },
  kbd: {
    fontSize: 9.5,
    fontFamily: "var(--font-data)",
    padding: "2px 6px",
    borderRadius: 3,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text-dim)",
  },
  logoutBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    padding: "9px 10px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "var(--radius-sm)",
    color: "var(--danger)",
    fontFamily: "var(--font-body)",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
  },
};
