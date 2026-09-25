"use client";

import React, { useState } from "react";
import { DiscoverData, PositionData } from "@/types";
import {
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Quote,
  Target,
  Swords,
  CheckCircle2,
  Check
} from "lucide-react";

interface PositionInterviewProps {
  discoverData: DiscoverData | null;
  data: PositionData | null;
  isLoading: boolean;
  onExecute: () => void;
  onAdvance: () => void;
  onBack: () => void;
}

const CATEGORY_ARCHETYPES = [
  {
    title: "The Counter-Positioner",
    tagline: "The Rebel against corporate sterile monopolies",
    desc: "Position in direct ideological contrast to slow, bureaucratic legacy giants."
  },
  {
    title: "The Category Creator",
    tagline: "Define a brand new vocabulary and standard",
    desc: "Create an entirely new market space that makes legacy comparisons obsolete."
  },
  {
    title: "The Unbundler",
    tagline: "Take one bloated feature and make it 10x better",
    desc: "Strip away all corporate baggage and deliver pure, focused excellence."
  },
  {
    title: "The Democratizer",
    tagline: "High-end elite capability made accessible",
    desc: "Remove financial or technical gatekeeping so any solo operator can win."
  }
];

export function PositionInterview({
  discoverData,
  data,
  isLoading,
  onExecute,
  onAdvance,
  onBack
}: PositionInterviewProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<number>(0);
  const [enemy, setEnemy] = useState<string>("Bloated legacy software full of corporate friction");

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold">
              Stage 02 · Positioning Strategy
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Market Wedge &amp; Counter-Positioning
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1.5 tracking-tight">
            Strategic Market Positioning
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Positioning is how you carve space in the customer&apos;s mind. Choose your strategic posture and define your market adversary.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
          >
            ← Back to Stage 1
          </button>
          {data && (
            <button
              onClick={onAdvance}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-sky-500/25"
            >
              Advance to Stage 3 (Shape) <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Upstream Chain Context Banner */}
      {discoverData && (
        <div className="glass-panel px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#FF542E]/20 text-[#FF542E] flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono text-slate-400 uppercase">
                Chained Discovery Context:
              </p>
              <p className="text-xs font-semibold text-white truncate">
                {discoverData.problemStatement}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0 font-semibold">
            ✓ Stage 1 Context Chained
          </span>
        </div>
      )}

      {/* Strategic Market Posture Cards (4 Archetypes) */}
      <div className="space-y-3">
        <label className="font-heading font-bold text-sm text-white block">
          01 · Select Your Strategic Market Posture
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CATEGORY_ARCHETYPES.map((arch, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedArchetype(i)}
              className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden ${
                selectedArchetype === i
                  ? "bg-sky-500/15 border-sky-400 shadow-xl shadow-sky-500/15"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-black ${selectedArchetype === i ? "text-sky-300" : "text-white"}`}>
                  {arch.title}
                </span>
                {selectedArchetype === i && (
                  <span className="w-5 h-5 rounded-full bg-sky-400 text-black flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-300 font-medium">
                {arch.tagline}
              </p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {arch.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Strategic Adversary / Enemy */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 bg-[#0a0d14]/70">
        <div className="flex items-center justify-between">
          <label className="font-heading font-bold text-xs text-white flex items-center gap-2">
            <Swords className="w-4 h-4 text-rose-400" />
            02 · Who or what is the enemy your brand actively fights against?
          </label>
          <span className="text-[10px] font-mono text-slate-400">Status Quo Enemy</span>
        </div>

        <input
          type="text"
          value={enemy}
          onChange={(e) => setEnemy(e.target.value)}
          className="w-full bg-[#040508] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-400 transition"
          placeholder="e.g. Bloated enterprise feature-creep and sluggish legacy software..."
        />
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onExecute}
        disabled={isLoading || !discoverData}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 text-black font-black text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
            Synthesizing Positioning Wedge via Groq Llama 3.3...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-black" />
            {data ? "Re-Synthesize Positioning Strategy" : "Synthesize Positioning Strategy"}
            <ArrowRight className="w-4 h-4 text-black" />
          </>
        )}
      </button>

      {/* Locked Output Results (When Generated) */}
      {data && (
        <div className="space-y-6 pt-4 border-t border-white/10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
              <CheckCircle2 className="w-4 h-4" />
              Stage 02 Output Locked · PositionData
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
              Pruned JSON Contract
            </span>
          </div>

          {/* Canonical Statement */}
          <div className="glass-panel p-6 rounded-2xl border border-sky-400/30 bg-sky-500/10 space-y-2">
            <div className="flex items-center gap-2 text-sky-300">
              <Quote className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                Canonical Positioning Statement
              </span>
            </div>
            <p className="font-heading text-base md:text-lg font-bold text-white leading-relaxed">
              &ldquo;{data.positioningStatement}&rdquo;
            </p>
          </div>

          {/* Category & Differentiator Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1.5 bg-[#0a0d14]/70">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                Defined Market Category
              </span>
              <p className="text-sm font-bold text-white">
                {data.marketCategory}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1.5 bg-[#0a0d14]/70">
              <span className="text-[10px] font-mono uppercase text-[#E8FF54] font-bold">
                Core Differentiator Wedge
              </span>
              <p className="text-sm font-bold text-white">
                {data.coreDifferentiator}
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1.5 bg-[#0a0d14]/70">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
              Value Proposition
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {data.valueProposition}
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onAdvance}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-sky-500/25"
            >
              Advance to Stage 3 (Shape Identity &amp; Voice) →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
