"use client";

import React, { useState, useEffect } from "react";
import { DiscoverData } from "@/types";
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Target,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Flame,
  Zap,
  RotateCcw
} from "lucide-react";

interface DiscoverInterviewProps {
  initialIdea: string;
  initialContext: string;
  data: DiscoverData | null;
  isLoading: boolean;
  onExecute: (idea: string, context: string) => void;
  onAdvance: () => void;
}

interface DomainDiscovery {
  problem: string;
  audience: string;
  workaround: string;
  superpower: string;
  altAudiences: string[];
  altWorkarounds: string[];
  altSuperpowers: string[];
}

const DOMAIN_INTELLIGENCE: Record<string, DomainDiscovery> = {
  fintech: {
    problem: "Solo creators and freelancers juggle irregular client income, messy deductions, and unpredictable cashflow without an easy way to understand their real-time tax liability or financial runway.",
    audience: "Solo creators, independent freelancers, and boutique digital studio founders managing unpredictable revenue streams.",
    workaround: "Duct-taped spreadsheets, manual receipt tracking, and bloated legacy tools (QuickBooks / Xero) built for CPAs rather than creators.",
    superpower: "Plain-English cashflow forecasting with zero accounting jargon, automated real-time tax liability calculations, and instant 1-click invoice tracking.",
    altAudiences: [
      "Digital nomads & remote consultants billing global clients",
      "Shopify & e-commerce solopreneurs managing inventory cashflow"
    ],
    altWorkarounds: [
      "Logging into 5 separate bank and Stripe dashboards every morning",
      "Tax season panic with lost paper receipts and missed deductions"
    ],
    altSuperpowers: [
      "Automated write-off detection with on-device encrypted receipt scanning",
      "Predictive runway alerts before taking on expensive subcontractors"
    ]
  },
  students: {
    problem: "University students routinely get paired with unresponsive or mismatched teammates on high-stakes projects, causing academic stress, uneven workloads, and missed hackathon deadlines.",
    audience: "Undergraduate STEM & design students, hackathon builders, and capstone project teams.",
    workaround: "Chaotic Discord / WhatsApp group chats, awkward classroom announcements, and shared Google Sheets spreadsheets.",
    superpower: "Verified commitment ratings and working-style compatibility matching to eliminate free-riders and ghosting.",
    altAudiences: [
      "Student club organizers forming cross-functional competitive teams",
      "Self-taught indie hackers looking for technical co-founders on campus"
    ],
    altWorkarounds: [
      "Awkward cold DMs on LinkedIn with zero proof of actual skill",
      "Random, frustrating team assignments mandated by course professors"
    ],
    altSuperpowers: [
      "Zero-ghosting guarantee with reciprocal peer accountability scoring",
      "Free forever for verified .edu university student emails"
    ]
  },
  devtool: {
    problem: "Engineering teams suffer from severe context switching and noisy alert fatigue across fragmented dashboards, slowing down shipping velocity and degrading developer experience.",
    audience: "Founding engineers, tech leads, and platform teams at high-growth software companies.",
    workaround: "Brittle bash scripts, unmaintained internal wikis, and noisy Slack alert channels.",
    superpower: "CLI-first, sub-50ms execution speed with 100% local privacy and native GitOps ergonomics.",
    altAudiences: [
      "Solo full-stack developers shipping micro-SaaS applications",
      "Open-source maintainers managing community pull requests"
    ],
    altWorkarounds: [
      "Fragmented observability dashboards (Datadog/New Relic) with noisy alerts",
      "Constant context switching between Jira, GitHub, and Slack"
    ],
    altSuperpowers: [
      "Self-hostable open-source core with Docker/Kubernetes deployment",
      "Zero external network telemetry: 100% local machine execution"
    ]
  },
  default: {
    problem: "Target customers are forced to use slow, fragmented legacy tools that require steep learning curves and hours of manual coordination, leading to wasted time and lost revenue.",
    audience: "Bootstrapped founders, solo operators, and modern digital knowledge workers.",
    workaround: "Scattered Notion pages, messy spreadsheets, and disjointed email threads.",
    superpower: "Zero-friction onboarding that delivers 10x faster time-to-value with modern, delightful UX.",
    altAudiences: [
      "Small agile remote teams looking to streamline workflows",
      "High-output operators seeking unfair automation leverage"
    ],
    altWorkarounds: [
      "Endless Slack threads and lost follow-ups across tools",
      "Paying high retainer fees to external agencies and contractors"
    ],
    altSuperpowers: [
      "Radically transparent pricing with no contracts or lock-ins",
      "Multiplayer real-time collaboration with zero sync lag"
    ]
  }
};

