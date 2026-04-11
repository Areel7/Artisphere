import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers } from 'lucide-react';
import { useGetAllArtworksQuery } from '../../redux/api/artwork';
import ThreeDGallery from '../../components/ThreeDGallery';
import ThreeDModal from '../../components/ThreeDModal';

const GalleryPage = () => {
  const { data: artworks, isLoading, error } = useGetAllArtworksQuery();
  const [selectedImage, setSelectedImage] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(73);
  const navigate = useNavigate();

  // Match the same nav-height detection used in ThreeDModal
  useEffect(() => {
    const nav = document.querySelector('nav');
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
    art?.image ? `${import.meta.env.VITE_BASE_URL}${art.image}` : null;

  return (
    <>
      <div
        className="relative z-10 flex flex-col text-zinc-900 dark:text-white"
        style={{ paddingTop: headerHeight, minHeight: 'calc(100vh - 100px)' }}
      >

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex-none flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-white/5 bg-white/85 dark:bg-black/30 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back
        </button>

        <div className="flex items-center gap-2.5">
          {/* Animated galaxy pulse indicator */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            3D Gallery
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-600 text-xs">
          <Layers size={12} />
          {isLoading ? '…' : `${artworks?.length ?? 0} artworks`}
        </div>
      </div>

      {/* ── Hero label ──────────────────────────────────────────────────────── */}
      <div className="flex-none px-8 pt-6 pb-3 text-center pointer-events-none select-none">
        <h1
          className="text-3xl md:text-4xl font-black tracking-tight leading-tight"
          style={{
            background: 'linear-gradient(135deg, #e2d9ff 0%, #b8a4f8 35%, #7c6ee0 70%, #4a3fa0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Virtual Art Gallery
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-500 text-xs max-w-sm mx-auto">
          Orbit the space · Click any frame to explore in full 3D
        </p>
      </div>

      {/* ── 3D Canvas fills remaining height ────────────────────────────────── */}
      <div className="flex-1 px-4 pb-4 min-h-[600px] mb-10 flex flex-col">
        {isLoading ? (
          <div className="flex-1 w-full rounded-2xl border border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-white/2 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-zinc-200 dark:border-white/10 border-t-violet-500 dark:border-t-violet-400 animate-spin" />
            <p className="text-zinc-600 dark:text-zinc-500 text-sm animate-pulse">Loading artworks…</p>
          </div>
        ) : error ? (
          <div className="flex-1 w-full rounded-2xl border border-red-500/20 bg-zinc-50 dark:bg-white/2 flex items-center justify-center">
            <p className="text-red-400 text-sm">
              Failed to load artworks — {error?.message ?? 'Unknown error'}
            </p>
          </div>
        ) : (
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0">
              <ThreeDGallery
                artworks={artworks ?? []}
                onSelect={(art) => setSelectedImage(imageOf(art))}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Footer hint ───────────────────────────────────────────────────────
      <div className="flex-none text-center py-2.5 text-zinc-700 text-xs border-t border-white/5">
        Drag to orbit &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Click artwork to view in 3D
      </div> */}

      {/* ── 3D detail modal ─────────────────────────────────────────────────── */}
      {selectedImage && (
        <ThreeDModal
          imageSrc={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
    </>
  );
};

export default GalleryPage;
