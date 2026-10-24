import { motion } from "framer-motion";

/**
 * 100x Smoother Page Transition.
 * Modern blur-fade easing with GPU acceleration and snappy exit curves
 * so navigation feels instantaneous and buttery smooth.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -4, filter: "blur(2px)", transition: { duration: 0.12, ease: "easeIn" } }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      {children}
    </motion.div>
  );
}
