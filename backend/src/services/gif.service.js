import axios from "axios";

const GIPHY_BASE_URL = "https://api.giphy.com/v1/gifs";
const DEFAULT_LIMIT = 24;

const mapGif = (gif) => ({
  id: gif.id,
  title: gif.title,
  previewUrl: gif.images?.fixed_width_small?.url || gif.images?.fixed_width?.url,
  url: gif.images?.original?.url,
  width: gif.images?.fixed_width?.width,
  height: gif.images?.fixed_width?.height,
});

const buildResult = (data) => {
  const gifs = (data?.data || []).map(mapGif);

  const pagination = data?.pagination || {};
  const paginationOffset = pagination.offset || 0;
  const paginationCount = pagination.count || 0;
  const totalCount = pagination.total_count || 0;
  const hasMore = paginationOffset + paginationCount < totalCount;

  return { gifs, hasMore };
};

const ensureApiKey = () => {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey || apiKey === "your_giphy_api_key") {
    const err = new Error("Giphy API key not configured");
    err.code = "GIF_PROVIDER_NOT_CONFIGURED";
    throw err;
  }
  return apiKey;
};

export const getTrendingGifs = async ({ offset = 0, limit = DEFAULT_LIMIT } = {}) => {
  const apiKey = ensureApiKey();

  const response = await axios.get(`${GIPHY_BASE_URL}/trending`, {
    params: {
      api_key: apiKey,
      limit,
      offset,
      rating: "pg-13",
    },
    timeout: 8000,
  });

  return buildResult(response.data);
};

export const searchGifs = async ({ query, offset = 0, limit = DEFAULT_LIMIT }) => {
  const apiKey = ensureApiKey();

  const response = await axios.get(`${GIPHY_BASE_URL}/search`, {
    params: {
      api_key: apiKey,
      q: query,
      limit,
      offset,
      rating: "pg-13",
    },
    timeout: 8000,
  });

  return buildResult(response.data);
};