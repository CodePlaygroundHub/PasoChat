import { useEffect, useRef, useState, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const GifPicker = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const fetchGifs = useCallback(async (searchQuery, currentOffset, append) => {
    const requestId = ++requestIdRef.current;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const endpoint = searchQuery.trim() ? "/gif/search" : "/gif/trending";
      const params = searchQuery.trim()
        ? { query: searchQuery.trim(), offset: currentOffset }
        : { offset: currentOffset };

      const res = await axiosInstance.get(endpoint, { params });

      // Ignore stale responses if a newer request has since started
      if (requestId !== requestIdRef.current) return;

      setGifs((prev) => (append ? [...prev, ...res.data.gifs] : res.data.gifs));
      setHasMore(res.data.hasMore);
      setOffset(currentOffset);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      const status = err?.response?.status;
      if (status === 503) {
        setError("GIF search isn't available right now.");
      } else {
        setError("Couldn't load GIFs. Please try again.");
      }
      if (!append) setGifs([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  // Load trending GIFs on mount
  useEffect(() => {
    fetchGifs("", 0, false);
  }, [fetchGifs]);

  // Debounced search as the user types
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchGifs(query, 0, false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, fetchGifs]);

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    fetchGifs(query, offset + 24, true);
  };

  return (
    <div className="flex flex-col w-full sm:w-80 h-96 bg-base-100 border border-base-300 sm:rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 p-2 border-b border-base-300">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs"
            autoFocus
            className="w-full pl-8 pr-2 py-1.5 text-sm rounded-lg bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-circle btn-xs"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <div className="flex items-center justify-center h-full text-base-content/50">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center justify-center h-full text-center text-sm text-base-content/50 px-4">
            {error}
          </div>
        )}

        {!isLoading && !error && gifs.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-base-content/50">
            No GIFs found
          </div>
        )}

        {!isLoading && !error && gifs.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => onSelect(gif.url)}
                className="rounded-lg overflow-hidden border border-transparent hover:border-primary transition-colors"
              >
                <img
                  src={gif.previewUrl}
                  alt={gif.title || "GIF"}
                  loading="lazy"
                  className="w-full h-24 object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {!isLoading && !error && hasMore && (
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="btn btn-ghost btn-sm w-full mt-2"
          >
            {isLoadingMore ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Load more"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default GifPicker;