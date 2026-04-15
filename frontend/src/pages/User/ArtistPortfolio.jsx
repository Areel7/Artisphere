import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useGetArtworksbyArtistIdQuery } from '../../redux/api/artwork';
import { useGetArtistsQuery } from '../../redux/api/user';
import TiltCard from '../../components/TiltCard';
import ParticleBackground from '../../components/ParticleBackground';
import { User as UserIcon, Mail } from 'lucide-react';
import { getAvatarColor } from '../../utils/avatarColors';

const ArtistPortfolio = () => {
  const { id } = useParams();
  const location = useLocation();

  // Try to get artist data from state first (if navigated from AllArtists)
  // Otherwise, fetch artists and find by id
  const { data: artists } = useGetArtistsQuery(undefined, {
    skip: !!location.state?.artist
  });

  const artist = location.state?.artist || artists?.find((a) => a._id === id);

  const { data: artworks, isLoading, error } = useGetArtworksbyArtistIdQuery(id);

  if (!artist && !artists) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-900 dark:text-white">
        <div className="w-12 h-12 border-4 border-zinc-200 dark:border-white/10 border-t-violet-500 rounded-full animate-spin mb-4" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-900 dark:text-white">
        <h2 className="text-2xl font-bold">Artist not found</h2>
      </div>
    );
  }

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen relative z-10 w-full px-6 pt-32 pb-20 text-zinc-900 dark:text-white">
        <div className="max-w-[90rem] mx-auto">
          
          {/* Artist Info Section */}
          <div className="bg-white/90 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl backdrop-blur-md mb-16 flex flex-col md:flex-row items-center gap-8 shadow-sm dark:shadow-none">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500/30 to-fuchsia-500/30 p-1 border border-zinc-200 dark:border-white/10 flex-shrink-0">
              {artist.avatar ? (
                <img src={artist.avatar} alt={artist.username} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr ${getAvatarColor(artist.username || artist.name)}`}>
                  <span className="text-5xl font-bold text-white uppercase drop-shadow-md">
                    {(artist.username || artist.name || "A").charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">
                {artist.username || artist.name || "Artist"}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-600 dark:text-zinc-400 text-lg font-light">
                <Mail className="w-5 h-5" />
                <span>{artist.email}</span>
              </div>
            </div>
          </div>

          {/* Artworks Portfolio Section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-zinc-900 dark:text-white uppercase tracking-tight mb-8">
              P<span className="italic font-serif">ortfolio</span>
            </h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 dark:text-white/50">
                <div className="w-12 h-12 border-4 border-zinc-200 dark:border-white/10 border-t-violet-500 rounded-full animate-spin mb-4" />
                <p>Loading artworks...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-2xl text-center">
                Failed to load artist's artworks. Please try again later.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
                {(Array.isArray(artworks) ? artworks : []).map((artwork) => (
                  <TiltCard key={artwork._id} artwork={artwork} />
                ))}
                {(!artworks || artworks.length === 0) && (
                  <div className="col-span-full text-center py-20 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-white/10 rounded-3xl border-dashed">
                    This artist hasn't uploaded any artworks yet.
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>
  );
};

export default ArtistPortfolio;
