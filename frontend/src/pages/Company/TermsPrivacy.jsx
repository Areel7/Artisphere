import React from 'react';
import { Shield, FileText } from 'lucide-react';

const TermsPrivacy = () => {
  return (
    <div className="min-h-screen text-white pt-32 pb-20 px-6 relative z-10 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto z-10 relative bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/10">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">Terms & Privacy</h1>
            <p className="text-zinc-400 mt-1">Last updated: August 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-zinc-300 font-light leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" /> 1. Terms of Service
            </h2>
            <p className="mb-4">
              Welcome to Artisphere. By accessing or using our platform, you agree to be bound by these terms. Our 3D gallery and artwork marketplace are intended for users who are at least 18 years of age. You agree to use the platform responsibly and not to engage in any activity that could harm the integrity of the ecosystem.
            </p>
            <p>
              Artists retain all intellectual property rights to their original works. When an artwork is sold, the buyer receives the physical piece (if applicable) and a verifiable digital certificate of authenticity, but the copyright remains with the creator unless explicitly transferred in writing.
            </p>
          </section>

          <div className="w-full h-px bg-white/10" />

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" /> 2. Privacy Policy
            </h2>
            <p className="mb-4">
              Your privacy is of paramount importance to us. We collect minimal personal data—only what is necessary to securely process transactions, curate your 3D gallery experience, and allow you to interact closely with artists.
            </p>
            <p className="mb-4">
              We never sell your personal footprint or gallery traversal data to third-party advertising networks. Your payment information is securely tokenized via our payment gateways (Stripe) and is never stored on Artisphere servers.
            </p>
            <p>
              By using our service, you consent to the storage of essential session cookies required for authentication and rendering preferences in the 3D gallery.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};

export default TermsPrivacy;
