import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetFavoritesQuery, useRemoveFavoriteMutation } from "../../redux/api/favorite";
import { Heart, Trash2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const Favorite = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [removingIds, setRemovingIds] = useState(new Set());
  const { data: favorites, isLoading, isError, refetch } = useGetFavoritesQuery(
    undefined,
    { skip: !userInfo?.token },
  );
  const [removeFavorite] = useRemoveFavoriteMutation();

  const handleRemoveFavorite = async (artworkId) => {
    if (removingIds.has(artworkId)) return;
    setRemovingIds((prev) => new Set(prev).add(artworkId));
    try {
      await removeFavorite({ artworkId }).unwrap();
      toast.success("Removed from favorites");
      refetch();
    } catch (err) {
      toast.error(err?.data?.errors?.[0]?.msg || "Failed to remove favorite");
    } finally {
      setRemovingIds((prev) => { const s = new Set(prev); s.delete(artworkId); return s; });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-rose-400 gap-4">
        <AlertCircle className="w-12 h-12" />
        <p className="font-semibold text-lg">Failed to load favorites</p>
        <button
          onClick={refetch}
          className="px-6 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-white transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-100 p-6 pt-28">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Favorites List Section */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl font-light tracking-tighter text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
              YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500 italic">
                FAVORITES.
              </span>
              <Heart className="w-8 h-8 text-fuchsia-500 ml-2" />
            </h1>
            <p className="text-zinc-600 dark:text-zinc-500">
              {favorites?.length || 0} {(favorites?.length === 1) ? "item" : "items"} currently saved.
            </p>
          </div>

          {!favorites || favorites.length === 0 ? (
            <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl flex flex-col items-center text-center">
              <Heart className="w-16 h-16 text-zinc-400 dark:text-zinc-800 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">No favorites yet</h2>
              <p className="text-zinc-500 mb-6">Looks like you haven't liked any artwork yet.</p>
              <Link
                to="/"
                className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Discover Artworks
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Subtle visual element */}
              <div className="absolute top-0 -left-10 w-40 h-40 bg-fuchsia-600/5 rounded-full blur-3xl pointer-events-none" />

              {favorites.map((fav) => {
                if (!fav.artworkId) return null; // Safety check in case of deleted artworks nullifying population
                return (
                  <div
                    key={fav._id}
                    className="flex flex-col p-4 rounded-2xl bg-white/90 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-colors group relative overflow-hidden shadow-sm dark:shadow-none"
                  >
                    <div className="relative overflow-hidden rounded-xl w-full h-48 mb-4">
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${fav.artworkId.image}`}
                        alt={fav.artworkId.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-transparent transition-colors" />
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFavorite(fav.artworkId._id);
                        }}
                        disabled={removingIds.has(fav.artworkId._id)}
                        className="absolute top-3 right-3 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-rose-500 hover:bg-black/60 transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from favorites"
                      >
                        {removingIds.has(fav.artworkId._id)
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-medium truncate text-zinc-900 dark:text-white">{fav.artworkId.title}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-500 mt-1 mb-4">${fav.artworkId.price}</p>
                      
                      <Link
                        to={`/view-3d/${fav.artworkId._id}`}
                        className="mt-auto w-full border border-zinc-300 text-zinc-900 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-100 dark:border-white/10 dark:text-white dark:hover:bg-white/5 transition-all text-sm"
                      >
                        View Artwork
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorite;
