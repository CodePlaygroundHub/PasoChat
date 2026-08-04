import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { persist } from "zustand/middleware";

export const useChatStore = create(
  persist(
    (set, get) => ({
      onlineUsers: [],
      messages: [],
      users: [],
      groups: [],
      selectedUser: null,
      selectedGroup: null,
      selectedChatType: "private",
      chatWallpapers: {},
      typingUsers: {},
      unreadCounts: {},
      isUsersLoading: false,
      isGroupsLoading: false,
      isMessagesLoading: false,
      reactions: {},
      pinnedMessages: {},
      clearedChats: {},
      replyingTo: null,
      highlightedMessageId: null,
      searchQuery: "",
      searchResults: [],
      currentSearchIndex: 0,
      isSearching: false,
      smartReplies: [],

      setHighlightedMessage: (id) => set({ highlightedMessageId: id }),

      clearHighlightedMessage: () => set({ highlightedMessageId: null }),

      setReplyingTo: (message) => set({ replyingTo: message }),
      clearReplyingTo: () => set({ replyingTo: null }),

      setSearchQuery: (q) =>
        set({
          searchQuery: q,
          currentSearchIndex: 0,
        }),

      searchMessages: async () => {
        const { selectedUser, searchQuery } = get();
        if (!selectedUser || !searchQuery.trim()) return;

        set({ isSearching: true });

        try {
          const res = await axiosInstance.get(
            `/messages/search/${selectedUser._id}?query=${searchQuery}`,
          );

          set({
            searchResults: res.data,
            highlightedMessageId: res.data[0]?._id || null,
            currentSearchIndex: 0,
          });
        } catch {
          toast.error("Search failed");
        } finally {
          set({ isSearching: false });
        }
      },

      searchGroupMessages: async () => {
        const { selectedGroup, searchQuery } = get();
        if (!selectedGroup || !searchQuery.trim()) return;

        set({ isSearching: true });

        try {
          const res = await axiosInstance.get(
            `/messages/group/search/${selectedGroup._id}?query=${searchQuery}`,
          );

          set({
            searchResults: res.data,
            highlightedMessageId: res.data[0]?._id || null,
            currentSearchIndex: 0,
          });
        } catch {
          toast.error("Search failed");
        } finally {
          set({ isSearching: false });
        }
      },

      nextSearchResult: () => {
        const { searchResults, currentSearchIndex } = get();
        if (!searchResults.length) return;

        const next = (currentSearchIndex + 1) % searchResults.length;

        set({
          currentSearchIndex: next,
          highlightedMessageId: searchResults[next]._id,
        });
      },

      prevSearchResult: () => {
        const { searchResults, currentSearchIndex } = get();
        if (!searchResults.length) return;

        const prev =
          (currentSearchIndex - 1 + searchResults.length) %
          searchResults.length;

        set({
          currentSearchIndex: prev,
          highlightedMessageId: searchResults[prev]._id,
        });
      },

      clearSearch: () =>
        set({
          searchQuery: "",
          searchResults: [],
          currentSearchIndex: 0,
          highlightedMessageId: null,
        }),

      setChatWallpaper: async (chatId, image) => {
        try {
          const res = await axiosInstance.put("/messages/chat-wallpaper", {
            chatId,
            image,
          });

          set((state) => ({
            chatWallpapers: {
              ...state.chatWallpapers,
              [chatId]: res.data.wallpaper,
            },
          }));
        } catch {
          toast.error("Failed to set wallpaper");
        }
      },

      removeChatWallpaper: async (chatId) => {
        try {
          await axiosInstance.delete("/messages/chat-wallpaper", {
            data: { chatId },
          });

          set((state) => {
            const updated = { ...state.chatWallpapers };
            delete updated[chatId];
            return { chatWallpapers: updated };
          });
        } catch {
          toast.error("Failed to remove wallpaper");
        }
      },

      clearSelectedChat: () =>
        set({
          selectedUser: null,
          selectedGroup: null,
          selectedChatType: "private",
          messages: [],
          typingUsers: {},
        }),

      clearChatForMe: (chatId) =>
        set((state) => ({
          clearedChats: {
            ...state.clearedChats,
            [chatId]: Date.now(),
          },
        })),

      togglePin: (chatId, messageId) =>
        set((state) => {
          const chatPins = state.pinnedMessages[chatId] || {};
          return {
            pinnedMessages: {
              ...state.pinnedMessages,
              [chatId]: {
                ...chatPins,
                [messageId]: !chatPins[messageId],
              },
            },
          };
        }),

      addReaction: async (chatId, messageId, emoji) => {
        try {
          await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
        } catch {
          toast.error("Reaction failed");
        }
      },

      //changing this
      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");

          set((state) => {
            const updatedSelectedUser = state.selectedUser
              ? res.data.find((u) => u._id === state.selectedUser._id) ||
              state.selectedUser
              : null;

            return {
              users: res.data,
              selectedUser: updatedSelectedUser,
            };
          });
        } catch {
          toast.error("Failed to load users");
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });

          set((state) => ({
            unreadCounts: {
              ...state.unreadCounts,
              [userId]: 0,
            },
          }));
        } catch {
          toast.error("Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return;
        if (get().selectedChatType !== "private") return;

        const res = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          messageData,
        );

        set({
          messages: [...messages, res.data.message],
          replyingTo: null,
        });
      },

      getGroups: async () => {
        set({ isGroupsLoading: true });
        try {
          const res = await axiosInstance.get("/groups/my");
          set({ groups: res.data });
        } catch {
          toast.error("Failed to load groups");
        } finally {
          set({ isGroupsLoading: false });
        }
      },

      getGroupMessages: async (groupId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/group/${groupId}`);
          set({ messages: res.data });

          set((state) => ({
            unreadCounts: {
              ...state.unreadCounts,
              [groupId]: 0,
            },
          }));
        } catch {
          toast.error("Failed to load group messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendGroupMessage: async (messageData) => {
        const { selectedGroup, messages } = get();
        if (!selectedGroup) return;
        if (get().selectedChatType !== "group") return;

        const res = await axiosInstance.post(
          `/messages/group/send/${selectedGroup._id}`,
          messageData,
        );

        set({
          messages: [...messages, res.data.message],
          // smartReplies: res.data.smartReplies || [],
          replyingTo: null,
        });
      },

      deleteMessageForMe: async (messageId) => {
        try {
          await axiosInstance.delete(`/messages/${messageId}/me`);
          set((state) => ({
            messages: state.messages.filter((m) => m._id !== messageId),
          }));
        } catch {
          toast.error("Failed to delete message");
        }
      },

      deleteMessageForEveryone: async (messageId) => {
        try {
          await axiosInstance.delete(`/messages/${messageId}/everyone`);
          // backend will emit socket event
        } catch {
          toast.error("Failed to delete message");
        }
      },

      async sendMessageToAI(message) {
        const { messages, selectedUser } = get();
        if (!selectedUser) return;

        const authUser = useAuthStore.getState().authUser;

        const userMessage = {
          _id: crypto.randomUUID(),
          senderId: authUser._id,
          receiverId: selectedUser._id,
          text: message,
          status: "seen",
          createdAt: new Date().toISOString(),
        };

        set({ messages: [...messages, userMessage] });

        try {
          await axiosInstance.post("/ai/chat", { message });
        } catch {
          toast.error("Failed to send message to AI");
        }
      },

      startTyping: () => {
        const { selectedUser, selectedGroup, selectedChatType } = get();
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.emit("typing", {
          to:
            selectedChatType === "private"
              ? selectedUser?._id
              : selectedGroup?._id,
        });
      },

      stopTyping: () => {
        const { selectedUser, selectedGroup, selectedChatType } = get();
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.emit("stopTyping", {
          to:
            selectedChatType === "private"
              ? selectedUser?._id
              : selectedGroup?._id,
        });
      },

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.off("newGroupMessage");
        socket.off("typing");
        socket.off("stopTyping");
        socket.off("messageDeletedEveryone");
        socket.off("messageStatusUpdate");
        socket.off("messageStatusUpdateBulk");

        // socket.on("reactionUpdated", ({ messageId, reactions }) => {
        //   set((state) => ({
        //     messages: state.messages.map((m) =>
        //       m._id === messageId ? { ...m, reactions } : m,
        //     ),
        //   }));
        // });

        socket.on("reactionUpdated", (data) => {
          console.log("🔥 FRONTEND RECEIVED:", data);

          set((state) => ({
            messages: state.messages.map((m) =>
              m._id === data.messageId
                ? { ...m, reactions: data.reactions }
                : m,
            ),
          }));
        });

        socket.on("newMessage", (msg) => {
          const { selectedUser, selectedChatType } = get();
          const authUser = useAuthStore.getState().authUser;

          const senderId =
            typeof msg.senderId === "string" ? msg.senderId : msg.senderId?._id;

          if (senderId === authUser._id) return;

          const chatUserId = senderId;

          if (
            selectedChatType === "private" &&
            selectedUser?._id === chatUserId
          ) {
            set((state) => ({
              messages: [...state.messages, msg],
              smartReplies: msg.smartReplies || [],
            }));

            axiosInstance.put(`/messages/mark-seen/${chatUserId}`);
          } else {
            set((state) => ({
              unreadCounts: {
                ...state.unreadCounts,
                [chatUserId]: (state.unreadCounts[chatUserId] || 0) + 1,
              },
            }));
          }
        });

        socket.on("newGroupMessage", (msg) => {
          const { selectedGroup, selectedChatType } = get();

          if (
            selectedChatType === "group" &&
            selectedGroup?._id === msg.groupId
          ) {
            set((state) => ({
              messages: [...state.messages, msg],
            }));
          } else {
            set((state) => ({
              unreadCounts: {
                ...state.unreadCounts,
                [msg.groupId]: (state.unreadCounts[msg.groupId] || 0) + 1,
              },
            }));
          }
        });

        socket.on("typing", ({ from }) => {
          set((state) => ({
            typingUsers: { ...state.typingUsers, [from]: true },
          }));
        });

        socket.on("stopTyping", ({ from }) => {
          set((state) => {
            const t = { ...state.typingUsers };
            delete t[from];
            return { typingUsers: t };
          });
        });

        socket.on("messageDeletedEveryone", ({ messageId }) => {
          set((state) => ({
            messages: state.messages.filter((m) => m._id !== messageId),
          }));
        });

        socket.on("messageStatusUpdateBulk", ({ messageIds, status }) => {
          set((state) => ({
            messages: state.messages.map((m) =>
              messageIds.includes(m._id) ? { ...m, status } : m,
            ),
          }));
        });

        socket.off("getOnlineUsers");
        socket.on("getOnlineUsers", (users) => {
          set({ onlineUsers: users });
        });

        socket.off("userLastSeenUpdate");
        socket.on("userLastSeenUpdate", ({ userId, isOnline, lastSeen }) => {
          set((state) => ({
            users: state.users.map((u) =>
              u._id === userId ? { ...u, isOnline, lastSeen } : u,
            ),
            selectedUser:
              state.selectedUser?._id === userId
                ? { ...state.selectedUser, isOnline, lastSeen }
                : state.selectedUser,
          }));
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.off("newGroupMessage");
        socket.off("typing");
        socket.off("stopTyping");
        socket.off("messageStatusUpdate");
        socket.off("messageStatusUpdateBulk");
        socket.off("messageDeletedEveryone");
      },

      deleteGroup: async (groupId) => {
        try {
          await axiosInstance.delete(`/groups/${groupId}`);
          set((state) => ({
            groups: state.groups.filter((g) => g._id !== groupId),
          }));
          toast.success("Group deleted");
        } catch {
          toast.error("Failed to delete group");
        }
      },

      setSelectedUser: (user) =>
        set((state) => {
          axiosInstance.put(`/messages/mark-seen/${user._id}`);
          return {
            selectedUser: user,
            selectedGroup: null,
            selectedChatType: "private",
            messages: [],
            typingUsers: {},
            unreadCounts: {
              ...state.unreadCounts,
              [user._id]: 0,
            },
            searchQuery: "",
            searchResults: [],
            highlightedMessageId: null,
            smartReplies: [],
          };
        }),

      setSelectedGroup: (group) =>
        set((state) => ({
          selectedGroup: group,
          selectedUser: null,
          selectedChatType: "group",
          messages: [],
          typingUsers: {},
          unreadCounts: {
            ...state.unreadCounts,
            [group?._id]: 0,
          },
          searchQuery: "",
          searchResults: [],
          highlightedMessageId: null,
          smartReplies: [],
        })),
    }),
    {
      name: "chat-ui-state",
      partialize: (state) => ({
        reactions: state.reactions,
        pinnedMessages: state.pinnedMessages,
        clearedChats: state.clearedChats,
        chatWallpapers: state.chatWallpapers,
      }),
    },
  ),
);
