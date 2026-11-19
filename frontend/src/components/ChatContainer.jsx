import { useEffect, useRef, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { usePollStore } from "../store/usePollStore";
import { motion, AnimatePresence } from "framer-motion";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageBubble from "./MessageBubble.jsx";
import PinnedHeader from "./PinnedHeader.jsx";
import PollBubble from "./PollBubble.jsx";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    getGroupMessages,
    isMessagesLoading,
    selectedUser,
    selectedGroup,
    selectedChatType,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    clearedChats,
    isAILoading,
    chatWallpapers,
    highlightedMessageId,
  } = useChatStore();

  const {
    polls,
    getGroupPolls,
    clearPolls,
    subscribeToPollEvents,
    unsubscribeFromPollEvents,
  } = usePollStore();

  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);
  const messageRefs = useRef({});

  const chatId =
    selectedChatType === "private" ? selectedUser?._id : selectedGroup?._id;

  const wallpaper = chatWallpapers?.[chatId];
  const clearedAt = clearedChats?.[chatId];

  // subscribe / unsubscribe messages
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, selectedGroup?._id, selectedChatType]);

  // subscribe / unsubscribe poll events (group only)
  useEffect(() => {
    if (selectedChatType === "group") {
      subscribeToPollEvents();
    }
    return () => unsubscribeFromPollEvents();
  }, [selectedGroup?._id, selectedChatType]);

  // fetch messages
  useEffect(() => {
    if (selectedChatType === "private" && selectedUser?._id) {
      getMessages(selectedUser._id);
    }
    if (selectedChatType === "group" && selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
    }
  }, [selectedUser?._id, selectedGroup?._id, selectedChatType]);

  // fetch polls (group only); clear when leaving group
  useEffect(() => {
    if (selectedChatType === "group" && selectedGroup?._id) {
      getGroupPolls(selectedGroup._id);
    } else {
      clearPolls();
    }
  }, [selectedGroup?._id, selectedChatType]);

  useEffect(() => {
    if (!highlightedMessageId) return;

    const el = messageRefs.current[highlightedMessageId];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedMessageId]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: window.innerWidth < 640 ? "auto" : "smooth",
    });
  }, [messages, polls, typingUsers, isAILoading]);

  const visibleMessages = clearedAt
    ? messages.filter((msg) => new Date(msg.createdAt).getTime() > clearedAt)
    : messages;

  // Merge messages and polls into a single sorted timeline
  const timelineItems = useMemo(() => {
    const msgItems = visibleMessages.map((m) => ({
      type: "message",
      _id: m._id,
      createdAt: m.createdAt,
      data: m,
    }));

    const pollItems =
      selectedChatType === "group"
        ? polls.map((p) => ({
            type: "poll",
            _id: p._id,
            createdAt: p.createdAt,
            data: p,
          }))
        : [];

    return [...msgItems, ...pollItems].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
  }, [visibleMessages, polls, selectedChatType]);

  if (!selectedUser && !selectedGroup) return null;

  if (isMessagesLoading) {
    return (
      <div className="flex flex-1 flex-col h-full min-h-0 w-full bg-white dark:bg-[#100F0F]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full min-h-0 w-full bg-white dark:bg-[#100F0F] overflow-hidden">
      <div className="shrink-0 z-20">
        <ChatHeader />
      </div>

      <div className="shrink-0 z-20">
        <PinnedHeader chatId={chatId} />
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        {wallpaper && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${wallpaper})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }}
          />
        )}

        <div className="relative z-10 h-full overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4">
          <div className="space-y-2.5 sm:space-y-3.5">
            {timelineItems.map((item, idx) => {
              const isLast = idx === timelineItems.length - 1;

              if (item.type === "poll") {
                return (
                  <div
                    key={`poll-${item._id}`}
                    ref={(el) => {
                      if (isLast) bottomRef.current = el;
                    }}
                    className="flex justify-start px-1 sm:px-2"
                  >
                    <PollBubble poll={item.data} />
                  </div>
                );
              }

              const message = item.data;
              const isMe =
                typeof message.senderId === "string"
                  ? message.senderId === authUser._id
                  : message.senderId?._id === authUser._id;

              const sender =
                selectedChatType === "group"
                  ? message.senderId
                  : isMe
                    ? authUser
                    : selectedUser;

              return (
                <div
                  key={message._id}
                  ref={(el) => {
                    if (el) messageRefs.current[message._id] = el;
                    if (isLast) bottomRef.current = el;
                  }}
                >
                  <MessageBubble
                    message={message}
                    sender={sender}
                    isMe={isMe}
                    chatType={selectedChatType}
                    chatId={chatId}
                  />
                </div>
              );
            })}

            {/* AI Thinking Indicator */}
            <AnimatePresence>
              {isAILoading && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2.5 pt-1"
                >
                  <img
                    src="/ai-avatar.png"
                    alt="AI"
                    className="h-7 w-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                  />

                  <div className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/70 px-3">
                    {[0, 0.18, 0.36].map((delay, i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.1,
                          delay,
                          ease: "easeInOut",
                        }}
                        className="h-1.5 w-1.5 rounded-full bg-zinc-500 dark:bg-zinc-400"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="shrink-0 z-20">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;