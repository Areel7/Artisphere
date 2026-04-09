import React from "react";
import { Outlet } from "react-router-dom";
import ParticleBackground from "./components/ParticleBackground";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-white font-sans selection:bg-white/30 selection:text-white">
      <ParticleBackground />
      <ToastContainer />
      <Header />
      <main className="relative z-20 flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
