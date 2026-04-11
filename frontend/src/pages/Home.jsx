import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import Artwork from "../components/Artwork";
import Exibition from "../components/Exibition";
import Cta from "../components/Cta";

const Home = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-violet-500 origin-left z-[100]"
        style={{ scaleX }}
      />
      <HeroSection />
      <Features />
      <Artwork />
      <Exibition />
      <Cta />
    </motion.main>
  );
};

export default Home;
