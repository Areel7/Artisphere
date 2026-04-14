import React from "react";
import { Maximize, Layers, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

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

const Features = () => {
  return (
    <>
      {/* Value Proposition / Features */}
      <section className="mt-12 lg:mt-24 py-16 border-y border-zinc-200 bg-zinc-100/50 dark:border-white/5 dark:bg-black/20 backdrop-blur-sm overflow-hidden text-zinc-900 dark:text-white">
        <motion.div 
          className="max-w-[90rem] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {[
            {
              icon: Maximize,
              title: "Interactive 3D Walkthroughs",
              desc: "Experience spatial art in your browser or AR.",
            },
            {
              icon: Layers,
              title: "Multimedia Storytelling",
              desc: "Dive deeper into the context of every masterpiece.",
            },
            {
              icon: ShoppingCart,
              title: "Seamless Ecommerce",
              desc: "Secure purchases directly from artists and curators.",
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className="flex flex-col gap-3 opacity-90 hover:opacity-100 transition-all duration-300 p-6 rounded-2xl bg-transparent border border-transparent hover:bg-white hover:border-zinc-200 hover:shadow-xl dark:hover:bg-white/5 dark:hover:border-white/10 dark:hover:shadow-none"
            >
              <feature.icon className="w-6 h-6 text-zinc-900 dark:text-white" />
              <h4 className="font-bold text-lg text-zinc-900 dark:text-white">{feature.title}</h4>
              <p className="text-sm text-zinc-600 dark:text-white/60 font-medium dark:font-light">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
};

export default Features;
