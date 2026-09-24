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
  RefreshCw,
  Copy,
  Check,
  Code,
  FileText,
  AlertCircle,
  Home,
  FolderOpen
} from "lucide-react";
import ResumeProjectModal from "@/components/shared/ResumeProjectModal";
import ExportBrandKit from "@/components/shared/ExportBrandKit";
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
  { id: 1, name: "Discover", provider: "Groq", icon: Compass, color: "text-amber-400" },
  { id: 2, name: "Position", provider: "Groq", icon: Layers, color: "text-blue-400" },
  { id: 3, name: "Shape", provider: "Groq", icon: Sparkles, color: "text-purple-400" },
  { id: 4, name: "Visualize", provider: "Groq", icon: Palette, color: "text-emerald-400" },
  { id: 5, name: "Challenge", provider: "Gemini", icon: ShieldCheck, color: "text-rose-400" },
  { id: 6, name: "Deliver", provider: "Groq", icon: Zap, color: "text-orange-400" }
];

function createFreshProject(): BrandProject {
  return {
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
}

export default function WizardContent() {
  const searchParams = useSearchParams();
  const isMockMode = searchParams.get("mode") === "mock";

  const [project, setProject] = useState<BrandProject>(
    isMockMode ? MOCK_BRAND_PROJECT : createFreshProject()
  );
  const [activeStage, setActiveStage] = useState<number>(isMockMode ? 1 : 1);
  const [rawIdeaInput, setRawIdeaInput] = useState<string>(
    "I want to create an app that helps university students find complementary project teammates based on verified work styles."
  );
  const [contextInput, setContextInput] = useState<string>(
    "Targeting CS and design students preparing for 36-hour hackathons and capstone courses."
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewJsonMode, setViewJsonMode] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  // Member 1: Resume modal state
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);

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

  const persistProjectState = async (updated: BrandProject) => {
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn("[Persist Warning]:", err);
    }
  };

  // Member 1 — Task 1.2: Load an existing project from the Resume modal
  const handleLoadProject = (loaded: BrandProject) => {
    setProject(loaded);
    // Jump to the furthest completed stage
    setActiveStage(loaded.current_stage);
    setErrorMsg(null);
  };

  // Member 1 — Task 1.2: Reset to a blank new project
  const handleNewProject = () => {
    setProject(createFreshProject());
    setActiveStage(1);
    setErrorMsg(null);
  };

  const handleExecuteStage1 = async () => {
    if (!rawIdeaInput.trim()) { setErrorMsg("Please enter an initial idea."); return; }
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/stages/1-discover", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawIdea: rawIdeaInput.trim(), additionalContext: contextInput.trim() })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.message);
      const updated: BrandProject = { ...project, title: rawIdeaInput.slice(0, 32) + "...", current_stage: Math.max(project.current_stage, 2), discover_data: json.data as DiscoverData };
      setProject(updated); await persistProjectState(updated); setActiveStage(2);
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Stage 1 failed."); }
    finally { setIsLoading(false); }
  };

  const handleExecuteStage2 = async () => {
    if (!project.discover_data) { setErrorMsg("Run Stage 1 first."); return; }
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/stages/2-position", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoverData: project.discover_data })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.message);
      const updated: BrandProject = { ...project, current_stage: Math.max(project.current_stage, 3), position_data: json.data as PositionData };
      setProject(updated); await persistProjectState(updated); setActiveStage(3);
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Stage 2 failed."); }
    finally { setIsLoading(false); }
  };

  const handleExecuteStage3 = async () => {
    if (!project.discover_data || !project.position_data) { setErrorMsg("Run Stages 1 & 2 first."); return; }
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/stages/3-shape", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoverData: project.discover_data, positionData: project.position_data })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.message);
      const shapeData = json.data as ShapeData;
      const updated: BrandProject = { ...project, title: shapeData.selectedName || project.title, current_stage: Math.max(project.current_stage, 4), shape_data: shapeData };
      setProject(updated); await persistProjectState(updated); setActiveStage(4);
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Stage 3 failed."); }
    finally { setIsLoading(false); }
  };

  const handleExecuteStage4 = async () => {
    if (!project.position_data || !project.shape_data) { setErrorMsg("Run Stages 2 & 3 first."); return; }
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/stages/4-visualize", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionData: project.position_data, shapeData: project.shape_data })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.message);
      const updated: BrandProject = { ...project, current_stage: Math.max(project.current_stage, 5), visualize_data: json.data as VisualizeData };
      setProject(updated); await persistProjectState(updated); setActiveStage(5);
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Stage 4 failed."); }
    finally { setIsLoading(false); }
  };

  const handleExecuteStage5 = async () => {
    if (!project.discover_data || !project.position_data || !project.shape_data || !project.visualize_data) {
      setErrorMsg("Complete Stages 1-4 before running Gemini validation."); return;
    }
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/stages/5-challenge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoverData: project.discover_data, positionData: project.position_data, shapeData: project.shape_data, visualizeData: project.visualize_data })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.message);
      const updated: BrandProject = { ...project, current_stage: Math.max(project.current_stage, 6), challenge_data: json.data as ChallengeData };
      setProject(updated); await persistProjectState(updated); setActiveStage(6);
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Stage 5 failed."); }
    finally { setIsLoading(false); }
  };

  const handleExecuteStage6 = async () => {
    if (!project.position_data || !project.shape_data) { setErrorMsg("Complete Stages 2 & 3 first."); return; }
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/stages/6-deliver", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionData: project.position_data, shapeData: project.shape_data, challengeData: project.challenge_data ?? undefined })
      });
      const json = await res.json();
      if (json.error) throw new Error(json.message);
      const updated: BrandProject = { ...project, current_stage: 6, deliver_data: json.data as DeliverData };
      setProject(updated); await persistProjectState(updated);
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Stage 6 failed."); }
    finally { setIsLoading(false); }
  };

  const getCurrentStageData = () => {
    const map: Record<number, unknown> = { 1: project.discover_data, 2: project.position_data, 3: project.shape_data, 4: project.visualize_data, 5: project.challenge_data, 6: project.deliver_data };
    return map[activeStage] ?? null;
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-white/5 bg-[#0e1015]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF542E] to-[#E8FF54] flex items-center justify-center font-bold text-black text-xs">B</div>
              <span className="font-heading font-bold text-base text-white">Brand<span className="text-[#FF542E]">OS</span></span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-medium text-slate-400 truncate max-w-[180px] sm:max-w-xs">{project.title}</span>
            {isMockMode && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8FF54]/10 text-[#E8FF54] border border-[#E8FF54]/30">
                DEMO MODE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Member 1 — Task 1.3: Export Brand Kit */}
            <ExportBrandKit project={project} />
            <button
              onClick={() => setViewJsonMode(!viewJsonMode)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${viewJsonMode ? "bg-[#FF542E]/20 text-[#FF542E] border-[#FF542E]/40" : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"}`}
            >
              {viewJsonMode ? <FileText className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              {viewJsonMode ? "Visual" : "JSON"}
            </button>
            {/* Member 1 — Task 1.2: Resume Project */}
            <button
              onClick={() => setShowResumeModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5" /> Projects
            </button>
            <Link href="/" className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
          </div>
        </div>

        {/* Stepper */}
        <div className="border-t border-white/5 bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-1.5 overflow-x-auto">
            {STAGES.map((s, idx) => {
              const Icon = s.icon;
              const isCurrent = activeStage === s.id;
              const isDone = project.current_stage > s.id;
              const isAccessible = s.id <= project.current_stage;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => isAccessible && setActiveStage(s.id)}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap disabled:cursor-not-allowed ${
                      isCurrent ? "bg-[#FF542E]/15 text-[#FF542E] border border-[#FF542E]/30" :
                      isDone ? "text-emerald-400 hover:bg-white/5 border border-transparent" :
                      isAccessible ? "text-slate-300 hover:bg-white/5 border border-transparent" :
                      "text-slate-600 border border-transparent"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isCurrent ? "bg-[#FF542E] text-white" :
                      isDone ? "bg-emerald-500/20 text-emerald-400" :
                      "bg-white/5 text-slate-500"
                    }`}>
                      {isDone ? "✓" : s.id}
                    </div>
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? "text-[#FF542E]" : s.color}`} />
                    <span>{s.name}</span>
                  </button>
                  {idx < STAGES.length - 1 && (
                    <span className="text-slate-700 text-xs shrink-0">›</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        {/* Error banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white ml-4 shrink-0">✕</button>
          </div>
        )}

        {/* JSON Inspector */}
        {viewJsonMode ? (
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div>
                <h3 className="font-heading font-bold text-sm text-white">Stage {activeStage} — Pruned JSON Contract</h3>
                <p className="text-xs text-slate-400">This is the exact payload passed downstream to the next stage.</p>
              </div>
              <button onClick={() => copyToClipboard(JSON.stringify(getCurrentStageData(), null, 2), "json")}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5">
                {copiedKey === "json" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "json" ? "Copied!" : "Copy JSON"}
              </button>
            </div>
            <pre className="font-mono text-xs text-emerald-300 bg-black/40 p-4 rounded-xl overflow-x-auto border border-white/5 max-h-[600px] leading-relaxed">
              {JSON.stringify(getCurrentStageData(), null, 2) || "// No data for this stage yet. Run the stage to generate."}
            </pre>
          </div>
        ) : (
          <div>
            {/* ─── STAGE 1: DISCOVER ─── */}
            {activeStage === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Input Panel */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 h-fit">
                  <div className="flex items-center gap-2 mb-1">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">Stage 01 · Discover</span>
                  </div>
                  <h2 className="font-heading font-bold text-xl text-white mb-1">Unpack the Raw Idea</h2>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">Enter a rough, incomplete founder thought. AI extracts the real problem and target user.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Rough Product Idea</label>
                      <textarea value={rawIdeaInput} onChange={e => setRawIdeaInput(e.target.value)} rows={3}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FF542E]/60 transition resize-none"
                        placeholder="e.g. I want to build an app that helps students find teammates..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Context & Constraints <span className="text-slate-500">(optional)</span></label>
                      <textarea value={contextInput} onChange={e => setContextInput(e.target.value)} rows={2}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FF542E]/60 transition resize-none"
                        placeholder="e.g. Targeting university hackathon students, fast onboarding..." />
                    </div>
                    <button onClick={handleExecuteStage1} disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF542E] to-[#ff6947] hover:opacity-90 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#FF542E]/20">
                      {isLoading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Synthesizing with Groq...</> :
                        <>Run Stage 1 Discovery <ArrowRight className="w-3.5 h-3.5" /></>}
                    </button>
                    {isMockMode && !project.discover_data && (
                      <p className="text-center text-[10px] text-slate-500">
                        In demo mode — <span className="text-amber-400">mock data already loaded</span>, navigate stages freely.
                      </p>
                    )}
                  </div>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-3">
                  {project.discover_data ? (
                    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-xs font-mono text-emerald-400 font-semibold">✓ STAGE 1: DISCOVER CONTRACT</span>
                        <button onClick={() => setActiveStage(2)} className="text-xs text-[#FF542E] hover:underline flex items-center gap-1">
                          Go to Stage 2 <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-slate-500 mb-1">Sharpened Problem</p>
                        <p className="text-sm font-medium text-white leading-relaxed">{project.discover_data.problemStatement}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl">
                          <p className="text-[10px] font-mono uppercase text-amber-400 mb-1">Primary Segment</p>
                          <p className="text-xs font-bold text-white">{project.discover_data.targetAudience.primarySegment}</p>
                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{project.discover_data.targetAudience.psychographics}</p>
                        </div>
                        <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl">
                          <p className="text-[10px] font-mono uppercase text-rose-400 mb-2">Acute Pain Points</p>
                          <ul className="space-y-1.5">
                            {project.discover_data.targetAudience.acutePainPoints.map((pain, i) => (
                              <li key={i} className="text-[11px] text-slate-200 flex items-start gap-1.5">
                                <span className="text-rose-400 shrink-0">•</span>{pain}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-[#E8FF54]/5 border border-[#E8FF54]/20">
                        <p className="text-[10px] font-mono uppercase text-[#E8FF54] mb-1">Primary Value Hook</p>
                        <p className="text-xs font-semibold text-white">{project.discover_data.primaryValueHook}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-slate-500 mb-2">Key Constraints</p>
                        <div className="flex flex-wrap gap-2">
                          {project.discover_data.keyConstraints.map((c, i) => (
                            <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel h-full min-h-[320px] rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-10">
                      <Compass className="w-12 h-12 text-slate-700 mb-3" />
                      <h4 className="text-sm font-semibold text-slate-300">Awaiting Discovery</h4>
                      <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                        {isMockMode ? "Click a stage in the stepper above to explore the Campfire demo." : "Fill in your idea and click Run Stage 1 to begin."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── STAGE 2: POSITION ─── */}
            {activeStage === 2 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><Layers className="w-4 h-4 text-blue-400" /><span className="text-[11px] font-mono text-blue-400 uppercase font-semibold">Stage 02 · Position</span></div>
                    <h2 className="font-heading font-bold text-2xl text-white">Market Positioning</h2>
                    <p className="text-xs text-slate-400 mt-1">Consumes Stage 1 JSON. Produces market category, differentiator, and positioning statement.</p>
                  </div>
                  <button onClick={handleExecuteStage2} disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shrink-0">
                    {isLoading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating...</> :
                      <><Layers className="w-3.5 h-3.5" />{project.position_data ? "Regenerate" : "Generate Positioning"}</>}
                  </button>
                </div>
                {project.position_data ? (
                  <div className="mt-6 space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-[#0e1015] to-transparent border border-blue-500/20">
                      <p className="text-[10px] font-mono uppercase text-blue-400 font-semibold mb-2">Positioning Statement</p>
                      <p className="text-lg font-semibold text-white leading-relaxed">&ldquo;{project.position_data.positioningStatement}&rdquo;</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: "Market Category", value: project.position_data.marketCategory, color: "text-blue-300" },
                        { label: "Core Differentiator", value: project.position_data.coreDifferentiator, color: "text-purple-300" },
                        { label: "Unique Angle", value: project.position_data.competitiveAngle.uniqueAngle, color: "text-emerald-300" }
                      ].map((item, i) => (
                        <div key={i} className="glass-card p-4 rounded-xl border border-white/5">
                          <p className={`text-[10px] font-mono uppercase ${item.color} mb-1.5`}>{item.label}</p>
                          <p className="text-xs text-slate-200 leading-relaxed">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="glass-card p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">Value Proposition</p>
                      <p className="text-sm font-medium text-white">{project.position_data.valueProposition}</p>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setActiveStage(3)} className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white text-xs font-semibold flex items-center gap-2">
                        Advance to Stage 3 (Shape) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center"><Layers className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Click Generate Positioning to process Stage 1 JSON.</p></div>
                )}
              </div>
            )}

            {/* ─── STAGE 3: SHAPE ─── */}
            {activeStage === 3 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><Sparkles className="w-4 h-4 text-purple-400" /><span className="text-[11px] font-mono text-purple-400 uppercase font-semibold">Stage 03 · Shape</span></div>
                    <h2 className="font-heading font-bold text-2xl text-white">Naming & Brand Voice</h2>
                    <p className="text-xs text-slate-400 mt-1">4 naming territories with memorability scores, voice traits to embody and avoid.</p>
                  </div>
                  <button onClick={handleExecuteStage3} disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shrink-0">
                    {isLoading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating...</> :
                      <><Sparkles className="w-3.5 h-3.5" />{project.shape_data ? "Regenerate" : "Generate Identity"}</>}
                  </button>
                </div>
                {project.shape_data ? (
                  <div className="mt-6 space-y-8">
                    {/* Naming territories */}
                    <div>
                      <p className="text-xs font-mono uppercase text-slate-400 mb-3">Naming Territories</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {project.shape_data.namingTerritories.map((opt, i) => (
                          <div key={i} className={`p-4 rounded-xl border transition ${opt.name === project.shape_data?.selectedName ? "bg-purple-950/30 border-purple-500/50 glow-ember" : "glass-card border-white/5"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-purple-300">{opt.category}</span>
                              <span className="text-xs font-mono text-emerald-400 font-bold">{opt.memorabilityScore}/10</span>
                            </div>
                            <h3 className="font-heading font-bold text-lg text-white">{opt.name}</h3>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{opt.rationale}</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-2">{opt.domainConcept}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Selected + Tagline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
                        <p className="text-[10px] font-mono uppercase text-purple-400 mb-1">Selected Name</p>
                        <p className="text-2xl font-heading font-extrabold text-white">{project.shape_data.selectedName}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#E8FF54]/5 border border-[#E8FF54]/20">
                        <p className="text-[10px] font-mono uppercase text-[#E8FF54] mb-1">Selected Tagline</p>
                        <p className="text-base font-bold text-white">&ldquo;{project.shape_data.selectedTagline}&rdquo;</p>
                      </div>
                    </div>
                    {/* Voice */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-mono uppercase text-emerald-400 mb-3">Traits to Embody</p>
                        <div className="space-y-3">
                          {project.shape_data.brandVoice.traitsToEmbody.map((t, i) => (
                            <div key={i} className="pb-2 border-b border-white/5 last:border-0">
                              <p className="text-xs font-bold text-white">{t.trait}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{t.justification}</p>
                              <p className="text-[10px] italic text-emerald-300 mt-1">&ldquo;{t.behavioralExample}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-mono uppercase text-rose-400 mb-3">Traits to Avoid</p>
                        <ul className="space-y-2">
                          {project.shape_data.brandVoice.traitsToAvoid.map((a, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-rose-400 font-bold shrink-0">✕</span>{a}</li>
                          ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-[10px] font-mono uppercase text-slate-400 mb-2">Tone Descriptors</p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.shape_data.brandVoice.toneDescriptors.map((t, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setActiveStage(4)} className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white text-xs font-semibold flex items-center gap-2">
                        Advance to Stage 4 (Visualize) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center"><Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Click Generate Identity to explore naming options.</p></div>
                )}
              </div>
            )}

            {/* ─── STAGE 4: VISUALIZE ─── */}
            {activeStage === 4 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><Palette className="w-4 h-4 text-emerald-400" /><span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">Stage 04 · Visualize</span></div>
                    <h2 className="font-heading font-bold text-2xl text-white">Visual Design Brief</h2>
                    <p className="text-xs text-slate-400 mt-1">Generates a 5-token color palette, typography pairing, logo concepts, and art direction.</p>
                  </div>
                  <button onClick={handleExecuteStage4} disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shrink-0">
                    {isLoading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating...</> :
                      <><Palette className="w-3.5 h-3.5" />{project.visualize_data ? "Regenerate" : "Generate Visual Brief"}</>}
                  </button>
                </div>
                {project.visualize_data ? (
                  <div className="mt-6 space-y-8">
                    {/* Color Palette */}
                    <div>
                      <p className="text-xs font-mono uppercase text-slate-400 mb-3">Color Palette</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {project.visualize_data.colorPalette.map((c, i) => (
                          <div key={i} className="glass-card p-3 rounded-xl border border-white/5 group cursor-pointer"
                            onClick={() => copyToClipboard(c.hex, `color-${i}`)}>
                            <div className="h-14 rounded-lg w-full mb-3 border border-white/10" style={{ backgroundColor: c.hex }} />
                            <p className="text-xs font-bold text-white truncate">{c.name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-[10px] font-mono text-slate-400">{c.hex}</p>
                              {copiedKey === `color-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100" />}
                            </div>
                            <p className="text-[10px] text-[#FF542E] uppercase font-mono mt-1">{c.usageRole}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Typography */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-mono uppercase text-slate-400 mb-3">Typography Pairing</p>
                        <div className="space-y-2.5">
                          <div><span className="text-xs text-slate-400">Heading: </span><span className="text-sm font-bold text-white">{project.visualize_data.typography.headingFont}</span></div>
                          <div><span className="text-xs text-slate-400">Body: </span><span className="text-sm font-bold text-white">{project.visualize_data.typography.bodyFont}</span></div>
                          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5">{project.visualize_data.typography.pairingRationale}</p>
                        </div>
                      </div>
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-mono uppercase text-slate-400 mb-3">Logo & Symbol Concepts</p>
                        <ul className="space-y-2">
                          {project.visualize_data.logoAndSymbolConcepts.map((item, i) => (
                            <li key={i} className="text-xs text-slate-200 flex items-start gap-2"><span className="text-[#E8FF54] shrink-0">✦</span>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {/* Composition & Avoids */}
                    <div className="glass-card p-5 rounded-xl border border-white/5">
                      <p className="text-[10px] font-mono uppercase text-slate-400 mb-2">Composition Style</p>
                      <p className="text-xs text-slate-200">{project.visualize_data.compositionStyle}</p>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setActiveStage(5)} className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white text-xs font-semibold flex items-center gap-2">
                        Advance to Stage 5 (Gemini Audit) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center"><Palette className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Click Generate Visual Brief to produce color tokens and typography.</p></div>
                )}
              </div>
            )}

            {/* ─── STAGE 5: CHALLENGE ─── */}
            {activeStage === 5 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      <span className="text-[11px] font-mono text-rose-400 uppercase font-semibold">Stage 05 · Challenge</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono text-rose-300">Google Gemini 2.5 Pro</span>
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-white">Adversarial Brand Audit</h2>
                    <p className="text-xs text-slate-400 mt-1">Deep reasoning: cliché detection, contradiction flagging, cohesion score, and actionable remedies.</p>
                  </div>
                  <button onClick={handleExecuteStage5} disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-rose-600/20">
                    {isLoading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Auditing with Gemini...</> :
                      <><ShieldCheck className="w-3.5 h-3.5" />{project.challenge_data ? "Re-run Audit" : "Run Gemini Audit"}</>}
                  </button>
                </div>
                {project.challenge_data ? (
                  <div className="mt-6 space-y-6">
                    {/* Score */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#0e1015] to-transparent border border-rose-500/20 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-slate-400">Overall Cohesion Score</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-heading font-extrabold text-5xl text-white">{project.challenge_data.overallCohesionScore}</span>
                          <span className="text-sm font-mono text-slate-500">/ 100</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">{project.challenge_data.verdictSummary}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold border shrink-0 ${project.challenge_data.passedValidation ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}>
                        {project.challenge_data.passedValidation ? "✓ PASSED VALIDATION" : "⚠ REVISIONS NEEDED"}
                      </span>
                    </div>
                    {/* Critique Items */}
                    <div>
                      <p className="text-xs font-mono uppercase text-slate-400 mb-3">Detected Flags</p>
                      <div className="space-y-3">
                        {project.challenge_data.critiqueItems.map(item => (
                          <div key={item.id} className="glass-card p-4 rounded-xl border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-slate-500">{item.id}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 uppercase">{item.category.replace("_", " ")}</span>
                              </div>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${item.severity === "high" ? "bg-rose-500/20 text-rose-400" : item.severity === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                                {item.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-200">{item.description}</p>
                            <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                              <p className="text-[10px] font-mono text-emerald-400 font-semibold">Remedy:</p>
                              <p className="text-[11px] text-emerald-200 mt-0.5">{item.actionableRemedy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => setActiveStage(6)} className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white text-xs font-semibold flex items-center gap-2">
                        Advance to Stage 6 (Deliver) <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center"><ShieldCheck className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Click Run Gemini Audit to stress-test your brand for clichés and contradictions.</p></div>
                )}
              </div>
            )}

            {/* ─── STAGE 6: DELIVER ─── */}
            {activeStage === 6 && (
              <div className="glass-panel p-8 rounded-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-orange-400" /><span className="text-[11px] font-mono text-orange-400 uppercase font-semibold">Stage 06 · Deliver</span></div>
                    <h2 className="font-heading font-bold text-2xl text-white">Launch Kit</h2>
                    <p className="text-xs text-slate-400 mt-1">Landing hero copy, one-line pitch, social posts, and operational brand guardrails.</p>
                  </div>
                  <button onClick={handleExecuteStage6} disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shrink-0">
                    {isLoading ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating...</> :
                      <><Zap className="w-3.5 h-3.5" />{project.deliver_data ? "Regenerate Kit" : "Generate Launch Kit"}</>}
                  </button>
                </div>
                {project.deliver_data ? (
                  <div className="mt-6 space-y-8">
                    {/* Hero Preview */}
                    <div className="p-8 rounded-2xl bg-gradient-to-b from-[#1a202e] to-[#0e1015] border border-white/10 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                      <div className="relative max-w-2xl mx-auto">
                        <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#FF542E]/10 border border-[#FF542E]/30 text-[#FF542E] uppercase font-semibold">Landing Page Hero Preview</span>
                        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mt-5 leading-tight">{project.deliver_data.landingPageHero.headline}</h3>
                        <p className="text-sm text-slate-300 mt-2 leading-relaxed">{project.deliver_data.landingPageHero.subheadline}</p>
                        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                          <button className="px-5 py-2.5 rounded-xl bg-[#FF542E] text-white text-xs font-bold shadow-lg shadow-[#FF542E]/25">{project.deliver_data.landingPageHero.primaryCtaText}</button>
                          {project.deliver_data.landingPageHero.secondaryCtaText && (
                            <button className="px-5 py-2.5 rounded-xl glass-card text-slate-200 text-xs font-medium border border-white/10">{project.deliver_data.landingPageHero.secondaryCtaText}</button>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Pitches */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-mono uppercase text-slate-400 mb-2">One-Line Pitch</p>
                        <p className="text-xs font-semibold text-white leading-relaxed">{project.deliver_data.oneLinePitch}</p>
                      </div>
                      <div className="glass-card p-5 rounded-xl border border-white/5">
                        <p className="text-[10px] font-mono uppercase text-slate-400 mb-2">Elevator Pitch</p>
                        <p className="text-xs text-slate-300 leading-relaxed">{project.deliver_data.elevatorPitch}</p>
                      </div>
                    </div>
                    {/* Social Posts */}
                    <div>
                      <p className="text-xs font-mono uppercase text-slate-400 mb-3">Launch Social Posts</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {project.deliver_data.launchSocialPosts.map((post, i) => (
                          <div key={i} className="glass-card p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono uppercase text-[#E8FF54] font-bold">{post.platform.replace("_", " ")}</span>
                                <button onClick={() => copyToClipboard(`${post.hook}\n\n${post.body}\n\n${post.callToAction}`, `post-${i}`)}
                                  className="text-slate-500 hover:text-white transition">
                                  {copiedKey === `post-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <p className="text-xs font-semibold text-white mb-2">{post.hook}</p>
                              <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">{post.body}</p>
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 mt-3 pt-2 border-t border-white/5">{post.callToAction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Guardrails */}
                    <div>
                      <p className="text-xs font-mono uppercase text-slate-400 mb-3">Brand Guardrails</p>
                      <div className="space-y-2.5">
                        {project.deliver_data.brandGuardrails.map((g, i) => (
                          <div key={i} className="glass-card p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
                            <span className="text-amber-400 font-bold text-sm shrink-0">⚠</span>
                            <div><p className="text-xs font-bold text-white">{g.rule}</p><p className="text-[11px] text-slate-400 mt-0.5">{g.whyItMatters}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center"><Zap className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Click Generate Launch Kit to assemble your launch assets.</p></div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Member 1 — Task 1.2: Resume Project Modal overlay */}
      <ResumeProjectModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onLoad={handleLoadProject}
        onNew={handleNewProject}
      />
    </div>
  );
}
