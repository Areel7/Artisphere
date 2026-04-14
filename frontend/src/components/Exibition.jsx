import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Play, PlusCircle, Loader2 } from "lucide-react";
import { useGetExhibitionsQuery } from "../redux/api/exhibition.js";
import { artistLabel, artworkTitle } from "../utils/artworkMeta.js";
import { motion } from "framer-motion"; // used: motion.div, motion.article


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const imgBase = import.meta.env.VITE_BASE_URL ?? "";

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const opts = { month: "short", day: "numeric", year: "numeric" };
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

function coverImage(ex) {
  const first = ex.artworkIds?.[0];
  if (first?.image) {
    const path = first.image.startsWith("http")
      ? first.image
      : `${imgBase}${first.image}`;
    return path;
  }
  return "https://images.unsplash.com/photo-1518998053901-5314c32943e6?auto=format&fit=crop&q=80&w=1200";
}

const Exibition = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isCurator = userInfo?.role === "curator";
  const { data, isLoading, isError } = useGetExhibitionsQuery();
  const exhibitions = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  return (
    <section className="relative py-20 md:py-28 px-6 bg-zinc-100/80 dark:bg-zinc-950/80 border-y border-zinc-200 dark:border-white/5 overflow-hidden text-zinc-900 dark:text-white backdrop-blur-md" id="exhibitions">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[40rem] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[90rem] mx-auto relative z-10">

        {/* ── Centered Header ── */}
        <motion.div
          className="flex flex-col items-center text-center gap-5 mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold tracking-widest uppercase">
            Exclusive Spaces
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-zinc-900 dark:text-white">
            Curated &nbsp;
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500">
              Exhibitions
            </span>
          </h2>
          <p className="text-zinc-600 dark:text-white/60 text-lg font-light leading-relaxed">
            Step into scheduled, immersive virtual gallery spaces crafted by top curators. Exclusive, time-limited art shows you can walk through from your browser.
          </p>
          {isCurator && (
            <Link
              to="/curator/select-exhibition-artworks"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Exhibition
            </Link>
          )}
        </motion.div>

        {/* ── Cards Grid ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32 text-zinc-500 dark:text-zinc-500 bg-white/60 dark:bg-white/5 rounded-[3rem] border border-zinc-200 dark:border-white/5">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="tracking-widest uppercase text-xs">Curating Spaces...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center text-center text-rose-400 py-24 bg-rose-500/5 rounded-[3rem] border border-rose-500/10">
            <p className="text-lg font-light">Could not connect to the gallery servers.</p>
            <p className="text-sm opacity-60">Please try refreshing.</p>
          </div>
        ) : exhibitions.length === 0 ? (
          <div className="flex flex-col items-center text-center text-zinc-600 dark:text-white/50 py-32 border border-dashed border-zinc-300 dark:border-white/10 rounded-[3rem] bg-white/50 dark:bg-zinc-950/50">
            <p className="text-xl font-light mb-1">The Gallery Floor is Empty</p>
            <p className="text-sm opacity-60 max-w-sm mb-6">No scheduled exhibitions yet. Check back soon.</p>
            {isCurator && (
              <Link to="/curator/select-exhibition-artworks" className="px-6 py-2.5 rounded-full bg-zinc-900/10 text-zinc-900 text-xs font-semibold hover:bg-zinc-900/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-colors tracking-widest uppercase">
                Create Genesis Exhibition
              </Link>
            )}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {exhibitions.map((ex) => {
              const curatorName = ex.curatorId?.username || "Curator";
              const dates = formatDateRange(ex.startDate, ex.endDate);
              const pieces = Array.isArray(ex.artworkIds) ? ex.artworkIds : [];

              return (
                <motion.article
                  key={ex._id}
                  variants={fadeUp}
                  className="group relative flex flex-col rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-zinc-900 overflow-hidden shadow-2xl aspect-[4/3]"
                >
                  <img
                    src={coverImage(ex)}
                    alt={ex.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 group-hover:blur-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

                  <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
                    {dates && (
                      <span className="inline-block bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-3 w-fit">
                        {dates}
                      </span>
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-1">
                      {ex.title}
                    </h3>
                    <p className="text-white/70 text-sm font-light mb-0">
                      Curated by <span className="text-white font-medium">{curatorName}</span>
                    </p>

                    {/* Hover reveal — hidden on mobile (always shown on mobile) */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out overflow-hidden hidden sm:grid">
                      <div className="overflow-hidden">
                        {ex.description && (
                          <p className="text-white/80 text-sm leading-relaxed mt-4 italic line-clamp-2">
                            {ex.description}
                          </p>
                        )}
                        {pieces.length > 0 && (
                          <div className="pt-4 mt-3 border-t border-white/20">
                            <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Featured Artworks</p>
                            <ul className="space-y-1.5">
                              {pieces.slice(0, 3).map((a) => (
                                <li key={a._id ?? String(a)} className="text-sm text-zinc-200 truncate">
                                  <span className="text-white font-medium">{artworkTitle(a)}</span>
                                  {artistLabel(a) && <span className="text-zinc-500"> · {artistLabel(a)}</span>}
                                </li>
                              ))}
                            </ul>
                            {pieces.length > 3 && (
                              <p className="text-xs text-zinc-500 mt-2">+ {pieces.length - 3} more pieces inside</p>
                            )}
                          </div>
                        )}
                        <Link
                          to={`/exhibition/${ex._id}/room`}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 mt-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors w-full"
                        >
                          <Play className="w-4 h-4 fill-black" /> Enter 3D Room
                        </Link>
                      </div>
                    </div>

                    {/* Mobile always-visible button */}
                    <div className="sm:hidden mt-4">
                      <Link
                        to={`/exhibition/${ex._id}/room`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold border border-white/30 hover:bg-white hover:text-black transition-all w-full"
                      >
                        <Play className="w-4 h-4 fill-current" /> Enter 3D Room
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Exibition;
