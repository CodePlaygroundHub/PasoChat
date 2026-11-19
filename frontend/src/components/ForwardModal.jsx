import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Loader2, Send, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ForwardModal = ({ isOpen, onClose, messageId, users = [], groups = [] }) => {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isSelected = (type, id) =>
    selected.some((item) => item.id === id && item.type === type);

  const toggleSelection = (type, id) => {
    setSelected((prev) => {
      const exists = prev.find((item) => item.id === id && item.type === type);

      if (exists) {
        return prev.filter((item) => !(item.id === id && item.type === type));
      }

      return [...prev, { type, id }];
    });
  };

  const handleClose = () => {
    if (loading) return;
    setSelected([]);
    onClose();
  };

  const handleForward = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one conversation");
      return;
    }

    try {
      setLoading(true);

      const destinations = selected.map((item) =>
        item.type === "user" ? { receiverId: item.id } : { groupId: item.id },
      );

      await axiosInstance.post("/messages/forward", {
        messageId,
        destinations,
      });

      toast.success("Message forwarded successfully");
      setSelected([]);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to forward message");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#141313] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 px-5 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
              <Send className="h-4 w-4 stroke-[1.75]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                Forward message
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Choose people or groups to send this to.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Recipient List */}
        <div className="max-h-80 overflow-y-auto px-3 py-3 space-y-3">
          {users.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                Direct messages
              </p>
              <div className="space-y-0.5">
                {users.map((user) => {
                  const checked = isSelected("user", user._id);
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleSelection("user", user._id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                        checked
                          ? "bg-zinc-100 dark:bg-zinc-800/80"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName || "User"}
                          onError={(e) => {
                            e.currentTarget.src = "/avatar.png";
                          }}
                          className="h-8 w-8 shrink-0 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                        />
                        <span className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {user.fullName}
                        </span>
                      </div>

                      <SelectionBox checked={checked} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {groups.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                Groups
              </p>
              <div className="space-y-0.5">
                {groups.map((group) => {
                  const checked = isSelected("group", group._id);
                  return (
                    <button
                      key={group._id}
                      type="button"
                      onClick={() => toggleSelection("group", group._id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                        checked
                          ? "bg-zinc-100 dark:bg-zinc-800/80"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {group.name?.[0]?.toUpperCase() || "G"}
                        </div>
                        <span className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {group.name}
                        </span>
                      </div>

                      <SelectionBox checked={checked} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {users.length === 0 && groups.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              No conversations available to forward to.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30 px-5 py-3.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
            {selected.length} selected
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 px-3.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleForward}
              disabled={loading || selected.length === 0}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Forwarding...</span>
                </>
              ) : (
                <span>Forward</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const SelectionBox = ({ checked }) => (
  <span
    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
      checked
        ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950"
        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
    }`}
  >
    {checked && <Check className="h-2.5 w-2.5 stroke-[2.75]" />}
  </span>
);

export default ForwardModal;