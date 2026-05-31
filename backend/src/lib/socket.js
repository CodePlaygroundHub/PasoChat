import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient } from "./redis.js";
const app = express();
const server = http.createServer(app);
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
const io = new Server(server, {
  cors: {
    origin: ["https://chat-app-sooty-mu.vercel.app", "http://localhost:5173"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

if (pubClient && subClient) {
  io.adapter(createAdapter(pubClient, subClient));
}
const userSocketMap = {};
const activeCalls = new Set();
const activeGroupCalls = new Map();
export function getReceiverSocketIds(userId) {
  return userSocketMap[userId] ? [...userSocketMap[userId]] : [];
}
export function emitToUser(userId, event, payload) {
  console.log("Trying to emit to:", userId);
  const socketIds = userSocketMap[userId];
  console.log("Raw socket set:", socketIds);
  if (!socketIds) {
    console.log("No socket found for user:", userId);
    return;
  }
  socketIds.forEach((id) => {
    console.log("➡ Emitting to socket:", id);
    io.to(id).emit(event, payload);
  });
}
io.on("connection", async (socket) => {
  console.log("SOCKET FILE LOADED");
  const userId = socket.handshake.auth.userId;
  if (!userId) return;
  socket.on("requestOnlineUsers", () => {
    const users = Object.keys(userSocketMap);
    console.log("Sending online users:", users);
    socket.emit("getOnlineUsers", users);
  });
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }
  userSocketMap[userId].add(socket.id);
  socket.join(userId);
  await User.findByIdAndUpdate(userId, { isOnline: true });
  const groups = await Group.find({ "members.userId": userId }).select("_id");
  groups.forEach((group) => {
    socket.join(group._id.toString());
  });
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("typing", ({ to }) => {
    socket.to(to).emit("typing", { from: userId });
  });
  socket.on("stopTyping", ({ to }) => {
    socket.to(to).emit("stopTyping", { from: userId });
  });
  socket.on("messageSeen", async ({ messageIds, senderId }) => {
    await Message.updateMany({ _id: { $in: messageIds } }, { status: "seen" });
    emitToUser(senderId, "messageStatusUpdateBulk", {
      messageIds,
      status: "seen",
    });
  });
  socket.on("groupMessageSeen", ({ messageId, groupId }) => {
    socket.to(groupId).emit("groupMessageSeen", { messageId, userId });
  });
  socket.on("call:invite", async ({ to, callType, roomId }) => {
    if (activeCalls.has(to)) {
      socket.emit("call:busy");
      return;
    }
    activeCalls.add(userId);
    activeCalls.add(to);
    const callerUser = await User.findById(userId).select(
      "_id fullName profilePic",
    );
    socket
      .to(to)
      .emit("call:incoming", { caller: callerUser, callType, roomId });
  });
  socket.on("call:accept", ({ to, roomId }) => {
    socket.to(to).emit("call:accepted", { roomId });
  });
  socket.on("call:reject", ({ to }) => {
    activeCalls.delete(userId);
    activeCalls.delete(to);
    socket.to(to).emit("call:rejected");
  });
  socket.on("call:end", ({ to }) => {
    activeCalls.delete(userId);
    activeCalls.delete(to);
    socket.to(to).emit("call:ended");
  });
  socket.on("group:call:start", async ({ groupId, callType, roomId }) => {
    if (activeGroupCalls.has(groupId)) {
      socket.emit("group:call:already-active");
      return;
    }
    activeGroupCalls.set(groupId, roomId);
    const callerUser = await User.findById(userId).select(
      "_id fullName profilePic",
    );
    socket.to(groupId).emit("group:call:incoming", {
      groupId,
      callType,
      roomId,
      caller: callerUser,
    });
  });
  socket.on("group:call:end", ({ groupId }) => {
    activeGroupCalls.delete(groupId);
    socket.to(groupId).emit("group:call:ended", { groupId });
  });
  socket.on("disconnect", async () => {
    if (!userSocketMap[userId]) return;
    userSocketMap[userId].delete(socket.id);
    if (userSocketMap[userId].size === 0) {
      delete userSocketMap[userId];
      activeCalls.delete(userId);
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { io, app, server };
