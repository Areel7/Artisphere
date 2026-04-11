import React from "react";
import { Outlet } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ParticleBackground from "./components/ParticleBackground";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import { useTheme } from "./context/ThemeContext.jsx";

const App = () => {
  const { theme } = useTheme();
  return (
    <div className="relative min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-white font-sans selection:bg-zinc-900/20 selection:text-zinc-900 dark:selection:bg-white/30 dark:selection:text-white">
      <ScrollToTop />
      <ParticleBackground />
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
      <Header />
      <main className="relative z-20 flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
