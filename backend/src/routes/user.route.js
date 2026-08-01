import express from "express";
import {
  pinChat,
  unpinChat,
} from "../controllers/user.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Pin a chat
router.post("/pin", protectRoute, pinChat);

// Unpin a chat
router.delete("/pin/:chatId", protectRoute, unpinChat);

export default router;