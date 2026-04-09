import React from "react";
import { Box, Search } from "lucide-react";
import TiltCard from "./TiltCard";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useGetArtistsQuery } from "../redux/api/user";
import { useGetAllArtworksQuery } from "../redux/api/artwork";

const ARTWORKS = [
  {
    id: "66nnnjbb",
    title: "Ethereal Echoes",
    artist: "Elena Rostova",
    image: "/uploads/image-1775504396143.jpeg",
    category: "Abstract Oil",
    price: 1200,
    likes: 342,
    hasStory: true,
  },
];

const HeroSection = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: artists, isLoading, error } = useGetArtistsQuery();
  const { data: artworks, isLoading: artworksLoading, error: artworksError } = useGetAllArtworksQuery();
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-24 pb-12 px-6">
        <div className="max-w-[90rem] mx-auto w-full grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start gap-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-white/80">
                Interactive Gallery v1.0
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold leading-[1.05] tracking-tight">
              Where art meets <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600 italic">
                engagement.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-xl font-light leading-relaxed">
              Browse, explore, interact, and experience art online. Step into
              interactive 3D spaces, uncover artist stories, and curate your
              personal collection.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button onClick={() => !userInfo ? toast.error('Please login to enter the gallery') : navigate('/gallery')} className="group flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors duration-300">
                Enter 3D Gallery
                <Box className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
              <button onClick={() => navigate('/search')} className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-white/10 text-white rounded-full font-semibold hover:bg-zinc-800 transition-colors duration-300">
                <Search className="w-4 h-4 text-white/60" />
                Discover Artworks
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-white/10 w-full max-w-lg">
              <div>
                {artworksLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-16 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 w-12 bg-white/10 rounded"></div>
                  </div>
                ) : artworksError ? (
                  <div className="text-red-400 text-sm">Error loading artworks</div>
                ) : (
                  <>
                    <h4 className="text-2xl font-bold">{artworks?.length}</h4>
                    <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
                      Artworks
                    </p>
                  </>
                )}
              </div>
              <div>
                <h4 className="text-2xl font-bold">3D</h4>
                <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
                  Galleries
                </p>
              </div>
              <div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-16 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 w-12 bg-white/10 rounded"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-400 text-sm">Error loading artists</div>
                ) : (
                  <>
                    <h4 className="text-2xl font-bold">{artists?.length}</h4>
                    <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
                      Artists
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hero Interactive Element */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto z-10 hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 blur-3xl rounded-full" />
            <TiltCard artwork={ARTWORKS[0]} />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