function getDomainDiscovery(text: string): DomainDiscovery {
  const lower = text.toLowerCase();
  if (
    lower.includes("financ") ||
    lower.includes("creator") ||
    lower.includes("money") ||
    lower.includes("tax") ||
    lower.includes("invoice") ||
    lower.includes("accounting") ||
    lower.includes("bank") ||
    lower.includes("freelance")
  ) {
    return DOMAIN_INTELLIGENCE.fintech;
  }
  if (
    lower.includes("student") ||
    lower.includes("hackathon") ||
    lower.includes("campus") ||
    lower.includes("university") ||
    lower.includes("teammate") ||
    lower.includes("college")
  ) {
    return DOMAIN_INTELLIGENCE.students;
  }
  if (
    lower.includes("developer") ||
    lower.includes("code") ||
    lower.includes("api") ||
    lower.includes("engineering") ||
    lower.includes("devops") ||
    lower.includes("terminal") ||
    lower.includes("infra")
  ) {
    return DOMAIN_INTELLIGENCE.devtool;
  }
  return DOMAIN_INTELLIGENCE.default;
}

const STARTER_IDEAS = [
  {
    tag: "Creator Fintech",
    text: "A zero-friction financial intelligence command center for solo creators and freelancers."
  },
  {
    tag: "Student Network",
    text: "An app that helps university students find complementary project teammates based on verified work styles."
  },
  {
    tag: "AI DevTool",
    text: "An AI teammate that replaces chaotic project management for startup engineering leads."
  }
];

