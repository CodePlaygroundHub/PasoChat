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
} from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import EmojiPicker from "emoji-picker-react";
import GifPicker from "./GifPicker";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [recording, setRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    startTyping,
    stopTyping,
    replyingTo,
    clearReplyingTo,
    smartReplies,
  } = useChatStore();

  const isAI = selectedChatType === "private" && selectedUser?.isAI;

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
        stream.getTracks().forEach((track) => track.stop()); // Clean up hardware use
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
    if (!text.trim() && !imagePreview && !fileData && !audioData) return;

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

    // Reset all states
    setText("");
    setImagePreview(null);
    setFileData(null);
    setAudioData(null);

    // useChatStore.setState({ smartReplies: [] });
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
      className={`relative border-t border-base-300 p-2 sm:p-4 w-full shrink-0 bg-base-100 ${
        dragActive ? "bg-primary/10 border-primary" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {dragActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-200/70 backdrop-blur-sm z-40 rounded-xl">
          <p className="text-lg font-semibold text-primary">
            Drop file to upload
          </p>
        </div>
      )}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-base-200 px-3 py-2 text-sm">
          <div className="truncate">
            <span className="text-primary font-medium mr-1">Replying to</span>
            {replyingTo.text || "Media message"}
          </div>
          <button
            onClick={clearReplyingTo}
            className="btn btn-ghost btn-xs"
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {(imagePreview || fileData || audioData) && (
        <div className="mb-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
          {imagePreview && (
            <Preview onRemove={() => setImagePreview(null)}>
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-14 w-14 sm:h-20 sm:w-20 rounded-lg object-cover border border-base-300"
                />
              </div>
            </Preview>
          )}

          {fileData && (
            <Preview onRemove={() => setFileData(null)}>
              <div className="flex items-center gap-2 text-xs sm:text-sm bg-base-300/50 p-2 rounded-lg">
                <Paperclip size={14} className="text-primary" />
                <span className="truncate max-w-[120px] sm:max-w-[200px] font-medium">
                  {fileData.name}
                </span>
              </div>
            </Preview>
          )}

          {audioData && (
            <Preview onRemove={() => setAudioData(null)}>
              <div className="flex items-center gap-2 text-xs sm:text-sm bg-primary/10 text-primary p-2 rounded-lg">
                <Mic size={14} />
                <span className="font-medium">Voice message</span>
              </div>
            </Preview>
          )}
        </div>
      )}

      {smartReplies?.length > 0 && !isAI && (
        <div
          className="
      mb-4 relative overflow-hidden
      rounded-2xl p-4
      bg-base-100/60 backdrop-blur-xl
      border border-base-300/50
      shadow-lg shadow-primary/5
      animate-in fade-in slide-in-from-bottom-4 duration-300
    "
        >
          {/* Glow Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-40 pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={() => useChatStore.setState({ smartReplies: [] })}
            className="
        absolute top-3 right-3
        w-6 h-6 flex items-center justify-center
        rounded-full text-xs
        bg-base-200 hover:bg-error hover:text-white
        transition-all duration-200
      "
          >
            ✕
          </button>

          {/* Title */}
          <p className="text-xs font-semibold text-base-content/50 mb-3 uppercase tracking-wider">
            Suggested Replies
          </p>

          {/* Replies */}
          <div className="flex flex-wrap gap-3">
            {smartReplies.map((reply, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setText(reply);
                  useChatStore.setState({ smartReplies: [] });
                }}
                className="
            group relative
            px-4 py-2 rounded-full
            bg-gradient-to-r from-primary/10 to-primary/5
            text-primary
            border border-primary/20
            text-sm font-medium
            transition-all duration-300
            hover:scale-105 hover:bg-primary hover:text-white
            hover:shadow-lg hover:shadow-primary/30
            active:scale-95
          "
                style={{
                  animation: `fadeSlideUp 0.4s ease forwards`,
                  animationDelay: `${index * 70}ms`,
                  opacity: 0,
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-end gap-2">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="relative flex items-center bg-base-200 rounded-xl px-3 py-1 sm:py-2">
            <input
              type="text"
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              onBlur={stopTyping}
              placeholder={isAI ? "Ask AI assistant…" : "Message"}
              disabled={recording}
              className="
    w-full min-w-0
    h-11 sm:h-12
    px-3 sm:px-4
    text-sm sm:text-base
    rounded-full
    bg-base-200/70
    placeholder:text-base-content/40
    focus:outline-none
    focus:bg-base-100
    focus:ring-2
    focus:ring-primary/30
    transition-all
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
            />

{!isAI && (
              <div className="flex items-center gap-0.5 sm:gap-1 ml-2">
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

                <div className="relative" ref={emojiRef}>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="btn btn-ghost btn-circle btn-xs sm:btn-sm"
                  >
                    <Smile size={18} />
                  </button>

                  {showEmojiPicker && (
                  <div
                    className="
                      fixed sm:absolute
                      bottom-0 sm:bottom-12
                      left-0 sm:left-auto
                      right-0
                      z-50
                      w-full sm:w-auto
                      bg-base-100
                      border-t sm:border sm:rounded-xl
                      shadow-lg
                    "
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width="100%"
                      height={320}
                    />
                  </div>
                )}
                </div>

                <button
                  type="button"
                  onClick={() => imageRef.current.click()}
                  className="btn btn-ghost btn-circle btn-xs sm:btn-sm"
                >
                  <Image size={18} />
                </button>

                <div className="relative" ref={gifRef}>
                  <button
                    type="button"
                    onClick={() => setShowGifPicker((prev) => !prev)}
                    className="btn btn-ghost btn-circle btn-xs sm:btn-sm"
                  >
                    <Clapperboard size={18} />
                  </button>

                  {showGifPicker && (
                    <div
                      className="
                        fixed sm:absolute
                        bottom-0 sm:bottom-12
                        left-0 sm:left-auto
                        right-0
                        z-50
                        w-full sm:w-auto
                        sm:border sm:rounded-xl
                        shadow-lg
                      "
                    >
                      <GifPicker
                        onSelect={handleGifSelect}
                        onClose={() => setShowGifPicker(false)}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="btn btn-ghost btn-circle btn-xs sm:btn-sm"
                >
                  <Paperclip size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-[7px]">
          {!isAI && (
            <div className="flex items-center">
              {!recording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="btn btn-ghost btn-circle btn-sm sm:btn-md"
                >
                  <Mic size={22} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="btn btn-error btn-circle btn-sm sm:btn-md animate-pulse"
                >
                  <StopCircle size={22} />
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!text.trim() && !imagePreview && !fileData && !audioData}
            className={`btn btn-primary btn-circle btn-sm sm:btn-md ${
              !text.trim() && !imagePreview && !fileData && !audioData
                ? "btn-disabled opacity-50"
                : ""
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

const Preview = ({ children, onRemove }) => (
  <div className="relative inline-flex items-center">
    {children}
    <button
      onClick={onRemove}
      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-base-300 flex items-center justify-center border border-base-100 shadow-sm hover:bg-error hover:text-white transition-colors"
    >
      <X size={12} />
    </button>
  </div>
);

export default MessageInput;
