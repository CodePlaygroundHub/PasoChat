import { motion } from "framer-motion";
import { BarChart2, Clock, CheckCircle2, Lock } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { usePollStore } from "../store/usePollStore";
import { formatMessageTime } from "../lib/utils";

const PollBubble = ({ poll }) => {
  const { authUser } = useAuthStore();
  const { votePoll, closePoll } = usePollStore();

  const isCreator = poll.creatorId?._id === authUser._id || poll.creatorId === authUser._id;
  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);
  const isActive = !poll.isClosed && !isExpired;

  // Total votes across all options
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

  // Which option did the current user vote for?
  const myVotedOptionId = poll.options.find((opt) =>
    opt.votes.some((v) => (typeof v === "string" ? v : v?._id || v?.toString?.()) === authUser._id),
  )?._id;

  const handleVote = (optionId) => {
    if (!isActive) return;
    votePoll(poll._id, optionId);
  };

  const handleClose = () => {
    if (!isCreator) return;
    if (window.confirm("Close this poll? Members will no longer be able to vote.")) {
      closePoll(poll._id);
    }
  };

  const getVotePercent = (votes) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes.length / totalVotes) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[340px] sm:max-w-[380px] bg-base-100 border border-base-300 rounded-2xl shadow-md overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 px-4 pt-4 pb-2">
        <div className="mt-0.5 p-1.5 bg-primary/10 rounded-lg shrink-0">
          <BarChart2 size={15} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-snug break-words">
            {poll.question}
          </p>
          <p className="text-[10px] text-base-content/40 mt-0.5">
            By {poll.creatorId?.fullName || "Unknown"}
          </p>
        </div>
      </div>

      {/* Status badge */}
      {(!isActive) && (
        <div className={`mx-4 mb-2 flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full w-fit
          ${poll.isClosed
            ? "bg-base-200 text-base-content/50"
            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
          }`}
        >
          <Lock size={9} />
          {poll.isClosed ? "Closed" : "Expired"}
        </div>
      )}

      {/* Options */}
      <div className="px-4 pb-3 space-y-2">
        {poll.options.map((opt) => {
          const percent = getVotePercent(opt.votes);
          const isMyVote = myVotedOptionId === opt._id;
          const isLeading =
            totalVotes > 0 &&
            opt.votes.length === Math.max(...poll.options.map((o) => o.votes.length));

          return (
            <button
              key={opt._id}
              type="button"
              onClick={() => handleVote(opt._id)}
              disabled={!isActive}
              className={`relative w-full text-left rounded-xl overflow-hidden transition-all duration-200
                ${isActive ? "cursor-pointer hover:opacity-90 active:scale-[0.98]" : "cursor-default"}
                ${isMyVote
                  ? "ring-2 ring-primary ring-offset-1"
                  : "border border-base-200"
                }
              `}
            >
              {/* Progress fill */}
              <div
                className={`absolute inset-0 transition-all duration-500 rounded-xl
                  ${isMyVote
                    ? "bg-primary/15"
                    : isLeading && totalVotes > 0
                    ? "bg-base-200/80"
                    : "bg-base-200/40"
                  }
                `}
                style={{ width: `${percent}%` }}
              />

              {/* Content */}
              <div className="relative flex items-center justify-between px-3 py-2.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isMyVote && (
                    <CheckCircle2 size={13} className="text-primary shrink-0" />
                  )}
                  <span className={`text-[13px] font-medium truncate ${isMyVote ? "text-primary" : ""}`}>
                    {opt.text}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-base-content/50 shrink-0">
                  {percent}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-base-200 bg-base-200/30">
        <div className="flex items-center gap-1 text-[10px] text-base-content/40">
          <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
          {poll.expiresAt && isActive && (
            <>
              <span className="mx-1 opacity-40">·</span>
              <Clock size={9} />
              <span>
                Ends {new Date(poll.expiresAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-base-content/30">
            {formatMessageTime(poll.createdAt)}
          </span>
          {isCreator && isActive && (
            <button
              type="button"
              onClick={handleClose}
              className="text-[10px] font-semibold text-error/70 hover:text-error transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PollBubble;
