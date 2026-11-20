import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Trash2, X } from "lucide-react";
import { useStatusStore } from "../store/useStatusStore";
import StatusProgress from "./StatusProgress";
import { useAuthStore } from "../store/useAuthStore";

const StatusViewer = () => {
  const {
    statuses,
    selectedStatus,
    clearSelectedStatus,
    viewStatus,
    deleteStatus,
  } = useStatusStore();

  const { authUser } = useAuthStore();

  const [showViewers, setShowViewers] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Safely group statuses for the selected author
  const userStatuses = useMemo(() => {
    if (!selectedStatus?.user?._id) return [];

    return statuses.filter(
      (s) => s?.user?._id && s.user._id === selectedStatus.user._id,
    );
  }, [statuses, selectedStatus]);

  // Sync active index and register view
  useEffect(() => {
    if (!selectedStatus?.user?._id) return;

    const index = userStatuses.findIndex((s) => s?._id === selectedStatus._id);
    setCurrentIndex(index === -1 ? 0 : index);
    viewStatus(selectedStatus);
  }, [selectedStatus, userStatuses, viewStatus]);

  if (!selectedStatus?.user?._id) return null;

  const status = userStatuses[currentIndex];

  if (!status) {
    clearSelectedStatus();
    return null;
  }

  const nextStatus = () => {
    if (currentIndex < userStatuses.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      clearSelectedStatus();
    }
  };

  const prevStatus = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const isOwner = status.user._id === authUser?._id;
  const isImage = status.mediaUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  const isVideo = status.mediaUrl?.match(/\.(mp4|webm|ogg)$/i);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col bg-[#100F0F] text-zinc-100 select-none">
      {/* Progress Segments */}
      <div className="flex gap-1 px-3 pt-3 z-20">
        {userStatuses.map((_, i) => {
          if (i < currentIndex) {
            return (
              <div
                key={i}
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-zinc-100"
              />
            );
          }

          if (i === currentIndex) {
            return (
              <div key={i} className="flex-1">
                <StatusProgress duration={5000} onComplete={nextStatus} />
              </div>
            );
          }

          return (
            <div
              key={i}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-zinc-700/80"
            />
          );
        })}
      </div>

      {/* Top Bar */}
      <div className="relative z-20 flex items-center justify-between gap-3 border-b border-zinc-800/70 bg-[#100F0F]/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={status.user.profilePic || "/avatar.png"}
            alt={status.user.fullName || "User"}
            onError={(e) => {
              e.currentTarget.src = "/avatar.png";
            }}
            className="h-9 w-9 shrink-0 rounded-full border border-zinc-700/80 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-zinc-100">
              {status.user.fullName}
            </p>
            <p className="truncate text-[11px] text-zinc-400 tabular-nums">
              {new Date(status.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowViewers(true)}
              title="Viewers"
              aria-label="View status viewers"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4 stroke-[1.75]" />
            </button>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={() => deleteStatus(status._id)}
              title="Delete status"
              aria-label="Delete status"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-red-950/50 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4 stroke-[1.75]" />
            </button>
          )}

          <button
            type="button"
            onClick={clearSelectedStatus}
            title="Close"
            aria-label="Close status viewer"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* Tap Navigation Zones */}
      <div className="absolute inset-x-0 top-16 bottom-0 z-10 flex">
        <button
          type="button"
          onClick={prevStatus}
          aria-label="Previous status"
          className="h-full w-1/2 cursor-default focus:outline-none"
        />
        <button
          type="button"
          onClick={nextStatus}
          aria-label="Next status"
          className="h-full w-1/2 cursor-default focus:outline-none"
        />
      </div>

      {/* Media / Text Content */}
      <div className="relative z-10 pointer-events-none flex flex-1 items-center justify-center overflow-hidden p-4">
        {isImage && (
          <img
            src={status.mediaUrl}
            alt={status.text || "Status media"}
            className="max-h-full max-w-full rounded-lg border border-zinc-800/80 object-contain"
          />
        )}

        {isVideo && (
          <video
            src={status.mediaUrl}
            autoPlay
            controls
            className="pointer-events-auto max-h-full max-w-full rounded-lg border border-zinc-800/80 object-contain"
          />
        )}

        {!status.mediaUrl && status.text && (
          <div className="max-w-lg rounded-xl border border-zinc-800/90 bg-[#141313] px-6 py-5 text-center text-base sm:text-lg font-medium leading-relaxed text-zinc-100">
            {status.text}
          </div>
        )}
      </div>

      {/* Viewers Sheet */}
      {showViewers && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 backdrop-blur-[2px] p-4"
          onClick={() => setShowViewers(false)}
        >
          <div
            className="max-h-[60vh] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-800 bg-[#141313] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <p className="text-xs font-semibold text-zinc-100 tabular-nums">
                Viewed by {status.viewers?.length || 0}
              </p>
              <button
                type="button"
                onClick={() => setShowViewers(false)}
                aria-label="Close viewers list"
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[1.75]" />
              </button>
            </div>

            <div className="divide-y divide-zinc-800/70 px-4 py-2">
              {(!status.viewers || status.viewers.length === 0) && (
                <p className="py-6 text-center text-xs text-zinc-400">
                  No views yet
                </p>
              )}

              {status.viewers?.map((viewer) => (
                <div
                  key={viewer._id}
                  className="flex items-center gap-3 py-2.5"
                >
                  <img
                    src={viewer.profilePic || "/avatar.png"}
                    alt={viewer.fullName || "Viewer"}
                    onError={(e) => {
                      e.currentTarget.src = "/avatar.png";
                    }}
                    className="h-8 w-8 shrink-0 rounded-full border border-zinc-800 object-cover"
                  />
                  <p className="truncate text-xs font-medium text-zinc-200">
                    {viewer.fullName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
};

export default StatusViewer;