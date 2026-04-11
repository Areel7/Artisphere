import React, { useState } from "react";
import SignInandSignUp from "../pages/Auth/SignInandSignUp";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateRequestMutation } from "../redux/api/request.js"
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
  const [createRequest] = useCreateRequestMutation();




  const handleApplyAsArtist = async () => {
    try {
      await createRequest({}).unwrap();
      toast.success("Request sent successfully");
    } catch (error) {
      toast.error(error?.data?.message || "already send request");
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
      <section className="py-24 px-6 relative bg-zinc-100/70 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-tr from-zinc-200/40 via-white/60 to-transparent dark:from-white/5 dark:via-white/5 border border-zinc-200/80 dark:border-white/10 p-12 md:p-24 relative overflow-hidden shadow-2xl backdrop-blur-sm">
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
            <Link to="/auth/register">
            <button
              onClick={() => {
                setAuthMode("signup");
                setIsAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors"
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
      <section className="py-24 px-6 relative bg-zinc-100/70 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-white">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-tr from-zinc-200/40 via-white/60 to-transparent dark:from-white/5 dark:via-white/5 border border-zinc-200/80 dark:border-white/10 p-12 md:p-24 relative overflow-hidden shadow-2xl backdrop-blur-sm">
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
               <button onClick={handleApplyAsArtist} className="w-full sm:w-auto px-8 py-4 border border-zinc-300 text-zinc-900 rounded-full font-semibold hover:bg-zinc-100 dark:border-white/20 dark:text-white dark:hover:bg-white/5 transition-colors">
                Apply as Artist
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
