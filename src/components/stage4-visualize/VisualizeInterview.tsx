"use client";

import React, { useState } from "react";
import { ShapeData, VisualizeData } from "@/types";
import { ColorSwatchPalette } from "./ColorSwatchPalette";
import { TypographyPairingCard } from "./TypographyPairingCard";
import {
  Palette,
  ArrowRight,
  RefreshCw,
  Target,
  Sparkles,
  Type,
  Eye,
  CheckCircle2
} from "lucide-react";

interface VisualizeInterviewProps {
  shapeData: ShapeData | null;
  data: VisualizeData | null;
  isLoading: boolean;
  onExecute: () => void;
  onAdvance: () => void;
  onBack: () => void;
}

const VISUAL_ENERGIES = [
  {
    title: "Electric Neo-Brutalist",
    palette: "High contrast #FF542E & #818CF8 with deep obsidian",
    desc: "Bold borders, unapologetic typography, raw startup energy."
  },
  {
    title: "Obsidian Cyber & Glass",
    palette: "Deep slate #06070a with luminous cyan & purple neon glows",
    desc: "Sleek dark-mode aesthetic with frosted glass and futuristic gradients."
  },
  {
    title: "Warm Humanist & Editorial",
    palette: "Terracotta, soft cream, and deep espresso tones",
    desc: "Approachable, organic warmth signaling empathy, trust, and craft."
  },
  {
    title: "Swiss Modernist Minimal",
    palette: "Pure stark monochrome with a single surgical electric accent",
    desc: "Ultra-clean grids, expansive whitespace, quiet luxury and precision."
  }
];

const TYPO_STYLES = [
  {
    title: "Modern Geometric Display",
    fonts: "Outfit / Plus Jakarta Sans + Inter",
    desc: "Clean, high-legibility geometric forms favored by modern tech leaders."
  },
  {
    title: "Refined Editorial Serif",
    fonts: "Playfair Display / Fraunces + Inter",
    desc: "Sophisticated editorial gravitas for premium, thoughtful products."
  },
  {
    title: "Technical Developer Mono",
    fonts: "JetBrains Mono / Space Grotesk + Inter",
    desc: "Direct, technical credibility for developer tools and engineering apps."
  }
];

export function VisualizeInterview({
  shapeData,
  data,
  isLoading,
  onExecute,
  onAdvance,
  onBack
}: VisualizeInterviewProps) {
  const [selectedEnergy, setSelectedEnergy] = useState<number>(0);
  const [selectedTypo, setSelectedTypo] = useState<number>(0);

  return (
    <div className="space-y-8">
      {/* Agency Interview Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Stage 04 · Visual Design Brief
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Chain-Prompt Ingested: ShapeData & Naming Locked
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1.5">
              Visual System & Aesthetic Direction
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              We translate brand personality into visual physics: a 5-color semantic palette with psychological rationales, font pairings, and iconic symbol concepts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
            >
              ← Back to Stage 3
            </button>
            {data && (
              <button
                onClick={onAdvance}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                Advance to Step 5 — Brand Audit <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upstream Chain Context Banner */}
      {shapeData && (
        <div className="glass-panel p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">
                Chained from Stage 3 Shaping:
              </p>
              <p className="text-xs font-semibold text-white truncate max-w-xl">
                Brand Name: <span className="text-[#FF542E] font-bold">&ldquo;{shapeData.selectedName}&rdquo;</span> · Tagline: &ldquo;{shapeData.selectedTagline}&rdquo;
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 shrink-0">
            ✓ Context Chained
          </span>
        </div>
      )}

      {/* Interview Options Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Energy Direction */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              What emotional visual energy matches this brand?
            </label>
            <span className="text-[10px] font-mono text-slate-400">Select Energy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {VISUAL_ENERGIES.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedEnergy(i)}
                className={`text-left p-3 rounded-xl border transition ${
                  selectedEnergy === i
                    ? "bg-emerald-500/20 border-emerald-400 text-white"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <p className="text-xs font-bold text-white">{v.title}</p>
                <p className="text-[10px] font-mono text-emerald-300 mt-0.5 line-clamp-1">{v.palette}</p>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">{v.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Typography Spirit */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-cyan-400" />
              What typography spirit should lead the system?
            </label>
            <span className="text-[10px] font-mono text-slate-400">Select Typo</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {TYPO_STYLES.map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedTypo(i)}
                className={`text-left p-3 rounded-xl border transition ${
                  selectedTypo === i
                    ? "bg-cyan-500/20 border-cyan-400 text-white"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <p className="text-xs font-bold text-white">{t.title}</p>
                <p className="text-[10px] font-mono text-cyan-300 mt-0.5">{t.fonts}</p>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Generator Bar */}
      <div className="flex items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div>
          <h4 className="text-xs font-bold text-white">Generate Visual Design Brief</h4>
          <p className="text-[11px] text-slate-400">
            Our AI compiles the 5-color token system, typography pairings, and composition rules.
          </p>
        </div>

        <button
          onClick={onExecute}
          disabled={isLoading || !shapeData}
          className="px-6 py-3 rounded-xl bg-[#FF542E] hover:bg-[#FF6B47] disabled:opacity-40 text-white font-bold text-xs transition flex items-center gap-2 shadow-xl shadow-[#FF542E]/25 shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Visual Brief...
            </>
          ) : (
            <>
              <Palette className="w-4 h-4" />
              {data ? "Re-Generate Visual Brief" : "Generate Visual Brief"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Render Results if available */}
      {data && (
        <div className="space-y-8 pt-4 border-t border-white/10">
          <ColorSwatchPalette colors={data.colorPalette} />
          <TypographyPairingCard
            typography={data.typography}
            brandName={shapeData?.selectedName}
            tagline={shapeData?.selectedTagline}
          />

          {/* Logo & Symbol Concepts Bento */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 bg-[#0E1424]/85">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="font-heading font-bold text-base text-white">
                Iconic Logo & Symbol Concepts
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.logoAndSymbolConcepts.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#131B30]/70 p-4 rounded-xl border border-white/10 space-y-2 hover:border-[#818CF8]/40 transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#6366F1]/15 text-[#818CF8] font-bold text-xs flex items-center justify-center font-mono">
                    0{idx + 1}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
