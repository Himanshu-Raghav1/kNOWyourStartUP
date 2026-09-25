"use client";

import React from "react";
import { BrandVoice } from "@/types";
import { Volume2, ShieldOff, MessageCircle, XCircle, CheckCircle2, Mic } from "lucide-react";

interface BrandVoiceGridProps {
  voice: BrandVoice;
}

export function BrandVoiceGrid({ voice }: BrandVoiceGridProps) {
  return (
    <div className="space-y-5">
      {/* Tone Descriptors Row */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-purple-400" />
          <h4 className="font-heading font-bold text-sm text-white">Brand Tone</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {voice.toneDescriptors.map((tone, i) => (
            <span
              key={i}
              className="px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-200 border border-purple-500/25 text-xs font-semibold tracking-wide"
            >
              {tone}
            </span>
          ))}
        </div>
      </div>

      {/* Two-column: Traits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Traits to Embody */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h5 className="font-heading font-bold text-xs text-emerald-300 uppercase tracking-wider">Traits to Embody</h5>
          </div>

          <div className="space-y-4">
            {voice.traitsToEmbody.map((trait, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-white">{trait.trait}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pl-3.5">{trait.justification}</p>
                {trait.behavioralExample && (
                  <div className="ml-3.5 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
                    <Mic className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-200 italic leading-relaxed">&ldquo;{trait.behavioralExample}&rdquo;</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Traits to Avoid */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <ShieldOff className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <h5 className="font-heading font-bold text-xs text-rose-300 uppercase tracking-wider">Traits to Avoid</h5>
          </div>

          <div className="space-y-2">
            {voice.traitsToAvoid.map((avoid, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/15">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-[11px] text-rose-200 leading-relaxed">{avoid}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Do Say / Don't Say Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Do Say */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <h5 className="text-xs font-bold text-blue-300 uppercase tracking-wider">✅ Do Say</h5>
          </div>
          {voice.doSayExamples.map((ex, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[12px] text-blue-100 leading-relaxed font-medium"
            >
              <span className="text-blue-400 shrink-0 mt-0.5">→</span>
              <span>&ldquo;{ex}&rdquo;</span>
            </div>
          ))}
        </div>

        {/* Don't Say */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-rose-400" />
            <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wider">❌ Don&apos;t Say</h5>
          </div>
          {voice.dontSayExamples.map((ex, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[12px] text-rose-200 leading-relaxed line-through opacity-70"
            >
              <span className="text-rose-400 shrink-0 mt-0.5 no-underline" style={{ textDecoration: "none" }}>✕</span>
              <span>&ldquo;{ex}&rdquo;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
