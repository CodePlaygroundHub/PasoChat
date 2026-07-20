import { getTrendingGifs, searchGifs } from "../services/gif.service.js";

// GET /api/gif/trending?offset=0
export const trendingGifs = async (req, res) => {
  try {
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await getTrendingGifs({ offset });
    res.status(200).json(result);
  } catch (err) {
    if (err.code === "GIF_PROVIDER_NOT_CONFIGURED") {
      return res.status(503).json({ message: "GIF provider is not configured" });
    }
    console.error("Trending GIFs error:", err.message);
    res.status(502).json({ message: "Failed to load trending GIFs" });
  }
};

// GET /api/gif/search?query=hello&offset=0
export const searchGifsHandler = async (req, res) => {
  try {
    const { query } = req.query;
    const offset = parseInt(req.query.offset, 10) || 0;

    if (!query?.trim()) {
      return res.status(200).json({ gifs: [], hasMore: false });
    }

    const result = await searchGifs({ query: query.trim(), offset });
    res.status(200).json(result);
  } catch (err) {
    if (err.code === "GIF_PROVIDER_NOT_CONFIGURED") {
      return res.status(503).json({ message: "GIF provider is not configured" });
    }
    console.error("GIF search error:", err.message);
    res.status(502).json({ message: "Failed to search GIFs" });
  }
};