import { X, UserPlus, Search, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
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

  // Users not already in group + search
  const availableUsers = useMemo(() => {
    const memberIds = group.members.map((m) => m.userId?._id || m.userId);

    return users.filter(
      (u) =>
        !u.isAI &&
        !memberIds.includes(u._id) &&
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, group.members, searchTerm]);

  const handleAddMember = async (user) => {
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

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.14 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800/90 dark:bg-[#141313]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800/80">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <UserPlus className="h-4 w-4 stroke-[1.75]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                Add member
              </h2>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                Invite to {group.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="border-b border-zinc-200/80 px-5 py-3 dark:border-zinc-800/80">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50/70 pl-8 pr-8 text-xs text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-900"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5 stroke-[1.75]" />
              </button>
            )}
          </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400 dark:text-zinc-500">
              <Loader2 className="mb-2 h-4 w-4 animate-spin stroke-[1.75]" />
              <p className="text-xs">Loading people...</p>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {searchTerm
                ? "No people match your search"
                : "Everyone is already in this group"}
            </div>
          ) : (
            availableUsers.map((user) => {
              const isRowSubmitting = isSubmitting === user._id;
              return (
                <div
                  key={user._id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName || "User"}
                      onError={(e) => {
                        e.currentTarget.src = "/avatar.png";
                      }}
                      className="h-8 w-8 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {user.fullName}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Available
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddMember(user)}
                    disabled={Boolean(isSubmitting)}
                    aria-label={`Add ${user.fullName}`}
                    className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-950 disabled:pointer-events-none disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                  >
                    {isRowSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[1.75]" />
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5 stroke-[1.75]" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200/80 bg-zinc-50/60 px-5 py-2.5 text-center text-[11px] text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/30 dark:text-zinc-400">
          Select a person to add them directly to the group.
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

export default AddMemberModal;