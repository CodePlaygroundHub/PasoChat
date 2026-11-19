import { Pin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";

const PinnedHeader = ({ chatId }) => {
  const { pinnedMessages, messages, togglePin, setHighlightedMessage } =
    useChatStore();

  const pinnedIds = Object.keys(pinnedMessages?.[chatId] || {}).filter(
    (id) => pinnedMessages[chatId]?.[id],
  );

  if (pinnedIds.length === 0) return null;

  const pinnedId = pinnedIds[pinnedIds.length - 1];
  const pinnedMsg = messages?.find((m) => m._id === pinnedId);

  const scrollToMessage = () => {
    const el = document.getElementById(`msg-${pinnedId}`);
    if (!el) return;

    setHighlightedMessage(pinnedId);

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setTimeout(() => {
      setHighlightedMessage(null);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-[#141313]/90 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="h-7 w-0.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />

            <button
              type="button"
              onClick={scrollToMessage}
              className="flex flex-col items-start min-w-0 flex-1 text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Pin className="h-3 w-3 shrink-0 text-zinc-500 dark:text-zinc-400 fill-current" />
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  Pinned message
                </span>
              </div>

              <p className="mt-0.5 w-full truncate text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 transition-colors">
                {pinnedMsg?.text ||
                  (pinnedMsg?.image ? "Image attachment" : "Attachment")}
              </p>
            </button>
          </div>

          <button
            type="button"
            onClick={() => togglePin(chatId, pinnedId)}
            aria-label="Unpin message"
            title="Unpin"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5 stroke-[1.75]" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PinnedHeader;