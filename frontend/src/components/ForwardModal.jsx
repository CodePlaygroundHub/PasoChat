import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ForwardModal = ({ isOpen, onClose, messageId, users = [], groups = [] }) => {
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const toggleSelection = (type, id) => {
        setSelected((prev) => {
            const exists = prev.find((item) => item.id === id && item.type === type);

            if (exists) {
                return prev.filter((item) => !(item.id === id && item.type === type));
            }

            return [...prev, { type, id }];
        });
    };

    const handleForward = async () => {
        if (selected.length === 0) {
            toast.error("Select at least one conversation");
            return;
        }

        try {
            setLoading(true);

            const destinations = selected.map((item) =>
                item.type === "user"
                    ? { receiverId: item.id }
                    : { groupId: item.id }
            );

            await axiosInstance.post("/messages/forward", {
                messageId,
                destinations,
            });

            toast.success("Message forwarded successfully");
            onClose();
            setSelected([]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to forward message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-base-100 w-full max-w-md rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Forward Message</h2>
                    <button onClick={onClose} className="text-xl">×</button>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                    {users.map((user) => (
                        <label key={user._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.some((s) => s.id === user._id && s.type === "user")}
                                onChange={() => toggleSelection("user", user._id)}
                            />
                            <img src={user.profilePic || "/avatar.png"} alt="" className="w-10 h-10 rounded-full" />
                            <span className="font-medium">{user.fullName}</span>
                        </label>
                    ))}

                    {groups.map((group) => (
                        <label key={group._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selected.some((s) => s.id === group._id && s.type === "group")}
                                onChange={() => toggleSelection("group", group._id)}
                            />
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="font-bold">{group.name?.[0] || "G"}</span>
                            </div>
                            <span className="font-medium">{group.name}</span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end gap-3 mt-5">
                    <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                    <button onClick={handleForward} disabled={loading} className="btn btn-primary">
                        {loading ? "Forwarding..." : "Forward"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForwardModal;