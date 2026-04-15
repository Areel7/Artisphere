import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetSingleArtworkQuery } from "../../redux/api/artwork";
import { useRecordRecentlyViewedMutation } from "../../redux/api/user";
import { artistLabel, artworkTitle } from "../../utils/artworkMeta.js";
import { addRecentlyViewedArtworkId } from "../../utils/recentlyViewed.js";
import ThreeDModal from "../../components/ThreeDModal";

const View3D = () => {
  const { id } = useParams();
  const { data: artwork, isLoading, isError } = useGetSingleArtworkQuery(id);
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [recordRecentlyViewed] = useRecordRecentlyViewedMutation();

  useEffect(() => {
    if (!artwork?._id) return;
    addRecentlyViewedArtworkId(artwork._id);
    if (userInfo?.token) {
      recordRecentlyViewed(artwork._id).unwrap().catch(() => {});
    }
  }, [artwork?._id, userInfo?.token, recordRecentlyViewed]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-white/10 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !artwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white gap-6">
        <p className="text-xl font-medium text-zinc-600 dark:text-white/70">Artwork not found</p>
        <button 
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
        >
          Discover Artworks
        </button>
      </div>
    );
  }

  const src = artwork.image?.startsWith("http")
    ? artwork.image
    : `${import.meta.env.VITE_BASE_URL}${artwork.image}`;

  return (
    <div className="min-h-screen bg-zinc-950">
      <ThreeDModal
        imageSrc={src}
        title={artworkTitle(artwork)}
        artistName={artistLabel(artwork) || undefined}
        story={artwork.story || undefined}
        onClose={() => navigate(-1)}
      />
    </div>
  );
};

export default View3D;
