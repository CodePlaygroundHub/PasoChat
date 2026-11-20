import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  MessageSquare,
} from "lucide-react";

const GITHUB_URL =
  "https://github.com/CodePlaygroundHub/paso-chat-app";

const CONTRIBUTING_URL =
  "https://github.com/CodePlaygroundHub/PasoChat?tab=contributing-ov-file";

const EASE = [0.22, 1, 0.36, 1];

const LandingFooter = () => {
  return (
    <footer className="relative overflow-hidden border-t border-zinc-900/[0.09] bg-[#FAFAFA] pt-14 dark:border-white/[0.09] dark:bg-[#100F0F]">

      {/* Architectural Rails — matching the page layout */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="mx-auto h-full max-w-6xl border-x border-zinc-900/[0.055] dark:border-white/[0.055]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-12 md:gap-8">

          {/* Brand */}
          <div className="md:col-span-5">

            <Link
              to="/"
              className="group inline-flex items-center gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900/[0.10] bg-white text-zinc-950 shadow-sm transition-all duration-200 group-hover:border-zinc-900/20 dark:border-white/[0.12] dark:bg-[#151414] dark:text-white">
                <MessageSquare className="h-[18px] w-[18px] stroke-[1.7]" />
              </span>

              <span className="text-[21px] font-semibold tracking-[-0.055em] text-zinc-950 dark:text-zinc-50">
                PASO
              </span>

              <span className="rounded-md border border-zinc-900/[0.10] px-2 py-1 font-mono text-[9px] tracking-[0.08em] text-zinc-500 dark:border-white/[0.12] dark:text-zinc-400">
                MIT
              </span>
            </Link>

            <p className="mt-5 max-w-[340px] text-[14px] leading-[1.9] text-zinc-500 dark:text-zinc-400">
              An open-source real-time messaging and
              huddle workspace built for calm, fast
              conversations.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 md:gap-10">

            {/* Product */}
            <div>
              <h4 className="mb-7 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                Product
              </h4>

              <div className="flex flex-col gap-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
                <a
                  href="#showcase"
                  className="w-fit transition-colors duration-200 hover:text-zinc-950 dark:hover:text-white"
                >
                  Workspace
                </a>

                <Link
                  to="/signup"
                  className="w-fit transition-colors duration-200 hover:text-zinc-950 dark:hover:text-white"
                >
                  Get started
                </Link>
              </div>
            </div>

            {/* Account */}
            <div>
              <h4 className="mb-7 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                Account
              </h4>

              <div className="flex flex-col gap-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
                <Link
                  to="/login"
                  className="w-fit transition-colors duration-200 hover:text-zinc-950 dark:hover:text-white"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="w-fit transition-colors duration-200 hover:text-zinc-950 dark:hover:text-white"
                >
                  Create account
                </Link>
              </div>
            </div>

            {/* Open Source */}
            <div>
              <h4 className="mb-7 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                Open Source
              </h4>

              <div className="flex flex-col gap-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">

                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-1.5 transition-colors duration-200 hover:text-zinc-950 dark:hover:text-white"
                >
                  GitHub
                  <ArrowUpRight className="h-3 w-3 text-zinc-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>

                <a
                  href={CONTRIBUTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-fit items-center gap-1.5 transition-colors duration-200 hover:text-zinc-950 dark:hover:text-white"
                >
                  Contribute
                  <ArrowUpRight className="h-3 w-3 text-zinc-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>

              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-zinc-900/[0.09] py-6 dark:border-white/[0.09] sm:flex-row sm:items-center">

          <p className="font-mono text-[10px] tracking-wide text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} PASO. ALL RIGHTS RESERVED.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] tracking-wide text-zinc-400 dark:text-zinc-500">
            <span>REACT</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span>NODE.JS</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span>SOCKET.IO</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span>REDIS</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span>MONGODB</span>
          </div>
        </div>

        {/* Large Brand Wordmark */}
        <div
          aria-hidden="true"
          className="overflow-hidden border-t border-zinc-900/[0.055] pt-5 dark:border-white/[0.055]"
        >
          <span className="block translate-y-[8%] select-none text-center text-[23vw] leading-[0.78] font-semibold tracking-[-0.085em] text-zinc-950/[0.045] dark:text-white/[0.045]">
            PASO
          </span>
        </div>

      </motion.div>
    </footer>
  );
};

export default LandingFooter;