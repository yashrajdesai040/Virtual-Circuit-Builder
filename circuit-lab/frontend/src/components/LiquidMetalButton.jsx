import { useState, useRef, useId } from "react";
import { motion } from "framer-motion";

/**
 * Inspired by metal.jakubantalik.com (metal-fx):
 * True SVG specular-refraction liquid metal effect.
 * Features dynamic fePointLight tracking mouse cursor over feTurbulence
 * displacement map for an authentic viscous mercury / molten gold surface.
 */
export default function LiquidMetalButton({
  children,
  onClick,
  disabled = false,
  variant = "platinum", // 'platinum' | 'chrome' | 'emerald' | 'gold'
  size = "md",      // 'sm' | 'md' | 'lg'
  icon = null,
  className = "",
  style = {},
}) {
  const filterId = useId().replace(/:/g, "_");
  const [isHovered, setIsHovered] = useState(false);
  const [lightPos, setLightPos] = useState({ x: 120, y: 30 });
  const buttonRef = useRef(null);

  function handleMouseMove(e) {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLightPos({ x, y });
  }

  const palettes = {
    platinum: {
      base: "linear-gradient(135deg, #101218 0%, #1F232D 50%, #0C0E14 100%)",
      specular: "#FFFFFF",
      accent: "#E5E4E2",
      border: "rgba(229, 228, 226, 0.45)",
      text: "#FFFFFF",
      glow: "0 0 24px rgba(229, 228, 226, 0.35)",
    },
    gold: {
      base: "linear-gradient(135deg, #101218 0%, #1F232D 50%, #0C0E14 100%)",
      specular: "#FFFFFF",
      accent: "#E5E4E2",
      border: "rgba(229, 228, 226, 0.45)",
      text: "#FFFFFF",
      glow: "0 0 24px rgba(229, 228, 226, 0.35)",
    },
    chrome: {
      base: "linear-gradient(135deg, #1A1C20 0%, #2A2E36 50%, #14161A 100%)",
      specular: "#FFFFFF",
      accent: "#F2EDE4",
      border: "rgba(255, 255, 255, 0.35)",
      text: "#F2EDE4",
      glow: "0 0 24px rgba(255, 255, 255, 0.22)",
    },
    emerald: {
      base: "linear-gradient(135deg, #0F1C12 0%, #1A2E1E 50%, #0A140C 100%)",
      specular: "#C7D452",
      accent: "#6D712E",
      border: "rgba(109, 113, 46, 0.45)",
      text: "#6D712E",
      glow: "0 0 24px rgba(109, 113, 46, 0.35)",
    },
  };

  const p = palettes[variant] || palettes.gold;

  const sizeStyles = {
    sm: { padding: "7px 15px", fontSize: 12.5, borderRadius: "8px" },
    md: { padding: "9px 19px", fontSize: 13.5, borderRadius: "10px" },
    lg: { padding: "12px 25px", fontSize: 15, borderRadius: "12px" },
  };

  const s = sizeStyles[size] || sizeStyles.md;

  return (
    <>
      {/* Hidden SVG Filter for 3D Dynamic Specular Lighting */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id={`liquid-filter-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04 0.04"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={isHovered ? "7" : "3"}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feSpecularLighting
              in="displaced"
              surfaceScale="4"
              specularConstant="1.6"
              specularExponent="28"
              lightingColor={p.specular}
              result="specular"
            >
              <fePointLight x={lightPos.x} y={lightPos.y} z="45" />
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceAlpha" operator="in" result="specularCut" />
            <feBlend in="SourceGraphic" in2="specularCut" mode="screen" />
          </filter>
        </defs>
      </svg>

      <motion.button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97, y: 1 }}
        className={`liquid-metal-btn ${className}`}
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: p.base,
          color: p.text,
          border: `1px solid ${p.border}`,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          overflow: "hidden",
          boxShadow: isHovered ? p.glow : "0 4px 14px rgba(0, 0, 0, 0.45)",
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          ...s,
          ...style,
        }}
      >
        {/* Dynamic Liquid Specular Surface Layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: `url(#liquid-filter-${filterId})`,
            opacity: isHovered ? 0.95 : 0.4,
            background: `radial-gradient(circle at ${lightPos.x}px ${lightPos.y}px, ${p.specular} 0%, transparent 65%)`,
            pointerEvents: "none",
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Viscous Mercury Sweep Sheen */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.18) 55%, transparent 80%)",
            transform: "translateX(-100%)",
            pointerEvents: "none",
          }}
          animate={
            isHovered
              ? { transform: ["translateX(-100%)", "translateX(100%)"] }
              : { transform: "translateX(-100%)" }
          }
          transition={{
            duration: 1.1,
            repeat: isHovered ? Infinity : 0,
            repeatDelay: 1.6,
            ease: "easeInOut",
          }}
        />

        {/* Inner Label */}
        <span
          style={{
            position: "relative",
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          {icon}
          {children}
        </span>
      </motion.button>
    </>
  );
}
