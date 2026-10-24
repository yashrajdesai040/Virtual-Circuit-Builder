import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

const INTERACTIVE_SELECTOR = "a, button, [draggable='true'], .cursor-hover, select";
let sparkId = 0;

/**
 * 100x Smoother Custom Cursor.
 * Zero lag, high-speed physics springs, throttled hover detection,
 * and text-input passthrough for native typing and selection feel.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [sparks, setSparks] = useState([]);

  const isHoveringRef = useRef(false);
  const isTextRef = useRef(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Tuned high-speed springs for instantaneous, fluid targeting
  const ringX = useSpring(mouseX, { damping: 26, stiffness: 360, mass: 0.2 });
  const ringY = useSpring(mouseY, { damping: 26, stiffness: 360, mass: 0.2 });
  const trailX = useSpring(mouseX, { damping: 20, stiffness: 240, mass: 0.35 });
  const trailY = useSpring(mouseY, { damping: 20, stiffness: 240, mass: 0.35 });

  const spawnSpark = useCallback((x, y) => {
    const id = sparkId++;
    setSparks((s) => [...s.slice(-6), { id, x, y }]);
    setTimeout(() => setSparks((s) => s.filter((sp) => sp.id !== id)), 380);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor-active");

    let lastCheck = 0;

    function handleMove(e) {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const now = performance.now();
      if (now - lastCheck > 40) {
        lastCheck = now;
        const target = e.target;
        const isInteractive = Boolean(target.closest(INTERACTIVE_SELECTOR));
        const isText = Boolean(target.closest("input, textarea, [contenteditable='true']"));

        if (isInteractive !== isHoveringRef.current) {
          isHoveringRef.current = isInteractive;
          setIsHovering(isInteractive);
        }
        if (isText !== isTextRef.current) {
          isTextRef.current = isText;
          setIsTextInput(isText);
        }
      }
    }

    function handleDown(e) {
      if (!isTextRef.current) {
        spawnSpark(e.clientX, e.clientY);
      }
    }

    function handleLeave() {
      setIsVisible(false);
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [mouseX, mouseY, spawnSpark, isVisible]);

  if (!enabled) return null;

  return (
    <>
      {/* Ambient Comet Glow Trail */}
      <motion.div
        className="cursor-trail"
        style={{ translateX: trailX, translateY: trailY, willChange: "transform" }}
        animate={{ opacity: isVisible && !isTextInput ? 0.45 : 0 }}
        transition={{ duration: 0.15 }}
      />

      {/* Immediate Sharp Core */}
      <motion.div
        className="cursor-core"
        style={{ translateX: mouseX, translateY: mouseY, willChange: "transform" }}
        animate={{
          opacity: isVisible && !isTextInput ? 1 : 0,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.12 }}
      />

      {/* Targeting Reticle Ring with Spring */}
      <motion.div
        className="cursor-ring"
        style={{ translateX: ringX, translateY: ringY, willChange: "transform" }}
        animate={{
          opacity: isVisible && !isTextInput ? 1 : 0,
          scale: isHovering ? 1.15 : 0.45,
          rotate: isHovering ? 180 : 0,
        }}
        transition={{
          rotate: { duration: 2.5, repeat: isHovering ? Infinity : 0, ease: "linear" },
          scale: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.15 },
        }}
      />

      {/* Tactile Sparks on Click */}
      <AnimatePresence>
        {sparks.map((s) =>
          Array.from({ length: 5 }).map((_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            return (
              <motion.div
                key={`${s.id}-${i}`}
                className="cursor-spark"
                style={{ left: s.x, top: s.y, willChange: "transform, opacity" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * 18,
                  y: Math.sin(angle) * 18,
                  opacity: 0,
                  scale: 0.2,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })
        )}
      </AnimatePresence>
    </>
  );
}
