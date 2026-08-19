import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Clock, 
  Check, 
  Lock, 
  Crown, 
  Sparkles, 
  XCircle,
  Users
} from "lucide-react";
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

  // Highest vote count to determine the leader
  const maxVotes = Math.max(...poll.options.map((o) => o.votes.length), 0);

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
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="relative w-full max-w-[360px] sm:max-w-[400px] bg-base-100/90 dark:bg-base-900/80 backdrop-blur-xl border border-base-content/10 dark:border-white/10 rounded-3xl shadow-xl shadow-base-content/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/30"
    >
      {/* Subtle Ambient Top Accent Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-secondary/60 to-primary/60" />

      {/* Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Tag & Status */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <BarChart3 size={12} className="shrink-0" />
              <span>Poll</span>
            </span>

            {/* Status indicator */}
            {!isActive ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                poll.isClosed 
                  ? "bg-base-200 text-base-content/60 border-base-300"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}>
                <Lock size={10} />
                {poll.isClosed ? "Closed" : "Expired"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {/* Close Action for Creator */}
          {isCreator && isActive && (
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-error/70 hover:text-error hover:bg-error/10 px-2 py-1 rounded-lg transition-colors"
            >
              <XCircle size={12} />
              <span>End</span>
            </button>
          )}
        </div>

        {/* Question Title */}
        <h3 className="text-[15px] font-bold text-base-content leading-snug tracking-tight break-words">
          {poll.question}
        </h3>
        
        <p className="text-[11px] text-base-content/50 mt-1 flex items-center gap-1">
          <span>Created by</span>
          <span className="font-medium text-base-content/75">{poll.creatorId?.fullName || "Anonymous"}</span>
        </p>
      </div>

      {/* Options List */}
      <div className="px-4 sm:px-5 pb-4 space-y-2.5">
        {poll.options.map((opt) => {
          const percent = getVotePercent(opt.votes);
          const isMyVote = myVotedOptionId === opt._id;
          const isLeading = totalVotes > 0 && opt.votes.length === maxVotes && maxVotes > 0;

          return (
            <motion.button
              key={opt._id}
              type="button"
              onClick={() => handleVote(opt._id)}
              disabled={!isActive}
              whileTap={isActive ? { scale: 0.98 } : {}}
              className={`group relative w-full text-left rounded-2xl overflow-hidden p-3 transition-all duration-200 select-none
                ${isActive ? "cursor-pointer hover:border-primary/40" : "cursor-default"}
                ${isMyVote 
                  ? "border-2 border-primary bg-primary/5 shadow-sm shadow-primary/10" 
                  : "border border-base-200 dark:border-base-800 bg-base-200/30 hover:bg-base-200/50"
                }
              `}
            >
              {/* Animated Progress Fill */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute inset-y-0 left-0 rounded-2xl pointer-events-none transition-colors duration-300
                  ${isMyVote
                    ? "bg-gradient-to-r from-primary/20 to-primary/15"
                    : isLeading
                    ? "bg-gradient-to-r from-primary/10 to-base-300/40"
                    : "bg-base-200/70 dark:bg-base-700/30"
                  }
                `}
              />

              {/* Inner Content */}
              <div className="relative flex items-center justify-between gap-3 z-10">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Selection Radio / Check Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 border
                      ${isMyVote
                        ? "bg-primary border-primary text-primary-content shadow-sm shadow-primary/30 scale-105"
                        : "border-base-content/20 bg-base-100/60 dark:bg-base-800/60 group-hover:border-primary/50"
                      }
                    `}
                  >
                    {isMyVote && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>

                  <span className={`text-[13px] font-medium leading-tight truncate ${isMyVote ? "font-semibold text-primary" : "text-base-content/90"}`}>
                    {opt.text}
                  </span>

                  {/* Leader Trophy Icon */}
                  {isLeading && (
                    <Crown size={12} className="text-amber-500 shrink-0 drop-shadow-sm ml-0.5" />
                  )}
                </div>

                {/* Percentage & Vote Count */}
                <div className="flex items-baseline gap-1.5 shrink-0 pl-2">
                  <span className={`text-[13px] font-bold tracking-tight ${isMyVote ? "text-primary" : "text-base-content/70"}`}>
                    {percent}%
                  </span>
                  <span className="text-[10px] text-base-content/40 font-medium">
                    ({opt.votes.length})
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-base-200/80 dark:border-base-800 bg-base-200/20 text-[11px] text-base-content/50">
        <div className="flex items-center gap-1.5 font-medium">
          <Users size={12} className="opacity-70" />
          <span>{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</span>
          
          {poll.expiresAt && isActive && (
            <>
              <span className="opacity-30">•</span>
              <Clock size={11} className="opacity-70" />
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

        <span className="text-[10px] opacity-40 font-medium">
          {formatMessageTime(poll.createdAt)}
        </span>
      </div>
    </motion.div>
  );
};

export default PollBubble;