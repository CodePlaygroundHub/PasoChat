import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const usePollStore = create((set, get) => ({
  polls: [],
  isPollsLoading: false,

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  getGroupPolls: async (groupId) => {
    set({ isPollsLoading: true });
    try {
      const res = await axiosInstance.get(`/polls/groups/${groupId}`);
      set({ polls: res.data });
    } catch {
      toast.error("Failed to load polls");
    } finally {
      set({ isPollsLoading: false });
    }
  },

  // ─── Create ────────────────────────────────────────────────────────────────

  createPoll: async (groupId, pollData) => {
    try {
      const res = await axiosInstance.post(`/polls/groups/${groupId}`, pollData);
      // Socket will broadcast newGroupPoll — add only if not already present
      set((state) => {
        const exists = state.polls.some((p) => p._id === res.data._id);
        return exists ? {} : { polls: [res.data, ...state.polls] };
      });
      toast.success("Poll created!");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create poll");
      return null;
    }
  },

  // ─── Vote ──────────────────────────────────────────────────────────────────

  votePoll: async (pollId, optionId) => {
    try {
      const res = await axiosInstance.post(`/polls/${pollId}/vote`, {
        optionId,
      });
      // Socket will broadcast pollUpdated — update locally as well for instant feedback
      set((state) => ({
        polls: state.polls.map((p) => (p._id === pollId ? res.data : p)),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to vote");
    }
  },

  // ─── Close ─────────────────────────────────────────────────────────────────

  closePoll: async (pollId) => {
    try {
      const res = await axiosInstance.patch(`/polls/${pollId}/close`);
      set((state) => ({
        polls: state.polls.map((p) => (p._id === pollId ? res.data : p)),
      }));
      toast.success("Poll closed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close poll");
    }
  },

  // ─── Socket subscriptions ──────────────────────────────────────────────────

  subscribeToPollEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroupPoll");
    socket.off("pollUpdated");

    socket.on("newGroupPoll", (poll) => {
      set((state) => {
        const exists = state.polls.some((p) => p._id === poll._id);
        return exists ? {} : { polls: [poll, ...state.polls] };
      });
    });

    socket.on("pollUpdated", (poll) => {
      set((state) => ({
        polls: state.polls.map((p) => (p._id === poll._id ? poll : p)),
      }));
    });
  },

  unsubscribeFromPollEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newGroupPoll");
    socket.off("pollUpdated");
  },

  clearPolls: () => set({ polls: [] }),
}));
