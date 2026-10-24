import { useEffect, useRef, useState } from "react";
import soundFX from "../utils/soundEffects";

/**
 * OscilloscopeHUD Component
 * A luxury Black & Platinum interactive signal waveform monitor.
 * Displays live simulated circuit wave telemetry with selectable waveform types.
 */
export default function OscilloscopeHUD({ height = 120, className = "", style = {} }) {
  const canvasRef = useRef(null);
  const [waveType, setWaveType] = useState("sine"); // sine | pulse | saw
  const [frequency, setFrequency] = useState(1.0); // kHz
  const [isHovered, setIsHovered] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let t = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    function render() {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, width, h);

      // 1. Technical Grid in Platinum Tint
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(229, 228, 226, 0.06)";

      const gridStepX = 30;
      const gridStepY = 20;

      for (let x = 0; x <= width; x += gridStepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let y = 0; y <= h; y += gridStepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Reference Axes
      const midY = h / 2;
      ctx.strokeStyle = "rgba(229, 228, 226, 0.14)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Compute Waveform Signal
      const points = [];
      const totalPoints = Math.floor(width / 2);
      const amp = (h * 0.32);
      const freqMultiplier = frequency * 0.035;

      for (let i = 0; i <= totalPoints; i++) {
        const x = (i / totalPoints) * width;
        const phase = x * freqMultiplier + t;
        let yNorm = 0;

        if (waveType === "sine") {
          yNorm = Math.sin(phase) + 0.15 * Math.sin(phase * 3.0 + t * 0.5);
        } else if (waveType === "pulse") {
          yNorm = Math.sin(phase) > 0 ? 0.95 : -0.95;
          // Smooth the pulse transitions slightly
          yNorm += 0.08 * Math.sin(phase * 7.0);
        } else if (waveType === "saw") {
          yNorm = ((phase % (Math.PI * 2)) / Math.PI) - 1;
        }

        // Mouse harmonic distortion
        if (mouseRef.current.active) {
          const mdist = Math.abs(x - mouseRef.current.x);
          if (mdist < 70) {
            const mFactor = (1 - mdist / 70) * 0.45;
            yNorm += Math.sin(phase * 4.0) * mFactor;
          }
        }

        const y = midY - yNorm * amp;
        points.push({ x, y });
      }

      // 3. Draw Ambient Signal Shadow Glow (Phosphor Trace)
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
      ctx.shadowColor = "#FFFFFF";
      ctx.shadowBlur = 12;

      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // 4. Primary Platinum Beam Core
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 1.75;
      ctx.strokeStyle = "#FFFFFF";

      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(points[i].x, points[i].y);
        else ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // 5. Sweep Scanner Dot at Current Probe Lead
      const probeIndex = Math.floor(((t * 30) % totalPoints));
      const probePoint = points[probeIndex] || points[0];

      ctx.save();
      ctx.beginPath();
      ctx.arc(probePoint.x, probePoint.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#FFFFFF";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      t += 0.045;
      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [waveType, frequency]);

  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.x,
      y: e.clientY - rect.y,
      active: true,
    };
  }

  function handleMouseLeave() {
    mouseRef.current.active = false;
    setIsHovered(false);
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  return (
    <div
      style={{
        ...styles.wrapper,
        ...style,
      }}
      className={`oscilloscope-hud ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Telemetry Header */}
      <div style={styles.telemetryBar}>
        <div style={styles.telemetryLeft}>
          <span style={styles.liveIndicator}>
            <span style={styles.liveDot} />
            LIVE CH1
          </span>
          <span style={styles.specLabel}>MNA REAL-TIME TRACE</span>
        </div>

        <div style={styles.telemetryRight}>
          <span style={styles.metricItem}>
            <span style={styles.metricDim}>FREQ</span> {frequency.toFixed(2)} kHz
          </span>
          <span style={styles.metricItem}>
            <span style={styles.metricDim}>Vpp</span> 5.00 V
          </span>
          <span style={styles.metricItem}>
            <span style={styles.metricDim}>CONV</span> &lt;0.02ms
          </span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div style={{ position: "relative", width: "100%", height, overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            cursor: "crosshair",
          }}
        />

        {/* Subtle Horizontal Scanlines */}
        <div style={styles.scanlines} />

        {/* Waveform Selector Floating Pills */}
        <div style={styles.pillToolbar}>
          {[
            { id: "sine", label: "SIN" },
            { id: "pulse", label: "SQR" },
            { id: "saw", label: "SAW" },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                soundFX.playBlip(waveType === type.id ? 800 : 960);
                setWaveType(type.id);
              }}
              style={{
                ...styles.pillBtn,
                background: waveType === type.id ? "var(--cta-bg)" : "var(--surface-2)",
                color: waveType === type.id ? "var(--cta-text)" : "var(--text-dim)",
                borderColor: waveType === type.id ? "var(--cta-border)" : "var(--border)",
                fontWeight: waveType === type.id ? 700 : 500,
              }}
            >
              {type.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              soundFX.playSwitch(1.1);
              setFrequency((f) => (f >= 2.0 ? 0.5 : f + 0.5));
            }}
            style={styles.modBtn}
            title="Step Frequency"
          >
            +Δf
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
    background: "var(--surface)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "var(--card-shadow)",
  },
  telemetryBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--border)",
    fontSize: 10.5,
    fontFamily: "var(--font-mono)",
    color: "var(--text-dim)",
  },
  telemetryLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  liveIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    color: "var(--text)",
    fontWeight: 700,
    letterSpacing: "0.05em",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--primary)",
    boxShadow: "0 0 8px var(--primary)",
    animation: "radarPing 2s infinite ease-out",
  },
  specLabel: {
    color: "var(--text-faint)",
    fontSize: 9.5,
    letterSpacing: "0.06em",
  },
  telemetryRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  metricItem: {
    color: "var(--text)",
    fontWeight: 600,
    fontSize: 10,
    fontFamily: "var(--font-mono)",
  },
  metricDim: {
    color: "var(--text-faint)",
    marginRight: 2,
    fontWeight: 400,
  },
  scanlines: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)",
    backgroundSize: "100% 4px",
    pointerEvents: "none",
    opacity: 0.4,
  },
  pillToolbar: {
    position: "absolute",
    bottom: 8,
    right: 10,
    display: "flex",
    alignItems: "center",
    gap: 5,
    zIndex: 2,
  },
  pillBtn: {
    border: "1px solid",
    borderRadius: "4px",
    padding: "2px 7px",
    fontSize: 9.5,
    fontFamily: "var(--font-mono)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  modBtn: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "2px 7px",
    fontSize: 9.5,
    fontFamily: "var(--font-mono)",
    color: "var(--text)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};
