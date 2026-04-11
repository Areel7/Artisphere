import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Play, PlusCircle, Loader2 } from "lucide-react";
import { useGetExhibitionsQuery } from "../redux/api/exhibition.js";
import { artistLabel, artworkTitle } from "../utils/artworkMeta.js";
import { motion } from "framer-motion";

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
  const exhibitions = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  return (
    <>
      <section
        className="relative py-20 md:py-28 px-6 bg-zinc-950 border-t border-white/5 overflow-hidden"
        id="exhibitions"
      >
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[40rem] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-[90rem] mx-auto relative z-10 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4 relative">
            <motion.div 
               className="flex flex-col items-start text-left gap-6 sticky top-32"
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold tracking-widest uppercase">
              Exclusive Spaces
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Curated <br className="hidden lg:block"/> Exhibitions
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Step into scheduled, immersive virtual gallery spaces crafted by top curators. We partner with visionaries around the globe to bring you exclusive, time-limited art shows that you can walk through from your browser.
            </p>
            {isCurator && (
              <Link
                to="/curator/select-exhibition-artworks"
                className="inline-flex items-center gap-2 px-8 py-4 mt-4 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add New Exhibition
              </Link>
            )}
            </motion.div>
          </div>

          <div className="lg:col-span-8">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-32 text-zinc-500 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-sm">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="tracking-widest uppercase text-xs">Curating Spaces...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center text-center text-rose-400 py-24 bg-rose-500/5 rounded-[3rem] border border-rose-500/10">
              <p className="text-lg font-light">Could not connect to the gallery servers.</p>
              <p className="text-sm opacity-60">Please try refreshing the experience.</p>
            </div>
          ) : exhibitions.length === 0 ? (
            <div className="flex flex-col items-center text-center text-white/50 py-32 border border-dashed border-white/10 rounded-[3rem] bg-zinc-950/50 backdrop-blur-sm">
              <Box className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-light mb-1">The Gallery Floor is Empty</p>
              <p className="text-sm opacity-60 max-w-sm mb-6">There are currently no scheduled virtual exhibitions. Check back soon for new curations.</p>
              {isCurator && (
                <Link
                  to="/curator/select-exhibition-artworks"
                  className="px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors tracking-widest uppercase"
                >
                  Create Genesis Exhibition
                </Link>
              )}
            </div>
          ) : (
            <motion.div 
               className="grid grid-cols-1 gap-12 w-full"
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
                    className="group relative flex flex-col rounded-[2.5rem] border border-white/10 bg-zinc-950/80 overflow-hidden shadow-2xl min-h-[30rem] sm:min-h-[auto] sm:aspect-[16/9]"
                  >
                    {/* Full Card Image */}
                    <img
                      src={coverImage(ex)}
                      alt={ex.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    
                    {/* Dark gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 transition-opacity duration-500" />
                    
                    {/* Additional overlay blur on hover for easier reading of lists */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 backdrop-blur-md" />

                    {/* Content Layer */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8 overflow-hidden">
                      <div className="transform transition-transform duration-500 translate-y-0 sm:translate-y-16 group-hover:translate-y-0 flex flex-col justify-end h-full">
                        <div className="mb-2 shrink-0">
                          {dates && (
                            <span className="inline-block bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
                              {dates}
                            </span>
                          )}
                          <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                            {ex.title}
                          </h3>
                          <p className="text-white/75 text-sm md:text-base font-light">
                            Curated by <span className="text-white font-medium">{curatorName}</span>
                          </p>
                        </div>
                        
                        {/* Hidden Reveal Block */}
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out overflow-hidden hidden sm:grid">
                          <div className="overflow-hidden flex flex-col gap-4">
                            {pieces.length > 0 ? (
                              <div className="pt-4 mt-2 border-t border-white/20">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-3">
                                  Featured Artworks
                                </p>
                                <ul className="space-y-2 line-clamp-3 overflow-hidden">
                                  {pieces.slice(0, 3).map((a) => {
                                    const who = artistLabel(a);
                                    return (
                                      <li
                                        key={a._id ?? String(a)}
                                        className="text-sm text-zinc-200 truncate"
                                      >
                                        <span className="text-white font-medium">
                                          {artworkTitle(a)}
                                        </span>
                                        {who && (
                                          <span className="text-zinc-500">
                                            {" "}· {who}
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                                {pieces.length > 3 && (
                                  <p className="text-xs text-zinc-500 mt-3 font-light">
                                    + {pieces.length - 3} more exclusive pieces inside
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-zinc-500 pt-4 mt-2 border-t border-white/20">No artworks currently curated.</p>
                            )}

                            <Link
                              to={`/exhibition/${ex._id}/room`}
                              className="inline-flex items-center justify-center gap-2 px-6 py-4 mt-2 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors w-full"
                            >
                              <Play className="w-4 h-4 fill-black" /> Enter 3D Room
                            </Link>
                          </div>
                        </div>
                        {/* Mobile continuous visibility button fallback */}
                        <div className="sm:hidden mt-6">
                           <Link
                              to={`/exhibition/${ex._id}/room`}
                              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold hover:bg-white border border-white/30 hover:text-black transition-all w-full"
                            >
                              <Play className="w-4 h-4 fill-current" /> Enter 3D Room
                            </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Exibition;
