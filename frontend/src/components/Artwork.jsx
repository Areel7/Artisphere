import React from "react";
import { ArrowRight } from "lucide-react";
import TiltCard from "./TiltCard";

const ARTWORKS = [
  {
    id: 1,
    title: "Ethereal Echoes",
    artist: "Elena Rostova",
    image:
      "/uploads/image-1775504396143.jpeg",
    category: "Abstract Oil",
    price: 1200,
    likes: 342,
    hasStory: true,
  },
  {
    id: 2,
    title: "Neon Genesis",
    artist: "Marcus Chen",
    image:
      "/uploads/image-1775504396143.jpeg",
    category: "Digital 3D",
    price: 850,
    likes: 891,
    hasStory: false,
  },
  {
    id: 3,
    title: "Monolithic Serenity",
    artist: "Sarah Jenkins",
    image:
      "/uploads/image-1775504396143.jpeg",
    category: "Sculpture",
    price: 3400,
    likes: 124,
    hasStory: true,
  },
  {
    id: 4,
    title: "Chromatic Variance",
    artist: "David Osei",
    image:
      "/uploads/image-1775504396143.jpeg",
    category: "Mixed Media",
    price: 650,
    likes: 456,
    hasStory: true,
  },
  {
    id: 5,
    title: "Void Architecture",
    artist: "Aisha Patel",
    image:
      "/uploads/image-1775504396143.jpeg",
    category: "Generative",
    price: 1100,
    likes: 678,
    hasStory: false,
  },
  {
    id: 6,
    title: "Liquid Gold",
    artist: "Jean-Paul Dubois",
    image:
      "/uploads/image-1775504396143.jpeg",
    category: "Fluid Acrylic",
    price: 920,
    likes: 533,
    hasStory: true,
  },
];

const Artwork = () => {
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12">
            {ARTWORKS.slice(0, 6).map((artwork) => (
              <TiltCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Artwork;
