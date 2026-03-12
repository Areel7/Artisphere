import React from "react";
import { Play } from "lucide-react";

const EXHIBITIONS = [
  {
    id: 1,
    title: "Digital Renaissance",
    curator: "The Modern Art Trust",
    date: "Ends in 12 Days",
    image:
      "https://images.unsplash.com/photo-1518998053901-5314c32943e6?auto=format&fit=crop&q=80&w=1000",
  },
  {
    id: 2,
    title: "Sculpting the Void",
    curator: "Gallery 360",
    date: "Opening Tomorrow",
    image:
      "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=1000",
  },
];

const Exibition = () => {
  return (
    <>
      {/* Curated Exhibitions Module */}
      <section
        className="py-32 px-6 bg-zinc-900/30 border-t border-white/5"
        id="exhibitions"
      >
        <div className="max-w-[90rem] mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Curated Exhibitions
            </h2>
            <p className="text-white/60 text-lg font-light max-w-2xl">
              Step into scheduled, immersive virtual gallery spaces crafted by
              top curators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {EXHIBITIONS.map((ex) => (
              <div
                key={ex.id}
                className="group relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={ex.image}
                  alt={ex.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {ex.date}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {ex.title}
                  </h3>
                  <p className="text-white/70">Curated by {ex.curator}</p>

                  <div className="mt-6 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold hover:bg-white hover:text-black transition-colors flex items-center gap-2">
                      <Play className="w-4 h-4" /> Enter 3D Room
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Exibition;
