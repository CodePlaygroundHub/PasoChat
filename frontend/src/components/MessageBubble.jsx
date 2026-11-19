import { useState, useRef, useEffect, useMemo } from "react";
import {
  MoreVertical,
  Trash,
  Trash2,
  ShieldAlert,
  Copy,
  SmilePlus,
  Pin,
  Check,
  CheckCheck,
  Sparkles,
  Reply,
  Forward,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import FileMessage from "./FileMessage";
import AudioMessage from "./AudioMessage";
import { formatMessageTime } from "../lib/utils";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import ForwardModal from "./ForwardModal";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const MessageBubble = ({ message, sender, isMe, chatId }) => {
  const [open, setOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);

  const menuRef = useRef(null);
  const emojiRef = useRef(null);

  const {
    deleteMessageForMe,
    deleteMessageForEveryone,
    pinnedMessages,
    togglePin,
    setReplyingTo,
    setHighlightedMessage,
    highlightedMessageId,
    searchQuery,
    users,
    groups,
  } = useChatStore();

  const authUser = useAuthStore((state) => state.authUser);

  const isPinned = pinnedMessages?.[chatId]?.[message._id];
  const canDeleteForEveryone = isMe && !message.deletedForEveryone;
  const isAI = sender?.isAI;

  const highlightedText = useMemo(() => {
    if (!searchQuery || !message.text) return message.text;
    const regex = new RegExp(`(${searchQuery})`, "ig");
    return message.text.split(regex);
  }, [message.text, searchQuery]);

  const renderStatusTick = () => {
    if (!isMe || message.isTemp || message.deletedForEveryone) return null;
    if (message.status === "sent")
      return <Check size={13} className="text-white/70" />;
    if (message.status === "delivered")
      return <CheckCheck size={13} className="text-white/70" />;
    if (message.status === "seen")
      return <CheckCheck size={13} className="text-sky-300" />;
    return null;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setOpen(false);
      if (emojiRef.current && !emojiRef.current.contains(event.target))
        setShowEmojis(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleCopyText = async () => {
    if (!message.text) return;
    try {
      await navigator.clipboard.writeText(message.text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    } finally {
      setOpen(false);
    }
  };

  const handleReport = async () => {
    if (!window.confirm("Report this message?")) return;
    try {
      await axiosInstance.post("/reports", {
        reportedUserId:
          typeof message.senderId === "string"
            ? message.senderId
            : message.senderId?._id,
        reportedMessageId: message._id,
        reason: "Inappropriate content",
      });
      toast.success("Report submitted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setOpen(false);
    }
  };

  const handleForward = () => {
    setShowForwardModal(true);
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={isAI ? { opacity: 0, y: 6 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        id={`msg-${message._id}`}
        className={`group flex w-full gap-2.5 my-2 px-3 sm:px-6 select-none ${
          isMe ? "justify-end" : "justify-start"
        }`}
      >
        {/* Incoming Avatar */}
        {!isMe && (
          <div className="shrink-0 self-end mb-0.5">
            {isAI ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                <Sparkles className="h-3.5 w-3.5 stroke-[1.75]" />
              </div>
            ) : (
              <img
                src={sender?.profilePic || "/avatar.png"}
                alt="avatar"
                className="h-7 w-7 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/avatar.png";
                }}
              />
            )}
          </div>
        )}

        <div
          className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
            isMe ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`flex items-center gap-1.5 ${
              isMe ? "flex-row" : "flex-row-reverse"
            }`}
          >
            {/* Quick Actions Hover Group */}
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              {/* Emoji Picker */}
              <div className="relative" ref={emojiRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojis((prev) => !prev);
                    setOpen(false);
                  }}
                  title="React"
                  aria-label="React"
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer ${
                    showEmojis
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-700 dark:hover:text-zinc-200"
                  }`}
                >
                  <SmilePlus className="h-3.5 w-3.5 stroke-[1.75]" />
                </button>

                <AnimatePresence>
                  {showEmojis && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className={`absolute bottom-full z-50 mb-1.5 flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141313] px-2 py-1 shadow-lg ${
                        isMe ? "right-0" : "left-0"
                      }`}
                    >
                      {REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={async () => {
                            try {
                              await axiosInstance.post(
                                `/messages/react/${message._id}`,
                                { emoji }
                              );
                            } catch (err) {
                              toast.error("Failed to react");
                            }
                            setShowEmojis(false);
                          }}
                          className="rounded p-1 text-base leading-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3-Dot Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                    setShowEmojis(false);
                  }}
                  title="More actions"
                  aria-label="More actions"
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer ${
                    open
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-700 dark:hover:text-zinc-200"
                  }`}
                >
                  <MoreVertical className="h-3.5 w-3.5 stroke-[1.75]" />
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className={`absolute top-full z-50 mt-1 w-44 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141313] p-1 shadow-lg ${
                        isMe ? "right-0" : "left-0"
                      }`}
                    >
                      {!message.deletedForEveryone && (
                        <button
                          type="button"
                          onClick={() => {
                            togglePin(chatId, message._id);
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Pin
                            className={`h-3.5 w-3.5 stroke-[1.75] ${
                              isPinned
                                ? "text-amber-500 fill-amber-500"
                                : "text-zinc-400"
                            }`}
                          />
                          <span>{isPinned ? "Unpin" : "Pin message"}</span>
                        </button>
                      )}
                      {message.text && (
                        <button
                          type="button"
                          onClick={handleCopyText}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5 text-zinc-400 stroke-[1.75]" />
                          <span>Copy text</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(message);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Reply className="h-3.5 w-3.5 text-zinc-400 stroke-[1.75]" />
                        <span>Reply</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleForward}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Forward className="h-3.5 w-3.5 text-zinc-400 stroke-[1.75]" />
                        <span>Forward</span>
                      </button>

                      {!isMe && !message.deletedForEveryone && (
                        <>
                          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />
                          <button
                            type="button"
                            onClick={handleReport}
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50/70 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 stroke-[1.75]" />
                            <span>Report</span>
                          </button>
                        </>
                      )}

                      <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />
                      <button
                        type="button"
                        onClick={() => {
                          deleteMessageForMe(message._id);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash className="h-3.5 w-3.5 stroke-[1.75]" />
                        <span>Delete for me</span>
                      </button>
                      {canDeleteForEveryone && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteMessageForEveryone(message._id);
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                          <span>Delete for all</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Message Bubble Container */}
            <div className="relative">
              {/* Pinned Icon Badge */}
              {isPinned && (
                <div
                  className={`absolute -top-1.5 ${
                    isMe ? "-left-1.5" : "-right-1.5"
                  } z-20 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 shadow-xs`}
                >
                  <Pin className="h-2.5 w-2.5 fill-current stroke-[2]" />
                </div>
              )}

              <div
                className={`relative rounded-xl px-3.5 py-2 transition-colors ${
                  highlightedMessageId === message._id
                    ? "ring-2 ring-zinc-900/40 dark:ring-zinc-100/40"
                    : ""
                } ${
                  message.deletedForEveryone
                    ? "border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-500 text-xs"
                    : isMe
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-tr-xs"
                      : isAI
                        ? "border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-[#141313] text-zinc-900 dark:text-zinc-100 rounded-tl-xs"
                        : "border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141313] text-zinc-900 dark:text-zinc-100 rounded-tl-xs"
                }`}
              >
                {message.deletedForEveryone ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    <ShieldAlert className="h-3.5 w-3.5 stroke-[1.75]" />
                    <span>Message deleted</span>
                  </div>
                ) : (
                  <>
                    {/* Forwarded Status */}
                    {message.isForwarded && (
                      <div
                        className={`mb-1 flex items-center gap-1 text-[11px] font-medium ${
                          isMe
                            ? "text-white/70 dark:text-zinc-950/70"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        <Forward className="h-3 w-3 stroke-[1.75]" />
                        <span>Forwarded</span>
                      </div>
                    )}

                    {/* AI Tag */}
                    {isAI && (
                      <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        <Sparkles className="h-3 w-3 stroke-[1.75]" />
                        <span>Meta AI</span>
                      </div>
                    )}

                    {/* Replied Message Context */}
                    {message.replyTo && (
                      <div
                        onClick={() => {
                          const id = message.replyTo._id;
                          setHighlightedMessage(id);
                          document
                            .getElementById(`msg-${id}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          setTimeout(() => setHighlightedMessage(null), 1200);
                        }}
                        className={`mb-1.5 cursor-pointer rounded-md border-l-2 px-2.5 py-1 text-xs transition-colors ${
                          isMe
                            ? "border-white/50 dark:border-zinc-950/50 bg-white/10 dark:bg-zinc-950/10 hover:bg-white/15 dark:hover:bg-zinc-950/15 text-white dark:text-zinc-950"
                            : "border-zinc-400 dark:border-zinc-600 bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <div className="truncate text-[11px] font-semibold">
                          {message.replyTo.senderId?.fullName || "User"}
                        </div>
                        <div className="truncate text-[11px] opacity-80">
                          {message.replyTo.text || "Media attachment"}
                        </div>
                      </div>
                    )}

                    {/* Media Attachments */}
                    {(message.image ||
                      message.audio ||
                      message.file?.url) && (
                      <div className="my-1 flex flex-col gap-2">
                        {message.image && (
                          <img
                            src={message.image}
                            className="max-h-80 max-w-full rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 object-cover"
                            alt="attachment"
                          />
                        )}
                        {message.audio && (
                          <AudioMessage
                            audioUrl={message.audio}
                            isMe={isMe}
                          />
                        )}
                        {message.file?.url && (
                          <FileMessage file={message.file} />
                        )}
                      </div>
                    )}

                    {/* Moderation Badges */}
                    {!message.deletedForEveryone &&
                      (message.toxic || message.spam) && (
                        <div className="mb-1.5 flex flex-wrap gap-1">
                          {message.toxic && (
                            <span className="inline-flex items-center gap-1 rounded border border-red-500/25 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                              <ShieldAlert className="h-2.5 w-2.5 stroke-[1.75]" />
                              Toxic
                            </span>
                          )}
                          {message.spam && (
                            <span className="inline-flex items-center gap-1 rounded border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              <ShieldAlert className="h-2.5 w-2.5 stroke-[1.75]" />
                              Spam
                            </span>
                          )}
                        </div>
                      )}

                    {/* Text Body & Inline Timestamp */}
                    <div className="flex items-end justify-between gap-3">
                      {message.text && (
                        <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">
                          {Array.isArray(highlightedText)
                            ? highlightedText.map((part, i) =>
                                part.toLowerCase() ===
                                searchQuery?.toLowerCase() ? (
                                  <mark
                                    key={i}
                                    className="rounded bg-amber-200/90 dark:bg-amber-400/30 px-0.5 text-zinc-950 dark:text-zinc-100"
                                  >
                                    {part}
                                  </mark>
                                ) : (
                                  <span key={i}>{part}</span>
                                )
                              )
                            : highlightedText}
                        </p>
                      )}

                      {/* Timestamp & Status Icon */}
                      <div
                        className={`ml-1.5 flex shrink-0 select-none items-center gap-1 pb-0.5 text-[10px] tabular-nums ${
                          isMe
                            ? "text-white/65 dark:text-zinc-950/65"
                            : "text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {renderStatusTick()}
                      </div>
                    </div>
                  </>
                )}

                {/* Reaction Badge */}
                {message.reactions?.length > 0 && (
                  <div
                    className={`absolute -bottom-2 ${
                      isMe ? "left-2" : "right-2"
                    } z-10 flex items-center gap-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141313] px-1.5 py-0.5 shadow-xs`}
                  >
                    {message.reactions.map((r, i) => (
                      <span key={i} className="text-xs leading-none">
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <ForwardModal
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        messageId={message._id}
        users={users}
        groups={groups}
      />
    </>
  );
};

export default MessageBubble;