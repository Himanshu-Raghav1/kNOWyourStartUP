"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  Layers,
  Sparkles,
  Palette,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Code,
  FileText,
  AlertCircle
} from "lucide-react";
import {
  BrandProject,
  DiscoverData,
  PositionData,
  ShapeData,
  VisualizeData,
  ChallengeData,
  DeliverData
} from "@/types";
import { MOCK_BRAND_PROJECT } from "@/lib/mockBrandData";

const STAGES = [
  { id: 1, name: "Discover", provider: "Groq (Llama 3.3)", icon: Compass },
  { id: 2, name: "Position", provider: "Groq (Llama 3.3)", icon: Layers },
  { id: 3, name: "Shape", provider: "Groq (Llama 3.3)", icon: Sparkles },
  { id: 4, name: "Visualize", provider: "Groq (Llama 3.3)", icon: Palette },
  { id: 5, name: "Challenge", provider: "Google Gemini 2.5", icon: ShieldCheck },
  { id: 6, name: "Deliver", provider: "Groq (Llama 3.3)", icon: Zap }
];

export default function WizardPage() {
  const searchParams = useSearchParams();
  const isMockMode = searchParams.get("mode") === "mock";

  // Complex state: Project entity containing all 6 stages
  const [project, setProject] = useState<BrandProject>(() => {
    return isMockMode
      ? MOCK_BRAND_PROJECT
      : {
          id: crypto.randomUUID(),
          title: "New Brand Project",
          current_stage: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          discover_data: null,
          position_data: null,
          shape_data: null,
          visualize_data: null,
          challenge_data: null,
          deliver_data: null
        };
  });

  const [activeStage, setActiveStage] = useState<number>(() => {
    return isMockMode ? 1 : project.current_stage;
  });

  // Stage 1 Input State
  const [rawIdeaInput, setRawIdeaInput] = useState<string>(
    "I want to create an app that helps university students find complementary project teammates based on verified work styles."
  );
  const [contextInput, setContextInput] = useState<string>(
    "Specifically targeting CS and design students preparing for 36-hour hackathons and capstone courses."
  );

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewJsonMode, setViewJsonMode] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isMockMode) {
      setProject(MOCK_BRAND_PROJECT);
    }
  }, [isMockMode]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /**
   * Persists the updated project state to the server/Supabase.
   * Inline Comment: Optimistic state update pattern. Updates local state first,
   * then dispatches non-blocking update mutation to /api/projects.
   */
  const persistProjectState = async (updated: BrandProject) => {
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch (err: unknown) {
      console.warn("[Persist Warning]: Local state updated; backend sync deferred:", err);
    }
  };

  /**
   * STAGE 1: Execute Discovery LLM Generation
   * Inline Comment: Takes founder raw idea, invokes Stage 1 Groq API route,
   * validates returned DiscoverData contract, persists to project state,
   * and auto-advances the user to Stage 2.
   */
  const handleExecuteStage1 = async () => {
    if (!rawIdeaInput.trim()) {
      setErrorMsg("Please enter an initial idea description.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/stages/1-discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawIdea: rawIdeaInput.trim(),
          additionalContext: contextInput.trim()
        })
      });

      const json = await res.json();
      if (json.error || !json.data) {
        throw new Error(json.message || "Failed to generate Stage 1 discovery.");
      }

      const updatedProject: BrandProject = {
        ...project,
        title: `${rawIdeaInput.slice(0, 24)}...`,
        current_stage: Math.max(project.current_stage, 2),
        discover_data: json.data as DiscoverData
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
      setActiveStage(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 2: Execute Positioning LLM Generation
   * Inline Comment: Passes pruned DiscoverData JSON to Stage 2 Groq API route.
   * Advances wizard to Stage 3 on success.
   */
  const handleExecuteStage2 = async () => {
    if (!project.discover_data) {
      setErrorMsg("Stage 1 (Discover) output must be generated first.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/stages/2-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoverData: project.discover_data })
      });

      const json = await res.json();
      if (json.error || !json.data) {
        throw new Error(json.message || "Failed to generate Stage 2 positioning.");
      }

      const updatedProject: BrandProject = {
        ...project,
        current_stage: Math.max(project.current_stage, 3),
        position_data: json.data as PositionData
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
      setActiveStage(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 3: Execute Shaping (Naming & Voice) Generation
   * Inline Comment: Passes pruned DiscoverData and PositionData JSON contracts to Stage 3.
   * Auto-selects primary name candidate into shape_data.
   */
  const handleExecuteStage3 = async () => {
    if (!project.discover_data || !project.position_data) {
      setErrorMsg("Stage 1 and Stage 2 outputs are required before Shaping.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/stages/3-shape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discoverData: project.discover_data,
          positionData: project.position_data
        })
      });

      const json = await res.json();
      if (json.error || !json.data) {
        throw new Error(json.message || "Failed to generate Stage 3 identity.");
      }

      const updatedProject: BrandProject = {
        ...project,
        title: (json.data as ShapeData).selectedName || project.title,
        current_stage: Math.max(project.current_stage, 4),
        shape_data: json.data as ShapeData
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
      setActiveStage(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 4: Execute Visualization Generation
   * Inline Comment: Passes PositionData and ShapeData to Stage 4 Groq API route.
   */
  const handleExecuteStage4 = async () => {
    if (!project.position_data || !project.shape_data) {
      setErrorMsg("Stage 2 and Stage 3 outputs are required before Visualization.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/stages/4-visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionData: project.position_data,
          shapeData: project.shape_data
        })
      });

      const json = await res.json();
      if (json.error || !json.data) {
        throw new Error(json.message || "Failed to generate Stage 4 visuals.");
      }

      const updatedProject: BrandProject = {
        ...project,
        current_stage: Math.max(project.current_stage, 5),
        visualize_data: json.data as VisualizeData
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
      setActiveStage(5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 5: Execute Google Gemini Adversarial Critique & Validation
   * Inline Comment: Passes pruned contracts from Stages 1, 2, 3, and 4 to Google Gemini.
   * Enforces adversarial critique, calculates cohesion score, and surfaces actionable remedies.
   */
  const handleExecuteStage5 = async () => {
    if (!project.discover_data || !project.position_data || !project.shape_data || !project.visualize_data) {
      setErrorMsg("Stages 1-4 must all be generated before running Gemini validation.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/stages/5-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discoverData: project.discover_data,
          positionData: project.position_data,
          shapeData: project.shape_data,
          visualizeData: project.visualize_data
        })
      });

      const json = await res.json();
      if (json.error || !json.data) {
        throw new Error(json.message || "Failed to run Gemini Stage 5 critique.");
      }

      const updatedProject: BrandProject = {
        ...project,
        current_stage: Math.max(project.current_stage, 6),
        challenge_data: json.data as ChallengeData
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
      setActiveStage(6);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 6: Execute Launch Delivery Generation
   * Inline Comment: Ingests positioning, shape, and Gemini's validated challenge data.
   * Produces final launch assets and guardrails.
   */
  const handleExecuteStage6 = async () => {
    if (!project.position_data || !project.shape_data) {
      setErrorMsg("Position and Shape data are required for delivery generation.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/stages/6-deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionData: project.position_data,
          shapeData: project.shape_data,
          challengeData: project.challenge_data ?? undefined
        })
      });

      const json = await res.json();
      if (json.error || !json.data) {
        throw new Error(json.message || "Failed to generate Stage 6 launch assets.");
      }

      const updatedProject: BrandProject = {
        ...project,
        current_stage: 6,
        deliver_data: json.data as DeliverData
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get raw stage JSON for the JSON inspector tab
  const getCurrentStageData = () => {
    switch (activeStage) {
      case 1:
        return project.discover_data;
      case 2:
        return project.position_data;
      case 3:
        return project.shape_data;
      case 4:
        return project.visualize_data;
      case 5:
        return project.challenge_data;
      case 6:
        return project.deliver_data;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-[#0e1015]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF542E] to-[#E8FF54] flex items-center justify-center font-bold text-black text-xs">
                B
              </div>
              <span className="font-heading font-bold text-base tracking-tight text-white">
                Brand<span className="text-[#FF542E]">OS</span>
              </span>
            </Link>
            <span className="text-slate-500">/</span>
            <span className="text-xs font-medium text-slate-300 truncate max-w-xs">{project.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewJsonMode(!viewJsonMode)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                viewJsonMode
                  ? "bg-[#FF542E]/20 text-[#FF542E] border-[#FF542E]/40"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              }`}
            >
              {viewJsonMode ? <FileText className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              {viewJsonMode ? "Visual View" : "Pruned JSON Contract"}
            </button>

            <button
              onClick={() => {
                setProject(MOCK_BRAND_PROJECT);
                setActiveStage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              Reset to Mock Demo
            </button>
          </div>
        </div>

        {/* Stepper Navigation Bar */}
        <div className="border-t border-white/5 bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {STAGES.map((s) => {
              const Icon = s.icon;
              const isCurrent = activeStage === s.id;
              const isCompleted = s.id <= project.current_stage && getCurrentStageData() !== null;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStage(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    isCurrent
                      ? "bg-[#FF542E]/15 text-[#FF542E] border border-[#FF542E]/30"
                      : isCompleted
                      ? "text-slate-300 hover:bg-white/5"
                      : "text-slate-500 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? "bg-[#FF542E] text-white"
                        : isCompleted
                        ? "bg-white/10 text-slate-200"
                        : "bg-white/5 text-slate-600"
                    }`}
                  >
                    {s.id}
                  </div>
                  <span>{s.name}</span>
                  <span className="text-[10px] opacity-50 hidden sm:inline">({s.provider})</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* View Mode: JSON Contract vs Visual View */}
        {viewJsonMode ? (
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div>
                <h3 className="font-heading font-bold text-sm text-white">
                  Stage {activeStage} JSON Contract Payload
                </h3>
                <p className="text-xs text-slate-400">Strictly typed pruned payload passed downstream.</p>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(getCurrentStageData(), null, 2), "json-payload")
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5"
              >
                {copiedKey === "json-payload" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "json-payload" ? "Copied" : "Copy JSON"}
              </button>
            </div>
            <pre className="font-mono text-xs text-emerald-300 bg-[#06070a] p-4 rounded-xl overflow-x-auto border border-white/5 max-h-[600px]">
              {JSON.stringify(getCurrentStageData(), null, 2) || "// No data generated for this stage yet."}
            </pre>
          </div>
        ) : (
          <div>
            {/* STAGE 1: DISCOVER */}
            {activeStage === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10">
                  <span className="text-[11px] font-mono text-[#FF542E] uppercase tracking-wider font-semibold">
                    Stage 01 Input
                  </span>
                  <h2 className="font-heading font-bold text-xl text-white mt-1 mb-2">Unpack the Rough Idea</h2>
                  <p className="text-xs text-slate-400 mb-6">
                    Enter a rough, incomplete thought. The AI will sharpen the problem, identify the real user, and define the core value hook.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Raw Product Idea / Sentence
                      </label>
                      <textarea
                        value={rawIdeaInput}
                        onChange={(e) => setRawIdeaInput(e.target.value)}
                        rows={3}
                        className="w-full bg-[#06070a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF542E] transition"
                        placeholder="e.g. I want to build an app that helps students find teammates."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Constraints & Target Context (Optional)
                      </label>
                      <textarea
                        value={contextInput}
                        onChange={(e) => setContextInput(e.target.value)}
                        rows={2}
                        className="w-full bg-[#06070a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF542E] transition"
                        placeholder="e.g. University hackathon students, quick onboarding..."
                      />
                    </div>

                    <button
                      onClick={handleExecuteStage1}
                      disabled={isLoading}
                      className="w-full mt-2 py-3 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#FF542E]/20"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Synthesizing with Groq...
                        </>
                      ) : (
                        <>
                          Run Stage 1 Discovery <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  {project.discover_data ? (
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-xs font-mono text-emerald-400">STAGE 1: STRUCTURED CONTRACT</span>
                        <button
                          onClick={() => setActiveStage(2)}
                          className="text-xs text-[#FF542E] hover:underline flex items-center gap-1"
                        >
                          Proceed to Stage 2 <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">Sharpened Problem</span>
                        <p className="text-sm font-medium text-white mt-1 leading-relaxed">
                          {project.discover_data.problemStatement}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-card p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-amber-400">Target Segment</span>
                          <p className="text-xs font-semibold text-white mt-1">
                            {project.discover_data.targetAudience.primarySegment}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                            {project.discover_data.targetAudience.psychographics}
                          </p>
                        </div>

                        <div className="glass-card p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-rose-400">Acute Pain Points</span>
                          <ul className="mt-2 space-y-1.5">
                            {project.discover_data.targetAudience.acutePainPoints.map((pain, i) => (
                              <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                <span className="text-rose-400">•</span> {pain}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[10px] font-mono uppercase text-[#E8FF54]">Primary Value Hook</span>
                        <p className="text-xs font-medium text-white mt-1">{project.discover_data.primaryValueHook}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <Compass className="w-10 h-10 text-slate-600 mb-3" />
                      <h4 className="text-sm font-semibold text-slate-300">Awaiting Discovery Synthesis</h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Run Stage 1 on the left to extract the acute problem statement and audience psychographics.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 2: POSITION */}
            {activeStage === 2 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div>
                    <span className="text-[11px] font-mono text-blue-400 uppercase font-semibold">Stage 02</span>
                    <h2 className="font-heading font-bold text-2xl text-white mt-0.5">Market Positioning & Angle</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Synthesized strictly from Stage 1 Discovery JSON. Zero conversational fluff.
                    </p>
                  </div>

                  <button
                    onClick={handleExecuteStage2}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                    {project.position_data ? "Re-generate Positioning" : "Generate Positioning"}
                  </button>
                </div>

                {project.position_data ? (
                  <div className="mt-8 space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-transparent border border-blue-500/20">
                      <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                        Defensible Positioning Statement
                      </span>
                      <p className="text-base font-semibold text-white mt-2 leading-relaxed">
                        &ldquo;{project.position_data.positioningStatement}&rdquo;
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Market Category</span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{project.position_data.marketCategory}</h4>
                      </div>

                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Core Differentiator</span>
                        <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                          {project.position_data.coreDifferentiator}
                        </p>
                      </div>

                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Competitive Angle</span>
                        <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                          {project.position_data.competitiveAngle.uniqueAngle}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setActiveStage(3)}
                        className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white text-xs font-semibold flex items-center gap-2"
                      >
                        Advance to Stage 3 (Shape Identity) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-300">Click &apos;Generate Positioning&apos; to process Stage 1 Discovery JSON.</p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 3: SHAPE */}
            {activeStage === 3 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div>
                    <span className="text-[11px] font-mono text-purple-400 uppercase font-semibold">Stage 03</span>
                    <h2 className="font-heading font-bold text-2xl text-white mt-0.5">Naming Territories & Voice</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Generates 4 distinct naming territories, personality traits with behavioral examples, and traits to avoid.
                    </p>
                  </div>

                  <button
                    onClick={handleExecuteStage3}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {project.shape_data ? "Re-generate Identity" : "Generate Identity & Names"}
                  </button>
                </div>

                {project.shape_data ? (
                  <div className="mt-8 space-y-8">
                    <div>
                      <h4 className="text-xs font-mono uppercase text-slate-400 mb-4">Naming Territories</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {project.shape_data.namingTerritories.map((opt, i) => (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border transition ${
                              opt.name === project.shape_data?.selectedName
                                ? "bg-purple-950/30 border-purple-500/50"
                                : "glass-card border-white/5"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-purple-300">
                                {opt.category}
                              </span>
                              <span className="text-xs font-mono text-emerald-400">{opt.memorabilityScore}/10</span>
                            </div>
                            <h3 className="font-heading font-bold text-lg text-white mt-2">{opt.name}</h3>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{opt.rationale}</p>
                            <span className="block mt-3 text-[10px] font-mono text-slate-400">{opt.domainConcept}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-emerald-400">Brand Voice Traits to Embody</span>
                        <div className="mt-3 space-y-3">
                          {project.shape_data.brandVoice.traitsToEmbody.map((t, idx) => (
                            <div key={idx} className="border-b border-white/5 pb-2 last:border-0">
                              <span className="text-xs font-bold text-white">{t.trait}</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">{t.justification}</p>
                              <span className="text-[10px] text-emerald-300 italic block mt-1">
                                &ldquo;{t.behavioralExample}&rdquo;
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-rose-400">Traits to Avoid</span>
                        <ul className="mt-3 space-y-2">
                          {project.shape_data.brandVoice.traitsToAvoid.map((avoid, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-rose-400 font-bold">✕</span> {avoid}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 pt-4 border-t border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400">Tagline</span>
                          <p className="text-sm font-bold text-[#E8FF54] mt-1">
                            &ldquo;{project.shape_data.selectedTagline}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setActiveStage(4)}
                        className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white text-xs font-semibold flex items-center gap-2"
                      >
                        Advance to Stage 4 (Visualize) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-300">Click &apos;Generate Identity & Names&apos; to shape the naming and voice.</p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 4: VISUALIZE */}
            {activeStage === 4 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">Stage 04</span>
                    <h2 className="font-heading font-bold text-2xl text-white mt-0.5">Visual Design Brief</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Translates positioning and voice into color tokens, typography pairings, and composition principles.
                    </p>
                  </div>

                  <button
                    onClick={handleExecuteStage4}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Palette className="w-3.5 h-3.5" />}
                    {project.visualize_data ? "Re-generate Visuals" : "Generate Visual Brief"}
                  </button>
                </div>

                {project.visualize_data ? (
                  <div className="mt-8 space-y-8">
                    <div>
                      <h4 className="text-xs font-mono uppercase text-slate-400 mb-4">Color Palette Tokens</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        {project.visualize_data.colorPalette.map((c, i) => (
                          <div key={i} className="glass-card p-3 rounded-xl border border-white/5">
                            <div
                              className="h-16 rounded-lg w-full mb-3 border border-white/10 shadow-inner"
                              style={{ backgroundColor: c.hex }}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{c.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{c.hex}</span>
                            </div>
                            <span className="text-[10px] text-[#FF542E] uppercase font-mono block mt-1">
                              {c.usageRole}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1 leading-tight">{c.emotionalAssociation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Typography Pairing</span>
                        <div className="mt-3 space-y-2">
                          <div>
                            <span className="text-xs text-slate-400">Headings: </span>
                            <span className="text-sm font-bold text-white">
                              {project.visualize_data.typography.headingFont}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400">Body: </span>
                            <span className="text-sm font-bold text-white">
                              {project.visualize_data.typography.bodyFont}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {project.visualize_data.typography.pairingRationale}
                          </p>
                        </div>
                      </div>

                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Symbol & Logo Concepts</span>
                        <ul className="mt-3 space-y-2">
                          {project.visualize_data.logoAndSymbolConcepts.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                              <span className="text-[#E8FF54]">✦</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setActiveStage(5)}
                        className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white text-xs font-semibold flex items-center gap-2"
                      >
                        Advance to Stage 5 (Gemini Adversarial Challenge) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Palette className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-300">Click &apos;Generate Visual Brief&apos; to create colors and typography.</p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 5: CHALLENGE (GEMINI REASONING) */}
            {activeStage === 5 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-rose-400 uppercase font-semibold">Stage 05</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono text-rose-300">
                        Google Gemini 2.5 Pro Reasoner
                      </span>
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-white mt-1">Adversarial Cohesion & Cliche Audit</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Deep reasoning engine stress-tests stages 1–4, detecting contradictions and calculating alignment scores.
                    </p>
                  </div>

                  <button
                    onClick={handleExecuteStage5}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/20"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    {project.challenge_data ? "Re-run Gemini Validation" : "Run Gemini Audit"}
                  </button>
                </div>

                {project.challenge_data ? (
                  <div className="mt-8 space-y-6">
                    {/* Scorecard */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#0e1015] to-transparent border border-rose-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400">Cohesion & Alignment Score</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-heading font-extrabold text-4xl text-white">
                            {project.challenge_data.overallCohesionScore}
                          </span>
                          <span className="text-sm font-mono text-slate-500">/ 100</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 max-w-xl">
                          {project.challenge_data.verdictSummary}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            project.challenge_data.passedValidation
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {project.challenge_data.passedValidation ? "PASSED VALIDATION" : "REVISIONS RECOMMENDED"}
                        </span>
                      </div>
                    </div>

                    {/* Critique Flags */}
                    <div>
                      <h4 className="text-xs font-mono uppercase text-slate-400 mb-3">Detected Flags & Cliches</h4>
                      <div className="space-y-3">
                        {project.challenge_data.critiqueItems.map((item) => (
                          <div key={item.id} className="glass-card p-4 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-400">{item.id}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-amber-300 uppercase">
                                  {item.category.replace("_", " ")}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                  item.severity === "high"
                                    ? "bg-rose-500/20 text-rose-400"
                                    : item.severity === "medium"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-blue-500/20 text-blue-400"
                                }`}
                              >
                                {item.severity.toUpperCase()} SEVERITY
                              </span>
                            </div>
                            <p className="text-xs text-slate-200">{item.description}</p>
                            <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                              <span className="text-[10px] font-mono text-emerald-400 block font-semibold">
                                Actionable Remedy:
                              </span>
                              <p className="text-[11px] text-emerald-200 mt-0.5">{item.actionableRemedy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setActiveStage(6)}
                        className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white text-xs font-semibold flex items-center gap-2"
                      >
                        Advance to Stage 6 (Deliver Launch Kit) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-300">Click &apos;Run Gemini Audit&apos; to stress-test your brand system.</p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 6: DELIVER */}
            {activeStage === 6 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                  <div>
                    <span className="text-[11px] font-mono text-orange-400 uppercase font-semibold">Stage 06</span>
                    <h2 className="font-heading font-bold text-2xl text-white mt-0.5">Launch Kit & Deliverables</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Assembles the landing hero, social launch sequences, and brand rules protecting your voice.
                    </p>
                  </div>

                  <button
                    onClick={handleExecuteStage6}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    {project.deliver_data ? "Re-generate Launch Kit" : "Generate Launch Kit"}
                  </button>
                </div>

                {project.deliver_data ? (
                  <div className="mt-8 space-y-8">
                    {/* Landing Page Hero Preview */}
                    <div className="p-8 rounded-2xl bg-gradient-to-b from-[#1a202e] to-[#0e1015] border border-white/10 text-center relative overflow-hidden">
                      <div className="max-w-2xl mx-auto">
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#FF542E]/10 border border-[#FF542E]/30 text-[#FF542E] uppercase font-semibold">
                          Landing Page Hero Mockup
                        </span>
                        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-4">
                          {project.deliver_data.landingPageHero.headline}
                        </h3>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {project.deliver_data.landingPageHero.subheadline}
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-3">
                          <button className="px-5 py-2.5 rounded-xl bg-[#FF542E] text-white text-xs font-bold shadow-lg shadow-[#FF542E]/20">
                            {project.deliver_data.landingPageHero.primaryCtaText}
                          </button>
                          {project.deliver_data.landingPageHero.secondaryCtaText && (
                            <button className="px-5 py-2.5 rounded-xl glass-card text-slate-200 text-xs font-medium border border-white/10">
                              {project.deliver_data.landingPageHero.secondaryCtaText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pitches */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400">One-Line Pitch</span>
                        <p className="text-xs font-semibold text-white mt-2 leading-relaxed">
                          {project.deliver_data.oneLinePitch}
                        </p>
                      </div>

                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Elevator Pitch</span>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {project.deliver_data.elevatorPitch}
                        </p>
                      </div>
                    </div>

                    {/* Social Launch Posts */}
                    <div>
                      <h4 className="text-xs font-mono uppercase text-slate-400 mb-3">Multi-Platform Launch Copy</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {project.deliver_data.launchSocialPosts.map((post, idx) => (
                          <div key={idx} className="glass-card p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono uppercase text-[#E8FF54] font-bold">
                                  {post.platform.replace("_", " ")}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(`${post.hook}\n\n${post.body}\n\n${post.callToAction}`, `post-${idx}`)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {copiedKey === `post-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <p className="text-xs font-semibold text-white mb-2">{post.hook}</p>
                              <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">{post.body}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 block mt-3 pt-2 border-t border-white/5">
                              CTA: {post.callToAction}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Brand Guardrails */}
                    <div>
                      <h4 className="text-xs font-mono uppercase text-slate-400 mb-3">Operational Brand Guardrails</h4>
                      <div className="space-y-2.5">
                        {project.deliver_data.brandGuardrails.map((g, idx) => (
                          <div key={idx} className="glass-card p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
                            <span className="text-amber-400 font-bold text-xs mt-0.5">⚠</span>
                            <div>
                              <span className="text-xs font-bold text-white">{g.rule}</span>
                              <p className="text-[11px] text-slate-400 mt-0.5">{g.whyItMatters}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Zap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-300">Click &apos;Generate Launch Kit&apos; to assemble the landing copy and social campaign.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
