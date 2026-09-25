"use client";

import React, { useState } from "react";
import { DeliverData } from "@/types";
import { Rocket, Copy, Check, Monitor, ExternalLink, Twitter, Linkedin, ShoppingBag, Megaphone } from "lucide-react";

const PLATFORM_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  twitter:      { label: "X / Twitter",    icon: <Twitter className="w-4 h-4" />,      color: "text-sky-300",    bg: "bg-sky-500/10",    border: "border-sky-500/25" },
  linkedin:     { label: "LinkedIn",        icon: <Linkedin className="w-4 h-4" />,     color: "text-blue-300",   bg: "bg-blue-500/10",   border: "border-blue-500/25" },
  product_hunt: { label: "Product Hunt",   icon: <ShoppingBag className="w-4 h-4" />, color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/25" },
  instagram:    { label: "Instagram",       icon: <Megaphone className="w-4 h-4" />,   color: "text-pink-300",   bg: "bg-pink-500/10",   border: "border-pink-500/25" },
};

interface LaunchDeckProps {
  data: DeliverData;
  brandName?: string;
}

export function LaunchDeck({ data, brandName = "Your Brand" }: LaunchDeckProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition"
    >
      {copiedKey === id ? <><Check className="w-3 h-3 text-emerald-400" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Hero Landing Page Mockup */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {/* Mock browser chrome */}
        <div className="bg-[#0a0c10] px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-400/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
          </div>
          <div className="flex-1 mx-3 bg-white/5 rounded-md px-3 py-1 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
            <Monitor className="w-3 h-3" /> joincampfire.app
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
        </div>

        {/* Landing page hero */}
        <div className="relative px-8 py-14 text-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,84,46,0.15) 0%, #090a0f 60%)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 50% 100%, rgba(232,255,84,0.04) 0%, transparent 60%)" }} />

          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400 font-mono mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {brandName} · Now Live
          </div>

          <h1 className="font-heading text-3xl md:text-5xl font-black text-white leading-tight max-w-2xl mx-auto mb-4">
            {data.landingPageHero.headline}
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            {data.landingPageHero.subheadline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className="px-6 py-3 rounded-xl bg-[#FF542E] text-white font-bold text-sm hover:bg-[#ff6947] transition shadow-lg shadow-[#FF542E]/30">
              {data.landingPageHero.primaryCtaText} →
            </button>
            {data.landingPageHero.secondaryCtaText && (
              <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/15 text-slate-200 font-medium text-sm hover:bg-white/10 transition">
                {data.landingPageHero.secondaryCtaText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pitch Texts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-[#E8FF54]/20 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-[#E8FF54] uppercase tracking-wider flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5" /> One-Line Pitch
            </p>
            <CopyBtn text={data.oneLinePitch} id="one-liner" />
          </div>
          <p className="text-base font-bold text-white leading-snug">&ldquo;{data.oneLinePitch}&rdquo;</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Elevator Pitch (30s)</p>
            <CopyBtn text={data.elevatorPitch} id="elevator" />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{data.elevatorPitch}</p>
        </div>
      </div>

      {/* Social Launch Posts */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          Multi-Platform Launch Posts ({data.launchSocialPosts.length})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.launchSocialPosts.map((post, i) => {
            const meta = PLATFORM_META[post.platform] ?? PLATFORM_META.twitter;
            const fullText = `${post.hook}\n\n${post.body}\n\n${post.callToAction}`;
            return (
              <div key={i} className={`glass-panel p-5 rounded-2xl border ${meta.border} ${meta.bg} space-y-3`}>
                {/* Platform header */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${meta.color}`}>
                    {meta.icon}
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">{meta.label}</span>
                  </div>
                  <CopyBtn text={fullText} id={`post-${i}`} />
                </div>

                {/* Post hook */}
                <p className="text-sm font-bold text-white">{post.hook}</p>

                {/* Post body */}
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{post.body}</p>

                {/* CTA */}
                <div className={`text-[11px] font-mono ${meta.color} bg-black/30 px-3 py-2 rounded-lg border border-white/5`}>
                  → {post.callToAction}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Guardrails */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          Brand Guardrails ({data.brandGuardrails.length} Rules)
        </h4>
        {data.brandGuardrails.map((g, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl border border-white/10 flex items-start gap-4">
            <div className="w-7 h-7 rounded-lg bg-[#FF542E]/20 border border-[#FF542E]/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-black text-[#FF542E]">{i + 1}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">{g.rule}</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{g.whyItMatters}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
