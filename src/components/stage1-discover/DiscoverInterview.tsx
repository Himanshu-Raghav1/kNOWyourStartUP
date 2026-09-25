"use client";

import React, { useState } from "react";
import { DiscoverData } from "@/types";
import {
  ClarifyQuestion,
  Stage1ClarifyResult,
  Stage1ProbeResult,
  IdeaInterpretation,
  Stage1InterpretResult
} from "@/lib/llm/gemini";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Target,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Zap,
  HelpCircle,
  RotateCcw,
  Check,
  Plus,
  ChevronRight,
  Users,
  Wrench,
  PenLine,
  MessageCircleQuestion
} from "lucide-react";

// Four phases the UI can be in
type Phase = "initial" | "interpret" | "clarify" | "quadrants";

interface DiscoverInterviewProps {
  initialIdea: string;
  data: DiscoverData | null;
  isLoading: boolean;
  onExecuteDiscovery: (payload: {
    rawIdea: string;
    vision: string;
    problem: string;
    selectedPersonas: string[];
    ambiguityAnswers: Record<string, string>;
  }) => void;
  onAdvance: () => void;
}

export function DiscoverInterview({
  initialIdea,
  data,
  isLoading,
  onExecuteDiscovery,
  onAdvance
}: DiscoverInterviewProps) {
  // ── Phase state ──────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>(data ? "quadrants" : "initial");
  const [isProbing, setIsProbing] = useState(false);

  // ── Phase 1: raw idea ────────────────────────────────────────────────────────
  const [rawIdea, setRawIdea] = useState(initialIdea || "");

  // ── Phase 2: interpretations ─────────────────────────────────────────────────
  const [interpretations, setInterpretations] = useState<IdeaInterpretation[]>([]);
  const [selectedInterpId, setSelectedInterpId] = useState<string | null>(null);
  // The user's confirmed/edited version of the idea — may be the card text or their own words
  const [confirmedIdea, setConfirmedIdea] = useState("");
  const [showCustomBox, setShowCustomBox] = useState(false);

  // ── Phase 3: clarifying questions ──────────────────────────────────────────
  const [clarifyQuestions, setClarifyQuestions] = useState<ClarifyQuestion[]>([]);
  const [clarifyAnswers, setClarifyAnswers] = useState<Record<string, string>>({});
  // Per-question custom text the user types on top of the selected option
  const [clarifyCustom, setClarifyCustom] = useState<Record<string, string>>({});
  const [clarifyShowCustom, setClarifyShowCustom] = useState<Record<string, boolean>>({});

  // ── Phase 4: 4-quadrant discovery ──────────────────────────────────────────
  const [domainLabel, setDomainLabel] = useState("Your Product");
  const [coreVision, setCoreVision] = useState("");
  const [coreProblem, setCoreProblem] = useState("");
  const [personaOptions, setPersonaOptions] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [customPersonaInput, setCustomPersonaInput] = useState("");
  const [showCustomPersona, setShowCustomPersona] = useState(false);
  const [ambiguities, setAmbiguities] = useState<Stage1ProbeResult["ambiguities"]>([]);
  const [ambiguityAnswers, setAmbiguityAnswers] = useState<Record<string, string>>({});
  // Per-ambiguity custom text the user types on top of the selected option
  const [ambiguityCustom, setAmbiguityCustom] = useState<Record<string, string>>({});
  const [ambiguityShowCustom, setAmbiguityShowCustom] = useState<Record<string, boolean>>({});

  // ── Step 1: Click "Discover" → call interpret API ────────────────────────────
  const handleDiscoverClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawIdea.trim()) return;
    setIsProbing(true);
    try {
      const res = await fetch("/api/stages/1-discover/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawIdea: rawIdea.trim(), step: "interpret" })
      });
      const json = await res.json();
      if (!json.error && json.data) {
        const interpretData = json.data as Stage1InterpretResult;
        const interps = interpretData.interpretations || [];
        setInterpretations(interps);
        // Pre-select the first interpretation and pre-fill its quadrant fields
        if (interps.length > 0) {
          handleSelectInterp(interps[0]);
        }
        setPhase("interpret");
      } else {
        // Fall through to clarify if interpret fails
        await loadClarifyQuestions();
      }
    } catch {
      await loadClarifyQuestions();
    } finally {
      setIsProbing(false);
    }
  };

  // ── When user selects an interpretation card ──────────────────────────────────
  const handleSelectInterp = (interp: IdeaInterpretation) => {
    setSelectedInterpId(interp.id);
    setConfirmedIdea(interp.summary);
    setShowCustomBox(false);
    // Instantly pre-fill all quadrant fields from the card — no second API call needed
    setDomainLabel(interp.domainLabel || "Your Product");
    setCoreVision(interp.coreVision || "");
    setCoreProblem(interp.coreProblem || "");
    setPersonaOptions(interp.personaOptions || []);
    setSelectedPersonas((interp.personaOptions || []).slice(0, 2));
    setAmbiguities([]);
    setAmbiguityAnswers({});
  };

  // ── Step 2: Confirm interpretation → call clarify API ────────────────────────
  const handleInterpNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedIdea.trim()) return;
    // If user picked a card (pre-filled quadrant data), jump directly to quadrants
    if (selectedInterpId && coreVision.trim()) {
      setPhase("quadrants");
    } else {
      // User wrote their own idea in the custom box — need AI to fill quadrants
      setIsProbing(true);
      loadQuadrants(undefined).then(() => setIsProbing(false));
    }
  };

  const loadClarifyQuestions = async () => {
    try {
      // Use the confirmed/edited idea as the context for clarify questions
      const ideaToUse = confirmedIdea.trim() || rawIdea.trim();
      const res = await fetch("/api/stages/1-discover/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawIdea: ideaToUse, step: "clarify" })
      });
      const json = await res.json();
      if (!json.error && json.data) {
        const clarifyData = json.data as Stage1ClarifyResult;
        const questions = clarifyData.questions || [];
        setClarifyQuestions(questions);
        // Pre-select first option for each question
        const defaults: Record<string, string> = {};
        questions.forEach((q) => {
          if (q.options?.length > 0) defaults[q.id] = q.options[0];
        });
        setClarifyAnswers(defaults);
        setPhase("clarify");
      } else {
        await loadQuadrants(undefined);
      }
    } catch {
      await loadQuadrants(undefined);
    }
  };

  // ── Step 3: Click "Next" → call fill API with answers ───────────────────────
  const handleClarifyNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProbing(true);
    // Merge any custom text the user typed into clarify answers
    const mergedAnswers: Record<string, string> = { ...clarifyAnswers };
    Object.entries(clarifyCustom).forEach(([id, customText]) => {
      if (customText.trim()) {
        // Append custom text to the selected option or use as standalone
        const existing = mergedAnswers[id];
        mergedAnswers[id] = existing
          ? `${existing} — ${customText.trim()}`
          : customText.trim();
      }
    });
    await loadQuadrants(mergedAnswers);
    setIsProbing(false);
  };

  const loadQuadrants = async (answers?: Record<string, string>) => {
    try {
      const res = await fetch("/api/stages/1-discover/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawIdea: rawIdea.trim(),
          confirmedIdea: confirmedIdea.trim() || rawIdea.trim(),
          step: "fill",
          clarifyAnswers: answers || {}
        })
      });
      const json = await res.json();
      if (!json.error && json.data) {
        const probe = json.data as Stage1ProbeResult;
        setDomainLabel(probe.domainName || "Your Product");
        setCoreVision(probe.coreVision || "");
        setCoreProblem(probe.coreProblem || "");
        setPersonaOptions(probe.personaOptions || []);
        setSelectedPersonas(probe.personaOptions?.slice(0, 2) || []);
        setAmbiguities(probe.ambiguities || []);
        const defaultAmbs: Record<string, string> = {};
        probe.ambiguities?.forEach((a) => {
          if (a.options?.length > 0) defaultAmbs[a.id] = a.options[0];
        });
        setAmbiguityAnswers(defaultAmbs);
      }
    } catch {
      // minimal fallback
      setCoreVision("Help people do something important, faster and better.");
      setCoreProblem("Current tools are too complex, too slow, or not built for this specific need.");
      setPersonaOptions([
        "People dealing with this problem daily",
        "Small teams without specialized help",
        "Beginners who find existing options too complex"
      ]);
      setSelectedPersonas(["People dealing with this problem daily"]);
    }
    setPhase("quadrants");
  };

  const togglePersona = (p: string) =>
    setSelectedPersonas((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const handleAddCustomPersona = () => {
    const trimmed = customPersonaInput.trim();
    if (trimmed && !personaOptions.includes(trimmed)) {
      setPersonaOptions((prev) => [...prev, trimmed]);
      setSelectedPersonas((prev) => [...prev, trimmed]);
      setCustomPersonaInput("");
      setShowCustomPersona(false);
    }
  };

  // ── Step 4: Synthesize → send to parent ─────────────────────────────────────
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Merge any custom ambiguity text
    const mergedAmb: Record<string, string> = { ...ambiguityAnswers };
    Object.entries(ambiguityCustom).forEach(([id, customText]) => {
      if (customText.trim()) {
        const existing = mergedAmb[id];
        mergedAmb[id] = existing
          ? `${existing} — ${customText.trim()}`
          : customText.trim();
      }
    });
    onExecuteDiscovery({
      rawIdea: confirmedIdea.trim() || rawIdea.trim(),
      vision: coreVision.trim(),
      problem: coreProblem.trim(),
      selectedPersonas: selectedPersonas.length > 0 ? selectedPersonas : personaOptions.slice(0, 1),
      ambiguityAnswers: mergedAmb
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#FF542E]/15 text-[#FF542E] border border-[#FF542E]/30 font-bold tracking-wider">
              Step 1 of 6 · Discover Your Idea
            </span>

          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1.5 tracking-tight">
            {phase === "initial" && "Tell us your idea"}
            {phase === "interpret" && "Which one sounds right?"}
            {phase === "clarify" && "Quick questions — just 30 seconds"}
            {phase === "quadrants" && "Here's what we understood"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {phase === "initial" &&
              "Share your rough idea — no need to have everything figured out. We'll help you make sense of it."}
            {phase === "interpret" &&
              "We read your idea and came up with a few ways it could go. Pick the one that feels closest — then add your own words if needed."}
            {phase === "clarify" &&
              "We have a few short questions so we understand your idea correctly before building your brand."}
            {phase === "quadrants" &&
              "We've broken your idea into 4 key areas. Review and edit anything that doesn't look right — then we'll move on."}
          </p>
        </div>

        {data && (
          <button
            onClick={onAdvance}
            className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-lg shadow-[#FF542E]/25"
          >
            Continue to Step 2 <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── PHASE 1: Initial blank box ─────────────────────────────────────── */}
      {phase === "initial" && (
        <form
          onSubmit={handleDiscoverClick}
          className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 space-y-6 max-w-3xl mx-auto shadow-2xl relative overflow-hidden bg-[#0E1424]/90"
        >
          <div className="space-y-2 text-center sm:text-left">
            <label className="font-heading font-black text-xl text-white block tracking-tight">
              What's your idea?
            </label>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Describe what you want to build in your own words. Don't worry about making it sound perfect — just say what's on your mind.
            </p>
          </div>

          <textarea
            value={rawIdea}
            onChange={(e) => setRawIdea(e.target.value)}
            rows={5}
            autoFocus
            className="w-full bg-[#131B30] border border-white/12 rounded-2xl p-4 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#FF542E] transition leading-relaxed placeholder:text-slate-400 focus:ring-1 focus:ring-[#FF542E]/50 shadow-inner"
            placeholder="e.g. An app that helps dog owners find trusted pet sitters nearby..."
          />

          <button
            type="submit"
            disabled={!rawIdea.trim() || isProbing}
            className="w-full py-4 rounded-2xl bg-[#FF542E] hover:bg-[#FF6B47] disabled:opacity-40 text-white font-bold text-sm transition flex items-center justify-center gap-2.5 shadow-xl shadow-[#FF542E]/25 cursor-pointer"
          >
            {isProbing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Reading your idea...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Discover my idea</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* ── PHASE 2: Interpretation cards ─────────────────────────────────── */}
      {phase === "interpret" && (
        <form
          onSubmit={handleInterpNext}
          className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300"
        >
          {/* Raw idea recap */}
          <div className="glass-panel px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
            <p className="text-xs text-white font-medium truncate">&ldquo;{rawIdea}&rdquo;</p>
            <button
              type="button"
              onClick={() => setPhase("initial")}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* Interpretation cards — each is a fully detailed idea option */}
          <div className="space-y-3">
            {interpretations.map((interp, idx) => {
              const isSelected = selectedInterpId === interp.id;
              const letters = ["A", "B", "C"];
              return (
                <div
                  key={interp.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "bg-[#FF542E]/10 border-[#FF542E] shadow-md shadow-[#FF542E]/10"
                      : "bg-white/[0.025] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                  }`}
                >
                  {/* Clickable header row */}
                  <button
                    type="button"
                    onClick={() => handleSelectInterp(interp)}
                    className="w-full text-left p-5 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Letter badge */}
                      <div className="flex items-center gap-2.5 shrink-0 mt-0.5">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                            isSelected
                              ? "bg-[#FF542E] border-[#FF542E]"
                              : "border-white/25 bg-black/40"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3 h-3 stroke-[3] text-white" />
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">{letters[idx]}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold leading-tight ${isSelected ? "text-white" : "text-slate-200"}`}>
                          {interp.title}
                        </p>
                        <p className={`text-xs mt-1.5 leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                          {interp.summary}
                        </p>
                      </div>
                    </div>

                    {/* Who / What row */}
                    <div className="flex flex-col sm:flex-row gap-2 pl-8">
                      <div className={`flex items-start gap-1.5 flex-1 text-[11px] rounded-xl px-3 py-2 ${isSelected ? "bg-white/[0.08]" : "bg-black/30"}`}>
                        <Users className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sky-400" />
                        <span className={`leading-snug ${isSelected ? "text-sky-200" : "text-slate-400"}`}>
                          <span className="font-semibold text-slate-300">For: </span>{interp.whoItsFor}
                        </span>
                      </div>
                      <div className={`flex items-start gap-1.5 flex-1 text-[11px] rounded-xl px-3 py-2 ${isSelected ? "bg-white/[0.08]" : "bg-black/30"}`}>
                        <Wrench className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span className={`leading-snug ${isSelected ? "text-amber-200" : "text-slate-400"}`}>
                          <span className="font-semibold text-slate-300">Does: </span>{interp.whatItDoes}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded preview when selected — shows vision + problem + personas */}
                  {isSelected && (
                    <div className="px-5 pb-5 pt-0 space-y-3 border-t border-[#FF542E]/20 mt-1 animate-in fade-in duration-200">
                      <p className="text-[11px] font-mono text-[#FF542E] uppercase tracking-wider pt-3">
                        ✔ Here’s what we’ll use for your brand overview — you can edit all of this in the next step
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Vision preview */}
                        <div className="bg-white/[0.04] rounded-xl p-3 border border-white/5 space-y-1">
                          <p className="text-[10px] font-mono text-[#FF542E] uppercase tracking-wider flex items-center gap-1.5">
                            <Lightbulb className="w-3 h-3" /> The Big Dream
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{interp.coreVision}</p>
                        </div>
                        {/* Problem preview */}
                        <div className="bg-white/[0.04] rounded-xl p-3 border border-white/5 space-y-1">
                          <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" /> The Problem You’re Solving
                          </p>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{interp.coreProblem}</p>
                        </div>
                      </div>
                      {/* Personas preview */}
                      {interp.personaOptions && interp.personaOptions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Who It’s For
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {interp.personaOptions.map((p, pi) => (
                              <span key={pi} className="text-[11px] px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-200">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom option toggle */}
          {!showCustomBox ? (
            <button
              type="button"
              onClick={() => {
                setShowCustomBox(true);
                setSelectedInterpId(null);
                setConfirmedIdea("");
              }}
              className="flex items-center gap-2 text-[12px] font-medium text-slate-400 hover:text-white transition px-1"
            >
              <MessageCircleQuestion className="w-4 h-4 text-[#FF542E]" />
              None of these feel right — let me describe it myself
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5 text-[#FF542E]" />
                Describe your idea in your own words:
              </p>
              <textarea
                autoFocus
                value={confirmedIdea}
                onChange={(e) => setConfirmedIdea(e.target.value)}
                rows={3}
                placeholder="e.g. It's more like a marketplace where pet owners post what they need and sitters bid on it..."
                className="w-full bg-[#131B30] border border-[#FF542E]/40 rounded-xl p-3.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#FF542E] transition leading-relaxed placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomBox(false);
                  if (interpretations.length > 0) {
                    handleSelectInterp(interpretations[0]);
                  }
                }}
                className="text-[11px] text-slate-400 hover:text-white transition"
              >
                ← Back to options
              </button>
            </div>
          )}

          {/* "Add your own words" expander when a card is selected */}
          {selectedInterpId && !showCustomBox && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] text-slate-300 font-mono flex items-center gap-1.5">
                <PenLine className="w-3 h-3 text-[#FF542E]" /> Want to add or change something in this description?
              </p>
              <textarea
                value={confirmedIdea}
                onChange={(e) => setConfirmedIdea(e.target.value)}
                rows={2}
                placeholder="Add details, fix anything wrong, or rewrite it completely..."
                className="w-full bg-[#131B30] border border-white/12 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#FF542E] transition leading-relaxed placeholder:text-slate-400"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isProbing || (!selectedInterpId && !confirmedIdea.trim())}
            className="w-full py-4 rounded-2xl bg-[#FF542E] hover:bg-[#FF6B47] disabled:opacity-40 text-white font-bold text-sm transition flex items-center justify-center gap-2.5 shadow-xl shadow-[#FF542E]/25"
          >
            {isProbing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Building your overview...</span>
              </>
            ) : selectedInterpId ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Yes, this is my idea — fill my overview</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                <span>Use this — continue</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ── PHASE 3: Clarifying questions ─────────────────────────────────── */}
      {phase === "clarify" && (
        <form
          onSubmit={handleClarifyNext}
          className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300"
        >
          {/* Confirmed idea recap */}
          <div className="glass-panel px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
            <p className="text-xs text-white font-medium truncate">&ldquo;{confirmedIdea || rawIdea}&rdquo;</p>
            <button
              type="button"
              onClick={() => setPhase("interpret")}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          {/* Questions */}
          <div className="space-y-5">
            {clarifyQuestions.map((q, qi) => (
              <div
                key={q.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 bg-[#0a0d14]/70"
              >
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {qi + 1}. {q.question}
                  </p>
                  {q.hint && (
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{q.hint}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, oi) => {
                    const isSelected = clarifyAnswers[q.id] === opt;
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() =>
                          setClarifyAnswers((prev) => ({ ...prev, [q.id]: opt }))
                        }
                        className={`text-left p-3 rounded-xl border text-xs transition flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#FF542E]/15 border-[#FF542E] text-white font-semibold shadow-sm shadow-[#FF542E]/10"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07] hover:text-white"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? "bg-[#FF542E] border-[#FF542E]"
                              : "border-white/25 bg-black/40"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                        </div>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Per-question custom input — "add your own words to this answer" */}
                {!clarifyShowCustom[q.id] ? (
                  <button
                    type="button"
                    onClick={() =>
                      setClarifyShowCustom((prev) => ({ ...prev, [q.id]: true }))
                    }
                    className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition pt-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add your own words to this answer
                  </button>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <PenLine className="w-3 h-3" /> Your addition:
                    </p>
                    <input
                      type="text"
                      autoFocus
                      value={clarifyCustom[q.id] || ""}
                      onChange={(e) =>
                        setClarifyCustom((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="e.g. specifically for dog owners, not cats..."
                      className="w-full bg-[#131B30] border border-white/12 rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FF542E] transition placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setClarifyShowCustom((prev) => ({ ...prev, [q.id]: false }))
                      }
                      className="text-[10px] text-slate-400 hover:text-white transition"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isProbing}
            className="w-full py-4 rounded-2xl bg-[#FF542E] hover:bg-[#FF6B47] disabled:opacity-40 text-white font-bold text-sm transition flex items-center justify-center gap-2.5 shadow-xl shadow-[#FF542E]/25"
          >
            {isProbing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Building your brand overview...</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                <span>Next — show me my brand overview</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ── PHASE 4: 4 Discovery Quadrants ────────────────────────────────── */}
      {phase === "quadrants" && (
        <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in duration-300">
          {/* Idea recap bar */}
          <div className="glass-panel px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] font-mono uppercase text-[#FF542E] bg-[#FF542E]/10 px-2.5 py-0.5 rounded-md border border-[#FF542E]/25 shrink-0 font-bold">
                {domainLabel}
              </span>
              <p className="text-xs text-white font-medium truncate">&ldquo;{confirmedIdea || rawIdea}&rdquo;</p>
            </div>
            <button
              type="button"
              onClick={() => setPhase("initial")}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Start over
            </button>
          </div>

          {/* 4 Quadrants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Q1: Vision */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition space-y-3 bg-[#0E1424]/85">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF542E]/15 text-[#FF542E] flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs text-white uppercase tracking-wider">
                    The Big Dream
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">What you're working toward</p>
                </div>
              </div>
              <textarea
                value={coreVision}
                onChange={(e) => setCoreVision(e.target.value)}
                rows={4}
                className="w-full bg-[#131B30] border border-white/12 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-[#FF542E] transition leading-relaxed font-sans placeholder:text-slate-400"
                placeholder="What does success look like? How does this change people's lives?"
              />
            </div>

            {/* Q2: Problem */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition space-y-3 bg-[#0E1424]/85">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs text-white uppercase tracking-wider">
                    The Problem You're Fixing
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">Why current options don't work</p>
                </div>
              </div>
              <textarea
                value={coreProblem}
                onChange={(e) => setCoreProblem(e.target.value)}
                rows={4}
                className="w-full bg-[#131B30] border border-white/12 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 transition leading-relaxed font-sans placeholder:text-slate-400"
                placeholder="What's the pain your users feel? What do they hate about the current options?"
              />
            </div>

            {/* Q3: Personas */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition space-y-3 bg-[#0E1424]/85">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs text-white uppercase tracking-wider">
                    Who Is This For?
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    Pick everyone who fits — {selectedPersonas.length} selected
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {personaOptions.map((persona, idx) => {
                  const isSelected = selectedPersonas.includes(persona);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => togglePersona(persona)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-sky-500/15 border-sky-400 text-sky-200 font-medium shadow-sm shadow-sky-500/10"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isSelected ? "bg-sky-400 border-sky-400 text-black" : "border-white/20 bg-black/40"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="leading-snug">{persona}</span>
                    </button>
                  );
                })}

                {!showCustomPersona ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomPersona(true)}
                    className="text-[11px] font-mono text-sky-400 hover:text-sky-300 transition flex items-center gap-1.5 pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add someone else
                  </button>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customPersonaInput}
                      onChange={(e) => setCustomPersonaInput(e.target.value)}
                      placeholder="e.g. Stay-at-home parents..."
                      className="flex-1 bg-[#131B30] border border-sky-400/40 rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomPersona}
                      className="px-3 py-2 rounded-xl bg-sky-500 text-black font-bold text-xs"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomPersona(false)}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Q4: Remaining questions */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition space-y-4 bg-[#0E1424]/85">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xs text-white uppercase tracking-wider">
                    A Couple More Questions
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    These help us get the details right
                  </p>
                </div>
              </div>

              {ambiguities.length > 0 ? (
                <div className="space-y-3.5">
                  {ambiguities.map((amb) => (
                    <div key={amb.id} className="space-y-2 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <p className="text-xs font-semibold text-white leading-tight">{amb.question}</p>
                      <p className="text-[10px] font-mono text-slate-400 leading-snug">
                        {amb.contextWhyItMatters}
                      </p>
                      <div className="flex flex-col gap-1.5 pt-1">
                        {amb.options.map((opt, oi) => {
                          const isSelected = ambiguityAnswers[amb.id] === opt;
                          return (
                            <button
                              key={oi}
                              type="button"
                              onClick={() =>
                                setAmbiguityAnswers((prev) => ({ ...prev, [amb.id]: opt }))
                              }
                              className={`text-left text-[11px] p-2 rounded-lg border transition ${
                                isSelected
                                  ? "bg-purple-500/20 text-purple-200 border-purple-400 font-medium"
                                  : "bg-white/5 text-slate-400 hover:text-slate-200 border-white/5"
                              }`}
                            >
                              • {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Per-ambiguity custom input */}
                      {!ambiguityShowCustom[amb.id] ? (
                        <button
                          type="button"
                          onClick={() =>
                            setAmbiguityShowCustom((prev) => ({ ...prev, [amb.id]: true }))
                          }
                          className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 hover:text-slate-300 transition pt-0.5"
                        >
                          <Plus className="w-2.5 h-2.5" /> Add your own words
                        </button>
                      ) : (
                        <div className="space-y-1 pt-1">
                          <input
                            type="text"
                            autoFocus
                            value={ambiguityCustom[amb.id] || ""}
                            onChange={(e) =>
                              setAmbiguityCustom((prev) => ({ ...prev, [amb.id]: e.target.value }))
                            }
                            placeholder="Add more context here..."
                            className="w-full bg-[#131B30] border border-white/12 rounded-lg px-3 py-1.5 text-[11px] text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] transition placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAmbiguityShowCustom((prev) => ({ ...prev, [amb.id]: false }))
                            }
                            className="text-[10px] text-slate-400 hover:text-white transition"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 leading-relaxed font-sans">
                  <span className="text-emerald-400 font-semibold block mb-1">✓ All clear!</span>
                  We have everything we need. Hit the button below to move on.
                </div>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {data ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 font-mono">Step 1 saved</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-[#FF542E] shrink-0" />
                  <span className="font-mono text-[11px]">
                    AI will use everything above to build your brand strategy.
                  </span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !coreVision.trim() || !coreProblem.trim() || selectedPersonas.length === 0}
              className="px-8 py-3.5 rounded-xl bg-[#FF542E] hover:bg-[#FF6B47] disabled:opacity-40 text-white font-bold text-xs transition flex items-center gap-2.5 shadow-xl shadow-[#FF542E]/25 shrink-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving & moving on...
                </>
              ) : (
                <>
                  <span>Looks good — move to Step 2</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
