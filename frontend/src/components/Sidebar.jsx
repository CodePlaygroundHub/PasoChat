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

  const {
    authUser,
    pinChat,
    unpinChat,
  } = useAuthStore();

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
        String(chat.chatId) === String(chatId) &&
        chat.chatType === chatType
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
        Number(isPinned(b._id, "user")) -
        Number(isPinned(a._id, "user"))
      );
    });
  }, [users, showOnlineOnly, onlineSet, authUser]);

  const sortedGroups = [...groups].sort((a, b) => {
    return (
      Number(isPinned(b._id, "group")) -
      Number(isPinned(a._id, "group"))
    );
  });

  if (isUsersLoading || isGroupsLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <>
      <aside className="flex h-full flex-col border-r border-base-300 bg-base-100 w-full md:w-20 lg:w-72">
        <div className="border-b border-base-300 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="font-medium hidden lg:block">Chats</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("status")}
                className="btn btn-sm btn-ghost"
              >
                <CircleDot className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowCreateGroup(true)}
                className="btn btn-sm btn-ghost"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-3 hidden lg:flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
            />
            <span className="text-sm">Online only</span>
            <span className="text-xs opacity-60">
              ({onlineSet.size} online)
            </span>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="border-b border-base-300 py-2">
            <p className="px-4 text-xs font-semibold opacity-60">GROUPS</p>

            {sortedGroups.map((group) => {
              const isActive = selectedGroup?._id === group._id;
              const isCreator = group.createdBy === authUser?._id;

              return (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`flex w-full items-center justify-between px-3 py-2 hover:bg-base-200 ${isActive ? "bg-base-200" : ""
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {group.avatar ? (
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <UsersRound className="h-10 w-10 rounded-full bg-primary/10 p-2" />
                    )}
                    <div>
                      <p className="font-medium truncate">{group.name}</p>
                      <p className="text-xs opacity-60">Group chat</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">

                    <span
                      onClick={(e) => handlePin(e, group._id, "group")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handlePin(e, group._id, "group");
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="btn btn-ghost btn-xs"
                      title={isPinned(group._id, "group") ? "Unpin Chat" : "Pin Chat"}
                    >
                      <Pin
                        size={16}
                        className={
                          isPinned(group._id, "group")
                            ? "fill-current text-warning"
                            : ""
                        }
                      />
                    </span>

                    {unreadCounts[group._id] > 0 && (
                      <span className="badge badge-error text-xs">
                        {unreadCounts[group._id] > 9
                          ? "9+"
                          : unreadCounts[group._id]}
                      </span>
                    )}

                    {isCreator && (
                      <span
                        onClick={(e) => handleDeleteGroup(e, group._id)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <Trash2 size={16} />
                      </span>
                    )}

                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          <p className="px-4 text-xs font-semibold opacity-60">USERS</p>

          {filteredUsers.map((user) => {
            const isSelected = selectedUser?._id === user._id;
            const isOnline = onlineSet.has(String(user._id));

            return (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`flex w-full items-center gap-3 px-3 py-2 hover:bg-base-200 ${isSelected ? "bg-base-200" : ""
                  }`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.fullName}
                    className="h-12 w-12 rounded-full"
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success ring-2 ring-base-100" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <p className="font-medium truncate">{user.fullName}</p>
                  <p className="text-xs opacity-60">
                    {user.isAI
                      ? "Always Active"
                      : isOnline
                        ? "Online"
                        : "Offline"}
                  </p>
                </div>

                <span
                  onClick={(e) => handlePin(e, user._id, "user")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePin(e, user._id, "user");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="btn btn-ghost btn-xs"
                  title={isPinned(user._id, "user") ? "Unpin Chat" : "Pin Chat"}
                >
                  <Pin
                    size={16}
                    className={
                      isPinned(user._id, "user")
                        ? "fill-current text-warning"
                        : ""
                    }
                  />
                </span>

                {unreadCounts[user._id] > 0 && (
                  <span className="badge badge-error text-xs">
                    {unreadCounts[user._id] > 9 ? "9+" : unreadCounts[user._id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </>
  );
};

export default Sidebar;
