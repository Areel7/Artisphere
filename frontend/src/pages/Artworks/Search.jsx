import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllArtworksQuery } from '../../redux/api/artwork';
import TiltCard from '../../components/TiltCard';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { setArtFilter } from '../../redux/features/artwork/artSlice';
import ParticleBackground from '../../components/ParticleBackground';
import { useSearchParams } from 'react-router-dom';

const Search = () => {
  const dispatch = useDispatch();
  const { artFilter } = useSelector((state) => state.artworks);
  const { data: artworks, isLoading, error } = useGetAllArtworksQuery();
  const [searchParams] = useSearchParams();

  // Pre-populate from ?q= URL param on mount
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) dispatch(setArtFilter({ searchTerm: q }));
  }, []);

  // Extract unique tags
  const categories = artworks
    ? [...new Set(artworks.flatMap((a) => a.tags || []).filter(Boolean))]
    : [];

  const handleTagClick = (tag) => {
    dispatch(setArtFilter({ selectedTag: artFilter.selectedTag === tag ? '' : tag }));
  };

  // Filter artworks
  const filteredArtworks = artworks?.filter((artwork) => {
    const term = artFilter.searchTerm.toLowerCase();
    const matchesSearch =
      term === '' ||
      artwork.title?.toLowerCase().includes(term) ||
      artwork.artistId?.username?.toLowerCase().includes(term);
    const matchesTag =
      artFilter.selectedTag === '' || artwork.tags?.includes(artFilter.selectedTag);
    return matchesSearch && matchesTag;
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(setArtFilter({ searchTerm: '', selectedTag: '' }));
    };
  }, [dispatch]);

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen text-zinc-900 dark:text-white pt-24 pb-20 px-6 relative z-10 overflow-hidden">
        <div className="max-w-[90rem] mx-auto">

          {/* ── Page heading ─────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              {artFilter.searchTerm ? (
                <>
                  Results for{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                    &ldquo;{artFilter.searchTerm}&rdquo;
                  </span>
                </>
              ) : (
                <>
                  Browse{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                    Catalog
                  </span>
                </>
              )}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-1">
              {isLoading
                ? 'Loading…'
                : `${filteredArtworks?.length ?? 0} artwork${
                    filteredArtworks?.length === 1 ? '' : 's'
                  } found`}
            </p>
          </div>

          {/* ── Tag Filters ──────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-zinc-200 dark:border-white/8">
            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-white/30 mr-1 uppercase tracking-widest text-[10px] font-bold">
              <Filter className="w-3 h-3" /> Filter:
            </div>
            <button
              onClick={() => dispatch(setArtFilter({ selectedTag: '' }))}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${
                artFilter.selectedTag === ''
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleTagClick(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${
                  artFilter.selectedTag === category
                    ? 'bg-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
            {(artFilter.searchTerm || artFilter.selectedTag) && (
              <button
                onClick={() => dispatch(setArtFilter({ searchTerm: '', selectedTag: '' }))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-500 hover:text-red-500 border border-zinc-200 dark:border-white/10 hover:border-red-500/30 transition-all ml-auto"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* ── Results ──────────────────────────────── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-t-violet-400 border-violet-500/20 animate-spin" />
              </div>
              <p className="text-zinc-500 text-sm">Loading catalog…</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
              Failed to load artwork catalog.
            </div>
          ) : filteredArtworks?.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-zinc-300 dark:border-white/10 rounded-3xl">
              <SearchIcon className="w-10 h-10 text-zinc-300 dark:text-white/10 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-white/40 font-light text-lg">
                No artworks match your search.
              </p>
              <button
                onClick={() => dispatch(setArtFilter({ searchTerm: '', selectedTag: '' }))}
                className="mt-5 px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-sm text-zinc-900 dark:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
              {filteredArtworks.map((artwork) => (
                <TiltCard key={artwork._id} artwork={artwork} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Search;
