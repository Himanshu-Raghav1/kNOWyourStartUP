"use client";

import React, { useState } from "react";
import { ColorSwatch } from "@/types";
import { Copy, Check, Palette } from "lucide-react";

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  primary:    { label: "Primary",    color: "text-[#FF542E]",   bg: "bg-[#FF542E]/10" },
  secondary:  { label: "Secondary",  color: "text-slate-300",   bg: "bg-white/10" },
  accent:     { label: "Accent",     color: "text-yellow-300",  bg: "bg-yellow-400/10" },
  background: { label: "Background", color: "text-slate-400",   bg: "bg-white/5" },
  surface:    { label: "Surface",    color: "text-blue-300",    bg: "bg-blue-500/10" },
};

interface ColorSwatchPaletteProps {
  colors: ColorSwatch[];
}

function isLight(hex: string): boolean {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export function ColorSwatchPalette({ colors }: ColorSwatchPaletteProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Palette className="w-4 h-4 text-emerald-400" />
        </div>
        <h4 className="font-heading font-bold text-sm text-white">Brand Color Palette</h4>
        <span className="text-[10px] font-mono text-slate-500 ml-auto">{colors.length} colors defined</span>
      </div>

      {/* Full-width combined preview bar */}
      <div className="h-10 w-full rounded-xl overflow-hidden flex shadow-lg shadow-black/40">
        {colors.map((c) => (
          <div
            key={c.hex}
            className="flex-1 hover:flex-[2] transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: c.hex }}
            onClick={() => handleCopy(c.hex)}
            title={`${c.name}: ${c.hex}`}
          />
        ))}
      </div>

      {/* Individual swatch cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {colors.map((swatch) => {
          const light = isLight(swatch.hex);
          const textColor = light ? "text-black" : "text-white";
          const subTextColor = light ? "text-black/60" : "text-white/60";
          const role = ROLE_BADGE[swatch.usageRole] ?? ROLE_BADGE.primary;

          return (
            <div
              key={swatch.hex}
              className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition group"
            >
              {/* Big colour block */}
              <div
                className="h-28 flex items-end justify-between p-4 relative overflow-hidden"
                style={{ backgroundColor: swatch.hex }}
              >
                <div>
                  <p className={`font-heading font-bold text-base leading-tight ${textColor}`}>{swatch.name}</p>
                  <p className={`font-mono text-xs ${subTextColor}`}>{swatch.hex}</p>
                </div>
                <button
                  onClick={() => handleCopy(swatch.hex)}
                  className={`opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm border ${
                    light
                      ? "bg-black/20 text-black border-black/20"
                      : "bg-white/20 text-white border-white/20"
                  }`}
                >
                  {copiedHex === swatch.hex ? (
                    <><Check className="w-3 h-3" /> Copied!</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy HEX</>
                  )}
                </button>
              </div>

              {/* Meta section */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-white/10 ${role.bg} ${role.color}`}>
                    {role.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {swatch.emotionalAssociation}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS Variables Export */}
      <div className="glass-panel p-4 rounded-xl border border-white/5">
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">CSS Custom Properties</p>
        <pre className="font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`:root {\n${colors.map((c) => `  --color-${c.usageRole}: ${c.hex};`).join("\n")}\n}`}
        </pre>
      </div>
    </div>
  );
}
