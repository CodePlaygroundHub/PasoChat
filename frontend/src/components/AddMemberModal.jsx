import { X, UserPlus, Search, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";

const AddMemberModal = ({ group, onClose, onAdded }) => {
  const { users, getUsers } = useChatStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        await getUsers();
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [getUsers]);

  // users not already in group + search
  const availableUsers = useMemo(() => {
    const memberIds = group.members.map((m) => m.userId._id);

    return users.filter(
      (u) =>
        !u.isAI &&
        !memberIds.includes(u._id) &&
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, group.members, searchTerm]);

  const handleAddMember = async (user) => {
    // HARD BLOCK AI
    if (user.isAI) {
      toast.error("AI cannot be added to groups");
      return;
    }

    setIsSubmitting(user._id);

    try {
      await axiosInstance.post(`/groups/${group._id}/add-user`, {
        userId: user._id,
      });

      onAdded({
        ...group,
        members: [...group.members, { userId: user, role: "member" }],
      });

      toast.success("Member added");
      onClose();
    } catch {
      toast.error("Failed to add member");
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 sm:pt-32 p-2 sm:p-4">
      <div onClick={onClose} className="" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="
  relative
  w-[calc(100vw-12px)]
  max-w-[420px]
  sm:max-w-sm
  h-[52vh]
  sm:h-auto
  rounded-3xl
  bg-base-100
  shadow-2xl
  border border-base-300
  overflow-hidden
  flex flex-col
"
      >
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-lg font-bold">Add Member</h2>
            <p className="text-xs opacity-50">Invite to {group.name}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users..."
              className="input w-full pl-10 h-11 rounded-xl bg-base-200/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-[45vh] overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center py-12 opacity-50">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-xs">Loading users...</p>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="py-12 text-center text-sm opacity-40">
              {searchTerm
                ? "No users match your search"
                : "Everyone is already in this group"}
            </div>
          ) : (
            availableUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200"
              >
                <img
                  src={user.profilePic || "/avatar.png"}
                  className="h-11 w-11 rounded-full"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.fullName}</p>
                  <p className="text-[10px] uppercase opacity-40">Available</p>
                </div>

                <button
                  onClick={() => handleAddMember(user)}
                  disabled={isSubmitting === user._id}
                  className="btn btn-primary btn-sm rounded-xl"
                >
                  {isSubmitting === user._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-3 text-center border-t text-[10px] opacity-40 font-bold">
          Search globally for new connections
        </div>
      </motion.div>
    </div>
  );
};

export default AddMemberModal;
