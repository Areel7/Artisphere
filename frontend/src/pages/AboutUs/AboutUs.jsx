import React from 'react';
import { Box, Map, Brush, Globe, Users, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AboutUs = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen text-white pt-24 pb-20 px-6 relative z-10 w-full overflow-hidden">
      <div className="max-w-[70rem] mx-auto z-10 relative">
        
        {/* Header Section */}
        <div className="text-center mb-24">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Box className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
            Connecting Worlds <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
              Through Art
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Artisphere is a revolutionary digital canvas bridging the gap between brilliant creators and passionate collectors. We bring the museum experience to your fingertips through immersive 3D technology.
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-sm">
            <Globe className="w-10 h-10 text-violet-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider">Our Vision</h3>
            <p className="text-zinc-400 leading-relaxed font-light">
              To democratize the art world by creating a borderless, accessible space where physical location no longer dictates who can experience, purchase, or exhibit breathtaking artwork. We believe that art is a universal language, and our gallery serves as the global interpreter.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-sm">
            <Brush className="w-10 h-10 text-fuchsia-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider">Our Mission</h3>
            <p className="text-zinc-400 leading-relaxed font-light">
              We empower independent artists with cutting-edge tools to showcase their work in fully realized 3D environments, while giving art lovers an unprecedented, interactive way to browse, curate, and collect masterpieces from emerging talent worldwide.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="border-y border-white/10 py-16 mb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black mb-2">12k+</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Artworks Hosted</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">850</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Global Artists</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">50+</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">3D Exhibitions</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">5M</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Virtual Visitors</div>
            </div>
          </div>
        </div>

        {/* Contact/CTA */}
        <div className="text-center bg-gradient-to-tr from-white/5 to-transparent border border-white/10 p-12 rounded-3xl">
          <h2 className="text-3xl font-bold mb-4 uppercase tracking-tight">Join the Revolution</h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8 font-light">
            Whether you are an artist looking for a digital stage, or a collector seeking your next masterpiece, the Artisphere community welcomes you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => { !userInfo ? toast.error("Please login to continue") : navigate("/gallery")} } className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-colors">
              Explore 3D Gallery
            </button>
            <Link to="/" className="px-8 py-4 rounded-full font-bold bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
              Return Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;
