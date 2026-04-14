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

const TICKER_ITEMS = [
  "✦ IMMERSIVE 3D EXHIBITIONS",
  "✦ CURATED DIGITAL COLLECTIONS",
  "✦ CONNECT WITH GLOBAL ARTISTS",
  "✦ AUGMENTED REALITY READY",
  "✦ SECURE ACQUISITIONS",
  "✦ EXCLUSIVE CURATOR SPACES",
  "✦ STORY-DRIVEN ARTWORKS",
];

const HeroSection = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: artists, isLoading, error } = useGetArtistsQuery();
  const { data: artworks, isLoading: artworksLoading, error: artworksError } = useGetAllArtworksQuery();
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center pt-32 pb-32 px-6 overflow-hidden text-zinc-900 dark:text-white">
        {/* Background glow layers */}
        <div className="absolute top-[20%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-fuchsia-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-[90rem] mx-auto w-full grid lg:grid-cols-12 gap-16 lg:gap-12 items-center relative z-10">
          <motion.div 
            className="lg:col-span-7 flex flex-col items-start gap-8 z-10"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-none backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-800 dark:text-white/80">
                Interactive Gallery v1.0
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-bold leading-[1.05] tracking-tight">
              Where art meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500 italic">
                engagement.
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-700 dark:text-white/60 max-w-xl font-medium dark:font-light leading-relaxed">
              Browse, explore, interact, and experience art online. Step into
              interactive 3D spaces, uncover artist stories, and curate your
              personal collection.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mt-4">
              <button 
                onClick={() => !userInfo ? toast.error('Please login to enter the gallery') : navigate('/gallery')} 
                className="group flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300"
              >
                Enter 3D Gallery
                <Box className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/search')} 
                className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-zinc-200 text-zinc-900 rounded-full font-bold hover:border-zinc-900 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-white/10 dark:text-white dark:hover:border-white/30 dark:hover:bg-zinc-800 transition-all duration-300 shadow-sm"
              >
                <Search className="w-4 h-4 text-zinc-900 dark:text-white/60" />
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

          {/* ── Enhanced Hero Interactive Element ── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="lg:col-span-5 relative w-full h-[600px] flex items-center justify-center z-10 hidden lg:flex perspective-[1000px]"
          >
            {/* Background Glows */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 blur-3xl rounded-full" />
            
            {/* Orbiting Concentric Rings */}
            <motion.div 
               className="absolute top-1/2 left-1/2 w-[120%] aspect-square rounded-full border border-dashed border-zinc-300 dark:border-white/10 -translate-x-1/2 -translate-y-1/2 z-0"
               animate={{ rotate: 360 }}
               transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
               className="absolute top-1/2 left-1/2 w-[90%] aspect-square rounded-full border border-zinc-200 dark:border-white/5 -translate-x-1/2 -translate-y-1/2 z-0"
               animate={{ rotate: -360 }}
               transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
               {/* Glowing dot on inner ring */}
               <div className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] -translate-x-1/2 -translate-y-1/2" />
               <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] -translate-x-1/2 translate-y-1/2" />
            </motion.div>

            {/* Main Floating 3D Artwork */}
            <motion.div 
               className="absolute top-1/2 left-1/2 w-full max-w-[320px] -translate-x-1/2 -translate-y-1/2 z-20"
               animate={{ rotateY: [-5, 5, -5], rotateX: [5, -5, 5] }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               style={{ transformStyle: "preserve-3d" }}
            >
              <div className="shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-500/10 rounded-2xl">
                {artworks?.at(-1) ? (
                  <TiltCard artwork={artworks.at(-1)} />
                ) : (
                  <div className="w-full aspect-[3/4] rounded-2xl bg-white border border-zinc-200 shadow-xl dark:bg-white/5 dark:border-white/10 animate-pulse" />
                )}
              </div>
            </motion.div>

            {/* Float Element 1: Live Bid Glassmorphism */}
            <motion.div
              className="absolute top-20 -right-8 xl:-right-16 z-30 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-[1.5rem] p-4 shadow-2xl flex items-center gap-4 min-w-[200px]"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                 <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-green-400 animate-ping" />
                 </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500 dark:text-white/50 mb-0.5">Live Auction</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">4.2 ETH</p>
              </div>
            </motion.div>

            {/* Float Element 2: Collectors Multi-Avatar */}
            <motion.div
              className="absolute bottom-28 -left-8 xl:-left-16 z-30 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/80 dark:border-white/10 rounded-[1.5rem] p-4 shadow-2xl flex items-center gap-4 min-w-[200px]"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex -space-x-3 shrink-0">
                <img src="https://i.pravatar.cc/100?img=1" className="w-10 h-10 object-cover rounded-full border-2 border-white dark:border-zinc-900" alt="avatar" />
                <img src="https://i.pravatar.cc/100?img=2" className="w-10 h-10 object-cover rounded-full border-2 border-white dark:border-zinc-900" alt="avatar" />
                <img src="https://i.pravatar.cc/100?img=3" className="w-10 h-10 object-cover rounded-full border-2 border-white dark:border-zinc-900" alt="avatar" />
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-white/80">+</div>
              </div>
              <div>
                <p className="text-base font-bold text-zinc-900 dark:text-white leading-none mb-1">1,240+</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-white/40">Collectors</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Endless Marquee Ticker ── */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-zinc-200 dark:border-white/10 bg-zinc-50/80 dark:bg-black/40 backdrop-blur-md py-4 z-20">
          <motion.div
            className="flex whitespace-nowrap items-center w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 35,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span 
                key={i} 
                className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-white/30 px-8 flex items-center gap-8"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
