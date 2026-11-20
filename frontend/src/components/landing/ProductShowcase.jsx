import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  Video,
} from "lucide-react";

const INITIAL_THREADS = [
  {
    id: "alex-morgan",
    name: "Alex Morgan",
    status: "Active now",
    online: true,
    isAI: false,
    messages: [
      { id: "1", from: "them", text: "Tried the new huddle flow?" },
      { id: "2", from: "me", text: "Yeah, super fast and clean." },
      { id: "3", from: "them", text: "Zero clutter. Ready to ship." },
    ],
  },
  {
    id: "core-systems",
    name: "Core Systems",
    status: "14 members",
    online: true,
    isAI: false,
    messages: [
      { id: "g1", from: "them", text: "Realtime sync is green." },
      { id: "g2", from: "me", text: "Let's run a quick voice check." },
    ],
  },
  {
    id: "paso-ai",
    name: "PASO AI",
    status: "Assistant",
    online: true,
    isAI: true,
    messages: [
      { id: "a1", from: "them", text: "Need a quick draft or summary?" },
    ],
  },
  {
    id: "john-smith",
    name: "John Smith",
    status: "1h ago",
    online: false,
    isAI: false,
    messages: [
      { id: "j1", from: "them", text: "Thanks for sharing the notes." },
    ],
  },
];

const EASE = [0.22, 1, 0.36, 1];

