"use client";

import React, { useState } from "react";
import { PositionData, ShapeData } from "@/types";
import { NamingTerritoryExplorer } from "./NamingTerritoryExplorer";
import { BrandVoiceGrid } from "./BrandVoiceGrid";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Target,
  Mic,
  Tag,
  CheckCircle2
} from "lucide-react";

interface ShapeInterviewProps {
  positionData: PositionData | null;
  data: ShapeData | null;
  isLoading: boolean;
  onExecute: () => void;
  onAdvance: () => void;
  onBack: () => void;
  onSelectName: (name: string) => void;
}

const NAMING_VIBES = [
  {
    title: "Evocative & Poetic",
    example: "e.g. Campfire, Monzo, Slack, Robinhood",
    desc: "Emotional metaphor that signals warmth, community, or transformation."
  },
  {
    title: "Invented & Modern",
    example: "e.g. Spotify, Figma, Vercel, Stripe",
    desc: "Coining a pristine, friction-free neologism with clean global trademarks."
  },
  {
    title: "Descriptive & Punchy",
    example: "e.g. Superhuman, Loom, Notion",
    desc: "Direct statement of capability with immense confidence and authority."
  },
  {
    title: "Compound & Kinetic",
    example: "e.g. DoorDash, GitHub, Airtable",
    desc: "Combining two vivid words to create instant semantic recognition."
  }
];

const VOICE_ARCHETYPES = [
  {
    title: "Direct & Unapologetic",
    quote: "“No corporate fluff. Zero filler. Just tools that actually work.”"
  },
  {
    title: "Warm & Human Companion",
    quote: "“We are right beside you through the messy 2 AM debugging sessions.”"
  },
  {
    title: "Obsessive Craftsperson",
    quote: "“Engineered down to the sub-pixel. Built for those who notice the details.”"
  },
  {
    title: "Playful Provocateur",
    quote: "“Life is too short for boring software. Let’s build something audacious.”"
  }
];

export function ShapeInterview({
  positionData,
  data,
  isLoading,
  onExecute,
  onAdvance,
  onBack,
  onSelectName
}: ShapeInterviewProps) {
  const [selectedVibe, setSelectedVibe] = useState<number>(0);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);

  return (
    <div className="space-y-8">
      {/* Agency Interview Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                Stage 03 · Shaping Identity & Voice
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Chain-Prompt Ingested: PositionData Locked
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1.5">
              Naming Territories & Brand Voice
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Names and tone are the emotional interface of your company. We explore 4 linguistic territories, test domain feasibility, and forge strict behavioral voice rules.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onBack}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
            >
              ← Back to Stage 2
            </button>
            {data && (
              <button
                onClick={onAdvance}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/25"
              >
                Advance to Stage 4 (Visualize) <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upstream Chain Context Banner */}
      {positionData && (
        <div className="glass-panel p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">
                Chained from Stage 2 Positioning:
              </p>
              <p className="text-xs font-semibold text-white truncate max-w-xl">
                Category: &ldquo;{positionData.marketCategory}&rdquo; · Wedge: &ldquo;{positionData.coreDifferentiator}&rdquo;
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
        {/* Naming Linguistic Vibe */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Which naming linguistic territory fits your brand best?
            </label>
            <span className="text-[10px] font-mono text-slate-400">Select Vibe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {NAMING_VIBES.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedVibe(i)}
                className={`text-left p-3 rounded-xl border transition ${
                  selectedVibe === i
                    ? "bg-purple-500/20 border-purple-400 text-white"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <p className="text-xs font-bold">{v.title}</p>
                <p className="text-[10px] font-mono text-purple-300 mt-0.5">{v.example}</p>
                <p className="text-[11px] text-slate-300 mt-1 leading-snug">{v.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Brand Voice Stance */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-[#E8FF54]" />
              What is your primary brand voice archetype?
            </label>
            <span className="text-[10px] font-mono text-slate-400">Select Archetype</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {VOICE_ARCHETYPES.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedVoice(i)}
                className={`text-left p-3 rounded-xl border transition ${
                  selectedVoice === i
                    ? "bg-[#E8FF54]/15 border-[#E8FF54]/50 text-white"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <p className="text-xs font-bold text-white">{v.title}</p>
                <p className="text-[11px] text-slate-300 mt-1 italic leading-snug">{v.quote}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Generator Bar */}
      <div className="flex items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div>
          <h4 className="text-xs font-bold text-white">Ready to Shape Identity?</h4>
          <p className="text-[11px] text-slate-400">
            Groq Llama 3.3 will synthesize 4 naming territories, domain suggestions, and the Do/Don&apos;t voice matrix.
          </p>
        </div>

        <button
          onClick={onExecute}
          disabled={isLoading || !positionData}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/25 shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating Names & Voice via Groq...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {data ? "Re-Generate Names & Voice" : "Generate Names & Voice"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Render Results if available */}
      {data && (
        <div className="space-y-8 pt-4 border-t border-white/10">
          <NamingTerritoryExplorer
            data={data}
            onSelectName={onSelectName}
          />
          <BrandVoiceGrid voice={data.brandVoice} />
        </div>
      )}
    </div>
  );
}
