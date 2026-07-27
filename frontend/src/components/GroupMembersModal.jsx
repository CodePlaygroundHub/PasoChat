import { AnimatePresence, motion } from "framer-motion";
import { Camera, Crown, LogOut, Plus, UserMinus, X } from "lucide-react";
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
  const fileInputRef = useRef(null);
  const { authUser } = useAuthStore();
  const { getGroups, clearSelectedChat, setSelectedGroup } = useChatStore();
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    // Validate file size (5 MB)
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

        setGroup(res.data);
        setSelectedGroup(res.data);
        await getGroups();
        toast.success("Group image updated");
      } catch (err) {
        toast.error("Failed to update group image");
      } finally {
        setIsUpdatingImage(false);
      }
    };
  };

  return (
    <>
      <div className="absolute top-full right-0 mt-3 z-[100] max-sm:fixed max-sm:top-20 max-sm:left-[36.3%] max-sm:-translate-x-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-[92vw] max-w-sm sm:w-96 max-h-[80vh]
  rounded-3xl bg-base-100 shadow-2xl border border-base-300
  flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={group.avatar || "/group.png"}
                  alt={group.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                {isAdmin && (
                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUpdatingImage}
                    className="absolute bottom-0 right-0 btn btn-circle btn-xs"
                  >
                    {isUpdatingImage ? (
                      <span className="loading loading-spinner loading-sm text-primary"></span>
                    ) : (
                      <Camera size={14} />
                    )}
                  </button>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold">{group.name}</h2>
                <p className="text-sm opacity-60">
                  {group.members.length} members
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <X size={20} />
            </button>
          </div>

          {isAdmin && (
            <div className="px-6 py-4">
              <button
                onClick={() => setShowAddMember(true)}
                className="btn btn-primary w-full gap-2 rounded-xl"
              >
                <Plus size={18} /> Add Member
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-2 py-2">
            {safeMembers.map((m) => {
              const isMe = m.userId._id === authUser._id;
              const isCreatorMember =
                m.userId._id.toString() ===
                (group.createdBy?._id || group.createdBy)?.toString();

              return (
                <div
                  key={m.userId._id}
                  className="group flex items-center gap-4 rounded-xl p-3 hover:bg-base-200"
                >
                  <div className="relative">
                    <img
                      src={m.userId.profilePic || "/avatar.png"}
                      className="h-11 w-11 rounded-full"
                    />
                    {m.role === "admin" && (
                      <div className="absolute -bottom-1 -right-1 bg-base-100 rounded-full p-0.5">
                        <Crown size={14} className="text-warning" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate flex gap-2 items-center">
                      {m.userId.fullName}
                      {isMe && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs capitalize opacity-60">{m.role}</p>
                  </div>

                  {isAdmin && !isMe && !isCreatorMember && (
                    <button
                      onClick={() => handleRemove(m.userId._id)}
                      className="btn btn-ghost btn-sm btn-circle text-error opacity-0 group-hover:opacity-100"
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {canLeave && (
            <div className="border-t p-4">
              <button
                onClick={handleLeave}
                className="btn btn-ghost w-full text-error gap-2"
              >
                <LogOut size={18} /> Leave Group
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
