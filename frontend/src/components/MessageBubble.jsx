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
        initial={isAI ? { opacity: 0, y: 10, scale: 0.96 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        id={`msg-${message._id}`}
        className={`flex w-full gap-2.5 my-2 px-3 sm:px-6 select-none ${
          isMe ? "justify-end" : "justify-start"
        } group`}
      >
        {/* Incoming Avatar */}
        {!isMe && (
          <div className="shrink-0 self-end mb-1">
            {isAI ? (
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary/20 via-primary/10 to-base-200 flex items-center justify-center border border-primary/30 text-primary shadow-sm">
                <Sparkles size={14} className="animate-pulse" />
              </div>
            ) : (
              <img
                src={sender?.profilePic || "/avatar.png"}
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover ring-1 ring-base-content/10 shadow-sm"
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
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              {/* Emoji Picker */}
              <div className="relative" ref={emojiRef}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojis((prev) => !prev);
                    setOpen(false);
                  }}
                  className={`p-1.5 rounded-full hover:bg-base-200/80 transition-colors ${
                    showEmojis
                      ? "text-primary bg-base-200"
                      : "text-base-content/45 hover:text-base-content"
                  }`}
                  title="React"
                >
                  <SmilePlus size={16} />
                </motion.button>

                <AnimatePresence>
                  {showEmojis && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: 6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`absolute bottom-full mb-2 z-50 bg-base-100 border border-base-content/10 rounded-full px-2.5 py-1 shadow-xl flex items-center gap-1 ${
                        isMe ? "right-0" : "left-0"
                      }`}
                    >
                      {REACTIONS.map((emoji) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.85 }}
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
                          className="text-lg p-1 leading-none transition-transform"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3-Dot Menu */}
              <div className="relative" ref={menuRef}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                    setShowEmojis(false);
                  }}
                  className={`p-1.5 rounded-full hover:bg-base-200/80 transition-colors ${
                    open
                      ? "text-primary bg-base-200"
                      : "text-base-content/45 hover:text-base-content"
                  }`}
                  title="More actions"
                >
                  <MoreVertical size={16} />
                </motion.button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`absolute top-full mt-1.5 z-50 w-48 bg-base-100 border border-base-content/10 rounded-2xl shadow-xl overflow-hidden p-1.5 ${
                        isMe ? "right-0" : "left-0"
                      }`}
                    >
                      {!message.deletedForEveryone && (
                        <button
                          onClick={() => {
                            togglePin(chatId, message._id);
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-base-200/80 text-base-content/80 hover:text-base-content transition-colors"
                        >
                          <Pin
                            size={14}
                            className={
                              isPinned
                                ? "text-amber-400 fill-amber-400"
                                : "text-base-content/50"
                            }
                          />
                          <span>{isPinned ? "Unpin" : "Pin Message"}</span>
                        </button>
                      )}
                      {message.text && (
                        <button
                          onClick={handleCopyText}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-base-200/80 text-base-content/80 hover:text-base-content transition-colors"
                        >
                          <Copy size={14} className="text-base-content/50" />
                          <span>Copy Text</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setReplyingTo(message);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-base-200/80 text-base-content/80 hover:text-base-content transition-colors"
                      >
                        <Reply size={14} className="text-base-content/50" />
                        <span>Reply</span>
                      </button>
                      <button
                        onClick={handleForward}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl hover:bg-base-200/80 text-base-content/80 hover:text-base-content transition-colors"
                      >
                        <Forward size={14} className="text-base-content/50" />
                        <span>Forward</span>
                      </button>

                      {!isMe && !message.deletedForEveryone && (
                        <>
                          <div className="my-1 border-t border-base-content/5" />
                          <button
                            onClick={handleReport}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors"
                          >
                            <ShieldAlert size={14} />
                            <span>Report</span>
                          </button>
                        </>
                      )}

                      <div className="my-1 border-t border-base-content/5" />
                      <button
                        onClick={() => {
                          deleteMessageForMe(message._id);
                          setOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-base-content/70 hover:bg-base-200/80 hover:text-base-content transition-colors"
                      >
                        <Trash size={14} />
                        <span>Delete for me</span>
                      </button>
                      {canDeleteForEveryone && (
                        <button
                          onClick={() => {
                            deleteMessageForEveryone(message._id);
                            setOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 size={14} />
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
                  className={`absolute -top-2 ${
                    isMe ? "-left-2" : "-right-2"
                  } z-20 h-5 w-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md ring-2 ring-base-100`}
                >
                  <Pin size={10} className="fill-black" />
                </div>
              )}

              <div
                className={`relative px-4 py-2.5 rounded-2xl transition-all shadow-xs ${
                  highlightedMessageId === message._id
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                } ${
                  message.deletedForEveryone
                    ? "bg-base-200/60 border border-base-content/10 text-base-content/50 italic text-xs sm:text-sm"
                    : isMe
                    ? "bg-primary text-primary-content rounded-tr-xs"
                    : isAI
                    ? "bg-base-100 border border-primary/25 text-base-content rounded-tl-xs ring-1 ring-primary/10"
                    : "bg-base-100 border border-base-content/10 text-base-content rounded-tl-xs"
                }`}
              >
                {message.deletedForEveryone ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    <ShieldAlert size={14} className="opacity-60" />
                    <span>Message deleted</span>
                  </div>
                ) : (
                  <>
                    {/* Forwarded Status */}
                    {message.isForwarded && (
                      <div
                        className={`mb-1 flex items-center gap-1 text-[11px] font-medium ${
                          isMe ? "text-primary-content/80" : "text-primary"
                        }`}
                      >
                        <Forward size={12} />
                        <span>Forwarded</span>
                      </div>
                    )}

                    {/* Meta AI Tag */}
                    {isAI && (
                      <div className="mb-1 flex items-center gap-1 text-[11px] font-bold text-primary">
                        <Sparkles size={12} />
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
                        className={`mb-1.5 px-2.5 py-1 rounded-xl text-xs border-l-3 cursor-pointer transition-colors ${
                          isMe
                            ? "bg-black/15 border-white/80 hover:bg-black/25 text-primary-content"
                            : "bg-base-200/80 border-primary hover:bg-base-200 text-base-content"
                        }`}
                      >
                        <div
                          className={`font-semibold truncate text-[11px] ${
                            isMe ? "text-white" : "text-primary"
                          }`}
                        >
                          {message.replyTo.senderId?.fullName || "User"}
                        </div>
                        <div className="truncate opacity-80 text-[11px]">
                          {message.replyTo.text || "Media attachment"}
                        </div>
                      </div>
                    )}

                    {/* Media Attachments */}
                    {(message.image ||
                      message.audio ||
                      message.file?.url) && (
                      <div className="flex flex-col gap-2 my-1">
                        {message.image && (
                          <img
                            src={message.image}
                            className="rounded-xl max-w-full max-h-80 object-cover ring-1 ring-black/5"
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
                        <div className="mb-1.5 flex gap-1.5 flex-wrap">
                          {message.toxic && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/25 text-[10px] font-bold uppercase tracking-wider">
                              <ShieldAlert size={11} />
                              Toxic
                            </span>
                          )}
                          {message.spam && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider">
                              <ShieldAlert size={11} />
                              Spam
                            </span>
                          )}
                        </div>
                      )}

                    {/* Text Body & Inline Timestamp */}
                    <div className="flex items-end gap-3 justify-between">
                      {message.text && (
                        <p className="text-[14px] sm:text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">
                          {Array.isArray(highlightedText)
                            ? highlightedText.map((part, i) =>
                                part.toLowerCase() ===
                                searchQuery?.toLowerCase() ? (
                                  <mark
                                    key={i}
                                    className="bg-amber-300 text-black px-0.5 rounded"
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
                        className={`flex items-center gap-1 text-[10px] font-medium shrink-0 select-none pb-0.5 ml-2 ${
                          isMe
                            ? "text-primary-content/75"
                            : "text-base-content/45"
                        }`}
                      >
                        <span>
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {renderStatusTick()}
                      </div>
                    </div>
                  </>
                )}

                {/* Reaction Badge */}
                {message.reactions?.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute -bottom-2.5 ${
                      isMe ? "left-2" : "right-2"
                    } flex items-center gap-0.5 bg-base-100 border border-base-content/10 rounded-full px-1.5 py-0.5 shadow-md z-10`}
                  >
                    {message.reactions.map((r, i) => (
                      <span key={i} className="text-xs leading-none">
                        {r.emoji}
                      </span>
                    ))}
                  </motion.div>
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