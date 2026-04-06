import React, { useState } from "react";
import SignInandSignUp from "../pages/Auth/SignInandSignUp";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Cta = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const userInfo = useSelector((state) => state.auth.userInfo);

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
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Join the Artisphere
          </h2>
          <p className="text-xl text-white/60 mb-10 font-light">
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
        </div>
      </section>
      )}


{userInfo?.role === "visitor" && (
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Join the Artisphere
          </h2>
          <p className="text-xl text-white/60 mb-10 font-light">
            Whether you are an artist ready to build a 3D gallery, or a
            collector seeking the next masterpiece.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <button className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white rounded-full font-semibold hover:bg-white/5 transition-colors">
                Apply as Artist
              </button>
          </div>
        </div>
      </section>
      )}
    </>
  );
};

export default Cta;
