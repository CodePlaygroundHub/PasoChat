import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Image,
  Info,
  MoreVertical,
  Phone,
  Search,
  Sparkles,
  Trash,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import GroupMembersModal from "./GroupMembersModal";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const {
    selectedUser,
    selectedGroup,
    selectedChatType,
    typingUsers,
    clearChatForMe,
    clearSelectedChat,
    isAILoading,
    onlineUsers,
    setChatWallpaper,
    removeChatWallpaper,
    searchQuery,
    setSearchQuery,
    clearSearch,
    runSearch,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const { startCall, startGroupCall } = useCallStore();

  const [showMembers, setShowMembers] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [showSearch]);

  if (!selectedUser && !selectedGroup) return null;

  const isGroup = selectedChatType === "group";
  const isAI = !isGroup && selectedUser?.isAI;
  const chatId = isGroup ? selectedGroup?._id : selectedUser?._id;
  const isOnline = !isGroup && !isAI && onlineUsers.includes(selectedUser?._id);

  const typingUserIds = Object.keys(typingUsers).filter(
    (id) => id !== authUser?._id
  );

  let typingText = null;
  if (typingUserIds.length > 0 && !isAI) {
    typingText = !isGroup
      ? "typing..."
      : typingUserIds.length === 1
      ? "Someone is typing..."
      : `${typingUserIds.length} people typing...`;
  }

  const handleClearChat = () => {
    if (!chatId) return;
    if (window.confirm("Clear chat for you? This action cannot be undone.")) {
      clearChatForMe(chatId);
      setOpenMenu(false);
    }
  };

  const handleWallpaperChange = () => {
    if (!chatId) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        await setChatWallpaper(chatId, reader.result);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleRemoveWallpaper = async () => {
    if (!chatId) return;
    await removeChatWallpaper(chatId);
    setOpenMenu(false);
  };

  const handleCloseSearch = () => {
    clearSearch();
    setShowSearch(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-base-content/5 bg-base-100/80 backdrop-blur-xl transition-all select-none">
      <div className="relative px-3 sm:px-5 py-2.5 sm:py-3 h-[60px] sm:h-[68px] flex items-center">
        {/* Full-width Seamless Overlay Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 z-30 flex items-center gap-2 bg-base-100 px-3 sm:px-5"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-base-content/40 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSearch();
                    if (e.key === "Escape") handleCloseSearch();
                  }}
                  placeholder="Search messages (press Enter)..."
                  className="w-full bg-base-200/70 border border-base-content/10 focus:border-primary focus:bg-base-100 rounded-full pl-10 pr-9 py-2 text-xs sm:text-sm text-base-content placeholder:text-base-content/40 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-0.5 rounded-full hover:bg-base-content/10 text-base-content/40 hover:text-base-content transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={runSearch}
                className="btn btn-primary btn-sm rounded-full px-4 text-xs font-semibold shadow-sm"
              >
                Search
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleCloseSearch}
                className="p-2 rounded-full text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                title="Close search (Esc)"
              >
                <X size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Content */}
        <div className="flex items-center justify-between gap-3 w-full min-w-0">
          {/* User / Group Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={clearSelectedChat}
              className="p-1.5 rounded-full lg:hidden text-base-content/70 hover:text-base-content hover:bg-base-200/80 transition-colors -ml-1"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>

            {/* Avatar */}
            <div className="relative shrink-0 select-none">
              {isGroup ? (
                selectedGroup?.avatar ? (
                  <img
                    src={selectedGroup.avatar}
                    alt={selectedGroup.name}
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl object-cover ring-1 ring-base-content/10 shadow-sm"
                  />
                ) : (
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-base-200 flex items-center justify-center border border-primary/20 shadow-sm">
                    <span className="font-semibold text-primary text-base sm:text-lg">
                      {selectedGroup?.name?.[0]?.toUpperCase() || "G"}
                    </span>
                  </div>
                )
              ) : (
                <div className="relative">
                  <img
                    src={
                      isAI
                        ? "/ai-avatar.png"
                        : selectedUser?.profilePic || "/avatar.png"
                    }
                    alt={isAI ? "AI Avatar" : selectedUser?.fullName || "User"}
                    className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover shadow-sm ${
                      isAI
                        ? "ring-2 ring-primary/40 p-0.5 bg-gradient-to-tr from-primary/30 to-secondary/30"
                        : "ring-1 ring-base-content/10"
                    }`}
                  />

                  {/* Online Status Indicator */}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-base-100 shadow-sm" />
                  )}

                  {/* AI Pulsing Ring */}
                  {isAI && isAILoading && (
                    <span className="absolute inset-0 rounded-full ring-2 ring-primary animate-ping opacity-30" />
                  )}
                </div>
              )}
            </div>

            {/* Title & Status */}
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base tracking-tight truncate text-base-content">
                  {isGroup
                    ? selectedGroup?.name
                    : isAI
                    ? "Meta AI"
                    : selectedUser?.fullName}
                </h3>
                {isAI && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Sparkles size={11} className={isAILoading ? "animate-spin" : ""} />
                    AI
                  </span>
                )}
              </div>

              <div className="h-4 flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {isAI && isAILoading ? (
                    <motion.span
                      key="ai"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="text-[11px] font-medium text-primary flex items-center gap-1.5"
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Thinking...
                    </motion.span>
                  ) : typingText ? (
                    <motion.span
                      key="typing"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      className="text-[11px] font-medium text-primary flex items-center gap-1.5 italic"
                    >
                      <span className="flex gap-0.5">
                        <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1 w-1 rounded-full bg-primary animate-bounce" />
                      </span>
                      {typingText}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="status"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] text-base-content/60 truncate tracking-wide"
                    >
                      {isGroup
                        ? `${selectedGroup?.members?.length || 0} members`
                        : isAI
                        ? "Always ready to help"
                        : isOnline
                        ? "Active now"
                        : selectedUser?.lastSeen
                        ? `Last seen ${new Date(selectedUser.lastSeen).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Offline"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <div className="flex items-center bg-base-200/50 backdrop-blur-md rounded-2xl p-1 border border-base-content/5 shadow-inner">
              {isGroup ? (
                <>
                  <HeaderButton
                    onClick={() => setShowMembers(true)}
                    title="Group info"
                  >
                    <Info size={17} />
                  </HeaderButton>
                  <HeaderButton
                    onClick={() =>
                      startGroupCall({
                        groupId: selectedGroup._id,
                        callType: "voice",
                      })
                    }
                    title="Audio call"
                  >
                    <Phone size={17} />
                  </HeaderButton>
                  <HeaderButton
                    onClick={() =>
                      startGroupCall({
                        groupId: selectedGroup._id,
                        callType: "video",
                      })
                    }
                    title="Video call"
                  >
                    <Video size={17} />
                  </HeaderButton>
                </>
              ) : (
                !isAI && (
                  <>
                    <HeaderButton
                      onClick={() =>
                        startCall({
                          receiver: selectedUser,
                          callType: "voice",
                        })
                      }
                      title="Audio call"
                    >
                      <Phone size={17} />
                    </HeaderButton>
                    <HeaderButton
                      onClick={() =>
                        startCall({
                          receiver: selectedUser,
                          callType: "video",
                        })
                      }
                      title="Video call"
                    >
                      <Video size={17} />
                    </HeaderButton>
                  </>
                )
              )}

              <HeaderButton
                onClick={() => setShowSearch(true)}
                title="Search conversation"
              >
                <Search size={17} />
              </HeaderButton>
            </div>

            {/* 3-Dot Dropdown Menu */}
            <div ref={menuRef} className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpenMenu((prev) => !prev)}
                className={`p-2 rounded-full transition-colors ${
                  openMenu
                    ? "bg-base-200 text-base-content"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-200/70"
                }`}
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>

              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-52 bg-base-100 border border-base-content/10 rounded-2xl shadow-2xl z-[100] p-1.5"
                  >
                    <button
                      onClick={handleWallpaperChange}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-base-200/70 text-base-content/80 hover:text-base-content transition-colors"
                    >
                      <Image size={16} className="text-base-content/60" />
                      Change Wallpaper
                    </button>

                    <button
                      onClick={handleRemoveWallpaper}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl hover:bg-base-200/70 text-base-content/80 hover:text-base-content transition-colors"
                    >
                      <Trash size={16} className="text-base-content/60" />
                      Remove Wallpaper
                    </button>

                    <div className="my-1 border-t border-base-content/5" />

                    <button
                      onClick={handleClearChat}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 size={16} />
                      Clear Conversation
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Close View */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={clearSelectedChat}
              className="p-2 rounded-full hidden lg:flex text-base-content/60 hover:text-base-content hover:bg-base-200/70 transition-colors"
              title="Close chat"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Group Members Modal */}
      <AnimatePresence>
        {showMembers && isGroup && (
          <GroupMembersModal
            groupId={selectedGroup._id}
            onClose={() => setShowMembers(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
};

const HeaderButton = ({ children, onClick, title }) => (
  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    title={title}
    className="h-8 w-8 rounded-full flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-100 transition-colors shadow-none"
  >
    {children}
  </motion.button>
);

export default ChatHeader;