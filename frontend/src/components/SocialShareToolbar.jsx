import React from "react";
import {
  MessageCircle,
  Facebook,
  Linkedin,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { openShareWindow } from "../utils/socialShare.js";

/**
 * @param {{ whatsapp: string; facebook: string; linkedin: string; twitter: string }} links
 */
export default function SocialShareToolbar({
  links,
  copied,
  onCopy,
  compact = false,
  showLabel = false,
  className = "",
}) {
  const icon = compact ? 14 : 15;
  const pad = compact ? "p-1.5" : "p-2";

  const baseBtn = `${pad} rounded-full transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-1 active:scale-[0.94] disabled:opacity-40`;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md px-1 py-1 ${className}`}
      role="group"
      aria-label="Share this page"
    >
      {showLabel && (
        <span className="hidden md:inline pl-2.5 pr-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Share
        </span>
      )}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          aria-label="Share on WhatsApp"
          title="WhatsApp"
          onClick={() => openShareWindow(links.whatsapp)}
          className={`${baseBtn} text-zinc-400 hover:text-[#25D366] hover:bg-[#25D366]/15 hover:shadow-[0_0_16px_rgba(37,211,102,0.15)]`}
        >
          <MessageCircle size={icon} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Share on Facebook"
          title="Facebook"
          onClick={() => openShareWindow(links.facebook)}
          className={`${baseBtn} text-zinc-400 hover:text-[#88b4ff] hover:bg-[#1877F2]/18 hover:shadow-[0_0_16px_rgba(24,119,242,0.12)]`}
        >
          <Facebook size={icon} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Share on LinkedIn"
          title="LinkedIn"
          onClick={() => openShareWindow(links.linkedin)}
          className={`${baseBtn} text-zinc-400 hover:text-[#7dd3fc] hover:bg-[#0A66C2]/20 hover:shadow-[0_0_16px_rgba(10,102,194,0.12)]`}
        >
          <Linkedin size={icon} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Share on X"
          title="X (Twitter)"
          onClick={() => openShareWindow(links.twitter)}
          className={`${baseBtn} text-zinc-400 hover:text-white hover:bg-white/12 hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]`}
        >
          <Share2 size={icon} strokeWidth={2} />
        </button>
        <span className="mx-0.5 h-5 w-px shrink-0 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        <button
          type="button"
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Copied" : "Copy link"}
          onClick={onCopy}
          className={`${baseBtn} ${
            copied
              ? "text-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-500/35 shadow-[0_0_14px_rgba(52,211,153,0.12)]"
              : "text-zinc-400 hover:text-violet-200 hover:bg-violet-500/15 hover:shadow-[0_0_14px_rgba(139,92,246,0.12)]"
          }`}
        >
          {copied ? (
            <Check size={icon} strokeWidth={2.5} className="text-emerald-400" />
          ) : (
            <Copy size={icon} strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
