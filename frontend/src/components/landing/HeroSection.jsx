import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { Link } from "react-router-dom";
import HeroLiveStage from "./HeroLiveStage";
import ProductShowcase from "./ProductShowcase";
import { AnimatedTooltip } from "../ui/AnimatedTooltip";
import { PointerHighlight } from "../ui/PointerHighlight";

const GITHUB_URL = "https://github.com/CodePlaygroundHub/paso-chat-app";

const EASE = [0.22, 1, 0.36, 1];

const HERO_MEMBERS = [
  {
    id: 1,
    name: "Rohan Das",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: 2,
    name: "Ananya Sen",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: 3,
    name: "Kabir Roy",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80",
  },
  {
    id: 4,
    name: "Meera Nair",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80",
  },
];

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-zinc-900/12 bg-[#FAFAFA] px-4 pt-8 pb-20 sm:px-6 sm:pt-11 sm:pb-24 lg:px-8 lg:pt-14 lg:pb-28 dark:border-white/12 dark:bg-[#100F0F]">
      {/* Architectural Framing Rails & Datum */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <motion.div
          initial={prefersReducedMotion ? false : { scaleY: 0.96, opacity: 0.6 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative mx-auto flex h-full max-w-6xl origin-top justify-between border-x border-zinc-900/15 dark:border-white/15"
        >
          <div className="hidden h-full w-16 border-r border-zinc-900/[0.06] sm:block dark:border-white/[0.06]" />
          <div className="hidden h-full w-16 border-l border-zinc-900/[0.06] sm:block dark:border-white/[0.06]" />

          <span className="absolute top-[44%] -left-[4.5px] hidden font-mono text-[11px] leading-none text-zinc-400 select-none md:block dark:text-zinc-600">
            +
          </span>
          <span className="absolute top-[44%] -right-[4.5px] hidden font-mono text-[11px] leading-none text-zinc-400 select-none md:block dark:text-zinc-600">
            +
          </span>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? false : { scaleX: 0.85, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.08, ease: EASE }}
          className="absolute inset-x-0 top-[44%] hidden h-px bg-gradient-to-r from-transparent via-zinc-900/[0.09] to-transparent md:block dark:via-white/[0.09]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,rgba(24,24,27,0.05),transparent_70%)] dark:bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Top Header Line */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <HeroLiveStage />
        </motion.div>

        {/* Primary Display Headline */}
        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
          style={{
            fontFamily:
              "var(--font-sans, 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif)",
          }}
          className="mt-4 text-[2.5rem] leading-[1.03] font-medium tracking-[-0.044em] text-zinc-950 sm:text-[3.85rem] lg:text-[4.9rem] dark:text-zinc-50"
        >
          Real talk, live rooms,
          <span className="mt-1.5 block sm:whitespace-nowrap">
            <PointerHighlight>
              <span className="bg-gradient-to-b from-zinc-400 to-zinc-500 bg-clip-text text-transparent dark:from-zinc-400 dark:to-zinc-500">
                built to keep pace with you.
              </span>
            </PointerHighlight>
          </span>
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
          style={{
            fontFamily:
              "var(--font-sans, 'Geist', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif)",
          }}
          className="mx-auto mt-4 max-w-[30rem] text-[15px] leading-[1.6] font-normal tracking-[-0.015em] text-zinc-600 sm:text-[15.5px] dark:text-zinc-400"
        >
          One calm workspace for live rooms, voice and video calls, and focused
          threads without the noise.
        </motion.p>

        {/* CTA Cluster */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/signup"
            className="group relative inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-5 text-[13px] font-medium text-white shadow-[0_2px_6px_-1px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 hover:bg-zinc-800 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.25)] active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.9)] dark:hover:bg-white"
          >
            <span>Get started</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-900/14 bg-white/90 px-5 text-[13px] font-medium text-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150 hover:border-zinc-900/30 hover:bg-white active:scale-[0.98] dark:border-white/14 dark:bg-white/[0.03] dark:text-zinc-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] dark:hover:border-white/28 dark:hover:bg-white/[0.06]"
          >
            <Github className="h-3.5 w-3.5 stroke-[1.75] text-zinc-600 transition-colors group-hover:text-zinc-950 dark:text-zinc-400 dark:group-hover:text-white" />
            <span>GitHub</span>
          </a>
        </motion.div>

        {/* Avatar Strip + Caption */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
          className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3.5"
        >
          <AnimatedTooltip items={HERO_MEMBERS} />
          <span className="font-mono text-[10.5px] tracking-[0.12em] text-zinc-500 uppercase dark:text-zinc-400">
            Already chatting in Paso
          </span>
        </motion.div>

        {/* Embedded Product Showcase */}
        <ProductShowcase flush />
      </div>
    </section>
  );
};

export default HeroSection;