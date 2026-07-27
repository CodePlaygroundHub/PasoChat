import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  getGroupMessages,
  sendGroupMessage,
  forwardMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
  markMessagesSeen,
  updateChatWallpaper,
  removeChatWallpaper,
  searchMessages,
  searchGroupMessages,
  reactToMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);

// Search messages
router.get("/search/:userId", protectRoute, searchMessages);
router.get("/group/search/:groupId", protectRoute, searchGroupMessages);

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

router.get("/group/:groupId", protectRoute, getGroupMessages);
router.post("/group/send/:groupId", protectRoute, sendGroupMessage);

router.post("/forward/", protectRoute, forwardMessage);

router.delete("/:messageId/me", protectRoute, deleteMessageForMe);
router.delete("/:messageId/everyone", protectRoute, deleteMessageForEveryone);

router.put("/mark-seen/:userId", protectRoute, markMessagesSeen);
router.put("/chat-wallpaper", protectRoute, updateChatWallpaper);
router.delete("/chat-wallpaper", protectRoute, removeChatWallpaper);

router.post("/react/:messageId", protectRoute, reactToMessage);


export default router;
