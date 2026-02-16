import { motion } from "framer-motion";
import { useMemo } from "react";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  type: "rect" | "circle" | "chip";
  delay: number;
  duration: number;
}

const LivingBackground = () => {
  const elements = useMemo<FloatingElement[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 60,
      type: (["rect", "circle", "chip"] as const)[i % 3],
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
          }}
          animate={{
            x: [0, 30, -10, 20, 0],
            y: [0, -20, 15, 10, 0],
            rotate: [0, 3, -2, 4, 0],
            scale: [1, 1.03, 0.97, 1.02, 1],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {el.type === "rect" && (
            <div
              className="rounded-lg border border-primary/10 bg-primary/[0.03]"
              style={{ width: el.size * 1.6, height: el.size }}
            />
          )}
          {el.type === "circle" && (
            <div
              className="rounded-full border border-neon-pink/10 bg-neon-pink/[0.02]"
              style={{ width: el.size, height: el.size }}
            />
          )}
          {el.type === "chip" && (
            <div
              className="rounded-full border border-neon-blue/10 bg-neon-blue/[0.02] px-3 py-1"
              style={{ width: el.size * 2, height: el.size * 0.5 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default LivingBackground;
