import React from 'react';
import { Instagram, Twitter, Github } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <>
    <footer className="relative z-10 border-t border-zinc-200 dark:border-white/10 bg-zinc-100/80 dark:bg-zinc-950 pt-16 pb-8">
        <div className="max-w-[90rem] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-1.5 mb-4 cursor-pointer group select-none" onClick={() => navigate('/')}>
                {/* Stylised A lettermark */}
                <svg
                  width="30" height="30" viewBox="0 0 36 36" fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0 transition-transform duration-500 group-hover:scale-110"
                >
                  <defs>
                    <linearGradient id="aGradHF" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                    <linearGradient id="aGradVF" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                  <path d="M5 30L18 5L31 30" stroke="url(#aGradVF)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M10.5 21H25.5" stroke="url(#aGradHF)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="18" cy="5" r="2" fill="#d946ef" />
                </svg>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-base font-semibold tracking-[0.15em] uppercase bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-violet-400 bg-clip-text text-transparent"
                >
                  rtisphere
                </span>
              </div>
              <p className="text-zinc-600 dark:text-white/50 max-w-sm font-light text-sm leading-relaxed mb-6">
                Interactive online art gallery. Browse, explore, interact, and experience art online.
              </p>
              <div className="flex items-center gap-4">
                {[Instagram, Twitter, Github].map((Icon, i) => (
                  <a key={i} href="#" className="text-zinc-500 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-zinc-800 dark:text-white/80">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/search" className="text-zinc-600 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors">Discover Art</Link></li>
                <li>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById("exhibitions");
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth" });
                      } else {
                        navigate("/");
                        setTimeout(() => {
                          document.getElementById("exhibitions")?.scrollIntoView({ behavior: "smooth" });
                        }, 300);
                      }
                    }}
                    className="text-zinc-600 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors"
                  >
                    3D Exhibitions
                  </button>
                </li>
                <li><Link to="/curators" className="text-zinc-600 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors">Curators</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-zinc-800 dark:text-white/80">Company</h4>
              <ul className="space-y-3 text-sm flex flex-col items-start">
                <li><Link to="/about" className="text-zinc-600 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/terms" className="text-zinc-600 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors">Terms & Privacy</Link></li>
                <li><Link to="/gdpr" className="text-zinc-600 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors">GDPR Compliance</Link></li>
                <li><Link to="/support" className="text-zinc-600 hover:text-zinc-900 dark:text-white/50 dark:hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/40 text-xs">
            <p>© 2026 Artisphere. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Powered by WebGL & Stripe</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer