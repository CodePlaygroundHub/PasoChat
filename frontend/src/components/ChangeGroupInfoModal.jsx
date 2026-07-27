import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

const ChangeGroupInfoModal = ({ group, onClose, onUpdateGroup }) => {
  const [name, setName] = useState(group.name);
  const [avatar, setAvatar] = useState(group?.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(
    group?.avatar || "/group.png",
  );
  const [loading, setLoading] = useState(false);
  const { getGroups } = useChatStore();
  const handleImageChange = (e) => {
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
    reader.onloadend = () => {
      const result = reader.result;
      setAvatar(result);
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.patch(`/groups/${group._id}/update`, {
        name,
        avatar,
      });
      onUpdateGroup(res.data);
      await getGroups();
      toast.success("Group updated");
      onClose();
    } catch {
      toast.error("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-base-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Group</h2>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <img
            src={avatarPreview}
            alt="Group Preview"
            className="h-24 w-24 rounded-full border object-cover"
          />
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered file-input-sm w-full"
            onChange={handleImageChange}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Group Name</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSave}
            className="btn btn-sm btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeGroupInfoModal;
