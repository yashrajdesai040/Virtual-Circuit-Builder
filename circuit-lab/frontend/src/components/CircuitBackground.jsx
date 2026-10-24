import { useEffect, useRef } from "react";

/**
 * 100x Smoother Ambient Background.
 * Uses requestAnimationFrame-throttled CSS variable updates on the DOM root
 * and GPU-composited SVG animations with will-change.
 * ZERO React component re-renders on mousemove.
 */
export default function CircuitBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    let rafId = null;
    let targetX = 50;
    let targetY = 30;
    let currentX = 50;
    let currentY = 30;

    function handleMouseMove(e) {
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;

      if (!rafId) {
        rafId = requestAnimationFrame(updatePosition);
      }
    }

    function updatePosition() {
      // Smooth lerp (linear interpolation) for organic floating motion
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (containerRef.current) {
        containerRef.current.style.setProperty("--bg-spot-x", `${currentX.toFixed(2)}%`);
        containerRef.current.style.setProperty("--bg-spot-y", `${currentY.toFixed(2)}%`);
      }

      // Continue animating until settled
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(updatePosition);
      } else {
        rafId = null;
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const traces = [
    "M -20 120 H 220 V 40 H 460 V 260 H 900",
    "M -20 420 H 160 V 520 H 520 V 340 H 1000",
    "M 1200 80 H 940 V 220 H 700",
    "M 1200 600 H 980 V 460 H 640 V 560 H 300",
    "M 100 680 V 500 H 280 V 380 H 600",
    "M 800 -20 V 160 H 1100 V 320",
  ];

  return (
    <div ref={containerRef} style={styles.container} aria-hidden="true">
      {/* Cybernetic Dot Matrix Grid */}
      <div style={styles.dotGrid} />

      {/* GPU Smooth Ambient Cursor Spotlight (Lerp Interpolated) */}
      <div style={styles.spotlight} />

      {/* Ambient Depth Blob */}
      <div style={styles.ambientBlob} />

      {/* Hardware-accelerated SVG Circuit Traces */}
      <svg
        className="circuit-bg-svg"
        viewBox="0 0 1200 680"
        preserveAspectRatio="xMidYMid slice"
        style={styles.svg}
      >
        <defs>
          <style>{`
            .trace-line {
              fill: none;
              stroke: rgba(47, 62, 80, 0.38);
              stroke-width: 1.5;
              stroke-linecap: round;
            }
            .pulse-energy {
              fill: none;
              stroke: var(--primary);
              stroke-width: 2.2;
              stroke-linecap: round;
              stroke-dasharray: 8 260;
              filter: drop-shadow(0 0 6px var(--primary));
              animation: flowPulse 6.5s linear infinite;
              will-change: stroke-dashoffset;
            }
            .pulse-energy.accent {
              stroke: var(--accent);
              filter: drop-shadow(0 0 6px var(--accent));
              animation-duration: 8s;
            }
            .pcb-via {
              fill: var(--surface-2);
              stroke: var(--border-bright);
              stroke-width: 1.5;
            }
            @keyframes flowPulse {
              from { stroke-dashoffset: 0; }
              to { stroke-dashoffset: -1200; }
            }
          `}</style>
        </defs>

        {traces.map((d, i) => (
          <path key={`base-${i}`} className="trace-line" d={d} />
        ))}

        {traces.map((d, i) => (
          <path
            key={`pulse-${i}`}
            className={`pulse-energy ${i % 2 === 1 ? "accent" : ""}`}
            d={d}
            style={{ animationDelay: `${i * 1.0}s` }}
          />
        ))}

        {[
          [220, 120], [460, 40], [900, 260],
          [160, 420], [520, 340], [980, 460],
          [280, 500], [600, 380], [940, 220],
        ].map(([cx, cy], i) => (
          <circle key={i} className="pcb-via" cx={cx} cy={cy} r="4" />
        ))}
      </svg>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0,
    overflow: "hidden",
    transform: "translateZ(0)",
  },
  dotGrid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
    backgroundSize: "28px 28px",
    opacity: 0.45,
    maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 80%)",
    WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, transparent 80%)",
  },
  spotlight: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(650px circle at var(--bg-spot-x, 50%) var(--bg-spot-y, 30%), rgba(109, 113, 46, 0.1), transparent 75%)",
    willChange: "background",
  },
  ambientBlob: {
    position: "absolute",
    bottom: "-15%",
    right: "10%",
    width: 460,
    height: 460,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255, 111, 94, 0.07) 0%, transparent 70%)",
    filter: "blur(60px)",
    transform: "translateZ(0)",
  },
  svg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0.65,
    transform: "translateZ(0)",
  },
};
