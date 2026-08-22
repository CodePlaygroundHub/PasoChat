import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Star, Clock, Sparkles, X, Loader2, Smile } from "lucide-react";
import { STICKER_PACKS, ALL_STICKERS } from "../constants/stickers";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const LOCAL_STORAGE_RECENTS_KEY = "paso_recent_stickers";
const LOCAL_STORAGE_FAVORITES_KEY = "paso_favorite_stickers";

const StickerPicker = ({ onSelect, onClose }) => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [recents, setRecents] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoadingUserPrefs, setIsLoadingUserPrefs] = useState(false);
  const searchInputRef = useRef(null);

  // Sync user favorites and recents from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        setIsLoadingUserPrefs(true);
        const res = await axiosInstance.get("/stickers/user-data");
        if (isMounted && res.data) {
          if (Array.isArray(res.data.favoriteStickers)) {
            setFavorites(res.data.favoriteStickers);
            localStorage.setItem(
              LOCAL_STORAGE_FAVORITES_KEY,
              JSON.stringify(res.data.favoriteStickers)
            );
          }
          if (Array.isArray(res.data.recentStickers)) {
            setRecents(res.data.recentStickers);
            localStorage.setItem(
              LOCAL_STORAGE_RECENTS_KEY,
              JSON.stringify(res.data.recentStickers)
            );
          }
        }
      } catch (err) {
        // Silently use localStorage fallback
      } finally {
        if (isMounted) setIsLoadingUserPrefs(false);
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleFavorite = async (e, stickerUrl) => {
    e.stopPropagation();
    const isFav = favorites.includes(stickerUrl);
    const updated = isFav
      ? favorites.filter((url) => url !== stickerUrl)
      : [stickerUrl, ...favorites];

    setFavorites(updated);
    localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(updated));

    try {
      await axiosInstance.post("/stickers/favorites/toggle", { stickerUrl });
      toast.success(isFav ? "Removed from Favorites" : "Added to Favorites", {
        id: "sticker-fav",
        duration: 1500,
      });
    } catch (error) {
      // Backend error fallback
    }
  };

  const handleStickerClick = async (sticker) => {
    // Record to recents
    const updatedRecents = [
      sticker.url,
      ...recents.filter((url) => url !== sticker.url),
    ].slice(0, 30);

    setRecents(updatedRecents);
    localStorage.setItem(
      LOCAL_STORAGE_RECENTS_KEY,
      JSON.stringify(updatedRecents)
    );

    try {
      axiosInstance.post("/stickers/recents", { stickerUrl: sticker.url }).catch(() => {});
    } catch {
      // Ignore background sync errors
    }

    onSelect(sticker.url);
    if (onClose) onClose();
  };

  // Filtered stickers based on search query
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    return ALL_STICKERS.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.packName.toLowerCase().includes(query) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(query)))
    );
  }, [searchQuery]);

  // Stickers to render depending on selectedTab
  const favoriteStickersList = useMemo(() => {
    return favorites
      .map((url) => ALL_STICKERS.find((s) => s.url === url) || { id: url, name: "Favorite", url })
      .filter(Boolean);
  }, [favorites]);

  const recentStickersList = useMemo(() => {
    return recents
      .map((url) => ALL_STICKERS.find((s) => s.url === url) || { id: url, name: "Recent", url })
      .filter(Boolean);
  }, [recents]);

  return (
    <div className="flex flex-col w-full sm:w-[360px] h-[440px] bg-base-100/95 backdrop-blur-md border border-base-300 sm:rounded-2xl shadow-2xl overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-base-300 bg-base-200/40">
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <h3 className="font-bold text-sm tracking-wide text-base-content">Sticker Packs</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-base-content"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-base-300/60 bg-base-100">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stickers by name, mood, meme..."
            className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm rounded-xl bg-base-200/80 focus:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-base-content placeholder:text-base-content/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Pack / Category Navigation Bar */}
      {!searchResults && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-base-300 bg-base-200/30 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedTab("all")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedTab === "all"
                ? "bg-primary text-primary-content shadow-sm scale-105"
                : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
            }`}
          >
            <Sparkles size={13} />
            <span>All</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("recents")}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedTab === "recents"
                ? "bg-primary text-primary-content shadow-sm scale-105"
                : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
            }`}
            title="Recently Used"
          >
            <Clock size={13} />
            <span>Recent</span>
            {recents.length > 0 && (
              <span className="text-[10px] opacity-80">({recents.length})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("favorites")}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              selectedTab === "favorites"
                ? "bg-primary text-primary-content shadow-sm scale-105"
                : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
            }`}
            title="Favorite Stickers"
          >
            <Star size={13} className={favorites.length > 0 ? "fill-warning text-warning" : ""} />
            <span>Favs</span>
            {favorites.length > 0 && (
              <span className="text-[10px] opacity-80">({favorites.length})</span>
            )}
          </button>

          <div className="h-4 w-[1px] bg-base-300 mx-0.5" />

          {STICKER_PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => setSelectedTab(pack.id)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTab === pack.id
                  ? "bg-primary text-primary-content shadow-sm scale-105"
                  : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <span>{pack.icon}</span>
              <span>{pack.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Sticker Content Grid */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-base-300">
        {/* Search View */}
        {searchResults ? (
          <div>
            <div className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider mb-2 px-1">
              Search Results ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-base-content/50">
                <Smile size={32} className="mb-2 opacity-40" />
                <p className="text-xs font-semibold">No stickers found</p>
                <p className="text-[11px] text-base-content/40 mt-0.5">
                  Try searching for another word or emotion
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {searchResults.map((sticker) => (
                  <StickerTile
                    key={sticker.id + sticker.url}
                    sticker={sticker}
                    isFavorite={favorites.includes(sticker.url)}
                    onSelect={handleStickerClick}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        ) : selectedTab === "recents" ? (
          /* Recents Tab */
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                Recently Used
              </span>
              {recents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRecents([]);
                    localStorage.removeItem(LOCAL_STORAGE_RECENTS_KEY);
                  }}
                  className="text-[10px] text-error/80 hover:text-error transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {recentStickersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-base-content/50">
                <Clock size={32} className="mb-2 opacity-40" />
                <p className="text-xs font-semibold">No recent stickers yet</p>
                <p className="text-[11px] text-base-content/40 mt-0.5">
                  Send stickers to see them appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {recentStickersList.map((sticker, idx) => (
                  <StickerTile
                    key={sticker.url + idx}
                    sticker={sticker}
                    isFavorite={favorites.includes(sticker.url)}
                    onSelect={handleStickerClick}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        ) : selectedTab === "favorites" ? (
          /* Favorites Tab */
          <div>
            <div className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider mb-2 px-1">
              Favorite Stickers
            </div>
            {favoriteStickersList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-base-content/50">
                <Star size={32} className="mb-2 opacity-40" />
                <p className="text-xs font-semibold">No favorites yet</p>
                <p className="text-[11px] text-base-content/40 mt-0.5">
                  Hover over any sticker and click the star to save it
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {favoriteStickersList.map((sticker) => (
                  <StickerTile
                    key={sticker.url}
                    sticker={sticker}
                    isFavorite={true}
                    onSelect={handleStickerClick}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        ) : selectedTab === "all" ? (
          /* All Packs Combined View */
          <div className="space-y-4">
            {STICKER_PACKS.map((pack) => (
              <div key={pack.id} className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-sm">{pack.icon}</span>
                  <span className="text-xs font-bold text-base-content/70">
                    {pack.name}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {pack.stickers.map((sticker) => (
                    <StickerTile
                      key={sticker.id}
                      sticker={sticker}
                      isFavorite={favorites.includes(sticker.url)}
                      onSelect={handleStickerClick}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Pack View */
          <div>
            {(() => {
              const currentPack = STICKER_PACKS.find((p) => p.id === selectedTab);
              if (!currentPack) return null;
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 px-1 mb-2">
                    <span className="text-base">{currentPack.icon}</span>
                    <span className="text-xs font-bold text-base-content/80">
                      {currentPack.name} Pack
                    </span>
                    <span className="text-[10px] text-base-content/40 ml-auto">
                      {currentPack.stickers.length} stickers
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {currentPack.stickers.map((sticker) => (
                      <StickerTile
                        key={sticker.id}
                        sticker={sticker}
                        isFavorite={favorites.includes(sticker.url)}
                        onSelect={handleStickerClick}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Footer / Tip */}
      <div className="px-3 py-1.5 border-t border-base-300 bg-base-200/30 text-[10px] text-base-content/50 flex items-center justify-between">
        <span>Click to send sticker</span>
        <span>⭐ Hover to favorite</span>
      </div>
    </div>
  );
};

// Sub-component for individual sticker item with hover effects and star toggle
const StickerTile = ({ sticker, isFavorite, onSelect, onToggleFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative group aspect-square rounded-xl bg-base-200/50 hover:bg-base-200/90 border border-transparent hover:border-primary/30 transition-all duration-150 flex items-center justify-center p-1.5 cursor-pointer overflow-hidden">
      <button
        type="button"
        onClick={() => onSelect(sticker)}
        className="w-full h-full flex items-center justify-center focus:outline-none"
        title={sticker.name}
      >
        <img
          src={sticker.url}
          alt={sticker.name || "Sticker"}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-contain transition-transform duration-200 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={14} className="animate-spin text-base-content/20" />
          </div>
        )}
      </button>

      {/* Favorite Star Button on hover */}
      <button
        type="button"
        onClick={(e) => onToggleFavorite(e, sticker.url)}
        className={`absolute top-1 right-1 p-1 rounded-full transition-all duration-150 ${
          isFavorite
            ? "opacity-100 bg-base-100/90 text-warning shadow-sm"
            : "opacity-0 group-hover:opacity-100 bg-base-100/80 text-base-content/50 hover:text-warning hover:bg-base-100 shadow-sm"
        }`}
        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      >
        <Star
          size={12}
          className={isFavorite ? "fill-warning text-warning" : ""}
        />
      </button>
    </div>
  );
};

export default StickerPicker;