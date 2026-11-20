
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, MessageSquare } from "lucide-react";

const LoadingScreen = ({ label = "Getting everything ready..." }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FAFAFA] px-4 select-none dark:bg-[#100F0F]"
    >
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* App Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          {!shouldReduceMotion && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.08, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-16 w-16 rounded-2xl border border-zinc-300 dark:border-zinc-700"
            />
          )}

          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-[#171616] dark:text-zinc-100">
            <MessageSquare className="h-5 w-5 stroke-[1.7]" />
          </div>
        </div>

        {/* Brand */}
        <h1 className="mb-5 text-lg font-bold tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
          PASO
        </h1>

        {/* Loading Status */}
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Loader2
            className={`h-4 w-4 text-zinc-500 ${
              shouldReduceMotion ? "" : "animate-spin"
            }`}
          />
          <span>{label}</span>
        </div>

        {/* Supporting Message */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-3 max-w-[280px] text-center text-xs leading-relaxed text-zinc-400 dark:text-zinc-500"
        >
          Our server may take a moment to wake up.
          Thanks for your patience!
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