export function DiscoverInterview({
  initialIdea,
  initialContext,
  data,
  isLoading,
  onExecute,
  onAdvance
}: DiscoverInterviewProps) {
  const [idea, setIdea] = useState<string>(initialIdea || "");
  const [isSplit, setIsSplit] = useState<boolean>(Boolean(data) || Boolean(initialIdea && initialIdea.length > 15));

  // The 4 Discovery Pillars
  const [problem, setProblem] = useState<string>("");
  const [audience, setAudience] = useState<string>("");
  const [workaround, setWorkaround] = useState<string>("");
  const [superpower, setSuperpower] = useState<string>("");
  const [activeIntel, setActiveIntel] = useState<DomainDiscovery>(DOMAIN_INTELLIGENCE.default);

  // Sync initial state
  useEffect(() => {
    if (data) {
      setProblem(data.problemStatement);
      setAudience(data.targetAudience.primarySegment);
      setWorkaround(data.targetAudience.acutePainPoints?.join(", ") || "");
      setSuperpower(data.primaryValueHook);
      setIsSplit(true);
    } else if (idea.trim()) {
      const intel = getDomainDiscovery(idea);
      setActiveIntel(intel);
      if (!problem) setProblem(intel.problem);
      if (!audience) setAudience(intel.audience);
      if (!workaround) setWorkaround(intel.workaround);
      if (!superpower) setSuperpower(intel.superpower);
    }
  }, [data, idea]);

  const handleNextClick = () => {
    if (!idea.trim()) return;
    const intel = getDomainDiscovery(idea);
    setActiveIntel(intel);
    setProblem(intel.problem);
    setAudience(intel.audience);
    setWorkaround(intel.workaround);
    setSuperpower(intel.superpower);
    setIsSplit(true);
  };

  const handleResetToSingleBox = () => {
    setIsSplit(false);
  };

  const handleConfirmAndAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const context = `Problem: ${problem}. Target Audience: ${audience}. Broken Current Workaround: ${workaround}. Core Superpower: ${superpower}.`;
    onExecute(idea, context);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FF542E]/15 text-[#FF542E] border border-[#FF542E]/30 font-bold">
              Stage 01 · Discovery Architecture
            </span>
            <span className="text-xs text-slate-500 font-mono">
              The 4 Foundational Pillars
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1.5 tracking-tight">
            Founder Discovery
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {isSplit
              ? "We unpacked your raw spark into the 4 core discovery pillars. Refine the details below before locking Stage 1."
              : "Every iconic brand starts from a clean spark. Enter your raw product idea to unpack its discovery architecture."}
          </p>
        </div>

        {data && (
          <button
            onClick={onAdvance}
            className="px-5 py-2.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-lg shadow-[#FF542E]/25"
          >
            Advance to Stage 2 (Position) <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* STATE 1: INITIAL SINGLE BOX ONLY */}
      {!isSplit ? (
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-6 max-w-3xl mx-auto shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#0e111a] to-[#07090e]">
          <div className="space-y-2">
            <label className="font-heading font-bold text-lg text-white block">
              What is your core product or raw idea?
            </label>
            <p className="text-xs text-slate-400 leading-relaxed">
              Describe in 1–2 plain sentences what you are creating and who it is for.
            </p>
          </div>

          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            autoFocus
            className="w-full bg-[#040508] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#FF542E] transition leading-relaxed placeholder:text-slate-600"
            placeholder="e.g. A zero-friction financial intelligence command center for solo creators and freelancers..."
          />

          {/* Minimal Idea Starters */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              Quick Ingest Inspiration:
            </span>
            <div className="flex flex-wrap gap-2">
              {STARTER_IDEAS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdea(item.text)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                    idea === item.text
                      ? "bg-[#FF542E]/20 text-white border-[#FF542E]/50 font-medium"
                      : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-white/5"
                  }`}
                >
                  <span className="text-slate-500 mr-1.5 font-mono">#{item.tag}:</span>
                  &ldquo;{item.text.slice(0, 42)}...&rdquo;
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextClick}
            disabled={!idea.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF542E] to-[#ff7b47] hover:from-[#ff6947] hover:to-[#ff8d5e] disabled:opacity-40 text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-[#FF542E]/25"
          >
            <span>Next: Unpack Discovery Structure</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* STATE 2: THE 4 SPLIT BOXES (CLEAN 2x2 QUADRANT) */
        <form onSubmit={handleConfirmAndAdvance} className="space-y-6">
          {/* Top Idea Anchor Bar */}
          <div className="glass-panel px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[10px] font-mono uppercase text-[#FF542E] bg-[#FF542E]/10 px-2 py-0.5 rounded-md border border-[#FF542E]/20 shrink-0 font-bold">
                Idea Spark
              </span>
              <p className="text-xs text-white font-medium truncate">
                &ldquo;{idea}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToSingleBox}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3 h-3" /> Edit Idea
            </button>
          </div>

          {/* The 4 Discovery Pillars (Clean 2x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* BOX 1: Sharpened Problem */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition space-y-3 bg-[#0a0d14]/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF542E]/20 text-[#FF542E] flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xs text-white">01 · Acute Problem</h3>
                    <p className="text-[10px] font-mono text-slate-400">Core friction being eliminated</p>
                  </div>
                </div>
              </div>

              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={3}
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#FF542E] transition leading-relaxed"
                placeholder="Describe the urgent problem..."
              />
            </div>

            {/* BOX 2: Target Audience */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition space-y-3 bg-[#0a0d14]/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xs text-white">02 · Target Persona</h3>
                    <p className="text-[10px] font-mono text-slate-400">Who feels this pain most acutely</p>
                  </div>
                </div>
              </div>

              <textarea
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                rows={3}
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-400 transition leading-relaxed"
                placeholder="Specify the hyper-specific persona..."
              />

              {/* Subtle suggestions */}
              {activeIntel.altAudiences.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mr-1">Suggestions:</span>
                  {activeIntel.altAudiences.map((alt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAudience(alt)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition"
                    >
                      + {alt.slice(0, 36)}...
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BOX 3: Broken Workarounds */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition space-y-3 bg-[#0a0d14]/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xs text-white">03 · Broken Workarounds</h3>
                    <p className="text-[10px] font-mono text-slate-400">Messy current habits &amp; tools</p>
                  </div>
                </div>
              </div>

              <textarea
                value={workaround}
                onChange={(e) => setWorkaround(e.target.value)}
                rows={3}
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition leading-relaxed"
                placeholder="What frustrating workaround are they using?"
              />

              {/* Subtle suggestions */}
              {activeIntel.altWorkarounds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mr-1">Suggestions:</span>
                  {activeIntel.altWorkarounds.map((alt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWorkaround(alt)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition"
                    >
                      + {alt.slice(0, 36)}...
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BOX 4: Unfair Superpower */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-white/20 transition space-y-3 bg-[#0a0d14]/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xs text-white">04 · Core Value Hook</h3>
                    <p className="text-[10px] font-mono text-slate-400">The primary reason users switch</p>
                  </div>
                </div>
              </div>

              <textarea
                value={superpower}
                onChange={(e) => setSuperpower(e.target.value)}
                rows={3}
                className="w-full bg-[#040508] border border-white/10 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition leading-relaxed"
                placeholder="What is your core differentiator?"
              />

              {/* Subtle suggestions */}
              {activeIntel.altSuperpowers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mr-1">Suggestions:</span>
                  {activeIntel.altSuperpowers.map((alt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSuperpower(alt)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition"
                    >
                      + {alt.slice(0, 36)}...
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {data ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 font-mono">Stage 1 Discovery Locked &amp; Chained</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FF542E] shrink-0" />
                  <span>Click below to synthesize and chain into Stage 2 Positioning.</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !problem.trim() || !audience.trim()}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF542E] to-[#ff7b47] hover:from-[#ff6947] hover:to-[#ff8d5e] disabled:opacity-40 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-xl shadow-[#FF542E]/25 shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Synthesizing Discovery Contract via Groq...
                </>
              ) : (
                <>
                  <span>Confirm Discovery &amp; Advance to Stage 2</span>
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
