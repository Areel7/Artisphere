import React from 'react';
import { Box, Instagram, Twitter, Github } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <>
    <footer className="relative z-10 border-t border-white/10 bg-zinc-950 pt-16 pb-8">
        <div className="max-w-[90rem] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-2 mb-4">
                <Box onClick={() => navigate('/')} className="w-6 h-6 text-white" />
                <span className="text-lg font-bold tracking-widest uppercase">Artisphere</span>
              </div>
              <p className="text-white/50 max-w-sm font-light text-sm leading-relaxed mb-6">
                Interactive online art gallery. Browse, explore, interact, and experience art online.
              </p>
              <div className="flex items-center gap-4">
                {[Instagram, Twitter, Github].map((Icon, i) => (
                  <a key={i} href="#" className="text-white/40 hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-white/80">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/search" className="text-white/50 hover:text-white transition-colors">Discover Art</Link></li>
                <li><Link to="/gallery" className="text-white/50 hover:text-white transition-colors">3D Exhibitions</Link></li>
                <li><Link to="/curators" className="text-white/50 hover:text-white transition-colors">Curators</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-widest text-white/80">Company</h4>
              <ul className="space-y-3 text-sm flex flex-col items-start">
                <li><Link to="/about" className="text-white/50 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/terms" className="text-white/50 hover:text-white transition-colors">Terms & Privacy</Link></li>
                <li><Link to="/gdpr" className="text-white/50 hover:text-white transition-colors">GDPR Compliance</Link></li>
                <li><Link to="/support" className="text-white/50 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-white/40 text-xs">
            <p>© 2026 Artisphere. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Powered by WebGL & Stripe</p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer