import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Image, Loader2 } from "lucide-react";
import { useGetAllArtworksQuery } from "../../redux/api/artwork.js";
import { artistLabel, artworkTitle } from "../../utils/artworkMeta.js";

const STORAGE_KEY = "curatorExhibitionArtworkIds";

const imgBase = import.meta.env.VITE_BASE_URL ?? "";

const SelectExhibitionArtworks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: artworks, isLoading, isError } = useGetAllArtworksQuery();
  const list = useMemo(() => (Array.isArray(artworks) ? artworks : []), [artworks]);

  const [selectedIds, setSelectedIds] = useState(() => new Set());

  useEffect(() => {
    const fromNav = location.state?.artworkIds;
    if (Array.isArray(fromNav) && fromNav.length > 0) {
      setSelectedIds(new Set(fromNav.map(String)));
      return;
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedIds(new Set(parsed.map(String)));
        }
      }
    } catch {
      /* ignore */
    }
  }, [location.state?.artworkIds, location.key]);

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const s = String(id);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const handleContinue = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    navigate("/curator/create-exhibition", {
      state: { artworkIds: ids },
    });
  };

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 pt-24 pb-32 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-zinc-900 dark:text-white">
              Select{" "}
              <span className="font-serif italic">artworks</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-500 mt-2 max-w-xl">
              Tap images to include them in your exhibition. You’ll add title,
              dates, and description on the next step.
            </p>
          </div>
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm">
            <Image className="w-4 h-4" />
            <span>{selectedIds.size} selected</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-32 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            Loading artworks…
          </div>
        ) : isError ? (
          <p className="text-center text-rose-400 py-20">
            Could not load artworks. Is the API running?
          </p>
        ) : list.length === 0 ? (
          <p className="text-center text-zinc-600 dark:text-zinc-500 py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
            No artworks yet. Ask artists to publish pieces first.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {list.map((art) => {
              const id = String(art._id);
              const on = selectedIds.has(id);
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => toggle(id)}
                  className={`relative text-left rounded-2xl overflow-hidden border-2 transition-all ${
                    on
                      ? "border-violet-600 dark:border-white shadow-md dark:shadow-[0_0_0_1px_rgba(255,255,255,0.2)] ring-2 ring-violet-300 dark:ring-white/25 scale-[1.02]"
                      : "border-zinc-300 dark:border-zinc-800/80 hover:border-zinc-500 dark:hover:border-zinc-600 opacity-90 hover:opacity-100"
                  }`}
                >
                  <div className="aspect-square bg-zinc-200 dark:bg-zinc-900">
                    <img
                      src={`${imgBase}${art.image}`}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 bg-white/95 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-white/5">
                    <p className="text-sm text-zinc-900 dark:text-white font-medium truncate">
                      {artworkTitle(art)}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                      {artistLabel(art)
                        ? `by ${artistLabel(art)}`
                        : "Artist unknown"}
                    </p>
                  </div>
                  {on && (
                    <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-black text-sm font-bold flex items-center justify-center shadow-lg">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 py-4 md:py-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center sm:text-left">
              {selectedIds.size === 0
                ? "Select at least one artwork to continue."
                : `${selectedIds.size} artwork${selectedIds.size === 1 ? "" : "s"} will be in this exhibition.`}
            </p>
            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedIds.size === 0 || isLoading}
              className="inline-flex items-center justify-center gap-2 bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Continue to details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectExhibitionArtworks;
