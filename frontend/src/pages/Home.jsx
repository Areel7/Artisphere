import React from "react";
import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import Artwork from "../components/Artwork";
import Exibition from "../components/Exibition";
import Cta from "../components/Cta";

const Home = () => {
  return (
    <>
      <HeroSection />
      <Features />
      <Artwork />
      <Exibition />
      <Cta />
    </>
  );
};

export default Home;
