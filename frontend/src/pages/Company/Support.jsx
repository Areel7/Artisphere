import React from 'react';
import { HelpCircle, Mail, MessageSquare, Phone } from 'lucide-react';

const Support = () => {
  return (
    <div className="min-h-screen text-white pt-32 pb-20 px-6 relative z-10 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto z-10 relative bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-white/10">
            <HelpCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">Support Center</h1>
            <p className="text-zinc-400 mt-1">We are here to help you</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:bg-white/10 transition-colors cursor-pointer">
            <Mail className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Email Support</h3>
            <p className="text-zinc-400 text-sm mb-4">We typically reply within 24 hours.</p>
            <span className="text-white font-medium">support@artisphere.com</span>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:bg-white/10 transition-colors cursor-pointer">
            <MessageSquare className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
            <p className="text-zinc-400 text-sm mb-4">Available 9 AM - 5 PM EST.</p>
            <span className="text-white font-medium">Start a Conversation</span>
          </div>
        </div>

        <div className="bg-black/30 p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-white mb-2">I bought an artwork. Where is my digital certificate?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Once payment clears via Stripe, your digital certificate of authenticity is generated and emailed to you. You can also view it anytime via your "My Orders" dashboard.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">My 3D Gallery is lagging or stuttering. What can I do?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Our 3D engine relies on hardware acceleration. Ensure that your browser has Hardware Acceleration enabled. For mobile devices, closing background apps can free up memory for a smoother experience.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">How do artists get paid?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Artists undergo a verification process during onboarding. Payments for artwork sold are routed to their connected bank account securely through our backend settlement pipeline minus the platform fee.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Support;
