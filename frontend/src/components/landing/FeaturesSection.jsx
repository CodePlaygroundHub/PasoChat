import { motion, useReducedMotion } from "framer-motion";
import {
  ChartNoAxesColumnIncreasing,
  Image,
  MessageCircle,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

const FEATURES = [
  {
    index: "01",
    icon: MessageCircle,
    title: "Real-time Messaging",
    description:
      "1:1 and group messages with presence, typing indicators, and read receipts.",
  },
  {
    index: "02",
    icon: Users,
    title: "Group Conversations",
    description:
      "Group rooms, pinned threads, and shared context in one place.",
  },
  {
    index: "03",
    icon: Video,
    title: "Audio & Video Calls",
    description:
      "Voice and video rooms directly alongside your conversations.",
  },
  {
    index: "04",
    icon: Image,
    title: "Media & File Sharing",
    description:
      "Upload and preview images, audio clips, and files cleanly.",
  },
  {
    index: "05",
    icon: ChartNoAxesColumnIncreasing,
    title: "Interactive Polls",
    description:
      "Quick polls inside chats to make decisions without long threads.",
  },
  {
    index: "06",
    icon: Sparkles,
    title: "AI Replies & Safety",
    description:
      "Drafts, summaries, and basic moderation checks built into the flow.",
  },
];

const EASE = [0.22, 1, 0.36, 1];

const FeaturesSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="features"
      className="relative border-b border-zinc-900/12 bg-[#FAFAFA] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 dark:border-white/12 dark:bg-[#100F0F]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="mx-auto h-full max-w-6xl border-x border-zinc-900/[0.08] dark:border-white/[0.08]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mb-10 flex flex-col justify-between gap-4 border-b border-zinc-900/[0.08] pb-6 sm:mb-12 md:flex-row md:items-end dark:border-white/[0.08]"
        >
          <div>
            <p className="font-mono text-[10.5px] tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.038em] text-zinc-950 sm:text-[2.5rem] dark:text-zinc-50">
              Everything in{" "}
              <span className="text-zinc-400 dark:text-zinc-500">
                one place.
              </span>
            </h2>
          </div>

          <p className="max-w-xs text-[13.5px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
            Rooms, calls, media, polls, and AI assistance inside one workspace.
          </p>
        </motion.div>

        <div className="divide-y divide-zinc-900/[0.08] border-b border-zinc-900/[0.08] dark:divide-white/[0.08] dark:border-white/[0.08]">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.index}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: "some" }}
                transition={{
                  duration: 0.35,
                  delay: idx * 0.03,
                  ease: EASE,
                }}
                className="group grid grid-cols-1 items-baseline gap-2 py-4 transition-colors duration-150 hover:bg-zinc-950/[0.015] sm:grid-cols-[64px_220px_1fr] sm:gap-4 sm:px-2 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2.5 font-mono text-[11px] text-zinc-400 tabular-nums dark:text-zinc-500">
                  <span>{feature.index}</span>
                  <Icon className="h-3.5 w-3.5 stroke-[1.75] text-zinc-500 transition-colors duration-150 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-200" />
                </div>

                <h3 className="text-[14px] font-medium tracking-[-0.015em] text-zinc-900 dark:text-zinc-100">
                  {feature.title}
                </h3>

                <p className="text-[13px] leading-[1.55] text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;