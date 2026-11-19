import { useRef, useState, useEffect } from "react";
import {
  Image,
  Send,
  X,
  Paperclip,
  Mic,
  StopCircle,
  Smile,
  Clapperboard,
  BarChart2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import EmojiPicker from "emoji-picker-react";
import GifPicker from "./GifPicker";
import PollCreatorModal from "./PollCreatorModal";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [recording, setRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);

  const emojiRef = useRef(null);
  const gifRef = useRef(null);
  const fileRef = useRef(null);
  const imageRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const typingTimeoutRef = useRef(null);

  const {
    sendMessage,
    sendGroupMessage,
    sendMessageToAI,
    selectedChatType,
    selectedUser,
    selectedGroup,
    startTyping,
    stopTyping,
    replyingTo,
    clearReplyingTo,
    smartReplies,
  } = useChatStore();

  const isAI = selectedChatType === "private" && selectedUser?.isAI;
  const hasContent = Boolean(text.trim() || imagePreview || fileData || audioData);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      stopTyping();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (gifRef.current && !gifRef.current.contains(event.target)) {
        setShowGifPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleImageChange = (e) => {
    if (isAI) return;
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGifSelect = (gifUrl) => {
    setImagePreview(gifUrl);
    setShowGifPicker(false);
  };

  const handleFileChange = (e) => {
    if (isAI) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFileData({
        base64: reader.result,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    if (isAI) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => setAudioData(reader.result);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleTyping = (value) => {
    setText(value);
    if (isAI) return;

    if (!value.trim()) {
      stopTyping();
      return;
    }

    startTyping();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(stopTyping, 1200);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!hasContent) return;

    stopTyping();

    if (isAI) {
      await sendMessageToAI(text.trim());
    } else {
      const payload = {
        text: text.trim(),
        image: imagePreview,
        audio: audioData,
        file: fileData,
        replyTo: replyingTo?._id || null,
      };

      selectedChatType === "group"
        ? await sendGroupMessage(payload)
        : await sendMessage(payload);
    }

    setText("");
    setImagePreview(null);
    setFileData(null);
    setAudioData(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setFileData({
          base64: reader.result,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`relative w-full shrink-0 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#100F0F] px-3 sm:px-5 py-3 transition-colors ${
        dragActive ? "bg-zinc-50 dark:bg-zinc-900/50" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {dragActive && (
        <div className="pointer-events-none absolute inset-2 z-40 flex items-center justify-center rounded-lg border border-dashed border-zinc-400 dark:border-zinc-600 bg-white/95 dark:bg-[#141313]/95 backdrop-blur-xs">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
            Drop file here to attach
          </p>
        </div>
      )}

      {/* Replying Banner */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-xs">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 font-medium text-zinc-700 dark:text-zinc-300">
              Replying to:
            </span>
            <span className="truncate text-zinc-500 dark:text-zinc-400">
              {replyingTo.text || "Media attachment"}
            </span>
          </div>
          <button
            type="button"
            onClick={clearReplyingTo}
            aria-label="Cancel reply"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="h-3 w-3 stroke-[1.75]" />
          </button>
        </div>
      )}

      {/* Media & Attachment Previews */}
      {(imagePreview || fileData || audioData) && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {imagePreview && (
            <Preview onRemove={() => setImagePreview(null)}>
              <img
                src={imagePreview}
                alt="Preview"
                className="h-14 w-14 rounded-lg border border-zinc-200 dark:border-zinc-800 object-cover"
              />
            </Preview>
          )}

          {fileData && (
            <Preview onRemove={() => setFileData(null)}>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-zinc-400 stroke-[1.75]" />
                <span className="max-w-[160px] truncate font-medium">
                  {fileData.name}
                </span>
              </div>
            </Preview>
          )}

          {audioData && (
            <Preview onRemove={() => setAudioData(null)}>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <Mic className="h-3.5 w-3.5 shrink-0 text-zinc-500 stroke-[1.75]" />
                <span>Voice memo attached</span>
              </div>
            </Preview>
          )}
        </div>
      )}

      {/* Smart Replies */}
      {smartReplies?.length > 0 && !isAI && (
        <div className="mb-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/40 px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Suggested replies
            </span>
            <button
              type="button"
              onClick={() => useChatStore.setState({ smartReplies: [] })}
              aria-label="Dismiss suggested replies"
              className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3 stroke-[1.75]" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {smartReplies.map((reply, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setText(reply);
                  useChatStore.setState({ smartReplies: [] });
                }}
                className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Composer Bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <div className="flex flex-1 items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 px-2 py-1 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-colors">
          <input
            type="text"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onBlur={stopTyping}
            placeholder={isAI ? "Ask AI assistant..." : "Type a message..."}
            disabled={recording}
            className="h-8 flex-1 bg-transparent px-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none disabled:opacity-50"
          />

          {!isAI && (
            <div className="flex items-center gap-0.5 text-zinc-500 dark:text-zinc-400">
              <input
                ref={imageRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
              <input
                ref={fileRef}
                type="file"
                hidden
                onChange={handleFileChange}
              />

              {/* Emoji Picker */}
              <div className="relative" ref={emojiRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowGifPicker(false);
                    setShowEmojiPicker((prev) => !prev);
                  }}
                  aria-label="Insert emoji"
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer ${
                    showEmojiPicker
                      ? "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Smile className="h-4 w-4 stroke-[1.75]" />
                </button>

                {showEmojiPicker && (
                  <div className="fixed bottom-16 right-4 z-50 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141313] shadow-lg sm:absolute sm:bottom-11 sm:right-0">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={320}
                      height={360}
                    />
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                aria-label="Attach image"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <Image className="h-4 w-4 stroke-[1.75]" />
              </button>

              {/* GIF Picker */}
              <div className="relative" ref={gifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(false);
                    setShowGifPicker((prev) => !prev);
                  }}
                  aria-label="Insert GIF"
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer ${
                    showGifPicker
                      ? "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Clapperboard className="h-4 w-4 stroke-[1.75]" />
                </button>

                {showGifPicker && (
                  <div className="fixed bottom-16 right-4 z-50 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141313] shadow-lg sm:absolute sm:bottom-11 sm:right-0">
                    <GifPicker
                      onSelect={handleGifSelect}
                      onClose={() => setShowGifPicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* File Attachment */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach file"
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <Paperclip className="h-4 w-4 stroke-[1.75]" />
              </button>

              {/* Poll Creator (Group chats only) */}
              {selectedChatType === "group" && (
                <button
                  type="button"
                  onClick={() => setShowPollModal(true)}
                  aria-label="Create poll"
                  title="Create poll"
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <BarChart2 className="h-4 w-4 stroke-[1.75]" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Voice Recording Button */}
        {!isAI && (
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            aria-label={recording ? "Stop recording" : "Record voice message"}
            title={recording ? "Stop recording" : "Record voice message"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer ${
              recording
                ? "border-red-600/30 bg-red-600 text-white hover:bg-red-700"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-950 dark:hover:text-zinc-100"
            }`}
          >
            {recording ? (
              <StopCircle className="h-4 w-4 stroke-[1.75]" />
            ) : (
              <Mic className="h-4 w-4 stroke-[1.75]" />
            )}
          </button>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={!hasContent}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4 stroke-[1.75]" />
        </button>
      </form>

      {/* Poll Creator Modal */}
      <PollCreatorModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        groupId={selectedGroup?._id}
      />
    </div>
  );
};

const Preview = ({ children, onRemove }) => (
  <div className="relative inline-flex items-center">
    {children}
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remove attachment"
      className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
    >
      <X className="h-2.5 w-2.5 stroke-[2]" />
    </button>
  </div>
);

export default MessageInput;