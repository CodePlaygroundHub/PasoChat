import { CircleDot, Pin, Plus, Trash2, Users, UsersRound } from "lucide-react";
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

  useEffect(() => {
    getUsers();
    getGroups();
  }, []);

  const onlineSet = useMemo(() => {
    return new Set((onlineUsers || []).map((id) => String(id)));
  }, [onlineUsers]);

  const handleDeleteGroup = (e, groupId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this group?")) return;
    deleteGroup(groupId);
  };

  const isPinned = (chatId, chatType) => {
    return authUser?.pinnedChats?.some(
      (chat) =>
        String(chat.chatId) === String(chatId) && chat.chatType === chatType
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

  const filteredUsers = useMemo(() => {
    const filtered = !showOnlineOnly
      ? users
      : users.filter((u) => onlineSet.has(String(u._id)));

    return [...filtered].sort((a, b) => {
      return (
        Number(isPinned(b._id, "user")) - Number(isPinned(a._id, "user"))
      );
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
      <aside className="flex h-full flex-col border-r border-base-300 bg-base-100 w-full md:w-20 lg:w-72 transition-all duration-300 select-none">
        {/* Header Section */}
        <div className="border-b border-base-300 p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-semibold text-base block md:hidden lg:block tracking-wide">
                Chats
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("status")}
                className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-base-content/70 hover:text-primary transition-colors"
                title="Status"
              >
                <CircleDot className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                onClick={() => setShowCreateGroup(true)}
                className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-base-content/70 hover:text-primary transition-colors"
                title="Create Group"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Online Filter Toggle */}
          <div className="mt-3 flex md:hidden lg:flex items-center justify-between px-1">
            <label className="cursor-pointer flex items-center gap-2 text-xs font-medium text-base-content/70 hover:text-base-content transition-colors">
              <input
                type="checkbox"
                className="checkbox checkbox-xs checkbox-primary rounded"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
              />
              <span>Online only</span>
            </label>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {onlineSet.size} online
            </span>
          </div>
        </div>

        {/* Chat List Container */}
        <div className="flex-1 overflow-y-auto px-1.5 py-2 space-y-4 custom-scrollbar">
          {/* GROUPS SECTION */}
          {groups.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold tracking-wider text-base-content/50 uppercase">
                <span className="block md:hidden lg:block">Groups</span>
                <span className="hidden md:block lg:hidden text-center w-full">GRP</span>
              </div>

              {sortedGroups.map((group) => {
                const isActive = selectedGroup?._id === group._id;
                const pinned = isPinned(group._id, "group");
                const isCreator = group.createdBy === authUser?._id;
                const unread = unreadCounts[group._id] || 0;

                return (
                  <button
                    key={group._id}
                    onClick={() => setSelectedGroup(group)}
                    className={`group relative flex w-full items-center justify-between p-2 rounded-xl transition-all duration-150 ${
                      isActive
                        ? "bg-primary/15 text-primary font-medium"
                        : "hover:bg-base-200/70 text-base-content/80 hover:text-base-content"
                    } ${pinned ? "border-l-2 border-warning/80 bg-base-200/40" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        {group.avatar ? (
                          <img
                            src={group.avatar}
                            alt={group.name}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-base-300"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                            <UsersRound className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="block md:hidden lg:block text-left truncate">
                        <p className="text-sm font-medium leading-snug truncate">
                          {group.name}
                        </p>
                        <p className="text-xs text-base-content/50 truncate">
                          Group chat
                        </p>
                      </div>
                    </div>

                    {/* Actions & Badges (Visible on mobile & lg, hidden on md) */}
                    <div className="flex md:hidden lg:flex items-center gap-1 flex-shrink-0">
                      {/* Mobile Always-Visible / Desktop Hover Actions */}
                      <div className="flex items-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span
                          onClick={(e) => handlePin(e, group._id, "group")}
                          className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-warning"
                          title={pinned ? "Unpin Chat" : "Pin Chat"}
                        >
                          <Pin
                            size={14}
                            className={pinned ? "fill-warning text-warning" : ""}
                          />
                        </span>

                        {isCreator && (
                          <span
                            onClick={(e) => handleDeleteGroup(e, group._id)}
                            className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-error"
                            title="Delete Group"
                          >
                            <Trash2 size={14} />
                          </span>
                        )}
                      </div>

                      {/* Unread Badge */}
                      {unread > 0 && (
                        <span className="badge badge-error badge-sm text-[10px] font-bold h-5 min-w-[20px] px-1">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* USERS SECTION */}
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold tracking-wider text-base-content/50 uppercase">
              <span className="block md:hidden lg:block">Direct Messages</span>
              <span className="hidden md:block lg:hidden text-center w-full">DM</span>
            </div>

            {filteredUsers.map((user) => {
              const isSelected = selectedUser?._id === user._id;
              const isOnline = onlineSet.has(String(user._id));
              const pinned = isPinned(user._id, "user");
              const unread = unreadCounts[user._id] || 0;

              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`group relative flex w-full items-center justify-between p-2 rounded-xl transition-all duration-150 ${
                    isSelected
                      ? "bg-primary/15 text-primary font-medium"
                      : "hover:bg-base-200/70 text-base-content/80 hover:text-base-content"
                  } ${pinned ? "border-l-2 border-warning/80 bg-base-200/40" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-base-300"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success ring-2 ring-base-100" />
                      )}
                    </div>

                    <div className="block md:hidden lg:block text-left truncate">
                      <p className="text-sm font-medium leading-snug truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-base-content/50 truncate">
                        {user.isAI
                          ? "Always Active"
                          : isOnline
                          ? "Online"
                          : "Offline"}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex md:hidden lg:flex items-center gap-1 flex-shrink-0">
                    {/* Mobile Always-Visible / Desktop Hover Action */}
                    <div className="flex items-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span
                        onClick={(e) => handlePin(e, user._id, "user")}
                        className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-warning"
                        title={pinned ? "Unpin Chat" : "Pin Chat"}
                      >
                        <Pin
                          size={14}
                          className={pinned ? "fill-warning text-warning" : ""}
                        />
                      </span>
                    </div>

                    {/* Unread Message Counter Badge */}
                    {unread > 0 && (
                      <span className="badge badge-error badge-sm text-[10px] font-bold h-5 min-w-[20px] px-1">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </>
  );
};

export default Sidebar;