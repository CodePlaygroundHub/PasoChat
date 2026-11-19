import { Lock, MessageSquare, Sparkles } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatSelected = () => {
  const { setSelectedUser, users } = useChatStore();

  const aiUser = users.find(
    (u) => u.isAI || u.fullName?.toLowerCase().includes("ai")
  );

  const handleSelectAI = () => {
    if (aiUser) {
      setSelectedUser(aiUser);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-white dark:bg-[#100F0F] px-6 py-12 select-none">
      <div className="w-full max-w-sm text-center">
        {/* Minimal Emblem */}
        <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
          <MessageSquare className="h-5 w-5 stroke-[1.75]" />
        </div>

        {/* Heading & Copy */}
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          No conversation selected
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Choose a direct message or group from the sidebar to pick up where you left off.
        </p>

        {/* Quiet Action Row */}
        {aiUser && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={handleSelectAI}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 stroke-[1.75]" />
              <span>Start chat with {aiUser.fullName || "AI"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Subtle Footer Meta */}
      <div className="absolute bottom-5 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
        <Lock className="h-3 w-3 stroke-[1.75]" />
        <span>End-to-end encrypted</span>
      </div>
    </div>
  );
};

export default NoChatSelected;