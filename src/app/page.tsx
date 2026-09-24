import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Layers, Palette, Compass, Zap } from "lucide-react";
import { MOCK_BRAND_PROJECT } from "@/lib/mockBrandData";

export default function HomePage() {
  const stages = [
    {
      step: "01",
      name: "Discover",
      provider: "Groq (Llama 3.3 70B)",
      role: "Extracts acute customer problems, audience psychographics, and value hooks.",
      icon: Compass,
      color: "text-amber-400"
    },
    {
      step: "02",
      name: "Position",
      provider: "Groq (Llama 3.3 70B)",
      role: "Defines market category, defensible differentiators, and competitive angle.",
      icon: Layers,
      color: "text-blue-400"
    },
    {
      step: "03",
      name: "Shape",
      provider: "Groq (Llama 3.3 70B)",
      role: "Generates 4 naming territories, brand voice principles, and behavioral examples.",
      icon: Sparkles,
      color: "text-purple-400"
    },
    {
      step: "04",
      name: "Visualize",
      provider: "Groq (Llama 3.3 70B)",
      role: "Builds a 5-color palette, typography pairings, and composition brief.",
      icon: Palette,
      color: "text-emerald-400"
    },
    {
      step: "05",
      name: "Challenge",
      provider: "Google Gemini 2.5 Pro",
      role: "Deep reasoning engine: audits cliches, flags contradictions, and scores cohesion.",
      icon: ShieldCheck,
      color: "text-rose-400"
    },
    {
      step: "06",
      name: "Deliver",
      provider: "Groq (Llama 3.3 70B)",
      role: "Assembles landing hero copy, pitch decks, social launch posts, and brand rules.",
      icon: Zap,
      color: "text-orange-400"
    }
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-grid-pattern">
      {/* Background glow flares */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-[#FF542E]/15 via-[#E8FF54]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF542E] to-[#E8FF54] flex items-center justify-center font-bold text-black text-sm">
              B
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-white">
              Brand<span className="text-[#FF542E]">OS</span>
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
              v1.0 Foundation
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/wizard?mode=mock&id=${MOCK_BRAND_PROJECT.id}`}
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition"
            >
              Load Reference Brand (Zero-Token)
            </Link>
            <Link
              href="/wizard"
              className="text-xs font-semibold bg-[#FF542E] hover:bg-[#ff6947] text-white px-4 py-2 rounded-lg transition shadow-lg shadow-[#FF542E]/20 flex items-center gap-2"
            >
              Start New Brand <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF542E]/10 border border-[#FF542E]/30 text-xs font-medium text-[#FF542E] mb-6">
          <Cpu className="w-3.5 h-3.5" />
          Sequential Multi-Stage Dual-LLM Pipeline
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Turn a raw sentence into a <span className="bg-gradient-to-r from-[#FF542E] via-amber-300 to-[#E8FF54] bg-clip-text text-transparent">launch-ready brand</span> system.
        </h1>

        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          Escape the &ldquo;one-prompt trap&rdquo;. Our 6-stage state architecture preserves structured context,
          routes high-speed synthesis to Groq, and applies adversarial reasoning with Google Gemini.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/wizard"
            className="px-6 py-3.5 rounded-xl bg-[#FF542E] hover:bg-[#ff6947] text-white font-semibold text-sm transition shadow-xl shadow-[#FF542E]/25 flex items-center gap-2"
          >
            Launch Brand Wizard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={`/wizard?mode=mock&id=${MOCK_BRAND_PROJECT.id}`}
            className="px-6 py-3.5 rounded-xl glass-card hover:bg-white/10 text-slate-200 font-medium text-sm transition border border-white/10 flex items-center gap-2"
          >
            Explore &ldquo;Campfire&rdquo; Demo System
          </Link>
        </div>
      </div>

      {/* 6-Stage Pipeline Matrix */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl text-white">The 6-Stage Architectural Pipeline</h2>
          <p className="text-sm text-slate-400 mt-2">Pruned JSON contracts pass deterministically from stage to stage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between border border-white/5 relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-slate-500">STAGE {stage.step}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {stage.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <Icon className={`w-5 h-5 ${stage.color}`} />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white">{stage.name}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">{stage.role}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Structured Contract</span>
                  <span className="text-emerald-400">Strict JSON</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
