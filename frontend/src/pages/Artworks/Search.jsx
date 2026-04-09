import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllArtworksQuery } from '../../redux/api/artwork';
import TiltCard from '../../components/TiltCard';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { setArtFilter } from '../../redux/features/artwork/artSlice';
import ParticleBackground from '../../components/ParticleBackground';

const Search = () => {
  const dispatch = useDispatch();
  const { artFilter } = useSelector((state) => state.artworks);
  const { data: artworks, isLoading, error } = useGetAllArtworksQuery();

  // Extract unique tags
  const categories = artworks ? [...new Set(artworks.flatMap(a => a.tags || []).filter(Boolean))] : [];

  const handleSearch = (e) => {
    dispatch(setArtFilter({ searchTerm: e.target.value }));
  };

  const handleTagClick = (tag) => {
    dispatch(setArtFilter({ selectedTag: artFilter.selectedTag === tag ? "" : tag }));
  };

  // Filter artworks logic
  const filteredArtworks = artworks?.filter((artwork) => {
    const term = artFilter.searchTerm.toLowerCase();
    const matchesSearch = term === "" || 
      (artwork.title?.toLowerCase().includes(term) || 
       artwork.artistId?.username?.toLowerCase().includes(term)
      );
      
    const matchesTag = artFilter.selectedTag === "" || artwork.tags?.includes(artFilter.selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Cleanup filter on unmount so returning doesn't keep a weird search state
  useEffect(() => {
    return () => {
      dispatch(setArtFilter({ searchTerm: "", selectedTag: "" }));
    }
  }, [dispatch]);

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen text-white pt-32 pb-20 px-6 relative z-10 w-full overflow-hidden">
        <div className="max-w-[90rem] mx-auto relative z-10">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Catalog</span>
              </h1>
              <p className="text-zinc-400 mt-2 font-light">Find exactly what you're looking for</p>
            </div>
            
            <div className="w-full md:w-96 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" 
                placeholder="Search by title, artist..." 
                value={artFilter.searchTerm}
                onChange={handleSearch}
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-12 outline-none focus:border-violet-500/50 focus:bg-white/10 transition-colors"
              />
              {artFilter.searchTerm && (
                <button onClick={() => dispatch(setArtFilter({ searchTerm: "" }))} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-white/40 hover:text-white" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-12 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-white/50 mr-2 uppercase tracking-widest text-xs font-bold">
              <Filter className="w-4 h-4" /> Filter Tags:
            </div>
            <button 
              onClick={() => dispatch(setArtFilter({ selectedTag: "" }))}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors ${artFilter.selectedTag === "" ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
            >
              All
            </button>
            {categories.map(category => (
              <button 
                key={category}
                onClick={() => handleTagClick(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors ${artFilter.selectedTag === category ? 'bg-violet-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                {category}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-white/10 border-t-violet-400 rounded-full animate-spin mb-4" />
              <p className="text-zinc-500">Executing search query...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
              Failed to load artwork catalog.
            </div>
          ) : (
            <>
              {filteredArtworks?.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
                  <p className="text-white/40 font-light text-lg">No artworks match your search.</p>
                  <button onClick={() => dispatch(setArtFilter({ searchTerm: "", selectedTag: "" }))} className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm">Clear Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
                  {filteredArtworks?.map((artwork) => (
                    <TiltCard key={artwork._id} artwork={artwork} />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
};

export default Search;
