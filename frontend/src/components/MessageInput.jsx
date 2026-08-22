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
  Sticker as StickerIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import StickerPicker from './StickerPicker';
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
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);

  const emojiRef = useRef(null);
  const gifRef = useRef(null);
  const stickerRef = useRef(null);
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
      if (stickerRef.current && !stickerRef.current.contains(event.target)) {
        setShowStickerPicker(false);
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

  const handleStickerSelect = async (stickerUrl) => {
    setShowStickerPicker(false);
    if (isAI) {
      toast.error("AI assistant cannot receive stickers");
      return;
    }

    const payload = {
      text: "",
      sticker: stickerUrl,
      replyTo: replyingTo?._id || null,
    };

    try {
      selectedChatType === "group"
        ? await sendGroupMessage(payload)
        : await sendMessage(payload);
    } catch (error) {
      toast.error("Failed to send sticker");
    }
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
      className={`relative border-t border-base-200/80 dark:border-base-800 px-4 py-3 w-full shrink-0 bg-base-100/80 backdrop-blur-md ${
        dragActive ? "bg-primary/10 border-primary" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {dragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-100/90 backdrop-blur-md z-40 rounded-2xl border-2 border-dashed border-primary m-2">
          <p className="text-sm font-bold text-primary animate-pulse">
            Drop file here to upload
          </p>
        </div>
      )}

      {/* Replying Banner */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-base-200/70 border border-base-300/40 px-3.5 py-2 text-xs">
          <div className="truncate flex items-center gap-1.5">
            <span className="text-primary font-bold">Replying to:</span>
            <span className="text-base-content/70 truncate">{replyingTo.text || "Media attachment"}</span>
          </div>
          <button
            onClick={clearReplyingTo}
            className="w-5 h-5 rounded-full flex items-center justify-center text-base-content/50 hover:bg-base-300 hover:text-base-content transition-colors"
            type="button"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Media & Attachment Previews */}
      {(imagePreview || fileData || audioData) && (
        <div className="mb-2.5 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
          {imagePreview && (
            <Preview onRemove={() => setImagePreview(null)}>
              <img
                src={imagePreview}
                alt="Preview"
                className="h-16 w-16 rounded-xl object-cover border border-base-300 shadow-sm"
              />
            </Preview>
          )}

          {fileData && (
            <Preview onRemove={() => setFileData(null)}>
              <div className="flex items-center gap-2 text-xs bg-base-200 border border-base-300 px-3 py-2 rounded-xl shadow-sm">
                <Paperclip size={14} className="text-primary" />
                <span className="truncate max-w-[150px] font-medium text-base-content/80">
                  {fileData.name}
                </span>
              </div>
            </Preview>
          )}

          {audioData && (
            <Preview onRemove={() => setAudioData(null)}>
              <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-2 rounded-xl">
                <Mic size={14} />
                <span className="font-semibold">Voice memo attached</span>
              </div>
            </Preview>
          )}
        </div>
      )}

      {/* Smart Replies */}
      {smartReplies?.length > 0 && !isAI && (
        <div className="mb-3 relative overflow-hidden rounded-2xl p-3 bg-base-200/50 border border-base-300/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider">
              Suggested Replies
            </span>
            <button
              type="button"
              onClick={() => useChatStore.setState({ smartReplies: [] })}
              className="text-base-content/40 hover:text-error transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {smartReplies.map((reply, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setText(reply);
                  useChatStore.setState({ smartReplies: [] });
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all duration-200 active:scale-95"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        {/* Unified Input Bar */}
        <div className="flex-1 flex items-center bg-base-200/60 dark:bg-base-800/50 border border-base-300/50 dark:border-white/5 rounded-2xl px-2.5 py-1 focus-within:border-primary/50 focus-within:bg-base-100 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onBlur={stopTyping}
            placeholder={isAI ? "Ask AI assistant…" : "Type a message…"}
            disabled={recording}
            className="flex-1 bg-transparent px-2.5 py-2 text-sm text-base-content placeholder:text-base-content/40 outline-none disabled:opacity-50"
          />

          {!isAI && (
            <div className="flex items-center gap-0.5 text-base-content/50">
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

              {/* Emoji Picker Button */}
              <div className="relative" ref={emojiRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowGifPicker(false);
                    setShowStickerPicker(false);
                    setShowEmojiPicker((prev) => !prev);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Smile size={18} />
                </button>

                {showEmojiPicker && (
                  <div className="fixed sm:absolute bottom-16 sm:bottom-12 right-4 sm:right-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-base-300">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={320}
                      height={360}
                    />
                  </div>
                )}
              </div>

              {/* Image Button */}
              <button
                type="button"
                onClick={() => imageRef.current.click()}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Image size={18} />
              </button>

              {/* GIF Picker Button */}
              <div className="relative" ref={gifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(false);
                    setShowStickerPicker(false);
                    setShowGifPicker((prev) => !prev);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Clapperboard size={18} />
                </button>

                {showGifPicker && (
                  <div className="fixed sm:absolute bottom-16 sm:bottom-12 right-4 sm:right-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-base-300">
                    <GifPicker
                      onSelect={handleGifSelect}
                      onClose={() => setShowGifPicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Sticker Picker Button */}
              <div className="relative" ref={stickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(false);
                    setShowGifPicker(false);
                    setShowStickerPicker((prev) => !prev);
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Stickers"
                >
                  <StickerIcon size={18} />
                </button>

                {showStickerPicker && (
                  <div className="fixed sm:absolute bottom-16 sm:bottom-12 right-4 sm:right-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-base-300">
                    <StickerPicker
                      onSelect={handleStickerSelect}
                      onClose={() => setShowStickerPicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Paperclip size={18} />
              </button>

              {/* Poll Button (Group chats only) */}
              {selectedChatType === "group" && (
                <button
                  type="button"
                  onClick={() => setShowPollModal(true)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors"
                  title="Create Poll"
                >
                  <BarChart2 size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Audio Recording / Mic Button */}
        {!isAI && (
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              recording
                ? "bg-error text-white shadow-lg shadow-error/30 animate-pulse"
                : "bg-base-200/70 hover:bg-base-300/80 text-base-content/70"
            }`}
          >
            {recording ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={!hasContent}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 ${
            hasContent
              ? "bg-primary text-primary-content shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
              : "bg-base-200/50 text-base-content/30 cursor-not-allowed"
          }`}
        >
          <Send size={18} className={hasContent ? "translate-x-0.5" : ""} />
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
      onClick={onRemove}
      type="button"
      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-base-300 flex items-center justify-center border border-base-100 shadow-sm hover:bg-error hover:text-white transition-colors"
    >
      <X size={11} />
    </button>
  </div>
);

export default MessageInput;