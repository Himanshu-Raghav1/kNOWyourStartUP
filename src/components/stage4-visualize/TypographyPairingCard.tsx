"use client";

import React from "react";
import { TypographySpec } from "@/types";
import { Type, ExternalLink } from "lucide-react";

interface TypographyPairingCardProps {
  typography: TypographySpec;
  brandName?: string;
  tagline?: string;
}

export function TypographyPairingCard({ typography, brandName = "BrandOS", tagline = "Your brand, built with intelligence." }: TypographyPairingCardProps) {
  const googleFontsUrl = `https://fonts.google.com/share?selection.family=${encodeURIComponent(typography.headingFont)}|${encodeURIComponent(typography.bodyFont)}`;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Type className="w-4 h-4 text-blue-400" />
          </div>
          <h4 className="font-heading font-bold text-sm text-white">Typography Pairing Studio</h4>
        </div>
        <a
          href={googleFontsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
        >
          <ExternalLink className="w-3 h-3" />
          Open in Google Fonts
        </a>
      </div>

      {/* Live Preview Block */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e1015] to-black/60 border border-white/5 space-y-4">
        {/* Heading preview */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Heading Font · {typography.headingFont}</p>
          <p
            className="text-3xl md:text-4xl font-black text-white leading-tight"
            style={{ fontFamily: `"${typography.headingFont}", ${typography.headingFallback}` }}
          >
            {brandName}
          </p>
          <p
            className="text-xl font-semibold text-slate-300"
            style={{ fontFamily: `"${typography.headingFont}", ${typography.headingFallback}` }}
          >
            Build with people who show up.
          </p>
        </div>

        <div className="border-t border-white/5 pt-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Body Font · {typography.bodyFont}</p>
          <p
            className="text-sm text-slate-300 leading-relaxed max-w-md"
            style={{ fontFamily: `"${typography.bodyFont}", ${typography.bodyFallback}` }}
          >
            {tagline} University students routinely get paired with unresponsive teammates on high-stakes projects — Campfire fixes that with verified commitment histories and reciprocal peer vouching.
          </p>
        </div>
      </div>

      {/* Font specs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Heading spec */}
        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <p className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-2">Heading Typeface</p>
          <p
            className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: `"${typography.headingFont}", ${typography.headingFallback}` }}
          >
            Aa Bb Cc
          </p>
          <p className="text-xs font-semibold text-white mb-0.5">{typography.headingFont}</p>
          <p className="text-[11px] font-mono text-slate-500">Fallback: {typography.headingFallback}</p>
          <div className="mt-2 flex gap-2">
            {["Black", "Bold", "Medium"].map((w) => (
              <span key={w} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Body spec */}
        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <p className="text-[10px] font-mono text-blue-400 uppercase tracking-wider mb-2">Body Typeface</p>
          <p
            className="text-2xl font-normal text-white mb-1"
            style={{ fontFamily: `"${typography.bodyFont}", ${typography.bodyFallback}` }}
          >
            Aa Bb Cc
          </p>
          <p className="text-xs font-semibold text-white mb-0.5">{typography.bodyFont}</p>
          <p className="text-[11px] font-mono text-slate-500">Fallback: {typography.bodyFallback}</p>
          <div className="mt-2 flex gap-2">
            {["Regular", "Medium", "SemiBold"].map((w) => (
              <span key={w} className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pairing Rationale */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Design Rationale</p>
        <p className="text-xs text-slate-300 leading-relaxed">{typography.pairingRationale}</p>
      </div>
    </div>
  );
}
