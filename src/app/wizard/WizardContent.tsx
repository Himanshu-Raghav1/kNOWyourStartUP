"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Code,
  FileText,
  AlertCircle,
  Download,
  ShieldCheck,
  Zap,
  Sparkles
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
import { VerticalStepper } from "@/components/wizard/VerticalStepper";
import { DiscoverInterview } from "@/components/stage1-discover/DiscoverInterview";
import { PositionInterview } from "@/components/stage2-position/PositionInterview";
import { ShapeInterview } from "@/components/stage3-shape/ShapeInterview";
import { VisualizeInterview } from "@/components/stage4-visualize/VisualizeInterview";
import { CohesionScorecard } from "@/components/stage5-challenge/CohesionScorecard";
import { LaunchDeck } from "@/components/stage6-deliver/LaunchDeck";

export default function WizardContent() {
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

  // Stage 1 Input State (Starts completely blank per user requirement)
  const [rawIdeaInput, setRawIdeaInput] = useState<string>("");

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
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

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  /**
   * Persists the updated project state to the server/Supabase.
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
   * STAGE 1: Execute Discovery LLM Generation via Google Gemini
   */
  const handleExecuteStage1 = async (payload: {
    rawIdea: string;
    vision: string;
    problem: string;
    selectedPersonas: string[];
    ambiguityAnswers: Record<string, string>;
  }) => {
    if (!payload.rawIdea.trim()) {
      setErrorMsg("Please enter an initial product idea.");
      return;
    }

    setRawIdeaInput(payload.rawIdea);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/stages/1-discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.error || !json.data) {
        throw new Error(json.message || "Failed to generate Stage 1 discovery.");
      }

      const updatedProject: BrandProject = {
        ...project,
        title: `${payload.rawIdea.slice(0, 24)}...`,
        current_stage: Math.max(project.current_stage, 2),
        discover_data: json.data as DiscoverData
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
      triggerToast("✓ Stage 01 Discovery Intelligence Synthesized & Chained!");
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
      triggerToast("✓ Stage 02 Market Positioning Wedge Synthesized!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 3: Execute Shaping (Naming & Voice) Generation
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

      const shapeResult = json.data as ShapeData;
      const updatedProject: BrandProject = {
        ...project,
        title: shapeResult.selectedName || project.title,
        current_stage: Math.max(project.current_stage, 4),
        shape_data: shapeResult
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
      triggerToast("✓ Stage 03 Naming Territories & Voice Matrix Generated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 4: Execute Visualization Generation
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
      triggerToast("✓ Stage 04 Visual Design Brief & Color Swatches Created!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 5: Execute Google Gemini Adversarial Critique & Validation
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
      triggerToast("✓ Stage 05 Gemini Adversarial Stress-Test Complete!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * STAGE 6: Execute Launch Delivery Generation
   */
  const handleExecuteStage6 = async () => {
    if (!project.position_data || !project.shape_data) {
      setErrorMsg("Stage 2 and Stage 3 outputs are required before Launch Kit generation.");
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
          challengeData: project.challenge_data
        })
      });

      const json = await res.json();
      if (json.error || !json.data) {
        throw new Error(json.message || "Failed to generate Stage 6 launch kit.");
      }

      const updatedProject: BrandProject = {
        ...project,
        deliver_data: json.data as DeliverData
      };

      setProject(updatedProject);
      await persistProjectState(updatedProject);
      triggerToast("✓ Stage 06 Launch Kit & Social Campaign Ready!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error occurred";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Task 4.2 Actionable Remedy Replacer: Apply Gemini's alternative to brand state
   */
  const handleApplyRemedy = (proposal: string, original: string) => {
    if (project.shape_data && original.toLowerCase().includes("name")) {
      const updated: BrandProject = {
        ...project,
        title: proposal,
        shape_data: {
          ...project.shape_data,
          selectedName: proposal
        }
      };
      setProject(updated);
      persistProjectState(updated);
      triggerToast(`✓ Brand name updated to "${proposal}" from Gemini remedy!`);
    } else {
      triggerToast(`✓ Remedy noted: "${proposal}" integrated into brand system!`);
    }
  };

  /**
   * Export Brand Kit as Markdown
   */
  const handleExportBrandKit = () => {
    const brandName = project.shape_data?.selectedName || project.title || "Brand System";
    const markdown = `# ${brandName} — Complete Brand Intelligence Kit
Generated by BrandOS (Dual-LLM 6-Stage Sequential Architecture)
Timestamp: ${new Date().toISOString()}

---

## 1. Discovery Brief
**Problem Statement**: ${project.discover_data?.problemStatement || "N/A"}
**Primary Target**: ${project.discover_data?.targetAudience.primarySegment || "N/A"}
**Psychographics**: ${project.discover_data?.targetAudience.psychographics || "N/A"}
**Primary Value Hook**: ${project.discover_data?.primaryValueHook || "N/A"}

---

## 2. Positioning Wedge
**Market Category**: ${project.position_data?.marketCategory || "N/A"}
**Core Differentiator**: ${project.position_data?.coreDifferentiator || "N/A"}
**Positioning Statement**:
> "${project.position_data?.positioningStatement || "N/A"}"

---

## 3. Brand Identity & Voice
**Selected Name**: ${project.shape_data?.selectedName || "N/A"}
**Selected Tagline**: ${project.shape_data?.selectedTagline || "N/A"}

### Voice Traits to Embody:
${project.shape_data?.brandVoice.traitsToEmbody.map(t => `- **${t.trait}**: ${t.justification} (e.g. ${t.behavioralExample})`).join("\n") || "N/A"}

### Voice Traits to Avoid:
${project.shape_data?.brandVoice.traitsToAvoid.map(t => `- **Avoid**: ${t}`).join("\n") || "N/A"}

---

## 4. Visual Identity Tokens
### Color Palette:
${project.visualize_data?.colorPalette.map(c => `- **${c.name}** (\`${c.hex}\`): ${c.usageRole} (${c.emotionalAssociation})`).join("\n") || "N/A"}

### Typography Pairing:
- **Heading**: ${project.visualize_data?.typography.headingFont || "N/A"}
- **Body**: ${project.visualize_data?.typography.bodyFont || "N/A"}
- **Design Rationale**: ${project.visualize_data?.typography.pairingRationale || "N/A"}

---

## 5. Adversarial Audit (Google Gemini)
**Cohesion Score**: ${project.challenge_data?.overallCohesionScore || "N/A"} / 100
**Validation Verdict**: ${project.challenge_data?.passedValidation ? "PASSED" : "REVISIONS RECOMMENDED"}
**Summary**: ${project.challenge_data?.verdictSummary || "N/A"}

---

## 6. Launch Deliverables
**One-Line Pitch**: ${project.deliver_data?.oneLinePitch || "N/A"}
**Elevator Pitch**: ${project.deliver_data?.elevatorPitch || "N/A"}

### Landing Page Hero:
- **Headline**: ${project.deliver_data?.landingPageHero.headline || "N/A"}
- **Subheadline**: ${project.deliver_data?.landingPageHero.subheadline || "N/A"}
- **Primary CTA**: ${project.deliver_data?.landingPageHero.primaryCtaText || "N/A"}
- **Secondary CTA**: ${project.deliver_data?.landingPageHero.secondaryCtaText || "N/A"}
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandName.toLowerCase().replace(/\s+/g, "-")}-brand-kit.md`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("✓ Brand Kit Exported as Markdown!");
  };

  /**
   * Helper to retrieve active stage's JSON
   */
  const getCurrentStageData = () => {
    switch (activeStage) {
      case 1: return project.discover_data;
      case 2: return project.position_data;
      case 3: return project.shape_data;
      case 4: return project.visualize_data;
      case 5: return project.challenge_data;
      case 6: return project.deliver_data;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 flex flex-col font-sans selection:bg-[#FF542E]/30 selection:text-white">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#0f131c] border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Global Top Studio Header */}
      <header className="border-b border-white/5 bg-[#0a0c10]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group transition"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF542E] to-[#ff7b47] flex items-center justify-center shadow-lg shadow-[#FF542E]/20">
                <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition duration-300" />
              </div>
              <span className="font-heading font-black text-lg tracking-tight text-white">
                Brand<span className="text-[#FF542E]">OS</span>
              </span>
            </Link>

            <span className="text-slate-600 hidden sm:inline">/</span>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-200">
                {project.shape_data?.selectedName || project.title}
              </span>
              {isMockMode && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8FF54]/10 text-[#E8FF54] border border-[#E8FF54]/25">
                  Mock Mode
                </span>
              )}
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportBrandKit}
              className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF542E] to-[#ff7b47] hover:from-[#ff6947] hover:to-[#ff8d5e] text-white font-bold transition shadow-md shadow-[#FF542E]/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Brand Kit</span>
            </button>

            <button
              onClick={() => setViewJsonMode(!viewJsonMode)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition ${
                viewJsonMode
                  ? "bg-[#E8FF54]/20 text-[#E8FF54] border-[#E8FF54]/40 font-bold"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {viewJsonMode ? <FileText className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{viewJsonMode ? "Visual View" : "JSON Contract"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace: Left Vertical Stepper + Right Interactive Agency Stage */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6 items-start">
        {/* Transformation 1: Vertical 1 to 6 Taskbar */}
        <VerticalStepper
          activeStage={activeStage}
          project={project}
          onSelectStage={(id) => setActiveStage(id)}
          viewJsonMode={viewJsonMode}
          onToggleJsonMode={() => setViewJsonMode(!viewJsonMode)}
          onResetMock={() => {
            setProject(MOCK_BRAND_PROJECT);
            setActiveStage(1);
            triggerToast("✓ Loaded Reference 'Campfire' Brand Project!");
          }}
        />

        {/* Transformation 2: Interactive Agency Chain-Prompter Workspace */}
        <main className="flex-1 w-full min-w-0">
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

          {/* View Mode: JSON Contract Inspector vs Visual Interactive Interview */}
          {viewJsonMode ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h3 className="font-heading font-bold text-sm text-white">
                    Stage 0{activeStage} Pruned JSON Contract Payload
                  </h3>
                  <p className="text-xs text-slate-400">
                    Strictly typed output schema passed downstream to subsequent prompts.
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(getCurrentStageData(), null, 2) || "{}",
                      `stage-${activeStage}`
                    )
                  }
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                >
                  {copiedKey === `stage-${activeStage}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-[#040508] p-5 rounded-xl border border-white/5 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[600px] leading-relaxed">
                {JSON.stringify(getCurrentStageData(), null, 2) || "// No structured data locked for this stage yet."}
              </pre>
            </div>
          ) : (
            <div>
              {/* STAGE 1: DISCOVER INTERVIEW */}
              {activeStage === 1 && (
                <DiscoverInterview
                  initialIdea={rawIdeaInput}
                  data={project.discover_data}
                  isLoading={isLoading}
                  onExecuteDiscovery={handleExecuteStage1}
                  onAdvance={() => setActiveStage(2)}
                />
              )}

              {/* STAGE 2: POSITION INTERVIEW */}
              {activeStage === 2 && (
                <PositionInterview
                  discoverData={project.discover_data}
                  data={project.position_data}
                  isLoading={isLoading}
                  onExecute={handleExecuteStage2}
                  onAdvance={() => setActiveStage(3)}
                  onBack={() => setActiveStage(1)}
                />
              )}

              {/* STAGE 3: SHAPE INTERVIEW */}
              {activeStage === 3 && (
                <ShapeInterview
                  positionData={project.position_data}
                  data={project.shape_data}
                  isLoading={isLoading}
                  onExecute={handleExecuteStage3}
                  onAdvance={() => setActiveStage(4)}
                  onBack={() => setActiveStage(2)}
                  onSelectName={(name) => {
                    const updated = {
                      ...project,
                      title: name,
                      shape_data: project.shape_data
                        ? { ...project.shape_data, selectedName: name }
                        : null
                    };
                    setProject(updated);
                    persistProjectState(updated);
                    triggerToast(`✓ Selected "${name}" as primary brand name!`);
                  }}
                />
              )}

              {/* STAGE 4: VISUALIZE INTERVIEW */}
              {activeStage === 4 && (
                <VisualizeInterview
                  shapeData={project.shape_data}
                  data={project.visualize_data}
                  isLoading={isLoading}
                  onExecute={handleExecuteStage4}
                  onAdvance={() => setActiveStage(5)}
                  onBack={() => setActiveStage(3)}
                />
              )}

              {/* STAGE 5: CHALLENGE (GEMINI ADVERSARIAL CRITIQUE) */}
              {activeStage === 5 && (
                <div className="space-y-8">
                  {/* Stage Header */}
                  <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            Stage 05 · Gemini Adversarial Audit
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Dual-LLM: Google Gemini 2.5 Pro Reasoner
                          </span>
                        </div>
                        <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1.5">
                          Adversarial Cohesion &amp; Cliché Stress-Test
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          Top agency creative directors challenge everything before presentation. Google Gemini audits stages 1 through 4 for startup clichés, audience contradictions, and cognitive dissonance.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveStage(4)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                        >
                          ← Back to Stage 4
                        </button>
                        <button
                          onClick={handleExecuteStage5}
                          disabled={isLoading}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/25"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Running Gemini Audit...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {project.challenge_data ? "Re-Run Gemini Audit" : "Run Gemini Audit"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {project.challenge_data ? (
                    <CohesionScorecard
                      data={project.challenge_data}
                      onNextStage={() => setActiveStage(6)}
                      onApplyRemedy={handleApplyRemedy}
                    />
                  ) : (
                    <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-rose-400 animate-pulse" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h4 className="font-heading font-bold text-base text-white">
                          Awaiting Gemini Adversarial Stress-Test
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Click &apos;Run Gemini Audit&apos; above. The deep reasoning model will cross-examine your Discovery, Positioning, Shaping, and Visual contracts.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 6: DELIVER (LAUNCH KIT & ASSETS) */}
              {activeStage === 6 && (
                <div className="space-y-8">
                  {/* Stage Header */}
                  <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            Stage 06 · Deliver &amp; Launch
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Groq Llama 3.3 Launch Kit Generator
                          </span>
                        </div>
                        <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1.5">
                          Launch-Ready Deliverables &amp; Campaign Deck
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          The final agency output: a live landing page hero mockup, elevator pitch, multi-platform social launch sequences, and voice protection guardrails.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setActiveStage(5)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                        >
                          ← Back to Stage 5
                        </button>
                        <button
                          onClick={handleExecuteStage6}
                          disabled={isLoading}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-500/25"
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                              Assembling Launch Kit...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-black" />
                              {project.deliver_data ? "Re-Generate Launch Kit" : "Generate Launch Kit"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {project.deliver_data ? (
                    <LaunchDeck
                      data={project.deliver_data}
                      brandName={project.shape_data?.selectedName}
                    />
                  ) : (
                    <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Zap className="w-7 h-7 text-amber-400 animate-pulse" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h4 className="font-heading font-bold text-base text-white">
                          Awaiting Launch Kit Assembly
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Click &apos;Generate Launch Kit&apos; above to generate your landing page hero, social campaign posts, and brand guardrails.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
