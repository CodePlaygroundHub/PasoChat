import { motion } from "framer-motion";
import { Camera, Crown, Loader2, LogOut, Plus, UserMinus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import AddMemberModal from "./AddMemberModal";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const GroupMembersModal = ({ groupId, onClose }) => {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef(null);
  const { authUser } = useAuthStore();
  const { getGroups, clearSelectedChat, setSelectedGroup } = useChatStore();
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setAvatarError(false);
        const res = await axiosInstance.get(`/groups/${groupId}`);
        setGroup(res.data);
      } catch {
        toast.error("Failed to load group info");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  useEffect(() => {
    setAvatarError(false);
  }, [group?.avatar]);

  if (loading || !group) return null;

  const safeMembers = group.members.filter((m) => m.userId);
  const myMember = safeMembers.find(
    (m) => (m.userId._id || m.userId).toString() === authUser._id,
  );

  const myRole = myMember?.role;
  const isAdmin = myRole === "admin";
  const isCreator =
    (group.createdBy?._id || group.createdBy)?.toString() === authUser._id;

  const adminCount = safeMembers.filter((m) => m.role === "admin").length;

  const canLeave = !isCreator && !(isAdmin && adminCount === 1);

  const handleRemove = async (userId) => {
    if (!confirm("Remove this member?")) return;

    try {
      await axiosInstance.post(`/groups/${group._id}/remove-user`, { userId });

      setGroup((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.userId?._id !== userId),
      }));

      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleLeave = async () => {
    if (!confirm("Leave this group?")) return;

    try {
      await axiosInstance.post(`/groups/${group._id}/leave`);

      await getGroups();
      clearSelectedChat();

      toast.success("Left group");
      onClose();
    } catch {
      toast.error("Failed to leave group");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      toast.error("Image size must be less than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      setIsUpdatingImage(true);
      try {
        const res = await axiosInstance.patch(`/groups/${group._id}/update`, {
          avatar: reader.result,
        });

        setAvatarError(false);
        setGroup(res.data);
        setSelectedGroup(res.data);
        await getGroups();
        toast.success("Group image updated");
      } catch {
        toast.error("Failed to update group image");
      } finally {
        setIsUpdatingImage(false);
      }
    };
  };

  return (
    <>
      <div className="fixed inset-x-0 top-16 z-[100] flex justify-end px-3 sm:px-5 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.14 }}
          className="pointer-events-auto flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800/90 dark:bg-[#141313]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-4 py-3.5 dark:border-zinc-800/80">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative shrink-0">
                {group.avatar && !avatarError ? (
                  <img
                    src={group.avatar}
                    alt={group.name}
                    onError={() => setAvatarError(true)}
                    className="h-11 w-11 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    {group.name?.[0]?.toUpperCase() || "G"}
                  </div>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUpdatingImage}
                    aria-label="Update group photo"
                    title="Update group photo"
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    {isUpdatingImage ? (
                      <Loader2 className="h-3 w-3 animate-spin stroke-[1.75]" />
                    ) : (
                      <Camera className="h-3 w-3 stroke-[1.75]" />
                    )}
                  </button>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {group.name}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                  {group.members.length} members
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close group info"
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4 stroke-[1.75]" />
            </button>
          </div>

          {/* Add Member Action */}
          {isAdmin && (
            <div className="border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-3.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2]" />
                <span>Add member</span>
              </button>
            </div>
          )}

          {/* Member List */}
          <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-2">
            {safeMembers.map((m) => {
              const isMe = m.userId._id === authUser._id;
              const isCreatorMember =
                m.userId._id.toString() ===
                (group.createdBy?._id || group.createdBy)?.toString();

              return (
                <div
                  key={m.userId._id}
                  className="group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  <div className="relative shrink-0">
                    <img
                      src={m.userId.profilePic || "/avatar.png"}
                      alt={m.userId.fullName || "Member"}
                      onError={(e) => {
                        e.currentTarget.src = "/avatar.png";
                      }}
                      className="h-9 w-9 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                    />
                    {m.role === "admin" && (
                      <span
                        title="Admin"
                        className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-200 bg-white text-amber-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-amber-400"
                      >
                        <Crown className="h-2.5 w-2.5 stroke-[2]" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {m.userId.fullName}
                      </p>
                      {isMe && (
                        <span className="shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] capitalize text-zinc-500 dark:text-zinc-400">
                      {m.role}
                    </p>
                  </div>

                  {isAdmin && !isMe && !isCreatorMember && (
                    <button
                      type="button"
                      onClick={() => handleRemove(m.userId._id)}
                      aria-label={`Remove ${m.userId.fullName}`}
                      title="Remove member"
                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <UserMinus className="h-3.5 w-3.5 stroke-[1.75]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Leave Group Footer */}
          {canLeave && (
            <div className="border-t border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/30">
              <button
                type="button"
                onClick={handleLeave}
                className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-red-200/80 bg-white px-3.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50/70 dark:border-red-900/50 dark:bg-zinc-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <LogOut className="h-3.5 w-3.5 stroke-[1.75]" />
                <span>Leave group</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {showAddMember && (
        <AddMemberModal
          group={group}
          onClose={() => setShowAddMember(false)}
          onAdded={(updatedGroup) => setGroup(updatedGroup)}
        />
      )}

      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageSelect}
      />
    </>
  );
};

export default GroupMembersModal;