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
  const isFirstRender = useRef(true);

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
        ? {
            query: searchQuery.trim(),
            offset: currentOffset,
          }
        : {
            offset: currentOffset,
          };

      const res = await axiosInstance.get(endpoint, { params });

      if (requestId !== requestIdRef.current) return;

      setGifs((prev) =>
        append ? [...prev, ...res.data.gifs] : res.data.gifs
      );

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

  useEffect(() => {
    fetchGifs("", 0, false);
  }, [fetchGifs]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

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
    <div className="flex h-96 w-full flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-xl sm:w-80 dark:border-zinc-800/90 dark:bg-[#141313]">
      {/* Search Header */}
      <div className="flex items-center gap-2 border-b border-zinc-200/80 px-3 py-2.5 dark:border-zinc-800/80">
        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 stroke-[1.75] text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            autoFocus
            className="h-8 w-full rounded-md border border-zinc-200 bg-zinc-50/70 pl-8 pr-7 text-xs text-zinc-900 placeholder:text-zinc-400 transition-colors focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-900"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-3 w-3 stroke-[1.75]" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close GIF picker"
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4 stroke-[1.75]" />
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {isLoading && (
          <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin stroke-[1.75]" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {error}
          </div>
        )}

        {!isLoading && !error && gifs.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
            No GIFs found
          </div>
        )}

        {!isLoading && !error && gifs.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => onSelect(gif.url)}
                className="group relative overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-50 transition-colors hover:border-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-600 cursor-pointer"
              >
                <img
                  src={gif.previewUrl}
                  alt={gif.title || "GIF"}
                  loading="lazy"
                  className="h-24 w-full object-cover"
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
            className="mt-2.5 flex h-8 w-full cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-white"
          >
            {isLoadingMore ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[1.75]" />
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