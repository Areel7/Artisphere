import { ArrowRight, Filter as FilterIcon } from "lucide-react";
import TiltCard from "./TiltCard";
import { useGetAllArtworksQuery } from "../redux/api/artwork";
import { useDispatch, useSelector } from "react-redux";
import { setArtFilter } from "../redux/features/artwork/artSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

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
const Artwork = () => {
  const { data: artworks, isLoading, isError } = useGetAllArtworksQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { artFilter } = useSelector((state) => state.artworks);

  // Reset filter tag on unmount so returning to this section doesn't show stale state
  useEffect(() => {
    return () => {
      dispatch(setArtFilter({ selectedTag: "" }));
    };
  }, [dispatch]);

  // Extract up to 4 popular tags dynamically safely
  const categories = artworks ? [...new Set(artworks.flatMap(a => a.tags || []).filter(Boolean))].slice(0, 4) : [];

  // Local filter
  const filteredArtworks = artworks?.filter((artwork) => {
    return artFilter.selectedTag === "" || artwork.tags?.includes(artFilter.selectedTag);
  });

  return (
    <>
      {/* Discovery Module (Artwork Catalog) */}
      <section className="py-24 md:py-32 px-6 text-zinc-900 dark:text-white" id="discovery">
        <div className="max-w-[90rem] mx-auto">
          <motion.div 
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-zinc-900 dark:text-white">
                Personalized &nbsp; 
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
                  className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest transition-colors ${artFilter.selectedTag === "" ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white' : 'border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-white/20 dark:text-white/50 dark:hover:border-white/50 dark:hover:text-white'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => dispatch(setArtFilter({ selectedTag: artFilter.selectedTag === cat ? "" : cat }))}
                    className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest transition-colors ${artFilter.selectedTag === cat ? 'bg-indigo-500 text-white border-indigo-500' : 'border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 dark:border-white/20 dark:text-white/50 dark:hover:border-white/50 dark:hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <button onClick={() => navigate('/search')} className="flex items-center gap-2 text-zinc-800 dark:text-white pb-1 border-b border-zinc-400 hover:border-zinc-600 dark:border-white dark:hover:border-zinc-500 transition-colors sm:ml-4 whitespace-nowrap">
                View Catalog <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

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
                  <motion.div variants={fadeUp} key={i} className="aspect-[3/4] bg-zinc-200 dark:bg-white/5 rounded-2xl animate-pulse border border-zinc-200 dark:border-white/5" />
                ))}
              </div>
            ) : isError ? (
              <div className="py-20 text-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl">
                <p className="text-zinc-500 dark:text-white/40 font-light">Unable to load artworks at the moment.</p>
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
    </>
  );
};

export default Artwork;
