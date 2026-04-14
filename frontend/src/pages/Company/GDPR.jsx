import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';

const GDPR = () => {
  return (
    <div className="min-h-screen text-zinc-900 dark:text-white pt-32 pb-20 px-6 relative z-10 w-full overflow-hidden">
      <div className="max-w-4xl mx-auto z-10 relative bg-white/90 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-sm dark:shadow-none">
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 rounded-2xl flex items-center justify-center border border-zinc-200 dark:border-white/10">
            <Lock className="w-7 h-7 text-zinc-800 dark:text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-zinc-900 dark:text-white">GDPR <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-500 italic">
                Compliance
              </span></h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">European Union Data Protection Standard</p>
          </div>
        </div>

        <div className="space-y-6 text-zinc-700 dark:text-zinc-300 font-light leading-relaxed">
          <p className="text-lg text-zinc-900 dark:text-white mb-6">
            Artisphere is fully committed to compliance with the General Data Protection Regulation (GDPR). We ensure that European Union citizens—and all global users—have complete sovereignty over their personal data.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            <div className="bg-zinc-100/90 dark:bg-black/20 p-6 rounded-xl border border-zinc-200 dark:border-white/5">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Right to Access</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">You have the right to request a complete export of all personal data we currently hold about you in a machine-readable format.</p>
            </div>
            <div className="bg-zinc-100/90 dark:bg-black/20 p-6 rounded-xl border border-zinc-200 dark:border-white/5">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Right to be Forgotten</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">You can request the permanent deletion of your account and all associated personal data from our active databases at any time.</p>
            </div>
            <div className="bg-zinc-100/90 dark:bg-black/20 p-6 rounded-xl border border-zinc-200 dark:border-white/5">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Data Portability</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">Transitioning to another platform? Your gallery preferences and past orders remain yours to transfer securely.</p>
            </div>
            <div className="bg-zinc-100/90 dark:bg-black/20 p-6 rounded-xl border border-zinc-200 dark:border-white/5">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Breach Notification</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">In the highly unlikely event of a data breach, we adhere to strict 72-hour notification policies to alert affected users.</p>
            </div>
          </div>

          <div className="mt-10 p-6 bg-zinc-100/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Data Protection Officer</h3>
            <p className="text-sm mb-4 text-zinc-700 dark:text-zinc-300">
              For any GDPR-specific inquiries, data export requests, or account deletion procedures, please contact our Data Protection Officer directly.
            </p>
            <a href="mailto:privacy@artisphere.com" className="text-cyan-700 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium transition-colors">
              privacy@artisphere.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GDPR;
