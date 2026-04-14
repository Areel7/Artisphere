import {
  ArrowRight,
  Filter as FilterIcon,
  Sparkles,
  BookOpen,
  Palette,
  Star,
  Globe,
  Zap,
  Eye,
} from "lucide-react";
import TiltCard from "./TiltCard";
import { useGetAllArtworksQuery } from "../redux/api/artwork";
import { useDispatch, useSelector } from "react-redux";
import { setArtFilter } from "../redux/features/artwork/artSlice";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

/* ── Circle slider cards ─────────────────────────── */
const CIRCLES = [
  {
    id: 1,
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
    icon: <Sparkles className="w-7 h-7 text-white/90" />,
    label: "Curated Daily",
    sub: "Fresh picks every 24h",
    accent: "text-violet-200",
  },
  {
    id: 2,
    gradient: "from-zinc-800 via-zinc-900 to-black",
    icon: <BookOpen className="w-7 h-7 text-white/90" />,
    label: "Story Layers",
    sub: "Every piece has a narrative",
    accent: "text-zinc-300",
  },
  {
    id: 3,
    gradient: "from-indigo-500 via-blue-600 to-cyan-600",
    icon: <Globe className="w-7 h-7 text-white/90" />,
    label: "Global Artists",
    sub: "From 40+ countries",
    accent: "text-blue-200",
  },
  {
    id: 4,
    gradient: "from-rose-500 via-pink-600 to-fuchsia-600",
    icon: <Star className="w-7 h-7 text-white/90" />,
    label: "Top Rated",
    sub: "Community favourites",
    accent: "text-pink-200",
  },
  {
    id: 5,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    icon: <Zap className="w-7 h-7 text-white/90" />,
    label: "3D Ready",
    sub: "View any piece in 3D space",
    accent: "text-amber-200",
  },
  {
    id: 6,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    icon: <Palette className="w-7 h-7 text-white/90" />,
    label: "All Mediums",
    sub: "Oil · Digital · Sculpture",
    accent: "text-emerald-200",
  },
  {
    id: 7,
    gradient: "from-slate-600 via-slate-700 to-zinc-900",
    icon: <Eye className="w-7 h-7 text-white/90" />,
    label: "10K+ Views",
    sub: "This month alone",
    accent: "text-slate-300",
  },
  {
    id: 8,
    gradient: "from-fuchsia-600 via-violet-700 to-indigo-700",
    icon: <Sparkles className="w-7 h-7 text-white/90" />,
    label: "Acquire Art",
    sub: "Physical & digital editions",
    accent: "text-fuchsia-200",
  },
];

