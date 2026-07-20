import express from "express";
import { trendingGifs, searchGifsHandler } from "../controllers/gif.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { gifRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/**
 * GET /api/gif/trending
 * Protected + rate-limited proxy to the Giphy trending endpoint.
 * Keeps the Giphy API key server-side only.
 */
router.get("/trending", protectRoute, gifRateLimiter, trendingGifs);

/**
 * GET /api/gif/search?query=hello
 * Protected + rate-limited proxy to the Giphy search endpoint.
 */
router.get("/search", protectRoute, gifRateLimiter, searchGifsHandler);

export default router;