const ProductShowcase = ({ flush = false }) => {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeId, setActiveId] = useState("alex-morgan");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  const feedContainerRef = useRef(null);
  const hasMountedRef = useRef(false);
  const aiTimerRef = useRef(null);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeId) || threads[0],
    [threads, activeId],
  );

  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.messages[t.messages.length - 1]?.text.toLowerCase().includes(q),
    );
  }, [threads, query]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const container = feedContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeId, activeThread.messages.length, aiTyping, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const targetThreadId = activeThread.id;
    const isAiThread = activeThread.isAI;

    const userMsg = {
      id: `${Date.now()}`,
      from: "me",
      text,
    };

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === targetThreadId
          ? { ...thread, messages: [...thread.messages, userMsg] }
          : thread,
      ),
    );

    setDraft("");

    if (isAiThread) {
      setAiTyping(true);
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

      aiTimerRef.current = setTimeout(() => {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === targetThreadId
              ? {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    {
                      id: `${Date.now()}-ai`,
                      from: "them",
                      text: `Draft: "${text.slice(0, 36)}${text.length > 36 ? "…" : ""}"`,
                    },
                  ],
                }
              : thread,
          ),
        );
        setAiTyping(false);
      }, 650);
    }
  };

  return (
    <div
  id="showcase"
  className={`relative ${
    flush
      ? "mt-12 sm:mt-14"
      : "border-b border-zinc-900/10 bg-[#FAFAFA] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 dark:border-white/10 dark:bg-[#100F0F]"
  }`}
>
      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: "some" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="overflow-hidden rounded-2xl border border-zinc-900/12 bg-white text-left shadow-[0_24px_60px_-24px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.03)] dark:border-white/12 dark:bg-[#141313] dark:shadow-[0_28px_70px_-24px_rgba(0,0,0,0.75)]"
        >
          {/* Window Chrome Bar */}
          <div className="flex h-10 items-center justify-between border-b border-zinc-900/[0.08] bg-[#FAFAFA] px-4 dark:border-white/[0.08] dark:bg-[#100F0F]">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full border border-zinc-900/15 bg-zinc-200/80 dark:border-white/15 dark:bg-zinc-800" />
              <span className="h-2.5 w-2.5 rounded-full border border-zinc-900/15 bg-zinc-200/80 dark:border-white/15 dark:bg-zinc-800" />
              <span className="h-2.5 w-2.5 rounded-full border border-zinc-900/15 bg-zinc-200/80 dark:border-white/15 dark:bg-zinc-800" />
            </div>

            <span className="font-mono text-[11px] tracking-[-0.01em] text-zinc-500 dark:text-zinc-400">
              pasochat.vercel.app
            </span>

            <span className="font-mono text-[10.5px] tracking-[0.04em] text-zinc-500 tabular-nums dark:text-zinc-400">
              {threads.filter((t) => t.online).length} active
            </span>
          </div>

          {/* Two-Pane Workspace */}
          <div className="grid min-h-[460px] grid-cols-1 sm:min-h-[490px] md:grid-cols-[248px_1fr]">
            {/* Sidebar */}
            <aside className="flex flex-col border-b border-zinc-900/[0.08] bg-white md:border-r md:border-b-0 dark:border-white/[0.08] dark:bg-[#100F0F]">
              <div className="flex h-12 items-center justify-between border-b border-zinc-900/[0.08] px-3.5 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-900/10 bg-[#FAFAFA] text-zinc-950 dark:border-white/10 dark:bg-[#161515] dark:text-zinc-100">
                    <MessageSquare className="h-3.5 w-3.5 stroke-[1.75]" />
                  </span>
                  <span className="text-[13px] font-semibold tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">
                    PASO
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveId("paso-ai");
                  }}
                  title="Open PASO AI"
                  aria-label="Open PASO AI assistant"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-zinc-900/10 bg-[#FAFAFA] text-zinc-500 transition-colors hover:border-zinc-900/20 hover:text-zinc-900 dark:border-white/10 dark:bg-[#161515] dark:text-zinc-400 dark:hover:border-white/20 dark:hover:text-zinc-100"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[1.75]" />
                </button>
              </div>

              {/* Search */}
              <div className="border-b border-zinc-900/[0.08] p-2.5 dark:border-white/[0.08]">
                <div className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    aria-label="Search preview chats"
                    className="h-8 w-full rounded-lg border border-zinc-900/10 bg-[#FAFAFA] pr-2.5 pl-8 text-[12px] text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900/25 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-[#141313] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-white/25"
                  />
                </div>
              </div>

              {/* Threads */}
              <div className="flex-1 space-y-1 overflow-y-auto p-2">
                {visibleThreads.length === 0 ? (
                  <p className="py-6 text-center text-[12px] text-zinc-400 dark:text-zinc-500">
                    No matching chats
                  </p>
                ) : (
                  visibleThreads.map((thread) => {
                    const isSelected = thread.id === activeThread.id;
                    const lastMsg = thread.messages[thread.messages.length - 1];

                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setActiveId(thread.id)}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 ${
                          isSelected
                            ? "bg-zinc-950/[0.06] text-zinc-950 dark:bg-white/[0.08] dark:text-zinc-50"
                            : "text-zinc-700 hover:bg-zinc-950/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[11px] font-semibold transition-colors duration-150 ${
                              isSelected
                                ? "border-zinc-950/15 bg-white text-zinc-950 shadow-2xs dark:border-white/20 dark:bg-[#1C1B1B] dark:text-white"
                                : "border-zinc-900/10 bg-[#FAFAFA] text-zinc-800 dark:border-white/10 dark:bg-[#161515] dark:text-zinc-200"
                            }`}
                          >
                            {thread.isAI ? (
                              <Bot className="h-3.5 w-3.5 stroke-[1.75]" />
                            ) : (
                              thread.name.charAt(0)
                            )}
                          </div>
                          {thread.online && (
                            <span
                              aria-hidden="true"
                              className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-white bg-zinc-900 dark:border-[#100F0F] dark:bg-zinc-200"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-medium">
                            {thread.name}
                          </p>
                          <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            {lastMsg?.text}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Conversation */}
            <div className="flex min-w-0 flex-col bg-[#FAFAFA]/70 dark:bg-[#141313]/60">
              <div className="flex h-12 items-center justify-between border-b border-zinc-900/[0.08] bg-white px-4 sm:px-5 dark:border-white/[0.08] dark:bg-[#100F0F]">
                <motion.div
                  key={activeThread.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="flex min-w-0 items-center gap-2.5"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-900/10 bg-[#FAFAFA] text-[11px] font-semibold text-zinc-800 dark:border-white/10 dark:bg-[#161515] dark:text-zinc-200">
                    {activeThread.isAI ? (
                      <Bot className="h-3.5 w-3.5 stroke-[1.75]" />
                    ) : (
                      activeThread.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-zinc-950 dark:text-zinc-50">
                      {activeThread.name}
                    </p>
                    <p className="truncate text-[10.5px] text-zinc-500 dark:text-zinc-400">
                      {activeThread.status}
                    </p>
                  </div>
                </motion.div>

                <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                  <button
                    type="button"
                    aria-label="Start voice call"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-zinc-900/[0.04] hover:text-zinc-900 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  >
                    <Phone className="h-3.5 w-3.5 stroke-[1.75]" />
                  </button>
                  <button
                    type="button"
                    aria-label="Start video call"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-zinc-900/[0.04] hover:text-zinc-900 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  >
                    <Video className="h-3.5 w-3.5 stroke-[1.75]" />
                  </button>
                  <button
                    type="button"
                    aria-label="More options"
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-zinc-900/[0.04] hover:text-zinc-900 dark:hover:bg-white/[0.05] dark:hover:text-white"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5 stroke-[1.75]" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={feedContainerRef}
                className="flex flex-1 flex-col justify-end gap-3 overflow-y-auto p-5 sm:p-6"
              >
                <AnimatePresence initial={false}>
                  {activeThread.messages.map((msg) => {
                    const isMe = msg.from === "me";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={
                          prefersReducedMotion ? false : { opacity: 0, y: 8 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.14 } }}
                        transition={{ duration: 0.24, ease: EASE }}
                        className={`max-w-[76%] ${
                          isMe ? "self-end text-right" : "self-start text-left"
                        }`}
                      >
                        <div
                          className={`rounded-xl border px-3.5 py-2 text-[13px] leading-relaxed ${
                            isMe
                              ? "border-zinc-950 bg-zinc-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
                              : "border-zinc-900/10 bg-white text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/10 dark:bg-[#100F0F] dark:text-zinc-200"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    );
                  })}

                  {aiTyping && activeThread.isAI && (
                    <motion.div
                      key="ai-typing-indicator"
                      initial={
                        prefersReducedMotion ? false : { opacity: 0, y: 6 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.14 } }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="inline-flex w-fit items-center gap-1 self-start rounded-xl border border-zinc-900/10 bg-white px-3.5 py-2.5 dark:border-white/10 dark:bg-[#100F0F]"
                    >
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          animate={
                            prefersReducedMotion
                              ? undefined
                              : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }
                          }
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: dot * 0.15,
                            ease: "easeInOut",
                          }}
                          className="h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400"
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-zinc-900/[0.08] bg-white p-3 dark:border-white/[0.08] dark:bg-[#100F0F]"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${activeThread.name}`}
                  aria-label="Type a preview message"
                  className="h-9 flex-1 rounded-full border border-zinc-900/12 bg-[#FAFAFA] px-4 text-[12.5px] text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-900/25 focus:bg-white focus:outline-none dark:border-white/12 dark:bg-[#141313] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-white/25"
                />
                <motion.button
                  type="submit"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                  aria-label="Send preview message"
                  className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                >
                  <Send className="h-3.5 w-3.5 stroke-[1.85]" />
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductShowcase;