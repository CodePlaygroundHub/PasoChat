import {
  X,
  Info,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Sparkles,
  Phone,
  Video,
  Image,
  Trash,
  Search,
  Users,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import GroupMembersModal from "./GroupMembersModal";
import { useCallStore } from "../store/useCallStore";

const IconBtn = ({ children, onClick, ...props }) => (
  <button
    onClick={onClick}
    className="btn btn-ghost h-8 w-8 min-h-0 sm:h-9 sm:w-9 btn-circle flex items-center justify-center p-0"
    {...props}
  >
    {children}
  </button>
);

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

  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const infoRef = useRef(null);
  const [showMembers, setShowMembers] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef(null);

 
useEffect(() => {
  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpenMenu(false);
    }

    if (infoRef.current && !infoRef.current.contains(e.target)) {
      setShowInfoPanel(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowInfoPanel(false);
      setOpenMenu(false);       
    setShowSearch(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDown);
  };
}, []);
  if (!selectedUser && !selectedGroup) return null;

  const isGroup = selectedChatType === "group";
  const isAI = !isGroup && selectedUser?.isAI;
  const chatId = isGroup ? selectedGroup?._id : selectedUser?._id;

  const typingUserIds = Object.keys(typingUsers).filter(
    (id) => id !== authUser._id,
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
    const ok = window.confirm(
      "Clear chat for you? This action cannot be undone.",
    );
    if (ok) {
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
  

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/70">
      <div className="px-2 sm:px-4 py-2 sm:py-3">
        {/* Added min-w-0 here to allow children to truncate */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={clearSelectedChat}
              className="btn btn-ghost btn-sm btn-circle lg:hidden shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="shrink-0">
              {isGroup ? (
                <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="font-bold text-primary text-sm sm:text-lg">
                    {selectedGroup.name[0].toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedUser?.profilePic || "/avatar.png"}
                    alt="avatar"
                    className={`h-9 w-9 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-base-200 ${
                      isAI ? "border-2 border-primary/30 animate-pulse" : ""
                    }`}
                  />
                  {!isAI && onlineUsers.includes(selectedUser?._id) && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-base-100" />
                  )}
                  {isAI && isAILoading && (
                    <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                  )}
                </div>
              )}
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center gap-1 min-w-0">
                <h3 className="font-bold truncate text-[13px] sm:text-lg leading-tight">
                  {isGroup
                    ? selectedGroup.name
                    : isAI
                      ? "Meta AI"
                      : selectedUser.fullName}
                </h3>
                {isAI && (
                  <Sparkles
                    size={14}
                    className={`text-primary shrink-0 ${
                      isAILoading ? "animate-pulse" : ""
                    }`}
                  />
                )}
              </div>

              <div className="h-4 overflow-hidden">
                <AnimatePresence mode="wait">
                  {isAI && isAILoading ? (
                    <motion.span
                      key="ai"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[10px] sm:text-xs text-primary font-semibold truncate block"
                    >
                      AI is thinking...
                    </motion.span>
                  ) : typingText ? (
                    <motion.span
                      key="typing"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[10px] sm:text-xs text-primary italic truncate block"
                    >
                      {typingText}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="status"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] sm:text-xs text-base-content/50 truncate block"
                    >
                      {isGroup
                        ? `${selectedGroup.members?.length || 0} members`
                        : isAI
                          ? "Always Active"
                          : onlineUsers.includes(selectedUser?._id)
                            ? "Active now"
                            : selectedUser?.lastSeen
                              ? `Last seen ${new Date(selectedUser.lastSeen).toLocaleString()}`
                              : "Offline"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="flex items-center bg-base-200/60 rounded-full p-0.5 sm:p-1 border border-base-300/40 gap-0.5 sm:gap-1">
              {isGroup ? (
                <>
                  <div className="relative">
                    <IconBtn onClick={() => setShowMembers(true)}>
                      <Info size={18} />
                    </IconBtn>

                    <AnimatePresence>
                      {showMembers && isGroup && (
                        <GroupMembersModal
                          groupId={selectedGroup._id}
                          onClose={() => setShowMembers(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <IconBtn
                    onClick={() =>
                      startGroupCall({
                        groupId: selectedGroup._id,
                        callType: "voice",
                      })
                    }
                  >
                    <Phone size={18} />
                  </IconBtn>
                  <IconBtn
                    onClick={() =>
                      startGroupCall({
                        groupId: selectedGroup._id,
                        callType: "video",
                      })
                    }
                  >
                    <Video size={18} />
                  </IconBtn>
                </>
              ) : (
                !isAI && (
                  <>
                    <IconBtn
                      onClick={() =>
                        startCall({
                          receiver: selectedUser,
                          callType: "voice",
                        })
                      }
                    >
                      <Phone size={18} />
                    </IconBtn>
                    <IconBtn
                      onClick={() =>
                        startCall({
                          receiver: selectedUser,
                          callType: "video",
                        })
                      }
                    >
                      <Video size={18} />
                    </IconBtn>
                  </>
                )
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-6 py-4">
            <button
              onClick={() => {
                setShowInfoPanel(false);
                isGroup
                  ? startGroupCall({ groupId: selectedGroup._id, callType: "voice" })
                  : startCall({ receiver: selectedUser, callType: "voice" });
              }}
              className="flex flex-col items-center gap-1"
            >
              <span className="btn btn-circle btn-sm bg-base-200 border-none">
                <Phone size={16} />
              </span>
              <span className="text-[10px] text-base-content/60">Voice</span>
            </button>

            <button
              onClick={() => {
                setShowInfoPanel(false);
                isGroup
                  ? startGroupCall({ groupId: selectedGroup._id, callType: "video" })
                  : startCall({ receiver: selectedUser, callType: "video" });
              }}
              className="flex flex-col items-center gap-1"
            >
              <span className="btn btn-circle btn-sm bg-base-200 border-none">
                <Video size={16} />
              </span>
              <span className="text-[10px] text-base-content/60">Video</span>
            </button>

            {isGroup && (
              <button
                onClick={() => {
                  setShowInfoPanel(false);
                  setShowMembers(true);
                }}
                className="flex flex-col items-center gap-1"
              >
                <span className="btn btn-circle btn-sm bg-base-200 border-none">
                  <Users size={16} />
                </span>
                <span className="text-[10px] text-base-content/60">Members</span>
              </button>
            )}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
            )}
            {/*SEARCH */}
            <div className="relative">
              <IconBtn onClick={() => setShowSearch((s) => !s)}>
                <Search size={18} />
              </IconBtn>

              {showSearch && (
                <div className="absolute right-0 top-10 z-[70] bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 w-56">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runSearch()}
                    placeholder="Search messages…"
                    className="input input-sm w-full"
                  />

                  <div className="flex justify-between mt-2">
                    <button
                      onClick={runSearch}
                      className="btn btn-sm btn-primary"
                    >
                      Search
                    </button>
                    <button
                      onClick={() => {
                        clearSearch();
                        setShowSearch(false);
                      }}
                      className="btn btn-sm btn-ghost"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div ref={menuRef} className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="btn btn-ghost btn-xs sm:btn-sm btn-circle"
              >
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
<AnimatePresence>
                {openMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    className="absolute right-0 mt-2 w-48 sm:w-56 bg-base-100 border border-base-300 rounded-xl shadow-xl z-[60]"
                  >
                    <button
                      onClick={handleClearChat}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10"
                    >
                      <Trash2 size={18} />
                      Clear Conversation
                    </button>
                    <button
                      onClick={handleWallpaperChange}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-base-200"
                    >
                      <Image size={18} />
                      Change Wallpaper
                    </button>
                    <button
                      onClick={handleRemoveWallpaper}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10"
                    >
                      <Trash size={18} />
                      Remove Wallpaper
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={clearSelectedChat}
              className="btn btn-ghost btn-sm btn-circle hidden lg:flex"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      
    </header>
  );
};




export default ChatHeader;
