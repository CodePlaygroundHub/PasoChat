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
    <header className="sticky top-0 z-40 w-full select-none border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#100F0F]/90">
      <div className="relative flex h-16 items-center px-3 sm:px-5">
        {/* Seamless Overlay Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14 }}
              className="absolute inset-0 z-30 flex items-center gap-2 bg-white px-3 sm:px-5 dark:bg-[#100F0F]"
            >
              <div className="relative flex flex-1 items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSearch();
                    if (e.key === "Escape") handleCloseSearch();
                  }}
                  placeholder="Search messages (press Enter)..."
                  className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-8 text-xs text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-900"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search query"
                    className="absolute right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  >
                    <X className="h-3.5 w-3.5 stroke-[1.75]" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={runSearch}
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-zinc-900 px-3.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleCloseSearch}
                aria-label="Close search"
                title="Close search (Esc)"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
              >
                <X className="h-4 w-4 stroke-[1.75]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Header Row */}
        <div className="flex w-full min-w-0 items-center justify-between gap-3">
          {/* User / Group Info */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={clearSelectedChat}
              className="-ml-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
            </button>

            {/* Avatar */}
            <div className="relative shrink-0 select-none">
              {isGroup ? (
                selectedGroup?.avatar ? (
                  <img
                    src={selectedGroup.avatar}
                    alt={selectedGroup.name}
                    className="h-9 w-9 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    {selectedGroup?.name?.[0]?.toUpperCase() || "G"}
                  </div>
                )
              ) : (
                <div className="relative">
                  {isAI ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      <Sparkles className="h-4 w-4 stroke-[1.75]" />
                    </div>
                  ) : (
                    <img
                      src={selectedUser?.profilePic || "/avatar.png"}
                      alt={selectedUser?.fullName || "User"}
                      className="h-9 w-9 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                    />
                  )}

                  {isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#100F0F]" />
                  )}
                </div>
              )}
            </div>

            {/* Title & Status */}
            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {isGroup
                    ? selectedGroup?.name
                    : isAI
                      ? "Meta AI"
                      : selectedUser?.fullName}
                </h3>
                {isAI && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    <Sparkles className="h-2.5 w-2.5 stroke-[1.75]" />
                    Assistant
                  </span>
                )}
              </div>

              <div className="flex h-4 items-center overflow-hidden">
                <AnimatePresence mode="wait">
                  {isAI && isAILoading ? (
                    <motion.span
                      key="ai"
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      transition={{ duration: 0.12 }}
                      className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      Thinking...
                    </motion.span>
                  ) : typingText ? (
                    <motion.span
                      key="typing"
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      transition={{ duration: 0.12 }}
                      className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300"
                    >
                      {typingText}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="status"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.12 }}
                      className="truncate text-[11px] text-zinc-500 dark:text-zinc-400"
                    >
                      {isGroup
                        ? `${selectedGroup?.members?.length || 0} members`
                        : isAI
                          ? "Always available"
                          : isOnline
                            ? "Online"
                            : selectedUser?.lastSeen
                              ? `Last seen ${new Date(
                                selectedUser.lastSeen,
                              ).toLocaleTimeString([], {
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
          <div className="flex shrink-0 items-center gap-1">
            {isGroup ? (
              <>
                <HeaderButton
                  onClick={() => setShowMembers(true)}
                  title="Group info"
                >
                  <Info className="h-4 w-4 stroke-[1.75]" />
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
                  <Phone className="h-4 w-4 stroke-[1.75]" />
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
                  <Video className="h-4 w-4 stroke-[1.75]" />
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
                    <Phone className="h-4 w-4 stroke-[1.75]" />
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
                    <Video className="h-4 w-4 stroke-[1.75]" />
                  </HeaderButton>
                </>
              )
            )}

            <HeaderButton
              onClick={() => setShowSearch(true)}
              title="Search conversation"
            >
              <Search className="h-4 w-4 stroke-[1.75]" />
            </HeaderButton>

            <div className="mx-1 h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

            {/* 3-Dot Dropdown Menu */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => !prev)}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors ${openMenu
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                  }`}
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4 stroke-[1.75]" />
              </button>

              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full z-[100] mt-1.5 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-[#141313]"
                  >
                    <button
                      type="button"
                      onClick={handleWallpaperChange}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-white"
                    >
                      <Image className="h-3.5 w-3.5 stroke-[1.75] text-zinc-500" />
                      Change Wallpaper
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveWallpaper}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/70 dark:hover:text-white"
                    >
                      <Trash className="h-3.5 w-3.5 stroke-[1.75] text-zinc-500" />
                      Remove Wallpaper
                    </button>

                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

                    <button
                      type="button"
                      onClick={handleClearChat}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50/70 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                      Clear Conversation
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Close View */}
            <button
              type="button"
              onClick={clearSelectedChat}
              className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:flex dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
              title="Close chat"
            >
              <X className="h-4 w-4 stroke-[1.75]" />
            </button>
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