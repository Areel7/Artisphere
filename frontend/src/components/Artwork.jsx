import { ArrowRight, Filter as FilterIcon } from "lucide-react";
import TiltCard from "./TiltCard";
import { useGetAllArtworksQuery } from "../redux/api/artwork";
import { useDispatch, useSelector } from "react-redux";
import { setArtFilter } from "../redux/features/artwork/artSlice";
import { useNavigate } from "react-router-dom";


const Artwork = () => {
  const { data: artworks, isLoading, isError } = useGetAllArtworksQuery();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { artFilter } = useSelector((state) => state.artworks);

  // Extract up to 4 popular tags dynamically safely
  const categories = artworks ? [...new Set(artworks.flatMap(a => a.tags || []).filter(Boolean))].slice(0, 4) : [];

  // Local filter
  const filteredArtworks = artworks?.filter((artwork) => {
    return artFilter.selectedTag === "" || artwork.tags?.includes(artFilter.selectedTag);
  });

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
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-6 lg:mt-0">
              <div className="flex flex-wrap items-center gap-2">
                <FilterIcon className="w-4 h-4 text-white/40 mr-2" />
                <button 
                  onClick={() => dispatch(setArtFilter({ selectedTag: "" }))}
                  className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest transition-colors ${artFilter.selectedTag === "" ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'}`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => dispatch(setArtFilter({ selectedTag: artFilter.selectedTag === cat ? "" : cat }))}
                    className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest transition-colors ${artFilter.selectedTag === cat ? 'bg-indigo-500 text-white border-indigo-500' : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <button onClick={() => navigate('/search')} className="flex items-center gap-2 text-white pb-1 border-b border-white hover:border-zinc-500 transition-colors sm:ml-4 whitespace-nowrap">
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
              {filteredArtworks?.length === 0 ? (
                <div className="col-span-full py-16 text-center border-dashed border border-white/10 rounded-2xl text-white/50">
                  No artworks found for this category.
                </div>
              ) : (
                filteredArtworks?.map((artwork) => (
                  <TiltCard key={artwork._id} artwork={artwork} />
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Artwork;
