import React from 'react';
import { useGetCuratorsQuery } from '../../redux/api/user' ;
import { User as UserIcon, Mail } from 'lucide-react';
import ParticleBackground from '../../components/ParticleBackground';

const AllCurators = () => {
  const { data: curators, isLoading, error } = useGetCuratorsQuery();

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen relative z-10 w-full px-6 pt-32 pb-20">
        <div className="max-w-[90rem] mx-auto">
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Curators</span>
            </h1>
            <p className="text-zinc-400 mt-4 max-w-2xl text-lg font-light">
              Discover the brilliant minds behind the mesmerizing 3D artworks on Artisphere.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/50">
              <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p>Loading artists...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
              Failed to load artists. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {curators?.map((curator) => (
                <div key={curator._id} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:bg-white/10 transition-colors flex flex-col items-center text-center">
                  
                  <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 p-1 border border-white/10 relative overflow-hidden group-hover:border-white/30 transition-colors">
                    {curator.avatar ? (
                      <img src={curator.avatar} alt={curator.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-black/40 rounded-full flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                    {curator.username || "Curator"}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-zinc-400 text-sm font-light">
                    <Mail className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{curator.email}</span>
                  </div>
                  
                  <button className="mt-8 px-6 py-2.5 w-full rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-semibold transition-all border border-white/5 text-sm uppercase tracking-wider">
                    View Portfolio
                  </button>
                </div>
              ))}
              
              {!curators?.length && (
                <div className="col-span-full text-center py-20 text-zinc-500 border border-white/10 rounded-3xl border-dashed">
                  No curators found.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AllCurators;
