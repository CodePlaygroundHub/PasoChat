import { useState } from "react";
import { createPortal } from "react-dom";
import { Image, Loader2, X } from "lucide-react";
import { useStatusStore } from "../store/useStatusStore";

const AddStatusModal = ({ onClose }) => {
  const { createStatus, isUploadingStatus } = useStatusStore();

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const hasContent = Boolean(text.trim() || file);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleClearMedia = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
  };

  const handleClose = () => {
    if (isUploadingStatus) return;
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasContent || isUploadingStatus) return;

    const formData = new FormData();
    formData.append("text", text.trim());
    if (file) formData.append("media", file);

    await createStatus(formData);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    onClose();
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
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Add status
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Share a short update, photo, or video.
            </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="status-text"
              className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Status note{" "}
              <span className="font-normal text-zinc-400 dark:text-zinc-500">
                (optional if media attached)
              </span>
            </label>
            <textarea
              id="status-text"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full resize-none rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 px-3 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white transition-colors">
              <Image className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 stroke-[1.75]" />
              <span>{file ? "Change media" : "Add image or video"}</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[160px]">
                {file.name}
              </span>
            )}
          </div>

          {preview && file && (
            <div className="relative overflow-hidden rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 p-2">
              <button
                type="button"
                onClick={handleClearMedia}
                aria-label="Remove media"
                className="absolute top-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5 stroke-[1.75]" />
              </button>

              {file.type.startsWith("image") ? (
                <img
                  src={preview}
                  alt="Status preview"
                  className="max-h-60 w-full rounded-md object-contain"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="max-h-60 w-full rounded-md object-contain"
                />
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploadingStatus}
              className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 px-3.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!hasContent || isUploadingStatus}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 text-xs font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              {isUploadingStatus ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Post status</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default AddStatusModal;