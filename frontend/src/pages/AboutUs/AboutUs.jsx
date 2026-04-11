import React from 'react';
import { Box, Map, Brush, Globe, Users, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { motion, animate, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const CountUp = ({ to, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, to, {
      duration: 1.2,
      ease: "circOut",
      onUpdate: (value) => {
        setCount(Math.floor(value));
      }
    });
    return () => controls.stop();
  }, [to, isInView]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const AboutUs = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen text-white pt-32 pb-24 px-6 relative w-full overflow-hidden bg-zinc-950">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-full max-w-3xl h-[40rem] bg-fuchsia-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full max-w-3xl h-[40rem] bg-violet-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[70rem] mx-auto z-10 relative">
        
        {/* Header Section */}
        <motion.div 
          className="text-center mb-24"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Box className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-6">
            Connecting Worlds <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
              Through Art
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Artisphere is a revolutionary digital canvas bridging the gap between brilliant creators and passionate collectors. We bring the museum experience to your fingertips through immersive 3D technology.
          </motion.p>
        </motion.div>

        {/* Vision & Mission Grid */}
        <motion.div 
           className="grid md:grid-cols-2 gap-12 mb-24"
           variants={staggerContainer}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-10 rounded-3xl backdrop-blur-sm">
            <Globe className="w-10 h-10 text-violet-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider">Our Vision</h3>
            <p className="text-zinc-400 leading-relaxed font-light">
              To democratize the art world by creating a borderless, accessible space where physical location no longer dictates who can experience, purchase, or exhibit breathtaking artwork. We believe that art is a universal language, and our gallery serves as the global interpreter.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-10 rounded-3xl backdrop-blur-sm">
            <Brush className="w-10 h-10 text-fuchsia-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider">Our Mission</h3>
            <p className="text-zinc-400 leading-relaxed font-light">
              We empower independent artists with cutting-edge tools to showcase their work in fully realized 3D environments, while giving art lovers an unprecedented, interactive way to browse, curate, and collect masterpieces from emerging talent worldwide.
            </p>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
           className="border-y border-white/10 py-16 mb-24"
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black mb-2"><CountUp to={12} suffix="k+" /></div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Artworks Hosted</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2"><CountUp to={850} /></div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Global Artists</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2"><CountUp to={50} suffix="+" /></div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">3D Exhibitions</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2"><CountUp to={5} suffix="M" /></div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Virtual Visitors</div>
            </div>
          </div>
        </motion.div>

        {/* Contact/CTA */}
        <motion.div 
           className="text-center bg-gradient-to-tr from-white/5 to-transparent border border-white/10 p-12 rounded-3xl"
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           whileInView={{ opacity: 1, scale: 1, y: 0 }}
           viewport={{ once: true, margin: "-50px" }}
           transition={{ duration: 0.6, ease: "easeOut" }}
        >
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
        </motion.div>

      </div>
    </div>
  );
};

export default AboutUs;
