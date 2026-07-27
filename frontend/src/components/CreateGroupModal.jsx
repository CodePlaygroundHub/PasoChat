import { X, Camera, Search, Users } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

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

  // Filter out AI users and apply search query filter
  const filteredUsers = users
    .filter((u) => !u.isAI)
    .filter((u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-base-100 shadow-2xl border border-base-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-base-200 px-6 py-4">
          <h2 className="text-xl font-bold tracking-tight">Create Group</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-2">
            <label className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full ring-4 ring-primary/20 overflow-hidden bg-base-200 flex items-center justify-center transition-all duration-200 group-hover:ring-primary/40">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Group Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Stylish Lucide Icon Fallback when no avatar is uploaded */
                  <Users className="w-10 h-10 text-base-content/40 transition-transform duration-200 group-hover:scale-110" />
                )}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs font-medium gap-1">
                <Camera className="w-5 h-5" />
                <span>{avatar ? "Change" : "Upload"}</span>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
            <span className="text-xs text-base-content/60 font-medium">
              Click to choose group picture
            </span>
          </div>

          {/* Group Name Input */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text font-medium">Group Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Design Team, Weekend Hikers"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="input input-bordered w-full focus:input-primary transition-all"
            />
          </div>

          {/* Member Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label-text font-medium">Add Members</label>
              <span className="badge badge-primary badge-sm font-semibold">
                {selectedUsers.length} selected
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm input-bordered w-full pl-9"
              />
            </div>

            {/* User List */}
            <div className="max-h-52 overflow-y-auto rounded-xl border border-base-200 divide-y divide-base-200">
              {filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-sm text-base-content/50">
                  No members found
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUsers.includes(user._id);
                  return (
                    <label
                      key={user._id}
                      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-base-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-base-300"
                        />
                        <span className="font-medium text-sm truncate">
                          {user.fullName}
                        </span>
                      </div>

                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm rounded-md"
                        checked={isSelected}
                        onChange={() => toggleUser(user._id)}
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-base-200 p-4 bg-base-200/30 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm text-base-content/70"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={createGroup}
            className="btn btn-primary btn-sm min-w-[100px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Create Group"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
