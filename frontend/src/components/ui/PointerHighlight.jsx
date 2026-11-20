import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SLOW_EASE = [0.22, 1, 0.36, 1];

export function PointerHighlight({
  children,
  rectangleClassName = "",
  pointerClassName = "",
  containerClassName = "",
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const hasSize = dimensions.width > 0 && dimensions.height > 0;
  const boxWidth = dimensions.width + 16;
  const boxHeight = dimensions.height + 4;

  return (
    <span
      ref={containerRef}
      className={`relative inline-block ${containerClassName}`}
    >
      <span className="relative z-10">{children}</span>

      {hasSize && !prefersReducedMotion && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-2 -inset-y-0.5 z-0"
        >
          {/* Slower expanding selection frame */}
          <motion.span
            initial={{ width: 0, opacity: 0.35 }}
            animate={{ width: boxWidth, opacity: 1 }}
            transition={{ duration: 1.55, delay: 0.35, ease: SLOW_EASE }}
            style={{ height: boxHeight }}
            className={`block rounded-[4px] border border-zinc-900/15 bg-zinc-900/[0.04] dark:border-white/15 dark:bg-white/[0.055] ${rectangleClassName}`}
          />

          {/* Pointer dragging along the bottom edge */}
          <motion.span
            initial={{ opacity: 0, x: 2, y: boxHeight - 4 }}
            animate={{
              opacity: [0, 1, 1, 0.9],
              x: boxWidth - 2,
              y: boxHeight - 2,
            }}
            transition={{
              x: { duration: 1.55, delay: 0.35, ease: SLOW_EASE },
              y: { duration: 1.55, delay: 0.35, ease: SLOW_EASE },
              opacity: {
                times: [0, 0.14, 0.85, 1],
                duration: 1.75,
                delay: 0.35,
              },
            }}
            className="pointer-events-none absolute top-0 left-0 z-20"
          >
            <Pointer
              className={`h-4 w-4 -rotate-90 text-zinc-800 dark:text-zinc-200 ${pointerClassName}`}
            />
          </motion.span>
        </span>
      )}
    </span>
  );
}

const Pointer = ({ className = "" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
  </svg>
);