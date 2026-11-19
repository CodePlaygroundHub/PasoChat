import { motion, AnimatePresence } from "framer-motion";
import {
  CircleDot,
  Pin,
  Plus,
  Sparkles,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import CreateGroupModal from "./CreateGroupModal";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const Sidebar = ({ setActiveTab }) => {
  const {
    getUsers,
    getGroups,
    users,
    groups,
    messages,
    selectedUser,
    selectedGroup,
    unreadCounts,
    setSelectedUser,
    setSelectedGroup,
    deleteGroup,
    isUsersLoading,
    isGroupsLoading,
    onlineUsers,
  } = useChatStore();

  const { authUser, pinChat, unpinChat } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [sentCounts, setSentCounts] = useState({});

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  // Track outgoing messages sent by the current user to each recipient
  useEffect(() => {
    if (!authUser?._id || !Array.isArray(messages) || messages.length === 0) {
      return;
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage?._id) return;

    const senderId = String(
      latestMessage.senderId?._id || latestMessage.senderId || "",
    );
    if (senderId !== String(authUser._id)) return;

    const targetId = String(
      latestMessage.receiverId?._id ||
        latestMessage.receiverId ||
        selectedUser?._id ||
        "",
    );
    if (!targetId) return;

    setSentCounts((prev) => {
      const current = prev[targetId] || { count: 0, lastMessageId: null };
      if (current.lastMessageId === latestMessage._id) return prev;

      return {
        ...prev,
        [targetId]: {
          count: current.count + 1,
          lastMessageId: latestMessage._id,
        },
      };
    });
  }, [messages, authUser?._id, selectedUser?._id]);

  const onlineSet = useMemo(() => {
    return new Set((onlineUsers || []).map((id) => String(id)));
  }, [onlineUsers]);

  const handleDeleteGroup = (e, groupId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this group?")) return;
    deleteGroup(groupId);
  };

  const isPinned = (chatId, chatType) => {
    return authUser?.pinnedChats?.some(
      (chat) =>
        String(chat.chatId) === String(chatId) && chat.chatType === chatType,
    );
  };

  const handlePin = async (e, chatId, chatType) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPinned(chatId, chatType)) {
      await unpinChat(chatId);
    } else {
      await pinChat(chatId, chatType);
    }
  };

  // Order: 1. Pinned users, 2. Online users, 3. Everyone else
  const filteredUsers = useMemo(() => {
    const filtered = !showOnlineOnly
      ? users
      : users.filter((u) => onlineSet.has(String(u._id)));

    return [...filtered].sort((a, b) => {
      const aPinned = Number(isPinned(a._id, "user"));
      const bPinned = Number(isPinned(b._id, "user"));
      if (aPinned !== bPinned) return bPinned - aPinned;

      const aOnline = Number(onlineSet.has(String(a._id)));
      const bOnline = Number(onlineSet.has(String(b._id)));
      if (aOnline !== bOnline) return bOnline - aOnline;

      return 0;
    });
  }, [users, showOnlineOnly, onlineSet, authUser]);

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      return (
        Number(isPinned(b._id, "group")) - Number(isPinned(a._id, "group"))
      );
    });
  }, [groups, authUser]);

  if (isUsersLoading || isGroupsLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <>
      <aside className="flex h-full w-full shrink-0 flex-col border-r border-zinc-200/80 bg-white transition-[width] duration-200 select-none md:w-64 lg:w-72 dark:border-zinc-800/80 dark:bg-[#100F0F]">
        {/* Header */}
        <div className="border-b border-zinc-200/80 px-3.5 py-3 lg:px-4 dark:border-zinc-800/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                <Users className="h-3.5 w-3.5 stroke-[1.75]" />
              </span>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Chats
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("status")}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                title="Status"
                aria-label="Status"
              >
                <CircleDot className="h-4 w-4 stroke-[1.75]" />
              </button>

              <button
                type="button"
                onClick={() => setShowCreateGroup(true)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                title="Create Group"
                aria-label="Create Group"
              >
                <Plus className="h-4 w-4 stroke-[1.75]" />
              </button>
            </div>
          </div>

          {/* Online Filter Row */}
          <div className="mt-2.5 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800/70">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-zinc-300 bg-transparent text-zinc-900 focus:ring-0 focus:ring-offset-0 dark:border-zinc-700 dark:text-zinc-100"
              />
              <span>Online only</span>
            </label>

            <span className="text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
              {onlineSet.size} online
            </span>
          </div>
        </div>

        {/* Scrollable Chat List */}
        <div className="flex-1 space-y-4 overflow-y-auto px-2 py-2.5">
          {/* GROUPS */}
          {groups.length > 0 && (
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Groups
              </div>

              {sortedGroups.map((group) => {
                const isActive = selectedGroup?._id === group._id;
                const pinned = isPinned(group._id, "group");
                const isCreator = group.createdBy === authUser?._id;
                const unread = unreadCounts[group._id] || 0;

                return (
                  <div
                    key={group._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedGroup(group)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedGroup(group);
                      }
                    }}
                    className={`group relative flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 text-left transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800/80 dark:text-zinc-50"
                        : "text-zinc-700 hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <div className="relative shrink-0">
                        {group.avatar ? (
                          <img
                            src={group.avatar}
                            alt={group.name}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            className="h-9 w-9 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                            <UsersRound className="h-4 w-4 stroke-[1.75]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-[13px] font-medium leading-tight">
                            {group.name}
                          </p>
                          {pinned && (
                            <Pin className="h-3 w-3 shrink-0 fill-current text-zinc-400 dark:text-zinc-500" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
                          {group.members?.length || 0} members
                        </p>
                      </div>
                    </div>

                    {/* Right Controls & Unread */}
                    <div className="ml-1.5 flex shrink-0 items-center gap-1">
                      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={(e) => handlePin(e, group._id, "group")}
                          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-800 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200"
                          title={pinned ? "Unpin chat" : "Pin chat"}
                          aria-label={pinned ? "Unpin chat" : "Pin chat"}
                        >
                          <Pin
                            className={`h-3.5 w-3.5 ${
                              pinned
                                ? "fill-current text-zinc-700 dark:text-zinc-200"
                                : ""
                            }`}
                          />
                        </button>

                        {isCreator && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteGroup(e, group._id)}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            title="Delete group"
                            aria-label="Delete group"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {unread > 0 && (
                        <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold tabular-nums text-white dark:bg-zinc-100 dark:text-zinc-950">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DIRECT MESSAGES */}
          <div className="space-y-0.5">
            <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Direct Messages
            </div>

            {filteredUsers.map((user) => {
              const isSelected = selectedUser?._id === user._id;
              const isOnline = onlineSet.has(String(user._id));
              const pinned = isPinned(user._id, "user");
              const unread = unreadCounts[user._id] || 0;
              const sentCount = sentCounts[String(user._id)]?.count || 0;
              const isAI = user.isAI;

              return (
                <div
                  key={user._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedUser(user)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedUser(user);
                    }
                  }}
                  className={`group relative flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2 text-left transition-colors ${
                    isSelected
                      ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800/80 dark:text-zinc-50"
                      : "text-zinc-700 hover:bg-zinc-100/70 dark:text-zinc-300 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="relative shrink-0">
                      {isAI ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                          <Sparkles className="h-4 w-4 stroke-[1.75]" />
                        </div>
                      ) : (
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          onError={(e) => {
                            e.currentTarget.src = "/avatar.png";
                          }}
                          className="h-9 w-9 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                        />
                      )}

                      {isOnline && !isAI && (
                        <span
                          title="Online"
                          className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#100F0F]"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[13px] font-medium leading-tight">
                          {isAI ? "Meta AI" : user.fullName}
                        </p>
                        {pinned && (
                          <Pin className="h-3 w-3 shrink-0 fill-current text-zinc-400 dark:text-zinc-500" />
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                        {isAI
                          ? "Assistant"
                          : isOnline
                            ? "Online"
                            : user.lastSeen
                              ? `Last seen ${new Date(
                                  user.lastSeen,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`
                              : "Offline"}
                      </p>
                    </div>
                  </div>

                  {/* Right Controls, Outgoing Counter Pop-up & Unread */}
                  <div className="ml-1.5 flex shrink-0 items-center gap-1">
                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => handlePin(e, user._id, "user")}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-800 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200"
                        title={pinned ? "Unpin chat" : "Pin chat"}
                        aria-label={pinned ? "Unpin chat" : "Pin chat"}
                      >
                        <Pin
                          className={`h-3.5 w-3.5 ${
                            pinned
                              ? "fill-current text-zinc-700 dark:text-zinc-200"
                              : ""
                          }`}
                        />
                      </button>
                    </div>

                    {sentCount > 0 && (
                      <motion.span
                        key={sentCount}
                        initial={{ scale: 0.78, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.14, ease: "easeOut" }}
                        title={`${sentCount} ${
                          sentCount === 1 ? "message" : "messages"
                        } sent`}
                        className="inline-flex h-4 min-w-[18px] items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 px-1 text-[10px] font-semibold tabular-nums text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {sentCount}
                      </motion.span>
                    )}

                    {unread > 0 && (
                      <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold tabular-nums text-white dark:bg-zinc-100 dark:text-zinc-950">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {showCreateGroup && (
          <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;