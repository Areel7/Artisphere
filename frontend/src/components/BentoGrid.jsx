import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Palette, ShieldCheck } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const BentoGrid = () => {
  return (
    <section className="relative min-h-[100svh] flex items-center pt-32 pb-32 px-6 overflow-hidden text-zinc-900 dark:text-white">
      <div className="max-w-[90rem] mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-zinc-900 dark:text-white">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500 italic">Collecting.</span>
          </h2>
          <p className="text-lg text-zinc-600 dark:text-white/60 font-medium dark:font-light max-w-2xl mx-auto">
            A next-generation platform engineered to bridge the gap between physical masterpieces and limitless digital spaces.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto auto-rows-[250px]">
          
          {/* Card 1: Large Span */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-zinc-200/80 dark:border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden group flex flex-col justify-between shadow-sm hover:shadow-xl transition-shadow"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150" />
            
            <div className="relative z-10">
               <Globe className="w-10 h-10 text-indigo-500 dark:text-indigo-400 mb-6" />
               <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">Global Reach</h3>
               <p className="text-zinc-600 dark:text-white/70 text-lg leading-relaxed max-w-sm">Connect directly with creators from Paris to Tokyo. No intermediaries, just pure visual dialogue.</p>
            </div>

            {/* Decorative Dots */}
            <div className="mt-8 relative h-40 w-full rounded-xl overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
               <div className="absolute right-10 top-10 w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
               <div className="absolute left-20 bottom-10 w-2 h-2 bg-fuchsia-500 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
               <div className="absolute right-32 bottom-20 w-4 h-4 bg-violet-500 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
            </div>
          </motion.div>

          {/* Card 2: Square */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-1 lg:col-span-2 row-span-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-white/10 rounded-[2rem] p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none transition-shadow"
          >
             <Sparkles className="w-8 h-8 text-fuchsia-500 mb-4" />
             <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Immersive VR Mode</h3>
             <p className="text-zinc-600 dark:text-white/60">Walk through curated exhibitions directly in your browser using our WebGL gallery integration.</p>
          </motion.div>

          {/* Card 3: Tall Vertical */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-1 lg:col-span-1 row-span-2 bg-gradient-to-t from-zinc-100/50 to-white/90 dark:from-zinc-900/50 dark:to-zinc-800/80 backdrop-blur-md border border-zinc-200/80 dark:border-white/10 rounded-[2rem] p-8 relative overflow-hidden flex flex-col items-center text-center justify-center group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-shadow"
          >
             <ShieldCheck className="w-12 h-12 text-green-500 mb-6 group-hover:scale-110 transition-transform" />
             <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Secure Acquisitions</h3>
             <p className="text-zinc-600 dark:text-white/60 text-sm">Every physical piece shipment is verified and monitored by top-tier art handlers.</p>
          </motion.div>

          {/* Card 4: Square Dark/Light Invert */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-2 lg:col-span-1 row-span-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] p-8 border border-zinc-800 dark:border-zinc-200 relative overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform"
          >
             <Palette className="w-8 h-8 text-white/50 dark:text-zinc-900/50 mb-4 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors" />
             <h3 className="text-2xl font-bold mb-2">Curator Mode</h3>
             <p className="text-white/70 dark:text-zinc-600/80 text-sm">Build your own 3D exhibition halls, place artworks, and invite the world.</p>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
