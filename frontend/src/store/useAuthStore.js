import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useCallStore } from "./useCallStore";
import { useChatStore } from "./useChatStore.js";

// const BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:5001"
//     : import.meta.env.VITE_BACKEND_URL;

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isVerifyingSecurity: false,
  isResettingPassword: false,
  resetToken: null,
  securityQuestions: [],
  isFetchingQuestions: false,
  isSendingOtp: false,
  isVerifyingOtp: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success(res.data.message || "Account created. Please verify your Email.");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return null;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // logout: async () => {
  //   try {
  //     await axiosInstance.post("/auth/logout");
  //     get().disconnectSocket();
  //     set({ authUser: null, onlineUsers: [] });
  //     toast.success("Logged out successfully");
  //   } catch (error) {
  //     toast.error(error.response?.data?.message);
  //   }
  // },

  logout: async () => {
    localStorage.removeItem("token");
    get().disconnectSocket();
    set({ authUser: null, onlineUsers: [] });
    toast.success("Logged out successfully");
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  verifySecurityAnswers: async (data) => {
    set({ isVerifyingSecurity: true });

    try {
      const res = await axiosInstance.post("/auth/verify-security", data);

      set({ resetToken: res.data.resetToken });
      toast.success("Security answers verified");

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return false;
    } finally {
      set({ isVerifyingSecurity: false });
    }
  },

  resetPassword: async (data) => {
    set({ isResettingPassword: true });

    try {
      await axiosInstance.post("/auth/reset-password", {
        ...data,
        resetToken: get().resetToken,
      });

      set({ resetToken: null });
      toast.success("Password reset successful");

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return false;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  sendOtp: async (email) => {
    set({ isSendingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/send-otp", { email });
      toast.success(res.data.message || "OTP sent successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      return false;
    } finally {
      set({ isSendingOtp: false });
    }
  },

  verifyOtp: async (data) => {
    set({ isVerifyingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      set({ resetToken: res.data.resetToken });
      toast.success("OTP verified successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
      return false;
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  verifyEmailOtp: async ({ email, otp }) => {
    set({ isVerifyingOtp: true });

    try {
      const res = await axiosInstance.post("/auth/verify-email", {
        email,
        otp,
      });

      toast.success(res.data.message || "Email verified successfully");
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Verification failed"
      );
      return false;
    } finally {
      set({ isVerifyingOtp: false });
    }
  },

  resendVerificationOtp: async (email) => {
    set({ isSendingOtp: true });

    try {
      const res = await axiosInstance.post(
        "/auth/resend-verification-otp",
        { email }
      );

      toast.success(res.data.message || "OTP sent successfully");

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend OTP"
      );

      return false;
    } finally {
      set({ isSendingOtp: false });
    }
  },

  fetchSecurityQuestions: async (email) => {
    set({ isFetchingQuestions: true });

    try {
      const res = await axiosInstance.post("/auth/get-security-questions", {
        email,
      });

      set({ securityQuestions: res.data.questions });
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return false;
    } finally {
      set({ isFetchingQuestions: false });
    }
  },

  connectSocket: () => {
    console.log("CONNECT SOCKET CALLED");

    const { authUser, socket } = get();
    if (!authUser) return;

    if (socket) {
      socket.disconnect();
    }

    // const newSocket = io(BASE_URL, {
    //   auth: { userId: authUser._id },
    //   withCredentials: true,
    //   transports: ["websocket"],
    //   reconnection: true,
    // });

    // const newSocket = io(BASE_URL, {
    //   auth: { userId: authUser._id },
    //   withCredentials: true,
    //   reconnection: true,
    // });

    const newSocket = io(BASE_URL, {
      auth: { userId: authUser._id },

      transports: ["polling", "websocket"],

      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,

      timeout: 20000,
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("RAW FROM SERVER:", userIds);

      if (!Array.isArray(userIds)) {
        set({ onlineUsers: [] });
        return;
      }

      // Always force string comparison consistency
      const normalized = userIds.map((id) => String(id));

      console.log("NORMALIZED:", normalized);

      set({ onlineUsers: normalized });
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("requestOnlineUsers"); // force sync
      useChatStore.getState().subscribeToMessages();
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      set({ onlineUsers: [] });
    });

    newSocket.onAny((event, ...args) => {
      console.log("EVENT:", event);
    });

    // Call events
    newSocket.on("call:incoming", (data) => {
      useCallStore.getState().receiveCall(data);
    });

    newSocket.on("call:accepted", () => {
      useCallStore.setState({ callStatus: "in-call" });
    });

    newSocket.on("call:rejected", () => {
      useCallStore.getState().resetCall();
    });

    newSocket.on("call:ended", () => {
      useCallStore.getState().resetCall();
    });

    newSocket.on("call:busy", () => {
      toast.error("User is busy on another call");
      useCallStore.getState().resetCall();
    });

    newSocket.on("group:call:incoming", (data) => {
      useCallStore.getState().receiveGroupCall(data);
    });

    newSocket.on("group:call:ended", () => {
      useCallStore.getState().resetCall();
    });

    newSocket.on("group:call:already-active", () => {
      toast.error("A group call is already active");
      useCallStore.getState().resetCall();
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
