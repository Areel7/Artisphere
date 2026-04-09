import { ArrowRight } from "lucide-react";
import TiltCard from "./TiltCard";
import { useGetAllArtworksQuery } from "../redux/api/artwork";


const Artwork = () => {
  const { data: artworks, isLoading, isError } = useGetAllArtworksQuery();
  return (
    <>
      {/* Discovery Module (Artwork Catalog) */}
      <section className="py-32 px-6" id="discovery">
        <div className="max-w-[90rem] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Personalized Discovery
              </h2>
              <p className="text-white/60 text-lg font-light">
                Curated recommendations based on your taste. Explore high-res
                imagery, story layers, and acquire physical or digital pieces.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2 rounded-full border border-white/20 text-sm hover:bg-white hover:text-black transition-colors">
                Filters
              </button>
              <button className="flex items-center gap-2 text-white pb-2 border-b border-white hover:border-zinc-500 transition-colors">
                View Catalog <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-white/40 font-light">Unable to load artworks at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
              {artworks?.map((artwork) => (
                <TiltCard key={artwork._id} artwork={artwork} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Artwork;
