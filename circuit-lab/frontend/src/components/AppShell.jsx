import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import CanvasEffects from "./CanvasEffects";
import CommandPalette from "./CommandPalette";
import SettingsMenu from "./SettingsMenu";
import { SearchIcon, UsersIcon } from "./icons/PremiumIcons";

export default function AppShell({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/components", label: "Components" },
    { path: "/builder", label: "Builder" },
    { path: "/tutorials", label: "Tutorials" },
    { path: "/share", label: "Share" },
    ...(user?.username ? [{ path: `/u/${user.username}`, label: "Profile" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Sleek Floating Glass Header (Aceternity / 21st.dev style) */}
      <header style={styles.header}>
        <NavLink to="/dashboard" style={styles.brandLink}>
          <div style={styles.brand}>
            <span style={styles.brandLed} className="neon-active" />
            <span style={styles.brandText}>CIRCUITLAB</span>
            <span style={styles.phaseBadge}>v2.0</span>
          </div>
        </NavLink>

        {/* Sliding Pill Navigation Bar */}
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/builder" && location.pathname.startsWith("/builder"));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navLink,
                  color: isActive ? "var(--text)" : "var(--text-dim)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    style={{ ...styles.activePill, willChange: "transform" }}
                    transition={{ type: "spring", stiffness: 440, damping: 32, mass: 0.7 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 2 }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Area */}
        <div style={styles.userArea}>
          {/* Universal Command Palette Trigger */}
          <motion.button
            onClick={() => setCommandOpen(true)}
            whileHover={{ scale: 1.04, borderColor: "rgba(229, 228, 226, 0.4)" }}
            whileTap={{ scale: 0.96 }}
            style={styles.searchTrigger}
            title="Open Command Palette (Ctrl+K)"
          >
            <SearchIcon size={12} color="var(--text-faint)" />
            <span style={styles.searchPrompt}>Search</span>
            <kbd style={styles.headerKbd}>Ctrl K</kbd>
          </motion.button>

          {/* People / Community Discovery */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <NavLink to="/people" style={styles.iconBtn} title="Find people & collaborate">
              <UsersIcon size={15} color="var(--text-dim)" />
            </NavLink>
          </motion.div>

          {/* Real-time Notifications */}
          <NotificationBell />

          {/* Operator Pill */}
          <div style={styles.userPill}>
            <div style={styles.userAvatar}>
              {user?.name ? user.name[0].toUpperCase() : "U"}
              <span style={styles.statusDot} />
            </div>
            <span style={styles.userName}>{user?.name}</span>
          </div>

          {/* Master Settings Hub (Theme Switcher, Lab Audio FX, Navigation, Sign out) */}
          <SettingsMenu onOpenCommandPalette={() => setCommandOpen(true)} />
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* canvasui.dev: Interactive Electric Potential & Particle Field (only on non-builder views to keep 3D canvas performant and clear) */}
      {!location.pathname.startsWith("/builder") && (
        <CanvasEffects particleCount={32} accentColor="#FFFFFF" secondaryColor="#94A3B8" />
      )}

      <main style={{ flex: 1, position: "relative", zIndex: 1 }}>{children}</main>
    </div>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 6vw",
    background: "var(--glass-bg)",
    backdropFilter: "blur(var(--glass-blur)) saturate(180%)",
    WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(180%)",
    borderBottom: "1px solid var(--border)",
    boxShadow: "var(--card-shadow)",
  },
  brandLink: {
    textDecoration: "none",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontFamily: "var(--font-display)",
    fontSize: 13.5,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "var(--text)",
  },
  brandLed: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--color-green)",
    boxShadow: "0 0 8px var(--color-green)",
  },
  brandText: {
    background: "linear-gradient(90deg, var(--text) 0%, var(--text-dim) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  phaseBadge: {
    fontSize: 9.5,
    fontFamily: "var(--font-data)",
    padding: "2px 6px",
    borderRadius: 4,
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    fontWeight: 700,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "var(--glass-surface)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    padding: "4px 6px",
    borderRadius: "var(--radius-full)",
    border: "1px solid var(--border)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.15)",
  },
  navLink: {
    position: "relative",
    fontSize: 13,
    fontFamily: "var(--font-display)",
    letterSpacing: "0.02em",
    textDecoration: "none",
    padding: "6px 14px",
    borderRadius: "var(--radius-full)",
    transition: "color 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
  },
  activePill: {
    position: "absolute",
    inset: 0,
    borderRadius: "var(--radius-full)",
    background: "var(--surface)",
    border: "1px solid var(--border-bright)",
    boxShadow: "0 0 16px var(--primary-glow)",
    zIndex: 1,
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  searchTrigger: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "5px 10px",
    background: "var(--glass-surface)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-dim)",
    fontSize: 12,
    fontFamily: "var(--font-display)",
    cursor: "pointer",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    transition: "all 0.15s ease",
  },
  searchPrompt: {
    display: "inline-block",
  },
  headerKbd: {
    fontSize: 9.5,
    fontFamily: "var(--font-data)",
    padding: "1px 5px",
    borderRadius: 3,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
  },
  iconBtn: {
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
    color: "var(--text-dim)",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 10px 4px 5px",
    background: "var(--glass-surface)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid var(--border)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    borderRadius: "var(--radius-full)",
  },
  userAvatar: {
    position: "relative",
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%)",
    color: "#0A0A0D",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 800,
    fontFamily: "var(--font-display)",
  },
  statusDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--primary)",
    border: "1.5px solid var(--bg)",
  },
  userName: {
    color: "var(--text)",
    fontSize: 12.5,
    fontWeight: 500,
  },
  logoutBtn: {
    background: "var(--surface)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    color: "var(--text-dim)",
    borderRadius: "var(--radius-sm)",
    padding: "6px 12px",
    fontSize: 12,
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    transition: "border-color 0.2s ease, color 0.2s ease, background 0.2s ease",
  },
};
