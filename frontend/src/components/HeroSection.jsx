import React, { useState, useEffect } from "react";
import { Box, Search } from "lucide-react";
import TiltCard from "./TiltCard";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useGetArtistsQuery } from "../redux/api/user";
import { useGetAllArtworksQuery } from "../redux/api/artwork";
import { motion, animate } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const CountUp = ({ to }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, to, {
      duration: 2,
      ease: "circOut",
      onUpdate: (value) => {
        setCount(Math.floor(value));
      }
    });
    return () => controls.stop();
  }, [to]);

  return <>{count}</>;
};

const HeroSection = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: artists, isLoading, error } = useGetArtistsQuery();
  const { data: artworks, isLoading: artworksLoading, error: artworksError } = useGetAllArtworksQuery();
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-32 pb-24 px-6 overflow-hidden text-zinc-900 dark:text-white">
        <div className="max-w-[90rem] mx-auto w-full grid lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          <motion.div 
            className="lg:col-span-7 flex flex-col items-start gap-8 z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/5 border border-zinc-200/80 dark:bg-white/5 dark:border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-600 dark:text-white/80">
                Interactive Gallery v1.0
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-bold leading-[1.05] tracking-tight">
              Where art meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500 italic">
                engagement.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-600 dark:text-white/60 max-w-xl font-light leading-relaxed">
              Browse, explore, interact, and experience art online. Step into
              interactive 3D spaces, uncover artist stories, and curate your
              personal collection.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mt-4">
              <button onClick={() => !userInfo ? toast.error('Please login to enter the gallery') : navigate('/gallery')} className="group flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors duration-300">
                Enter 3D Gallery
                <Box className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
              <button onClick={() => navigate('/search')} className="group flex items-center gap-3 px-8 py-4 bg-zinc-100 border border-zinc-300 text-zinc-900 rounded-full font-semibold hover:bg-zinc-200 dark:bg-zinc-900 dark:border-white/10 dark:text-white dark:hover:bg-zinc-800 transition-colors duration-300">
                <Search className="w-4 h-4 text-zinc-500 dark:text-white/60" />
                Discover Artworks
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-zinc-200 dark:border-white/10 w-full max-w-lg">
              <div>
                {artworksLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-16 bg-zinc-200 dark:bg-white/10 rounded mb-2"></div>
                    <div className="h-3 w-12 bg-zinc-200 dark:bg-white/10 rounded"></div>
                  </div>
                ) : artworksError ? (
                  <div className="text-red-400 text-sm">Error loading artworks</div>
                ) : (
                  <>
                    <h4 className="text-2xl font-bold text-zinc-900 dark:text-white"><CountUp to={artworks?.length || 0} /></h4>
                    <p className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-widest mt-1">
                      Artworks
                    </p>
                  </>
                )}
              </div>
              <div>
                <h4 className="text-2xl font-bold text-zinc-900 dark:text-white">3D</h4>
                <p className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-widest mt-1">
                  Galleries
                </p>
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-16 bg-zinc-200 dark:bg-white/10 rounded mb-2"></div>
                    <div className="h-3 w-12 bg-zinc-200 dark:bg-white/10 rounded"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-400 text-sm">Error loading artists</div>
                ) : (
                  <>
                    <h4 className="text-2xl font-bold text-zinc-900 dark:text-white"><CountUp to={artists?.length || 0} /></h4>
                    <p className="text-xs text-zinc-500 dark:text-white/50 uppercase tracking-widest mt-1">
                      Artists
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Interactive Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="lg:col-span-5 relative w-full max-w-md mx-auto z-10 hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 blur-3xl rounded-full" />
            {artworks?.at(-1) ? (
              <TiltCard artwork={artworks.at(-1)} />
            ) : (
              // Skeleton placeholder while artwork loads
              <div className="w-full aspect-[3/4] rounded-xl bg-zinc-100 border border-zinc-200 dark:bg-white/5 dark:border-white/10 animate-pulse" />
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
