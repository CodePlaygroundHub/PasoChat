import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Github, Star, X, ExternalLink } from "lucide-react";
import { useLocation } from "react-router-dom";

const GITHUB_URL = "https://github.com/CodePlaygroundHub/paso-chat-app";
// const STORAGE_KEY = "pasochat-github-popup-dismissed";

const GitHubStarPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== "/") return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-[336px] sm:bottom-5 sm:right-5"
        >
          <div className="relative overflow-hidden rounded-xl border border-zinc-200/90 bg-white/95 p-4 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-zinc-800/90 dark:bg-[#141313]/95 dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.65)]">
            {/* Top Header Row: Mark + Repo Tag + Dismiss */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/90 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                  <Github className="h-4 w-4 stroke-[1.75]" />
                </div>
                <div className="leading-none">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Open Source
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close GitHub star popup"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5 stroke-[1.75]" />
              </button>
            </div>

            {/* Copy */}
            <div className="mb-4 space-y-1">
              <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                Enjoying PasoChat?
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                If it’s been helpful in your workflow, a star on GitHub goes a
                long way in supporting the project.
              </p>
            </div>

            {/* Primary CTA */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3.5 text-xs font-medium text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <Star className="h-3.5 w-3.5 stroke-[1.85] transition-transform duration-150 group-hover:scale-110" />
              <span>Star on GitHub</span>
              <ExternalLink className="h-3 w-3 stroke-[1.75] opacity-65 transition-opacity group-hover:opacity-100" />
            </a>

            {/* Subtle Footer Note */}
            <div className="mt-2.5 flex items-center justify-center border-t border-zinc-100 pt-2.5 dark:border-zinc-800/70">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Built with care · Thank you for the support
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GitHubStarPopup;