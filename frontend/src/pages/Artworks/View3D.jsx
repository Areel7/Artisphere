import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSingleArtworkQuery } from "../../redux/api/artwork";
import { artistLabel, artworkTitle } from "../../utils/artworkMeta.js";
import ThreeDModal from "../../components/ThreeDModal";

const View3D = () => {
  const { id } = useParams();
  const { data: artwork, isLoading, isError } = useGetSingleArtworkQuery(id);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-white/10 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !artwork) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-6">
        <p className="text-xl font-medium text-white/70">Artwork not found</p>
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
        onClose={() => navigate(-1)}
      />
    </div>
  );
};

export default View3D;
