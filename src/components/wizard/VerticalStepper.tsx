"use client";

import React from "react";
import {
  Compass,
  Layers,
  Sparkles,
  Palette,
  ShieldCheck,
  Zap,
  Check,
  ChevronRight,
  Code,
  FileText,
  RotateCcw,
  Sparkle,
  ArrowDown
} from "lucide-react";
import { BrandProject } from "@/types";

export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  provider: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const STAGE_CONFIGS: StageConfig[] = [
  {
    id: 1,
    name: "Discover",
    subtitle: "Root Friction & Persona Matrix",
    provider: "AI",
    icon: Compass,
    accentColor: "#FF542E",
    badgeBg: "bg-[#FF542E]/10",
    badgeBorder: "border-[#FF542E]/30",
    badgeText: "text-[#FF542E]"
  },
  {
    id: 2,
    name: "Position",
    subtitle: "Category Wedge & Hegemony",
    provider: "AI",
    icon: Layers,
    accentColor: "#38bdf8",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-300"
  },
  {
    id: 3,
    name: "Shape",
    subtitle: "Linguistic Territories & Voice",
    provider: "AI",
    icon: Sparkles,
    accentColor: "#818CF8",
    badgeBg: "bg-[#6366F1]/10",
    badgeBorder: "border-[#6366F1]/30",
    badgeText: "text-[#818CF8]"
  },
  {
    id: 4,
    name: "Visualize",
    subtitle: "Chromatic Tokens & Typography",
    provider: "AI",
    icon: Palette,
    accentColor: "#34d399",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-300"
  },
  {
    id: 5,
    name: "Challenge",
    subtitle: "Adversarial Cohesion Audit",
    provider: "AI",
    icon: ShieldCheck,
    accentColor: "#f43f5e",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-300"
  },
  {
    id: 6,
    name: "Deliver",
    subtitle: "Launch Manifesto & Asset Deck",
    provider: "AI",
    icon: Zap,
    accentColor: "#fbbf24",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-300"
  }
];

interface VerticalStepperProps {
  activeStage: number;
  project: BrandProject;
  onSelectStage: (stageId: number) => void;
  viewJsonMode: boolean;
  onToggleJsonMode: () => void;
  onResetMock: () => void;
}

export function VerticalStepper({
  activeStage,
  project,
  onSelectStage,
  viewJsonMode,
  onToggleJsonMode,
  onResetMock
}: VerticalStepperProps) {
  // Determine completion count
  const stageDataMap: Record<number, unknown> = {
    1: project.discover_data,
    2: project.position_data,
    3: project.shape_data,
    4: project.visualize_data,
    5: project.challenge_data,
    6: project.deliver_data
  };

  const completedCount = Object.values(stageDataMap).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 6) * 100);

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
      {/* Top Studio Brand Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6366F1] animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Agency Studio
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30 font-semibold">
            {progressPercent}% Complete
          </span>
        </div>

        <h3 className="font-heading font-black text-lg text-white leading-tight">
          {project.shape_data?.selectedName || project.title || "Brand Architecture"}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
          {project.position_data?.marketCategory || "Sequential 6-Stage AI Brand Agency"}
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF542E] via-[#818CF8] to-[#6366F1] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-400 font-medium">
            <span>{completedCount} of 6 Stages Locked</span>
            <span>Stage 0{activeStage} Active</span>
          </div>
        </div>
      </div>

      {/* Vertical 1-to-6 Taskbar */}
      <div className="glass-panel p-3 rounded-2xl border border-white/10 space-y-1.5">
        <div className="px-3 py-2 flex items-center justify-between border-b border-white/5 mb-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
            Brand Creation Pipeline
          </span>
          <span className="text-[10px] font-mono text-slate-500">Chain-Prompted</span>
        </div>

        {STAGE_CONFIGS.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.id;
          const isCompleted = Boolean(stageDataMap[stage.id]);
          const isNextInChain = stage.id === activeStage + 1;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`w-full group text-left px-3.5 py-3 rounded-xl transition-all duration-200 flex items-start gap-3 relative ${
                isActive
                  ? "bg-white/[0.08] border border-white/20 shadow-lg shadow-black/40"
                  : isCompleted
                  ? "hover:bg-white/[0.04] border border-transparent hover:border-white/5 opacity-90"
                  : "hover:bg-white/[0.02] border border-transparent opacity-60 hover:opacity-80"
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full shadow-sm"
                  style={{ backgroundColor: stage.accentColor }}
                />
              )}

              {/* Step Number / Icon Badge */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold font-mono transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-md"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-white/5 text-slate-400 border border-white/10"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: stage.accentColor,
                        boxShadow: `0 0 14px ${stage.accentColor}50`
                      }
                    : undefined
                }
              >
                {isCompleted && !isActive ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <span>0{stage.id}</span>
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`font-heading font-bold text-xs leading-none ${
                      isActive ? "text-white font-extrabold" : "text-slate-200"
                    }`}
                  >
                    {stage.name}
                  </span>

                  {/* Micro Status Badge */}
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md leading-none ${
                      isActive
                        ? `${stage.badgeBg} ${stage.badgeText} ${stage.badgeBorder} border`
                        : isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {isActive ? "Active" : isCompleted ? "Saved" : stage.provider.split(" ")[0]}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 leading-snug truncate">
                  {stage.subtitle}
                </p>
              </div>

              {/* Chevron */}
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 mt-2 transition-transform duration-200 ${
                  isActive ? "text-white translate-x-0.5" : "text-slate-600 opacity-40 group-hover:opacity-100"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Chain-Prompting Architecture Visualizer */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          <Sparkle className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Chain-Prompt Context Flow</span>
        </div>

        <div className="bg-[#131B30] p-3.5 rounded-xl border border-white/10 text-[11px] font-mono text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#FF542E]" />
            <span className="text-white font-semibold">Stage 0{activeStage} Context:</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {activeStage === 1 && "Your idea ➡ AI understands what you're building ➡ Brand foundation"}
            {activeStage === 2 && "Your brand foundation ➡ AI finds your market angle ➡ Positioning"}
            {activeStage === 3 && "Your positioning ➡ AI names and gives your brand a voice ➡ Identity"}
            {activeStage === 4 && "Your identity ➡ AI locks in colors and fonts ➡ Visual system"}
            {activeStage === 5 && "Everything above ➡ AI audits for weak spots ➡ Stronger brand"}
            {activeStage === 6 && "Your complete brand ➡ AI writes your launch materials ➡ Go live"}
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onToggleJsonMode}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-slate-300 hover:text-white transition"
          >
            {viewJsonMode ? <FileText className="w-3 h-3 text-[#818CF8]" /> : <Code className="w-3 h-3 text-[#818CF8]" />}
            <span>{viewJsonMode ? "Visual View" : "JSON Contract"}</span>
          </button>

          <button
            onClick={onResetMock}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="w-3 h-3 text-rose-400" />
            <span>Load Mock</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
