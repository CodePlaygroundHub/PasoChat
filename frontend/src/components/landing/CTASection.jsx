import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Hash,
  MessageSquare,
  Mic,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";

const EASE = [0.22, 1, 0.36, 1];

const ORBIT_NODES = [
  {
    id: "dm",
    label: "Direct messages",
    icon: MessageSquare,
    angle: -90,
  },
  {
    id: "voice",
    label: "Voice channels",
    icon: Mic,
    angle: -18,
  },
  {
    id: "video",
    label: "Video rooms",
    icon: Video,
    angle: 54,
  },
  {
    id: "ai",
    label: "Workspace assistant",
    icon: Bot,
    angle: 126,
  },
  {
    id: "rooms",
    label: "Group threads",
    icon: Hash,
    angle: 198,
  },
];

const MEMBERS = [
  {
    name: "Alex Rivera",
    initials: "AR",
    src: "https://randomuser.me/api/portraits/men/32.jpg",
    sizeClass: "h-10 w-10 sm:h-11 sm:w-11 z-0",
  },
  {
    name: "Maya Kulkarni",
    initials: "MK",
    src: "https://randomuser.me/api/portraits/women/44.jpg",
    sizeClass: "h-13 w-13 sm:h-14 sm:w-14 z-10",
  },
  {
    name: "Samir Patel",
    initials: "SP",
    src: "https://randomuser.me/api/portraits/men/75.jpg",
    sizeClass: "h-10 w-10 sm:h-11 sm:w-11 z-0",
  },
];

function MemberAvatar({ member }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      title={member.name}
      className={`relative overflow-hidden rounded-full border-2 border-white bg-zinc-200 shadow-sm dark:border-[#141313] dark:bg-zinc-800 ${member.sizeClass}`}
    >
      {!imgError ? (
        <img
          src={member.src}
          alt={member.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-700 dark:text-zinc-200">
          {member.initials}
        </span>
      )}
    </div>
  );
}

const CTASection = () => {
  const prefersReducedMotion = useReducedMotion();
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <section
      id="about"
      className="relative border-b border-zinc-900/12 bg-[#FAFAFA] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 dark:border-white/12 dark:bg-[#100F0F]"
    >
      {/* Architectural Side Rails */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="mx-auto h-full max-w-6xl border-x border-zinc-900/[0.08] dark:border-white/[0.08]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.45, ease: EASE }}
          className="relative overflow-hidden rounded-2xl border border-zinc-900/12 bg-white px-6 py-12 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.08)] sm:px-10 lg:px-14 lg:py-16 dark:border-white/12 dark:bg-[#141313] dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]"
        >
          {/* Subtle Top Hairline & Ambient Wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-900/15 to-transparent dark:via-white/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(24,24,27,0.035),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(255,255,255,0.04),transparent_70%)]"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Copy & Actions */}
            <div className="text-center lg:col-span-6 lg:text-left">
              <h2 className="text-3xl font-medium tracking-[-0.038em] text-zinc-950 sm:text-5xl dark:text-zinc-50">
                Start talking{" "}
                <span className="text-zinc-400 dark:text-zinc-500">
                  without the noise.
                </span>
              </h2>

              <p className="mx-auto mt-4 max-w-md text-[13.5px] leading-[1.68] text-zinc-600 sm:text-sm lg:mx-0 dark:text-zinc-400">
                Direct chats, group rooms, voice and video calls, and AI help
                inside one calm workspace.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link
                  to="/signup"
                  className="group relative inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 text-[13px] font-medium text-white shadow-[0_2px_6px_-1px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                >
                  <span>Create account</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2] transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-900/14 bg-white px-5 text-[13px] font-medium text-zinc-800 shadow-2xs transition-all duration-150 hover:border-zinc-900/30 hover:bg-[#FAFAFA] active:scale-[0.98] dark:border-white/14 dark:bg-[#100F0F] dark:text-zinc-200 dark:hover:border-white/28 dark:hover:bg-white/[0.04]"
                >
                  Log in
                </Link>
              </div>
            </div>

            {/* Right Column: Boxless Orbital Stage */}
            <div className="relative flex items-center justify-center py-2 lg:col-span-6 lg:py-0">
              <div className="relative flex h-[280px] w-[280px] items-center justify-center sm:h-[310px] sm:w-[310px]">
                {/* Dashed Orbit Track */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute h-[204px] w-[204px] rounded-full border border-dashed border-zinc-900/15 sm:h-[232px] sm:w-[232px] dark:border-white/15"
                />

                {/* Slow Continuous Orbit */}
                <motion.div
                  animate={
                    prefersReducedMotion || hoveredNode
                      ? undefined
                      : { rotate: 360 }
                  }
                  transition={{
                    duration: 48,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="relative h-[204px] w-[204px] [--orbit-r:102px] sm:h-[232px] sm:w-[232px] sm:[--orbit-r:116px]"
                >
                  {ORBIT_NODES.map((node) => {
                    const Icon = node.icon;
                    const rad = (node.angle * Math.PI) / 180;
                    const cos = Math.cos(rad).toFixed(4);
                    const sin = Math.sin(rad).toFixed(4);
                    const isHovered = hoveredNode === node.id;

                    return (
                      <div
                        key={node.id}
                        style={{
                          transform: `translate(calc(${cos} * var(--orbit-r)), calc(${sin} * var(--orbit-r)))`,
                        }}
                        className="absolute top-1/2 left-1/2 -ml-5 -mt-5 sm:-ml-[22px] sm:-mt-[22px]"
                      >
                        <motion.button
                          type="button"
                          onMouseEnter={() => setHoveredNode(node.id)}
                          onMouseLeave={() => setHoveredNode(null)}
                          onFocus={() => setHoveredNode(node.id)}
                          onBlur={() => setHoveredNode(null)}
                          animate={
                            prefersReducedMotion || hoveredNode
                              ? undefined
                              : { rotate: -360 }
                          }
                          transition={{
                            duration: 48,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          title={node.label}
                          aria-label={node.label}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-150 sm:h-11 sm:w-11 ${
                            isHovered
                              ? "scale-105 border-zinc-900/25 bg-zinc-950 text-white shadow-md dark:border-white/30 dark:bg-zinc-100 dark:text-zinc-950"
                              : "border-zinc-900/12 bg-white text-zinc-700 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.12)] hover:border-zinc-900/25 dark:border-white/12 dark:bg-[#1A1919] dark:text-zinc-200 dark:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.75)]"
                          }`}
                        >
                          <Icon className="h-4 w-4 stroke-[1.8]" />
                        </motion.button>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Center Member Stack */}
                <div className="pointer-events-none absolute flex items-center -space-x-2.5">
                  {MEMBERS.map((member) => (
                    <MemberAvatar key={member.initials} member={member} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;