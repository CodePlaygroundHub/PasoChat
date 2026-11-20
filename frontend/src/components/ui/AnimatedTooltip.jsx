import React, { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const SETTLE_EASE = [0.22, 1, 0.36, 1];
const SPRING_FOLLOW = { stiffness: 320, damping: 32, mass: 0.55 };

export const AnimatedTooltip = ({ items = [] }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const frameRef = useRef(null);

  const followX = useSpring(
    useTransform(pointerX, [-40, 40], prefersReducedMotion ? [0, 0] : [-8, 8]),
    SPRING_FOLLOW
  );

  const handleMouseMove = (event) => {
    if (prefersReducedMotion) return;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    const target = event.currentTarget;
    const relX = event.nativeEvent.offsetX - target.offsetWidth / 2;

    frameRef.current = requestAnimationFrame(() => {
      pointerX.set(relX);
    });
  };

  const hoveredIndex = items.findIndex((item) => item.id === hoveredId);

  return (
    <div
      role="group"
      aria-label="People already in Paso"
      className="flex flex-row items-center justify-center"
    >
      {items.map((item, idx) => {
        const isHovered = hoveredId === item.id;
        const hasHover = hoveredIndex !== -1;

        let neighborShift = 0;
        if (!prefersReducedMotion && hasHover && !isHovered) {
          neighborShift = idx < hoveredIndex ? -3 : 3;
        }

        return (
          <motion.div
            key={item.id ?? item.name}
            onMouseEnter={() => {
              setHoveredId(item.id);
              pointerX.set(0);
            }}
            onMouseLeave={() => {
              setHoveredId(null);
              pointerX.set(0);
            }}
            animate={{
              x: neighborShift,
              zIndex: isHovered ? 30 : 10 + idx,
            }}
            transition={{ duration: 0.24, ease: SETTLE_EASE }}
            className="relative -mr-2.5 last:mr-0 focus-within:z-30"
          >
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 6 }
                  }
                  animate={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0 }
                  }
                  exit={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 4 }
                  }
                  transition={{ duration: 0.2, ease: SETTLE_EASE }}
                  style={{
                    x: prefersReducedMotion ? 0 : followX,
                  }}
                  className="pointer-events-none absolute -top-10 left-1/2 z-40 w-max -translate-x-1/2 rounded-md border border-zinc-900/15 bg-white/95 px-2.5 py-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.14)] backdrop-blur-xs dark:border-white/15 dark:bg-[#141313]/95 dark:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.85)]"
                >
                  <div className="text-[11px] font-medium leading-none text-zinc-950 dark:text-zinc-50">
                    {item.name}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onFocus={() => setHoveredId(item.id)}
              onBlur={() => setHoveredId(null)}
              onMouseMove={handleMouseMove}
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: isHovered ? -2 : 0,
                      scale: isHovered ? 1.06 : 1,
                    }
              }
              transition={{ duration: 0.22, ease: SETTLE_EASE }}
              aria-label={item.name}
              className="block cursor-pointer rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
            >
              <img
                src={item.image}
                alt={item.name}
                width={44}
                height={44}
                loading="lazy"
                className={`h-10 w-10 rounded-full border-2 object-cover object-top transition-colors duration-200 sm:h-11 sm:w-11 ${
                  isHovered
                    ? "border-zinc-950/35 dark:border-white/40"
                    : "border-[#FAFAFA] dark:border-[#100F0F]"
                }`}
              />
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
};