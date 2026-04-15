import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Layers } from "lucide-react";
import { useGetExhibitionByIdQuery } from "../../redux/api/exhibition.js";
import { artistLabel, artworkTitle } from "../../utils/artworkMeta.js";
import ThreeDGallery from "../../components/ThreeDGallery.jsx";
import ThreeDModal from "../../components/ThreeDModal.jsx";
import ExhibitionChatPanel from "../../components/ExhibitionChatPanel.jsx";

const ExhibitionRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(73);

  const { data: exhibition, isLoading, isError, error } =
    useGetExhibitionByIdQuery(id, { skip: !id });

  const artworks = useMemo(() => {
    const raw = exhibition?.artworkIds;
    if (!Array.isArray(raw)) return [];
    return raw.filter((a) => a && a.image);
  }, [exhibition]);

  useEffect(() => {
    const nav = document.querySelector("nav");
    if (!nav) return;
    const update = () => {
      const h = nav.getBoundingClientRect().height;
      if (h > 0) setHeaderHeight(h);
    };
    requestAnimationFrame(update);
    const ro = new ResizeObserver(update);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);

  const imageOf = (art) =>
    art?.image
      ? art.image.startsWith("http")
        ? art.image
        : `${import.meta.env.VITE_BASE_URL}${art.image}`
      : null;

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-4"
        style={{ paddingTop: headerHeight }}
      >
        <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-violet-400 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading exhibition room…</p>
      </div>
    );
  }

  if (isError || !exhibition) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-6 px-4"
        style={{ paddingTop: headerHeight }}
      >
        <p className="text-xl text-white/70 text-center">
          {error?.data?.errors?.[0]?.msg ?? "Exhibition not found"}
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-white/10 border border-white/15 rounded-xl hover:bg-white/15 text-sm"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative z-10 flex flex-col text-white"
        style={{
          paddingTop: headerHeight,
          minHeight: "calc(100vh - 100px)",
        }}
      >
        <div className="flex-none flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/30 backdrop-blur-md">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back
          </button>

          <div className="flex flex-col items-center min-w-0 px-2">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300 truncate max-w-[200px] md:max-w-md">
              {exhibition.title}
            </span>
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
              3D gallery room
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 text-xs">
            <Layers size={12} />
            {artworks.length} pieces
          </div>
        </div>

        <div className="flex-none px-8 pt-6 pb-3 text-center pointer-events-none select-none">
          <p className="text-zinc-500 text-xs max-w-md mx-auto">
            You are inside a virtual room · Click any frame for full 3D view
          </p>
        </div>

        <div className="flex-1 px-4 pb-4 mb-6 flex flex-col xl:flex-row gap-4 xl:items-stretch xl:max-w-[100rem] xl:mx-auto w-full min-h-0">
          <div className="flex-1 min-h-[420px] md:min-h-[520px] flex flex-col min-w-0">
            {artworks.length === 0 ? (
              <div className="flex-1 w-full rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-3 p-8">
                <p className="text-zinc-400 text-sm text-center">
                  This exhibition has no artwork images to show in 3D yet.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-violet-400 text-sm hover:underline"
                >
                  Return home
                </button>
              </div>
            ) : (
              <div className="flex-1 w-full min-h-[420px] relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0">
                  <ThreeDGallery
                    variant="interior"
                    artworks={artworks}
                    onSelect={(art) => setSelectedArtwork(art)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="w-full xl:w-[380px] shrink-0 flex flex-col">
            <ExhibitionChatPanel exhibitionId={id} />
          </div>
        </div>

        {artworks.length > 0 && (
          <div className="flex-none px-4 md:px-8 pb-10 max-w-6xl mx-auto w-full">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Works in this exhibition
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.map((art) => (
                <li key={art._id}>
                  <button
                    type="button"
                    onClick={() => setSelectedArtwork(art)}
                    className="w-full text-left rounded-xl overflow-hidden border border-white/10 bg-zinc-900/40 hover:border-violet-500/40 hover:bg-zinc-900/70 transition-colors"
                  >
                    <div className="aspect-square bg-zinc-800">
                      {art.image ? (
                        <img
                          src={imageOf(art)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-white line-clamp-2">
                        {artworkTitle(art)}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1 truncate">
                        {artistLabel(art)
                          ? `by ${artistLabel(art)}`
                          : "Artist unknown"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedArtwork && (
          <ThreeDModal
            imageSrc={imageOf(selectedArtwork)}
            title={artworkTitle(selectedArtwork)}
            artistName={artistLabel(selectedArtwork) || undefined}
            story={selectedArtwork.story}
            onClose={() => setSelectedArtwork(null)}
          />
        )}
      </div>
    </>
  );
};

export default ExhibitionRoomPage;
