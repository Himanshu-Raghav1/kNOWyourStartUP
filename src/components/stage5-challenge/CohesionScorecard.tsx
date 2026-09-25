"use client";

import React, { useState } from "react";
import { ChallengeData, DetectedCritiqueItem } from "@/types";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Wand2,
  Check
} from "lucide-react";

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  cliche:            { label: "Brand Cliché",       icon: <AlertTriangle className="w-3.5 h-3.5" />, color: "text-amber-300",  bg: "bg-amber-500/10",  border: "border-amber-500/25" },
  contradiction:     { label: "Contradiction",       icon: <XCircle className="w-3.5 h-3.5" />,       color: "text-rose-300",   bg: "bg-rose-500/10",   border: "border-rose-500/25" },
  audience_mismatch: { label: "Audience Mismatch",   icon: <ShieldAlert className="w-3.5 h-3.5" />,   color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/25" },
  scalability_risk:  { label: "Scalability Risk",    icon: <Zap className="w-3.5 h-3.5" />,           color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/25" },
};

const SEVERITY_DOT: Record<string, string> = {
  high:   "bg-rose-500 shadow-sm shadow-rose-500/60",
  medium: "bg-amber-400 shadow-sm shadow-amber-400/40",
  low:    "bg-emerald-400",
};

function ScoreArc({ score }: { score: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease-out", filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">{score}</span>
        <span className="text-[10px] font-mono text-slate-400 uppercase">/ 100</span>
      </div>
    </div>
  );
}

interface CohesionScorecardProps {
  data: ChallengeData;
  onNextStage?: () => void;
  onApplyRemedy?: (proposal: string, original: string) => void;
}

export function CohesionScorecard({ data, onNextStage, onApplyRemedy }: CohesionScorecardProps) {
  const [appliedIndices, setAppliedIndices] = useState<number[]>([]);

  const handleApply = (idx: number, proposal: string, original: string) => {
    setAppliedIndices((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    if (onApplyRemedy) {
      onApplyRemedy(proposal, original);
    }
  };

  const passColor = data.passedValidation ? "text-emerald-400" : "text-rose-400";
  const passBg   = data.passedValidation ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30";

  return (
    <div className="space-y-6">
      {/* Header verdict banner */}
      <div className={`glass-panel p-6 rounded-2xl border ${passBg} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full blur-3xl pointer-events-none"
          style={{ background: data.passedValidation ? "#34d399" : "#f87171" }} />

        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Arc Score */}
          <div className="shrink-0 text-center">
            <ScoreArc score={data.overallCohesionScore} />
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-2">Brand Cohesion Score</p>
          </div>

          {/* Verdict Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              {data.passedValidation
                ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${passColor}`}>
                {data.passedValidation ? "Passed Validation — Ready to Deliver" : "Requires Revisions Before Delivery"}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">{data.verdictSummary}</p>

            {onNextStage && (
              <button
                onClick={onNextStage}
                className="mt-4 flex items-center gap-2 text-xs px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition shadow-lg shadow-rose-500/25"
              >
                Proceed to Deliver Stage <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Critique Item Cards */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
          Detected Issues &amp; Vulnerabilities ({data.critiqueItems.length})
        </h4>
        {data.critiqueItems.map((item: DetectedCritiqueItem) => {
          const meta = CATEGORY_META[item.category] ?? CATEGORY_META.cliche;
          return (
            <div key={item.id} className={`glass-panel p-5 rounded-2xl border ${meta.border} ${meta.bg} space-y-3`}>
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`${meta.color}`}>{meta.icon}</span>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                  <span className="text-[10px] font-mono text-slate-500">#{item.id}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT[item.severity]}`} />
                  <span className="text-[10px] font-mono text-slate-400 capitalize">{item.severity} severity</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              {/* Affected stages pills */}
              <div className="flex flex-wrap gap-1.5">
                {item.affectedStages.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono capitalize">
                    Affects: Stage {s}
                  </span>
                ))}
              </div>

              {/* Remedy */}
              <div className="flex items-start gap-2 bg-black/30 p-3 rounded-xl border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-200 leading-relaxed"><span className="font-semibold">Actionable Remedy: </span>{item.actionableRemedy}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proposed Alternatives with 1-Click Apply Remedy (Task 4.2) */}
      {data.proposedAlternatives?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Gemini Proposed Alternatives &amp; Remedies ({data.proposedAlternatives.length})
            </h4>
            <span className="text-[10px] font-mono text-emerald-400">1-Click Live Replacer</span>
          </div>

          {data.proposedAlternatives.map((alt, i) => {
            const isApplied = appliedIndices.includes(i);
            return (
              <div key={i} className={`glass-panel p-5 rounded-2xl border transition-all ${isApplied ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10"}`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4">
                    <p className="text-[10px] font-mono text-rose-400 uppercase mb-1">Original Element</p>
                    <p className="text-xs text-slate-300 line-through opacity-60 leading-snug">{alt.originalElement}</p>
                  </div>

                  <div className="md:col-span-5">
                    <p className="text-[10px] font-mono text-emerald-400 uppercase mb-1">Audited Alternative</p>
                    <p className="text-xs text-white font-bold leading-snug">{alt.alternativeProposal}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{alt.reasoning}</p>
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      onClick={() => handleApply(i, alt.alternativeProposal, alt.originalElement)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isApplied
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Remedy Applied!
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                          Apply Remedy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
