import React, { useState } from "react";
import SignInandSignUp from "../pages/Auth/SignInandSignUp";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useApplyAsRoleMutation } from "../redux/api/request.js";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};


const Cta = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const userInfo = useSelector((state) => state.auth.userInfo);
  const [applyAsRole, { isLoading: applying }] = useApplyAsRoleMutation();

  const handleApplyAsArtist = async () => {
    if (applying) return;
    try {
      const res = await applyAsRole("artist").unwrap();
      toast.success(
        res.msg ||
          "Application submitted! A superadmin will review and activate your artist account.",
        { autoClose: 6000 },
      );
    } catch (error) {
      const msg =
        error?.data?.errors?.[0]?.msg ||
        error?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <>
      {/* Auth Modal */}
      <SignInandSignUp
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />

      {/* CTA Section */}
      {!userInfo && (
      <section className="relative min-h-[100svh] flex items-center pt-32 pb-32 px-6 overflow-hidden text-zinc-900 dark:text-white border-y border-zinc-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-white/90 border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:bg-zinc-900/90 dark:border-white/10 p-12 md:p-24 relative overflow-hidden dark:shadow-2xl backdrop-blur-xl">
          {/* Decorative glow inside CTA */}
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
          
          <motion.div 
            className="relative z-10 text-center"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-zinc-900 dark:text-white">
              Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500">Artisphere</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-white/60 mb-10 font-light max-w-2xl mx-auto">
              Whether you are an artist ready to build a 3D gallery, or a
              collector seeking the next masterpiece.
            </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/register">
            <button
              onClick={() => {
                setAuthMode("signup");
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-300"
            >
              Create Free Account
            </button>
            </Link>
            
            </div>
          </motion.div>
        </div>
      </section>
      )}


{userInfo?.role === "visitor" && (
      <section className="py-24 px-6 relative bg-zinc-50/80 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white backdrop-blur-md">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-white/90 border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:bg-zinc-900/90 dark:border-white/10 p-12 md:p-24 relative overflow-hidden dark:shadow-2xl backdrop-blur-xl">
          {/* Decorative glow inside CTA */}
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
          
          <motion.div 
            className="relative z-10 text-center"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-zinc-900 dark:text-white">
              Join the Artisphere
            </h2>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-white/60 mb-10 font-light max-w-2xl mx-auto">
              Whether you are an artist ready to build a 3D gallery, or a
              collector seeking the next masterpiece.
            </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <button onClick={handleApplyAsArtist} disabled={applying} className="w-full sm:w-auto px-8 py-4 border-2 border-zinc-200 bg-white text-zinc-900 rounded-full font-bold shadow-sm hover:border-zinc-900 hover:bg-zinc-50 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/5 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none">
                {applying ? "Submitting…" : "Apply as Artist"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
      )}
    </>
  );
};

export default Cta;
