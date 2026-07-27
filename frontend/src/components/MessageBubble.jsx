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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import FileMessage from "./FileMessage";
import AudioMessage from "./AudioMessage";
import { formatMessageTime } from "../lib/utils";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const MessageBubble = ({ message, sender, isMe, chatId }) => {
  const [open, setOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ top: 0, left: 0 });
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);
  
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
    if (message.status === "sent") return <Check size={12} className="opacity-40" />;
    if (message.status === "delivered") return <CheckCheck size={12} className="opacity-40" />;
    if (message.status === "seen") return <CheckCheck size={12} className="text-sky-500" />;
    return null;
  };

  // 1. Reactive isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
      if (emojiRef.current && !emojiRef.current.contains(event.target)) setShowEmojis(false);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    
    return () => {
      window.removeEventListener("resize", handleResize);
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
        reportedUserId: typeof message.senderId === "string" ? message.senderId : message.senderId?._id,
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

  return (
    <motion.div
      initial={isAI ? { opacity: 0, y: 10, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      id={`msg-${message._id}`}
      className={`chat ${isMe ? "chat-end" : "chat-start"} group mb-4 sm:mb-6 px-2 sm:px-4 relative`}
    >
      <div className="chat-image avatar self-end mb-1">
        <div className={`h-8 w-8 rounded-full shadow-sm overflow-hidden ring-1 flex items-center justify-center ${isAI ? "ring-primary animate-pulse" : "ring-base-300"}`}>
          <img
            src={sender?.profilePic || "/avatar.png"}
            alt="avatar"
            className="h-full w-full object-cover rounded-full"
            onError={(e) => { e.currentTarget.src = "/avatar.png"; }}
          />
        </div>
      </div>

      <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-1 sm:gap-2 ${isMe ? "flex-row" : "flex-row-reverse"}`}>
          
          <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            <div className="relative" ref={emojiRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isMobile) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setEmojiPosition({
                      top: rect.top - 60,
                      left: Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 160)
                    });
                  }
                  setShowEmojis((prev) => !prev);
                  setOpen(false);
                }}
                className={`p-2 rounded-full hover:bg-base-200 transition-colors ${showEmojis ? "text-primary bg-base-200" : "text-base-content/40"}`}
              >
                <SmilePlus size={18} />
              </button>

              <AnimatePresence>
                {showEmojis && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] sm:hidden"
                      onClick={() => setShowEmojis(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, y: isMobile ? 30 : 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.7, y: isMobile ? 30 : 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="fixed z-[9999] bg-base-100 border border-base-300 rounded-2xl p-3 sm:p-2 shadow-2xl flex items-center gap-2 sm:gap-3"
                      style={{
                        top: isMobile ? "50%" : emojiPosition.top,
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        minWidth: "280px",
                      }}
                    >
                      {REACTIONS.map((emoji, index) => (
                        <motion.button
                          key={emoji}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05, type: "spring", stiffness: 500 }}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={async () => {
                            try {
                              await axiosInstance.post(`/messages/react/${message._id}`, { emoji });
                            } catch (err) {
                              toast.error("Failed to react");
                            }
                            setShowEmojis(false);
                          }}
                          className="text-2xl sm:text-xl p-2 sm:p-1 active:bg-base-200 rounded-full transition-colors"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMobile) {
                    setMenuPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 - 105 });
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    // Clamping menu position
                    setMenuPosition({ 
                      top: rect.top, 
                      left: Math.min(Math.max(rect.left, 100), window.innerWidth - 100)
                    });
                  }
                  setOpen((prev) => !prev);
                  setShowEmojis(false);
                }}
                className={`p-2 rounded-full hover:bg-base-200 transition-colors ${open ? "text-primary bg-base-200" : "text-base-content/40"}`}
              >
                <MoreVertical size={18} />
              </button>

              <AnimatePresence>
                {open && (
                  <>
                    {isMobile && <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={() => setOpen(false)} />}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: isMobile ? -50 : 10 }}
                      animate={{ opacity: 1, scale: 1, y: isMobile ? -50 : 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: isMobile ? -50 : 10 }}
                      className="fixed z-[9999] w-56 bg-base-100 border border-base-300 rounded-2xl shadow-2xl overflow-hidden py-1"
                      style={{
                        top: menuPosition.top,
                        left: menuPosition.left,
                        transform: isMobile ? "translate(-50%, -50%)" : "translateX(-100%)",
                      }}
                    >
                      {!message.deletedForEveryone && (
                        <button onClick={() => { togglePin(chatId, message._id); setOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-base-200">
                          <Pin size={16} className={isPinned ? "text-warning fill-warning" : "opacity-50"} />
                          <span>{isPinned ? "Unpin" : "Pin Message"}</span>
                        </button>
                      )}
                      {message.text && (
                        <button onClick={handleCopyText} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-base-200">
                          <Copy size={16} className="opacity-50" />
                          <span>Copy Text</span>
                        </button>
                      )}
                      <button onClick={() => { setReplyingTo(message); setOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-base-200">
                        <Reply size={16} className="opacity-50" />
                        <span>Reply</span>
                      </button>
                      {!isMe && !message.deletedForEveryone && (
                        <button onClick={handleReport} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-warning/10 text-warning border-t border-base-200">
                          <ShieldAlert size={16} />
                          <span>Report</span>
                        </button>
                      )}
                      <button onClick={() => { deleteMessageForMe(message._id); setOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-base-200 border-t border-base-200">
                        <Trash size={16} className="opacity-50" />
                        <span>Delete for me</span>
                      </button>
                      {canDeleteForEveryone && (
                        <button onClick={() => { deleteMessageForEveryone(message._id); setOpen(false); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10 border-t border-base-200 font-medium">
                          <Trash2 size={16} />
                          <span>Delete for all</span>
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative">
            {isPinned && (
              <div className={`absolute -top-3 ${isMe ? "-left-1" : "-right-1"} z-20`}>
                <Pin size={14} className="text-warning fill-warning rotate-45 shadow-sm" />
              </div>
            )}

            <motion.div
              animate={isAI ? { boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 12px rgba(59, 130, 246, 0.2)", "0px 0px 0px rgba(59, 130, 246, 0)"] } : {}}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`relative px-4 py-2.5 shadow-sm transition-all duration-300 rounded-2xl
                ${highlightedMessageId === message._id ? "ring-2 ring-primary ring-offset-2 bg-primary/10" : ""}
                ${message.deletedForEveryone ? "bg-base-200/50 border border-base-300 text-base-content/40 italic" : 
                  isMe ? "bg-primary text-primary-content rounded-tr-none shadow-md" : 
                  isAI ? "bg-base-100 border-2 border-primary/20 text-base-content rounded-tl-none shadow-lg shadow-primary/5" : 
                  "bg-base-100 border border-base-200 text-base-content rounded-tl-none shadow-sm"}
              `}
            >
              {message.deletedForEveryone ? (
                <div className="flex items-center gap-2 text-[13px]">
                  <ShieldAlert size={14} /> <span>Message deleted</span>
                </div>
              ) : (
                <>
                  {isAI && (
                    <div className="absolute -top-2 -left-2 bg-primary text-primary-content p-1 rounded-full shadow-lg scale-75">
                      <Sparkles size={10} fill="currentColor" />
                    </div>
                  )}

                  {message.replyTo && (
                    <div
                      onClick={() => {
                        const id = message.replyTo._id;
                        setHighlightedMessage(id);
                        document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        setTimeout(() => setHighlightedMessage(null), 1200);
                      }}
                      className="mb-1.5 px-2 py-1.5 rounded-lg bg-black/5 text-[12px] border-l-4 border-primary cursor-pointer hover:bg-black/10 transition"
                    >
                      <div className="font-bold text-primary truncate">{message.replyTo.senderId?.fullName || "User"}</div>
                      <div className="truncate opacity-80">{message.replyTo.text || "Media message"}</div>
                    </div>
                  )}

                  {(message.image || message.audio || message.file?.url) && (
                    <div className="flex flex-col gap-2 mb-2">
                      {message.image && <img src={message.image} className="rounded-xl max-w-full max-h-80 object-cover border border-black/5" alt="attachment" />}
                      {message.audio && <AudioMessage audioUrl={message.audio} isMe={isMe} />}
                      {message.file?.url && <FileMessage file={message.file} />}
                    </div>
                  )}

                  {!message.deletedForEveryone && (message.toxic || message.spam) && (
                    <div className="mb-2 flex gap-2 flex-wrap">
                      {message.toxic && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          <ShieldAlert size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Toxic</span>
                        </div>
                      )}
                      {message.spam && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <ShieldAlert size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Spam</span>
                        </div>
                      )}
                    </div>
                  )}

                  {message.text && (
                    <p className="text-[15px] sm:text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">
                      {Array.isArray(highlightedText)
                        ? highlightedText.map((part, i) =>
                            part.toLowerCase() === searchQuery?.toLowerCase() ? (
                              <mark key={i} className="bg-yellow-300 text-black px-0.5 rounded-sm">{part}</mark>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )
                        : highlightedText}
                    </p>
                  )}
                </>
              )}

              {message.reactions?.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute -bottom-3.5 ${isMe ? "left-0" : "right-0"} flex items-center gap-1 bg-base-100 border border-base-300 rounded-full px-1.5 py-0.5 shadow-md z-10`}
                >
                  {message.reactions.map((r, i) => (
                    <span key={i} className="text-[12px] leading-none">{r.emoji}</span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold opacity-60 ${isMe ? "mr-1" : "ml-1"}`}>
          {isAI && <span className="text-primary uppercase tracking-widest">Meta AI</span>}
          <span>{formatMessageTime(message.createdAt)}</span>
          {renderStatusTick()}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;