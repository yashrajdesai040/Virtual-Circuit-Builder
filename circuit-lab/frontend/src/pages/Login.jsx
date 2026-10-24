import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import soundFX from "../utils/soundEffects";
import ContourTide from "../components/ContourTide";
import OscilloscopeHUD from "../components/OscilloscopeHUD";
import ThemeToggle from "../components/ThemeToggle";
import { CheckIcon, CloseIcon, BoltIcon } from "../components/icons/PremiumIcons";

const DEMO_USER = "demo_operator";
const DEMO_PASS = "Circuit123!";

export default function Login() {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [formError, setFormError] = useState("");
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => soundFX.isMuted());
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50, active: false });

  function handleCardMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Ultra-restrained luxury tilt (+/- 4 deg)
    const rx = ((y - centerY) / centerY) * -4;
    const ry = ((x - centerX) / centerX) * 4;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setTilt({ rx, ry, glareX, glareY, active: true });
  }

  function handleCardMouseLeave() {
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50, active: false });
  }

  function toggleSound() {
    const muted = soundFX.toggleMute();
    setSoundMuted(muted);
  }

  function updateField(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (formError) setFormError("");
    };
  }

  function handleKeyEvent(e) {
    if (e.getModifierState) {
      setCapsLock(e.getModifierState("CapsLock"));
    }
  }

  async function performLogin(username, password) {
    if (status === "loading" || status === "success") return;
    setFormError("");
    setStatus("loading");
    soundFX.playPowerHum();

    try {
      await login(username.trim().toLowerCase(), password);
      setStatus("success");
      soundFX.playSuccess();
      setTimeout(() => navigate("/dashboard"), 420);
    } catch (err) {
      setStatus("error");
      soundFX.playShortError();
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Invalid username or password. Check credentials or use Demo Access.";
      setFormError(msg);
      setTimeout(() => setStatus("idle"), 2400);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const user = form.username.trim();
    if (!user || !form.password) {
      soundFX.playShortError();
      setFormError("Please enter both username and password.");
      return;
    }
    await performLogin(user, form.password);
  }

  async function handleDemoLogin() {
    soundFX.playWireConnect();
    setForm({ username: DEMO_USER, password: DEMO_PASS });
    await performLogin(DEMO_USER, DEMO_PASS);
  }

  function handleCopyDemo() {
    soundFX.playBlip(900);
    navigator.clipboard?.writeText(`username: ${DEMO_USER}\npassword: ${DEMO_PASS}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={styles.page}>
      {/* 3D Contour Tide: Particle Ocean Waves (Adaptive to Black & Platinum / Platinum & Black) */}
      <ContourTide
        particleCount={120}
        colorHigh={isDark ? "#FFFFFF" : "#09090B"}
        colorMid={isDark ? "#94A3B8" : "#525866"}
        colorLow={isDark ? "#09090B" : "#ECEEF2"}
        waveSpeed={1.05}
        waveHeight={9.4}
        opacity={isDark ? 0.88 : 0.55}
      />

      {/* Adaptive Vignette Overlay for Crisp Contrast */}
      <div
        style={{
          ...styles.vignetteOverlay,
          background: isDark
            ? "radial-gradient(ellipse at 70% 50%, rgba(9, 9, 11, 0.4) 0%, rgba(9, 9, 11, 0.88) 85%)"
            : "radial-gradient(ellipse at 70% 50%, rgba(236, 238, 242, 0.25) 0%, rgba(236, 238, 242, 0.75) 85%)",
        }}
      />

      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.brandLogo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="#FFFFFF"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={styles.brandTitleWrap}>
            <span style={styles.brandTitle}>CircuitLab</span>
            <span style={styles.platinumPill}>
              <span style={styles.pulseDot} />
              PLATINUM CORE
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            to="/register"
            onClick={() => soundFX.playBlip(720)}
            style={styles.headerNavLink}
          >
            Create account
          </Link>

          <button
            type="button"
            onClick={toggleSound}
            style={styles.soundButton}
            title={soundMuted ? "Unmute audio effects" : "Mute audio effects"}
            aria-label={soundMuted ? "Unmute audio effects" : "Mute audio effects"}
          >
            {soundMuted ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
            <span style={{ fontSize: 11.5 }}>{soundMuted ? "Muted" : "Audio"}</span>
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Split Main Layout: Left Showcase + Right Card */}
      <main style={styles.splitMain} className="login-split-main">
        {/* Left Showcase (Desktop View) */}
        <section style={styles.leftShowcase} className="login-left-showcase">
          <div style={styles.showcaseInner}>
            <div style={styles.statusBadge}>
              <span style={styles.statusPing} />
              <span>v2.4 Platform Live • MNA Matrix Engine</span>
            </div>

            <h1 style={styles.showcaseHeading}>
              Precision circuit synthesis, <br />
              <span style={styles.platinumGradientText}>engineered for speed.</span>
            </h1>

            <p style={styles.showcaseSub}>
              Construct, simulate, and analyze complex analog & digital circuits in real-time with sub-millisecond MNA matrix convergence and interactive instrumentation.
            </p>

            {/* Three Platinum Engineering Metrics */}
            <div style={styles.metricsRow}>
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>&lt; 0.04ms</div>
                <div style={styles.metricLabel}>MNA Solve Latency</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>256-bit</div>
                <div style={styles.metricLabel}>Scrypt TLS Encryption</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricValue}>100%</div>
                <div style={styles.metricLabel}>Offline SPICE Core</div>
              </div>
            </div>

            {/* Interactive Live Signal Waveform Oscilloscope HUD */}
            <OscilloscopeHUD height={120} style={{ marginTop: 2 }} />

            {/* Quiet Feature Bullet Points */}
            <div style={styles.featureList}>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>
                  <CheckIcon size={11} color="#FFFFFF" strokeWidth={3} />
                </div>
                <span>Real-time oscilloscope & signal frequency analyzer</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>
                  <CheckIcon size={11} color="#FFFFFF" strokeWidth={3} />
                </div>
                <span>Full SPICE non-linear diode & transistor physics</span>
              </div>
              <div style={styles.featureItem}>
                <div style={styles.featureIcon}>
                  <CheckIcon size={11} color="#FFFFFF" strokeWidth={3} />
                </div>
                <span>Sub-circuit abstraction & custom IC packaging</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: The Upgraded Black & Platinum Card */}
        <section style={styles.rightSection} className="login-right-section">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={styles.cardWrapper}
          >
            <div
              style={{
                ...styles.card,
                transform: tilt.active
                  ? `perspective(1000px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) translateY(-2px)`
                  : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)",
                transition: tilt.active
                  ? "transform 0.08s ease-out, box-shadow 0.2s ease"
                  : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease",
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* Dynamic Specular Glare Reflection */}
              {tilt.active && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 1,
                    borderRadius: "20px",
                    background: `radial-gradient(circle 380px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.09) 0%, transparent 70%)`,
                  }}
                />
              )}

              {/* Platinum Specular Rim Glow */}
              <div style={styles.cardTopHighlight} />

              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={styles.badgeRow}>
                  <span style={styles.securityPill}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    SECURE ACCESS
                  </span>
                </div>
                <h2 style={styles.cardHeading}>Sign in to Workspace</h2>
                <p style={styles.cardSub}>
                  Enter your credentials or launch the instant Demo sandbox.
                </p>
              </div>

              {/* Quick Demo Access (SSO Style) */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={status === "loading" || status === "success"}
                style={styles.demoButton}
                className="platinum-demo-btn"
              >
                <div style={styles.demoIconWrap}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div style={styles.demoButtonTextCol}>
                  <span style={styles.demoButtonTitle}>Continue as Demo Operator</span>
                  <span style={styles.demoButtonDesc}>Pre-loaded circuits & instrument kit</span>
                </div>
                <span style={styles.demoBadge}>1-Click</span>
              </button>

              {/* Divider */}
              <div style={styles.dividerRow}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerLabel}>or sign in with credentials</span>
                <div style={styles.dividerLine} />
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleSubmit} style={styles.form}>
                {/* Username Field */}
                <div style={styles.fieldGroup}>
                  <label htmlFor="login-username" style={styles.label}>
                    Username or email
                  </label>
                  <div style={styles.inputWrap}>
                    <span style={styles.inputIcon}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="login-username"
                      type="text"
                      required
                      value={form.username}
                      onChange={updateField("username")}
                      placeholder="e.g. demo_operator or alex"
                      autoComplete="username"
                      className="platinum-input"
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div style={styles.fieldGroup}>
                  <div style={styles.labelRow}>
                    <label htmlFor="login-password" style={styles.label}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playBlip(750);
                        setShowRecoveryModal(true);
                      }}
                      style={styles.forgotBtn}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div style={styles.inputWrap}>
                    <span style={styles.inputIcon}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={updateField("password")}
                      onKeyDown={handleKeyEvent}
                      onKeyUp={handleKeyEvent}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="platinum-input"
                      style={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playSwitch(1.2);
                        setShowPassword((s) => !s);
                      }}
                      style={styles.eyeBtn}
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Caps Lock Alert */}
                  <AnimatePresence>
                    {capsLock && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        style={styles.capsAlert}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Caps Lock is active</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Remember Me Option */}
                <div style={styles.rememberRow}>
                  <label
                    style={styles.rememberLabel}
                    onClick={() => {
                      soundFX.playSwitch(0.85);
                      setRememberMe((r) => !r);
                    }}
                  >
                    <div
                      style={{
                        ...styles.checkbox,
                        background: rememberMe ? "#FFFFFF" : "transparent",
                        borderColor: rememberMe ? "#FFFFFF" : "rgba(255, 255, 255, 0.25)",
                      }}
                    >
                      {rememberMe && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span style={styles.rememberText}>Remember this browser</span>
                  </label>
                </div>

                {/* Form Error Banner */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      style={styles.errorBanner}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{formError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Primary Submit Button: Liquid Platinum */}
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="platinum-submit-btn"
                  style={styles.submitButton}
                >
                  {status === "loading" ? (
                    <span style={styles.spinnerWrap}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="#0A0A0D" strokeWidth="3" strokeDasharray="35 60" strokeLinecap="round" />
                      </svg>
                      <span>Authenticating…</span>
                    </span>
                  ) : status === "success" ? (
                    <span style={styles.spinnerWrap}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A0A0D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Authenticated</span>
                    </span>
                  ) : (
                    <span style={styles.submitInner}>
                      <span>Sign In to Workspace</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Card Footer */}
              <div style={styles.cardFooter}>
                <span style={styles.footerPrompt}>New to CircuitLab?</span>
                <Link
                  to="/register"
                  onClick={() => soundFX.playBlip(700)}
                  style={styles.createAccountLink}
                >
                  Create an account
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Engineering Trust & Security Strip */}
          <div style={styles.trustStrip}>
            <div style={styles.trustItem}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>256-bit Scrypt & JWT</span>
            </div>
            <span style={styles.trustDot}>•</span>
            <div style={styles.trustItem}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" />
                <line x1="9" y1="1" x2="9" y2="4" />
                <line x1="15" y1="1" x2="15" y2="4" />
                <line x1="9" y1="20" x2="9" y2="23" />
                <line x1="15" y1="20" x2="15" y2="23" />
                <line x1="20" y1="9" x2="23" y2="9" />
                <line x1="20" y1="14" x2="23" y2="14" />
                <line x1="1" y1="9" x2="4" y2="9" />
                <line x1="1" y1="14" x2="4" y2="14" />
              </svg>
              <span>Real-time MNA Solver</span>
            </div>
            <span style={styles.trustDot}>•</span>
            <div style={styles.trustItem}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Offline Capable</span>
            </div>
          </div>
        </section>
      </main>

      {/* Accessible Recovery Modal */}
      <AnimatePresence>
        {showRecoveryModal && (
          <div style={styles.modalBackdrop} onClick={() => setShowRecoveryModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              style={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={styles.modalIconWrap}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <h3 style={styles.modalTitle}>Password Recovery & Access</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  style={styles.modalCloseBtn}
                  aria-label="Close recovery dialog"
                >
                  <CloseIcon size={14} color="#94A3B8" />
                </button>
              </div>

              <div style={styles.modalBody}>
                <p style={styles.modalText}>
                  CircuitLab encrypts accounts with salted scrypt hashing. For local development and demonstration, you can sign in instantly with the built-in operator account:
                </p>

                <div style={styles.codeSnippet}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>DEMO CREDENTIALS</span>
                    <button
                      type="button"
                      onClick={handleCopyDemo}
                      style={styles.copyBtn}
                    >
                      {copied ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <CheckIcon size={10} color="var(--text)" strokeWidth={3} /> Copied
                        </span>
                      ) : (
                        "Copy"
                      )}
                    </button>
                  </div>
                  <code>username: <strong style={{ color: "var(--text)" }}>demo_operator</strong></code>
                  <br />
                  <code>password: <strong style={{ color: "var(--text)" }}>Circuit123!</strong></code>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button
                    type="button"
                    onClick={() => {
                      handleDemoLogin();
                      setShowRecoveryModal(false);
                    }}
                    style={styles.fillDemoModalBtn}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <BoltIcon size={13} color="#0A0A0D" fill="#0A0A0D" /> Auto-fill & Sign In
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    style={styles.cancelModalBtn}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    background: "var(--bg)",
  },
  vignetteOverlay: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1,
  },
  header: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 5vw 12px",
    maxWidth: 1400,
    margin: "0 auto",
    width: "100%",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: "10px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "var(--card-shadow)",
  },
  brandTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "var(--text)",
  },
  platinumPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 10.5,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    color: "var(--text)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: "3px 8px",
    borderRadius: "9999px",
    letterSpacing: "0.04em",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--primary)",
    boxShadow: "0 0 8px var(--primary)",
  },
  headerNavLink: {
    color: "var(--text-dim)",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "var(--font-body)",
    transition: "color 0.15s ease",
  },
  soundButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    padding: "6px 13px",
    borderRadius: "9999px",
    fontSize: 11.5,
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  splitMain: {
    position: "relative",
    zIndex: 2,
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 5vw 40px",
    maxWidth: 1400,
    margin: "0 auto",
    width: "100%",
    gap: 40,
  },
  leftShowcase: {
    flex: 1,
    maxWidth: 620,
    paddingRight: 20,
  },
  showcaseInner: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "9999px",
    padding: "4px 12px",
    fontSize: 12,
    fontFamily: "var(--font-mono)",
    color: "var(--text)",
  },
  statusPing: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#38BDF8",
    boxShadow: "0 0 10px #38BDF8",
  },
  showcaseHeading: {
    fontSize: "clamp(2.2rem, 3.8vw, 3.4rem)",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.035em",
    color: "var(--text)",
    margin: 0,
  },
  platinumGradientText: {
    background: "linear-gradient(135deg, var(--text) 0%, var(--text-dim) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  showcaseSub: {
    fontSize: "clamp(14px, 1.1vw, 16px)",
    color: "var(--text-dim)",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 540,
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginTop: 6,
  },
  metricCard: {
    background: "var(--surface)",
    backdropFilter: "blur(16px)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 800,
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    letterSpacing: "-0.02em",
  },
  metricLabel: {
    fontSize: 11,
    color: "var(--text-faint)",
    fontWeight: 500,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 6,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13.5,
    color: "var(--text-dim)",
  },
  featureIcon: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rightSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  card: {
    position: "relative",
    background: "var(--surface)",
    backdropFilter: "blur(32px) saturate(190%)",
    WebkitBackdropFilter: "blur(32px) saturate(190%)",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    padding: "36px 32px 30px",
    boxShadow: "var(--card-shadow)",
    overflow: "hidden",
  },
  cardTopHighlight: {
    position: "absolute",
    top: 0,
    left: "10%",
    right: "10%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, var(--border-bright), transparent)",
  },
  cardHeader: {
    marginBottom: 22,
    textAlign: "left",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
  },
  securityPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 9.5,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "var(--text-dim)",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    padding: "2px 7px",
    borderRadius: "4px",
  },
  cardHeading: {
    fontSize: 23,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "var(--text)",
    margin: "0 0 6px",
  },
  cardSub: {
    fontSize: 13,
    color: "var(--text-dim)",
    margin: 0,
    lineHeight: 1.45,
  },
  demoButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: "12px",
    padding: "10px 14px",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    marginBottom: 18,
    textAlign: "left",
  },
  demoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: "8px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "var(--text)",
  },
  demoButtonTextCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  demoButtonTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
  },
  demoButtonDesc: {
    fontSize: 11,
    color: "var(--text-dim)",
  },
  demoBadge: {
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    background: "var(--surface-2)",
    color: "var(--text)",
    padding: "3px 7px",
    borderRadius: "5px",
    border: "1px solid var(--border)",
    flexShrink: 0,
  },
  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "var(--border)",
  },
  dividerLabel: {
    fontSize: 11,
    color: "var(--text-faint)",
    letterSpacing: "0.02em",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--text)",
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  forgotBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    fontWeight: 500,
    transition: "color 0.15s ease",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 13,
    color: "var(--text-faint)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    height: 42,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "0 38px 0 38px",
    color: "var(--text)",
    fontSize: 13.5,
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  eyeBtn: {
    position: "absolute",
    right: 8,
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: 6,
    borderRadius: 4,
    transition: "color 0.15s ease",
  },
  capsAlert: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    color: "var(--text)",
    fontWeight: 600,
    marginTop: 2,
  },
  rememberRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1px 0 2px",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    userSelect: "none",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: "1.5px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },
  rememberText: {
    fontSize: 12.5,
    color: "var(--text-dim)",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    padding: "9px 12px",
    borderRadius: "8px",
    color: "#F87171",
    fontSize: 12.5,
    fontWeight: 500,
  },
  submitButton: {
    width: "100%",
    padding: "11px 18px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    cursor: "pointer",
    marginTop: 4,
    outline: "none",
  },
  submitInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  spinnerWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    paddingTop: 14,
    borderTop: "1px solid var(--border)",
  },
  footerPrompt: {
    fontSize: 13,
    color: "var(--text-dim)",
  },
  createAccountLink: {
    fontSize: 13,
    color: "var(--text)",
    fontWeight: 600,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  },
  trustStrip: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    fontSize: 11.5,
    color: "var(--text-faint)",
    fontFamily: "var(--font-mono)",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 420,
  },
  trustItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  trustDot: {
    opacity: 0.35,
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    boxShadow: "var(--card-shadow)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid var(--border)",
  },
  modalIconWrap: {
    width: 26,
    height: 26,
    borderRadius: "6px",
    background: "var(--surface-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--text)",
    margin: 0,
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    fontSize: 15,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  modalBody: {
    padding: "20px",
  },
  modalText: {
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 1.5,
    margin: "0 0 14px",
  },
  codeSnippet: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 12.5,
    fontFamily: "var(--font-mono)",
    color: "var(--text)",
  },
  copyBtn: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    color: "var(--text)",
    fontSize: 10.5,
    padding: "2px 7px",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  fillDemoModalBtn: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 8,
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    border: "none",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  cancelModalBtn: {
    padding: "10px 16px",
    borderRadius: 8,
    background: "var(--surface-2)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    fontSize: 13,
    cursor: "pointer",
  },
};
