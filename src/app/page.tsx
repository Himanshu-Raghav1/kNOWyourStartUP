import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  Layers,
  Sparkles,
  Palette,
  ShieldCheck,
  Zap,
  Rocket
} from "lucide-react";

export default function HomePage() {
  const stages = [
    {
      step: "01",
      name: "Discover",
      role: "Dig into what you're really building and who it's for.",
      icon: Compass,
      color: "text-[#FF542E]",
      bg: "bg-[#FF542E]/10",
      border: "border-[#FF542E]/20",
      glow: "rgba(255,84,46,0.15)"
    },
    {
      step: "02",
      name: "Position",
      role: "Find your angle in the market — the one no one else owns.",
      icon: Layers,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      glow: "rgba(14,165,233,0.15)"
    },
    {
      step: "03",
      name: "Shape",
      role: "Build your name, tagline, and brand voice from scratch.",
      icon: Sparkles,
      color: "text-[#818CF8]",
      bg: "bg-[#6366F1]/10",
      border: "border-[#6366F1]/20",
      glow: "rgba(99,102,241,0.15)"
    },
    {
      step: "04",
      name: "Visualize",
      role: "Lock in your colors, fonts, and visual identity system.",
      icon: Palette,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "rgba(16,185,129,0.15)"
    },
    {
      step: "05",
      name: "Challenge",
      role: "AI stress-tests your brand for clichés and blind spots.",
      icon: ShieldCheck,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      glow: "rgba(244,63,94,0.15)"
    },
    {
      step: "06",
      name: "Deliver",
      role: "Walk away with a pitch, launch copy, and brand rules.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "rgba(245,158,11,0.15)"
    }
  ];

  const vibes = [
    { icon: "⚡", label: "No boring forms" },
    { icon: "🎯", label: "Spot-on for your idea" },
    { icon: "🔥", label: "Launch-ready in minutes" },
    { icon: "🧠", label: "AI that actually gets it" }
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#090D16] bg-grid-pattern">

      {/* ── Ambient glows (Primary & Secondary accents) ── */}
      <div className="fixed top-[-10%] left-[30%] w-[600px] h-[500px] bg-[#FF542E]/8 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-[20%] right-[10%] w-[400px] h-[400px] bg-[#6366F1]/8 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-[10%] w-[500px] h-[300px] bg-[#F59E0B]/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] backdrop-blur-xl bg-[#090D16]/85">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo with src/components/logo.png */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#131B30] border border-white/10 flex items-center justify-center p-1 shadow-md shadow-[#FF542E]/15 hover-lift">
              <Image
                src="/logo.png"
                alt="kNOWyourStartUP Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-heading font-bold text-base text-white tracking-tight">
              k<span className="text-[#FF542E]">NOW</span>your<span className="text-[#FF542E]">START</span>up
            </span>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/wizard"
              className="text-xs font-bold bg-[#FF542E] hover:bg-[#FF6B47] text-white px-4 py-2.5 rounded-xl transition shadow-lg shadow-[#FF542E]/25 flex items-center gap-1.5 hover-lift"
            >
              Start free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-20 text-center relative">

        {/* Floating badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#131B30] border border-white/10 text-xs text-slate-200 mb-8 badge-pulse">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Turn your idea into a real brand — right now</span>
        </div>

        {/* Headline */}
        <h1 className="font-heading font-bold text-5xl sm:text-7xl leading-[1.05] tracking-tight text-white mb-6">
          Your startup idea{" "}
          <span className="gradient-text-brand block sm:inline">
            deserves a real brand.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Stop guessing. We ask the right questions, understand your idea,
          and build your brand identity — name, voice, colors, pitch, everything.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/wizard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FF542E] hover:bg-[#FF6B47] text-white font-bold text-sm transition shadow-xl shadow-[#FF542E]/30 flex items-center justify-center gap-2.5 hover-lift"
          >
            <Rocket className="w-4 h-4" />
            Build my brand — it's free
          </Link>
        </div>

        {/* Vibe pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
          {vibes.map((v) => (
            <span
              key={v.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#131B30] border border-white/10 text-xs text-slate-300"
            >
              <span>{v.icon}</span>
              {v.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-5 pb-28">
        <div className="text-center mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF542E] font-bold mb-3">How it works</p>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-tight">
            6 steps.{" "}
            <span className="gradient-text-cool">One complete brand.</span>
          </h2>
          <p className="text-sm text-slate-400 mt-3 max-w-lg mx-auto">
            Each step builds on the last — nothing gets lost, nothing gets repeated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className={`glass-card glass-card-hover p-6 rounded-2xl border ${stage.border} relative group overflow-hidden`}
                style={{ boxShadow: `inset 0 0 60px ${stage.glow}` }}
              >
                {/* Step number — watermark */}
                <span className="absolute top-4 right-4 text-5xl font-heading font-bold text-white/[0.05] select-none leading-none">
                  {stage.step}
                </span>

                <div className={`w-10 h-10 rounded-xl ${stage.bg} ${stage.border} border flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${stage.color}`} />
                </div>

                <h3 className="font-heading font-bold text-base text-white mb-1.5">
                  {stage.name}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {stage.role}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <Link
            href="/wizard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#FF542E] hover:bg-[#FF6B47] text-white font-bold text-sm transition shadow-xl shadow-[#FF542E]/25 hover-lift"
          >
            <Sparkles className="w-4 h-4" />
            Let's build it
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-slate-500 mt-3 font-medium">No account needed. Start in seconds.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.08] py-8 text-center bg-[#090D16]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-[#131B30] border border-white/10 flex items-center justify-center p-0.5 shadow-sm">
            <Image
              src="/logo.png"
              alt="kNOWyourStartUP Logo"
              width={20}
              height={20}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-heading font-bold text-sm text-white">
            k<span className="text-[#FF542E]">NOW</span>your<span className="text-[#FF542E]">START</span>up
          </span>
        </div>
        <p className="text-xs text-slate-400">Made for founders who move fast.</p>
      </footer>
    </main>
  );
}
