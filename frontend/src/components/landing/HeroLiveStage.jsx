import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const HeroLiveStage = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="mx-auto inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className="h-px w-4 bg-zinc-900/20 dark:bg-white/20"
      />

      <motion.span
        initial={
          prefersReducedMotion
            ? false
            : { opacity: 0, letterSpacing: "0.34em" }
        }
        animate={{ opacity: 1, letterSpacing: "0.22em" }}
        transition={{ duration: 0.75, ease: EASE }}
        className="font-mono text-[10.5px] font-medium text-zinc-600 uppercase dark:text-zinc-400"
      >
        PASO WORKSPACE
      </motion.span>

      <span
        aria-hidden="true"
        className="h-px w-4 bg-zinc-900/20 dark:bg-white/20"
      />
    </div>
  );
};

export default HeroLiveStage;