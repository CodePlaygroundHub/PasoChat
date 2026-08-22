import express from "express";
import {
  getStickerPacks,
  getUserStickerData,
  toggleFavoriteSticker,
  addRecentSticker,
} from "../controllers/sticker.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/packs", protectRoute, getStickerPacks);
router.get("/user-data", protectRoute, getUserStickerData);
router.post("/favorites/toggle", protectRoute, toggleFavoriteSticker);
router.post("/recents", protectRoute, addRecentSticker);

export default router;
