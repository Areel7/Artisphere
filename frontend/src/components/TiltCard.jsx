import React, { useRef, useState, useCallback } from "react";
import { Layers, Heart, Maximize, ShoppingCart, Trash } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAddToCartMutation } from "../redux/api/cart";
import { useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from "../redux/api/favorite";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const TiltCard = ({ artwork, handleDelete }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [pendingCart, setPendingCart] = useState(false);
  const [pendingFav, setPendingFav] = useState(false);
  const userInfo = useSelector((state) => state.auth.userInfo);

  const [addToCart] = useAddToCartMutation();
  const { data: favorites } = useGetFavoritesQuery(undefined, {
    skip: !userInfo?.token,
  });
  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();
  const navigate = useNavigate();

  const isLiked = favorites?.some((fav) => fav.artworkId && fav.artworkId._id === artwork._id);

  const handleAddToCart = async (id) => {
    if (!userInfo) { toast.error("Please login to add to cart"); return; }
    if (pendingCart) return;
    setPendingCart(true);
    try {
      await addToCart({ artworkId: id }).unwrap();
      toast.success("Artwork added to cart");
    } catch (error) {
      toast.error(error?.data?.message || error?.data?.errors?.[0]?.msg || "Error");
    } finally {
      setPendingCart(false);
    }
  };

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    if (!userInfo) { toast.error("Please login to add to favorites"); return; }
    if (pendingFav) return;
    setPendingFav(true);
    try {
      if (isLiked) {
        await removeFavorite({ artworkId: artwork._id }).unwrap();
        toast.success("Removed from favorites");
      } else {
        await addFavorite({ artworkId: artwork._id }).unwrap();
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error?.data?.errors?.[0]?.msg || "Failed to update favorites");
    } finally {
      setPendingFav(false);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / rect.height) * 20;
    const rotateY = (x / rect.width) * 20;
    setRotation({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  const location = useLocation();

  return (
    <div
      className="relative group perspective-1000"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[3/4] rounded-xl transition-all duration-300 ease-out bg-zinc-200 dark:bg-zinc-900 border border-zinc-200/80 dark:border-white/5"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovering ? 1.02 : 1})`,
          transformStyle: "preserve-3d",
          boxShadow: isHovering
            ? "0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.05)"
            : "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Artwork Image */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ transform: "translateZ(0px)" }}
        >
          <img
            src={`${import.meta.env.VITE_BASE_URL}${artwork.image}`}
            alt={artwork.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            style={{ filter: isHovering ? "blur(2px) brightness(0.55)" : "blur(0px) brightness(1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Top Badges (Lifted in 3D space) */}
        <div
          className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="flex flex-col gap-1">
            {artwork.story && (
              <>
                <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] uppercase tracking-wider flex items-center gap-1 border border-white/10 text-white/90 self-start">
                  <Layers className="w-3 h-3" /> Story
                </span>{/* Story excerpt — fades in on hover */}
          <p
            className="text-white/70 text-xs italic leading-relaxed mb-2 line-clamp-2 transition-all duration-500"
            style={{
              opacity: isHovering ? 1 : 0,
              transform: isHovering ? "translateY(0)" : "translateY(6px)",
            }}
          >
            {artwork.story
              ? artwork.story.split(".")[0].trim() + "."
              : ""}
          </p>
              </>
            )}
          </div>

          {location.pathname === "/artist/my-artworks" ? (
            ""
          ): (<button
              onClick={handleFavoriteToggle}
              disabled={pendingFav}
              className="pointer-events-auto p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-white/20 transition-colors border border-white/10 disabled:opacity-50"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
              />
            </button>)}
        </div>

        {/* Hover Actions (Center) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"
          style={{ transform: "translateZ(60px)" }}
        >
          <button onClick={() => navigate(`/view-3d/${artwork._id}`)} className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform">
            <Maximize className="w-4 h-4" /> View in 3D
          </button>
        </div>

        {/* Bottom Content */}
        <div
          className="absolute bottom-0 left-0 p-5 w-full pointer-events-none"
          style={{ transform: "translateZ(30px)" }}
        >
          

          <p className="text-white/60 text-xs tracking-widest font-medium mb-1 uppercase">
            {artwork.description?.slice(0, 40)}{artwork.description?.length > 40 ? "…" : ""}
          </p>
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
            {artwork.title}
          </h3>
          <p className="text-white/70 font-light text-sm mb-4">
            {artwork.artistId?.username ||
              (typeof artwork.artistId === "string"
                ? artwork.artistId
                : "Unknown Artist")}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 pointer-events-auto">
            <span className="text-lg font-light text-white">
              ${artwork.price.toLocaleString()}
            </span>

            {location.pathname === "/artist/my-artworks" ? (
              <button
                onClick={() => handleDelete(artwork._id)}
                className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-red-500 group/btn"
              >
                Delete
                <Trash className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => handleAddToCart(artwork._id)}
                disabled={pendingCart}
                className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white group/btn disabled:opacity-50"
              >
                Add to Cart
                <ShoppingCart className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiltCard;
