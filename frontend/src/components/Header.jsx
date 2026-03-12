import React, { useState, useEffect } from "react";
import { Box, Search, ShoppingCart, Menu, X } from "lucide-react";
import SignInandSignUp from "../pages/Auth/SignInandSignUp";
import { Link } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>

    <SignInandSignUp
      isAuthModalOpen={isAuthModalOpen}
      setIsAuthModalOpen={setIsAuthModalOpen}
      authMode={authMode}
      setAuthMode={setAuthMode}
    />



      {/* Minimal Chrome Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-zinc-950/80 backdrop-blur-lg border-b border-white/5 py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <Box className="w-7 h-7 text-white group-hover:rotate-180 transition-transform duration-700" />
            <span className="text-xl font-bold tracking-widest uppercase">
              Artisphere
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 bg-white/5 px-8 py-3 rounded-full border border-white/5 backdrop-blur-md">
            {["Discovery", "Exhibitions", "3D Spaces", "Artists"].map(
              (item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-xs font-semibold uppercase tracking-widest text-white/60 hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              ),
            )}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button className="text-white/70 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-white/70 hover:text-white transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            <Link to="/auth/login">
            <button
              onClick={() => openAuth("signin") }
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Sign In
            </button>
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-zinc-950/95 backdrop-blur-xl z-40 transition-transform duration-500 flex flex-col items-center justify-center ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center gap-8 text-2xl font-light">
          {["Discovery", "Exhibitions", "3D Spaces", "Artists", "Cart"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-white/60 transition-colors"
              >
                {item}
              </a>
            ),
          )}
          <button
            onClick={() => openAuth("signin")}
            className="hover:text-white/60 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