const Artwork = () => {
  const { data: artworks, isLoading, isError } = useGetAllArtworksQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { artFilter } = useSelector((state) => state.artworks);
  const sliderSectionRef = useRef(null);

  // Reset filter on unmount
  useEffect(() => {
    return () => {
      dispatch(setArtFilter({ selectedTag: "" }));
    };
  }, [dispatch]);

  // Extract up to 4 popular tags
  const categories = artworks
    ? [...new Set(artworks.flatMap((a) => a.tags || []).filter(Boolean))].slice(
        0,
        4,
      )
    : [];

  // Filter artworks
  const filteredArtworks = artworks?.filter(
    (artwork) =>
      artFilter.selectedTag === "" ||
      artwork.tags?.includes(artFilter.selectedTag),
  );

  // Scroll-driven transform — moves strip right→left as section enters viewport
  const { scrollYProgress } = useScroll({
    target: sliderSectionRef,
    offset: ["start end", "end start"],
  });
  const sliderX = useTransform(scrollYProgress, [0, 1], ["6%", "-28%"]);

  return (
    <>
      {/* ── Discovery / Artwork Catalog ──────────────── */}
      <section
        className="py-24 md:py-32 px-6 text-zinc-900 dark:text-white"
        id="discovery"
      >
        <div className="max-w-[90rem] mx-auto">
          {/* Header row */}
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-zinc-900 dark:text-white">
                Personalized&nbsp;
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500">
                  Discovery
                </span>
              </h2>
              <p className="text-zinc-600 dark:text-white/60 text-lg md:text-xl font-light">
                Curated recommendations based on your taste. Explore high-res
                imagery, story layers, and acquire physical or digital pieces.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-6 lg:mt-0">
              <div className="flex flex-wrap items-center gap-2">
                <FilterIcon className="w-4 h-4 text-zinc-400 dark:text-white/40 mr-2" />
                <button
                  onClick={() => dispatch(setArtFilter({ selectedTag: "" }))}
                  className={`px-4 py-1.5 rounded-full border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                    artFilter.selectedTag === ""
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white"
                      : "border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-zinc-900 hover:text-zinc-900 dark:bg-transparent dark:border-white/20 dark:text-white/50 dark:hover:border-white/50 dark:hover:text-white"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      dispatch(
                        setArtFilter({
                          selectedTag: artFilter.selectedTag === cat ? "" : cat,
                        }),
                      )
                    }
                    className={`px-4 py-1.5 rounded-full border-2 text-xs font-bold uppercase tracking-widest transition-all ${
                      artFilter.selectedTag === cat
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-lg"
                        : "border-zinc-200 bg-white text-zinc-600 shadow-sm hover:border-zinc-900 hover:text-zinc-900 dark:bg-transparent dark:border-white/20 dark:text-white/50 dark:hover:border-white/50 dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate("/search")}
                className="flex items-center gap-2 text-zinc-800 dark:text-white pb-1 border-b border-zinc-400 hover:border-zinc-600 dark:border-white dark:hover:border-zinc-500 transition-colors sm:ml-4 whitespace-nowrap"
              >
                View Catalog <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Artwork grid */}
          <motion.div
            key={artFilter.selectedTag}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    variants={fadeUp}
                    key={i}
                    className="aspect-[3/4] bg-zinc-200 dark:bg-white/5 rounded-2xl animate-pulse border border-zinc-200 dark:border-white/5"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="py-20 text-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl">
                <p className="text-zinc-500 dark:text-white/40 font-light">
                  Unable to load artworks at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12">
                {filteredArtworks?.length === 0 ? (
                  <div className="col-span-full py-16 text-center border-dashed border border-zinc-300 dark:border-white/10 rounded-2xl text-zinc-500 dark:text-white/50">
                    No artworks found for this category.
                  </div>
                ) : (
                  filteredArtworks?.map((artwork) => (
                    <motion.div variants={fadeUp} key={artwork._id}>
                      <TiltCard artwork={artwork} />
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Scroll-driven Circle Slider ──────────────── */}
      <div
        ref={sliderSectionRef}
        className="relative overflow-hidden py-16 md:py-24 border-t border-zinc-200 dark:border-white/5"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(139,92,246,0.04), transparent)",
        }}
      >
        {/* Section label */}
        <div className="px-6 mb-10 max-w-[90rem] mx-auto flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-300 dark:via-white/10 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-white/30 shrink-0">
            What We Offer
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-zinc-300 dark:via-white/10 to-transparent" />
        </div>

        {/* Scroll-translated strip */}
        <motion.div
          style={{ x: sliderX }}
          className="flex gap-6 will-change-transform pl-6"
        >
          {[...CIRCLES, ...CIRCLES.slice(0, 4)].map((circle, idx) => (
            <div
              key={`${circle.id}-${idx}`}
              className={`relative shrink-0 w-52 h-52 rounded-full bg-gradient-to-br ${circle.gradient} flex flex-col items-center justify-center text-center p-6 shadow-2xl border border-white/10 select-none cursor-default group`}
              style={{
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {/* Inner ring */}
              <div className="absolute inset-3 rounded-full border border-white/10 pointer-events-none" />
              {/* Icon */}
              <div className="mb-3 p-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                {circle.icon}
              </div>
              {/* Label */}
              <p className="text-white font-bold text-sm leading-tight mb-1">
                {circle.label}
              </p>
              <p
                className={`text-[11px] font-light leading-snug opacity-80 ${circle.accent}`}
              >
                {circle.sub}
              </p>
              {/* Hover shimmer */}
              <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-all duration-500 pointer-events-none" />
            </div>
          ))}
        </motion.div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10" />
      </div>
    </>
  );
};

export default Artwork;
