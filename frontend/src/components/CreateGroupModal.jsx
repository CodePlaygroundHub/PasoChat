import { useState } from "react";
import { Camera, Check, Loader2, Search, Users, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";

const CreateGroupModal = ({ onClose }) => {
  const { users, setSelectedGroup, getGroups } = useChatStore();

  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState("");

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    const humanMembers = selectedUsers.filter((id) => {
      const user = users.find((u) => u._id === id);
      return user && !user.isAI;
    });

    if (humanMembers.length < 1) {
      toast.error("Select at least 1 member");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axiosInstance.post("/groups/create", {
        name: groupName.trim(),
        members: humanMembers,
        avatar,
      });

      toast.success("Group created successfully");
      await getGroups();
      setSelectedGroup(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users
    .filter((u) => !u.isAI)
    .filter((u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141313] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
              <Users className="h-4 w-4 stroke-[1.75]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                Create group
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Set up a group name, photo, and members.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <label className="group relative h-16 w-16 shrink-0 cursor-pointer">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Group avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="h-6 w-6 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
                )}
              </div>

              <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                <Camera className="h-3 w-3 stroke-[1.75]" />
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>

            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Group photo
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {avatar ? "Click to replace image." : "Optional, PNG or JPG up to 5MB."}
              </p>
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label
              htmlFor="group-name"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Group name
            </label>
            <input
              id="group-name"
              type="text"
              placeholder="e.g. Design Team, Weekend Hikers"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Member Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Add members
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                {selectedUsers.length} selected
              </span>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 stroke-[1.75]" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pl-8 pr-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="max-h-52 overflow-y-auto rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  No members found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user._id);
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleUser(user._id)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-zinc-100 dark:bg-zinc-800/80"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          onError={(e) => {
                            e.currentTarget.src = "/avatar.png";
                          }}
                          className="h-8 w-8 shrink-0 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                        />
                        <span className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {user.fullName}
                        </span>
                      </div>

                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950"
                            : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[2.75]" />}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 px-3.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={createGroup}
            disabled={isLoading}
            className="inline-flex h-9 min-w-[100px] items-center justify-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>Create group</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;