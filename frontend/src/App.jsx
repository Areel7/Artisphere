import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ScrollToTop from "./components/ScrollToTop";
import ParticleBackground from "./components/ParticleBackground";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import { useTheme } from "./context/ThemeContext.jsx";

const App = () => {
  const { theme } = useTheme();
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  if (userInfo?.role === "superadmin" && !location.pathname.startsWith("/admin/dashboard")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className={`relative min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-white font-sans selection:bg-zinc-900/20 selection:text-zinc-900 dark:selection:bg-white/30 dark:selection:text-white ${userInfo?.role === "superadmin" ? "flex flex-col h-screen overflow-hidden" : ""}`}>
      <ScrollToTop />
      <ParticleBackground />
      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
      {userInfo?.role !== "superadmin" && <Header />}
      <main className={`relative z-20 flex-1 flex flex-col ${userInfo?.role === "superadmin" ? "overflow-hidden" : ""}`}>
        <Outlet />
      </main>
      {userInfo?.role !== "superadmin" && <Footer />}
    </div>
  );
};

export default App;
