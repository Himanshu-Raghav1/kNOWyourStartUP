"use client";

import React, { useState } from "react";
import { NamingOption, ShapeData } from "@/types";
import { Sparkles, Globe, Star, Check, RotateCcw, Trophy } from "lucide-react";

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
  invented:    { label: "Invented",    color: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: "✦" },
  evocative:   { label: "Evocative",   color: "text-amber-300",  bg: "bg-amber-500/10",  border: "border-amber-500/30",  icon: "◎" },
  descriptive: { label: "Descriptive", color: "text-cyan-300",   bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   icon: "⬡" },
  compound:    { label: "Compound",    color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "⊕" },
};

interface NamingTerritoryExplorerProps {
  data: ShapeData;
  onSelectName?: (name: string) => void;
}

function ScoreBar({ score }: { score: number }) {
  const dots = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      {dots.map((d) => (
        <div
          key={d}
          className={`w-2 h-2 rounded-full transition-all ${
            d <= score
              ? score >= 8 ? "bg-amber-400 shadow-sm shadow-amber-400/60"
                : score >= 6 ? "bg-emerald-400"
                : "bg-slate-400"
              : "bg-white/10"
          }`}
        />
      ))}
      <span className={`ml-1.5 text-xs font-bold tabular-nums ${score >= 8 ? "text-amber-400" : "text-slate-300"}`}>
        {score}/10
      </span>
    </div>
  );
}

export function NamingTerritoryExplorer({ data, onSelectName }: NamingTerritoryExplorerProps) {
  const [selected, setSelected] = useState<string>(data.selectedName);
  const [customInput, setCustomInput] = useState<string>("");

  const handleSelect = (name: string) => {
    setSelected(name);
    onSelectName?.(name);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handleSelect(customInput.trim());
      setCustomInput("");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-white">Naming Territory Explorer</h4>
            <p className="text-[11px] text-slate-400">Pick an AI-generated name or define your own.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#131B30] px-3 py-1.5 rounded-xl border border-white/10">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Selected: <span className="text-[#FF542E] font-bold ml-1">{selected}</span>
        </div>
      </div>

      {/* Custom Name Input */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Have your own name in mind? Type it here..."
          className="flex-1 bg-[#131B30] border border-white/12 focus:border-[#818CF8]/60 rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-slate-400 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#6366F1]/20 hover:bg-[#6366F1]/35 disabled:opacity-40 border border-[#6366F1]/40 text-[#818CF8] text-xs font-semibold transition"
        >
          Use My Name
        </button>
      </form>

      {/* Tagline candidates ribbon */}
      {data.taglineCandidates?.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-1">
          {data.taglineCandidates.map((t, i) => (
            <span
              key={i}
              className={`text-[11px] px-3 py-1 rounded-full border transition ${
                t === data.selectedTagline
                  ? "bg-[#FF542E]/15 text-[#FF542E] border-[#FF542E]/30 font-semibold"
                  : "bg-white/5 text-slate-400 border-white/10"
              }`}
            >
              {t === data.selectedTagline && "★ "}{t}
            </span>
          ))}
        </div>
      )}

      {/* Naming Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.namingTerritories.map((option: NamingOption) => {
          const meta = CATEGORY_META[option.category] ?? CATEGORY_META.invented;
          const isSelected = selected === option.name;

          return (
            <div
              key={option.name}
              onClick={() => handleSelect(option.name)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                isSelected
                  ? "bg-[#0E1424] border-[#818CF8]/50 shadow-lg shadow-[#6366F1]/15"
                  : "bg-[#0E1424]/60 border-white/10 hover:border-white/20 hover:bg-[#131B30]/70"
              }`}
            >
              {/* Glow on selected */}
              {isSelected && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Top row: name + category badge */}
              <div className="flex items-start justify-between mb-3 relative">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-heading font-black ${isSelected ? "text-white" : "text-slate-200"}`}>
                      {option.name}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                        <Check className="w-2.5 h-2.5" /> Selected
                      </span>
                    )}
                  </div>
                  <div className={`inline-flex items-center gap-1 mt-1 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold tracking-wider border ${meta.bg} ${meta.color} ${meta.border}`}>
                    <span>{meta.icon}</span> {meta.label}
                  </div>
                </div>
              </div>

              {/* Memorability score bar */}
              <div className="mb-3">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">
                  Memorability
                </label>
                <ScoreBar score={option.memorabilityScore} />
              </div>

              {/* Rationale */}
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{option.rationale}</p>

              {/* Domain concept */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="font-mono text-blue-300">{option.domainConcept}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
