import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Box } from "lucide-react";
import FBXViewer from "../../components/FBXViewer";

const GalleryPage = () => {
  const [headerHeight, setHeaderHeight] = useState(73);
  const navigate = useNavigate();

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

  return (
    <>
      <div
        className="relative z-10 flex flex-col text-zinc-900 dark:text-white"
        style={{ paddingTop: headerHeight, minHeight: "calc(100vh - 100px)" }}
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
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
              3D Gallery
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-600 text-xs">
            <Box size={12} />
            FBX Model View
          </div>
        </div>

        {/* ── Hero label ──────────────────────────────────────────────────────── */}
        <div className="flex-none px-8 pt-6 pb-3 text-center pointer-events-none select-none">
          <h1
            className="text-3xl md:text-4xl font-light tracking-tight leading-tight"
            style={{
              background:
                "linear-gradient(135deg, #e2d9ff 0%, #b8a4f8 35%, #7c6ee0 70%, #4a3fa0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Virtual{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500 italic">
              Art Gallery
            </span>
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-500 text-xs max-w-sm mx-auto">
            Drag to orbit · Scroll to zoom · Explore in full 3D
          </p>
        </div>

        {/* ── FBX Viewer fills remaining height ───────────────────────────────── */}
        <div className="flex-1 px-4 pb-4 min-h-[600px] mb-10 flex flex-col">
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0">
              <FBXViewer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryPage;
