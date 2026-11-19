import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  Clock,
  Lock,
  Users,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { usePollStore } from "../store/usePollStore";
import { formatMessageTime } from "../lib/utils";

const PollBubble = ({ poll }) => {
  const { authUser } = useAuthStore();
  const { votePoll, closePoll } = usePollStore();

  const isCreator =
    poll.creatorId?._id === authUser._id || poll.creatorId === authUser._id;
  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);
  const isActive = !poll.isClosed && !isExpired;

  const totalVotes = poll.options.reduce(
    (sum, opt) => sum + opt.votes.length,
    0,
  );

  const maxVotes = Math.max(...poll.options.map((o) => o.votes.length), 0);

  const myVotedOptionId = poll.options.find((opt) =>
    opt.votes.some(
      (v) =>
        (typeof v === "string" ? v : v?._id || v?.toString?.()) ===
        authUser._id,
    ),
  )?._id;

  const handleVote = (optionId) => {
    if (!isActive) return;
    votePoll(poll._id, optionId);
  };

  const handleClose = () => {
    if (!isCreator) return;
    if (
      window.confirm(
        "Close this poll? Members will no longer be able to vote.",
      )
    ) {
      closePoll(poll._id);
    }
  };

  const getVotePercent = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes.length / totalVotes) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-[360px] sm:max-w-[390px] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141313] shadow-xs overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
              <BarChart3 className="h-3.5 w-3.5 stroke-[1.75] text-zinc-500 dark:text-zinc-400" />
              <span>Poll</span>
            </span>

            <span className="text-zinc-300 dark:text-zinc-700">•</span>

            {!isActive ? (
              <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                <Lock className="h-3 w-3 stroke-[1.75]" />
                <span>{poll.isClosed ? "Closed" : "Expired"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Open</span>
              </span>
            )}
          </div>

          {isCreator && isActive && (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-red-50/70 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <XCircle className="h-3 w-3 stroke-[1.75]" />
              <span>Close poll</span>
            </button>
          )}
        </div>

        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug break-words">
          {poll.question}
        </h3>

        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          By{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {poll.creatorId?.fullName || "Anonymous"}
          </span>
        </p>
      </div>

      {/* Options */}
      <div className="px-4 pb-3.5 space-y-2">
        {poll.options.map((opt) => {
          const percent = getVotePercent(opt.votes);
          const isMyVote = myVotedOptionId === opt._id;
          const isLeading =
            totalVotes > 0 && opt.votes.length === maxVotes && maxVotes > 0;

          return (
            <button
              key={opt._id}
              type="button"
              onClick={() => handleVote(opt._id)}
              disabled={!isActive}
              className={`group relative w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors select-none ${
                isActive ? "cursor-pointer" : "cursor-default"
              } ${
                isMyVote
                  ? "border-zinc-900/40 dark:border-zinc-100/40 bg-zinc-50 dark:bg-zinc-900/70"
                  : "border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {/* Progress Bar Fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-none absolute inset-y-0 left-0 ${
                  isMyVote
                    ? "bg-zinc-900/[0.07] dark:bg-zinc-100/[0.10]"
                    : isLeading
                      ? "bg-zinc-900/[0.045] dark:bg-zinc-100/[0.06]"
                      : "bg-zinc-900/[0.025] dark:bg-zinc-100/[0.03]"
                }`}
              />

              {/* Option Content */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isMyVote
                        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950"
                        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-zinc-400 dark:group-hover:border-zinc-500"
                    }`}
                  >
                    {isMyVote && <Check className="h-2.5 w-2.5 stroke-[2.75]" />}
                  </span>

                  <span
                    className={`truncate text-xs leading-tight ${
                      isMyVote
                        ? "font-semibold text-zinc-950 dark:text-zinc-50"
                        : "font-medium text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {opt.text}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 shrink-0 tabular-nums">
                  <span
                    className={`text-xs ${
                      isMyVote || isLeading
                        ? "font-semibold text-zinc-900 dark:text-zinc-100"
                        : "font-medium text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {percent}%
                  </span>
                  <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    ({opt.votes.length})
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30 px-4 py-2.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 tabular-nums">
          <Users className="h-3 w-3 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
          <span>
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </span>

          {poll.expiresAt && isActive && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <Clock className="h-3 w-3 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
              <span>
                Ends{" "}
                {new Date(poll.expiresAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          )}
        </div>

        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
          {formatMessageTime(poll.createdAt)}
        </span>
      </div>
    </motion.div>
  );
};

export default PollBubble;