"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, ArrowRight, Search, Plus, Loader2 } from "lucide-react";
import { BrandProject } from "@/types";
import { MOCK_BRAND_PROJECT } from "@/lib/mockBrandData";

interface ResumeProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (project: BrandProject) => void;
  onNew: () => void;
}

interface ProjectSummary {
  id: string;
  title: string;
  current_stage: number;
  created_at: string;
  updated_at: string;
}

const STAGE_LABELS = ["", "Discover", "Position", "Shape", "Visualize", "Challenge", "Deliver"];

const STAGE_COLORS: Record<number, string> = {
  1: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  2: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  3: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  4: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  5: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  6: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

export default function ResumeProjectModal({ isOpen, onClose, onLoad, onNew }: ResumeProjectModalProps) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Always show the mock "Campfire" demo project as the first entry
  const DEMO_SUMMARY: ProjectSummary = {
    id: MOCK_BRAND_PROJECT.id,
    title: MOCK_BRAND_PROJECT.title,
    current_stage: MOCK_BRAND_PROJECT.current_stage,
    created_at: MOCK_BRAND_PROJECT.created_at,
    updated_at: MOCK_BRAND_PROJECT.updated_at,
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();
        if (!json.error && Array.isArray(json.data)) {
          // Filter out the mock project ID from DB results to avoid duplication
          const dbProjects = (json.data as ProjectSummary[]).filter(
            (p) => p.id !== MOCK_BRAND_PROJECT.id
          );
          setProjects(dbProjects);
        }
      } catch {
        // Silently fail — show demo project only
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [isOpen]);

  const allProjects = [DEMO_SUMMARY, ...projects];

  const filtered = allProjects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoadProject = async (summary: ProjectSummary) => {
    setLoadingId(summary.id);
    // If it's the demo project, load from mock data directly
    if (summary.id === MOCK_BRAND_PROJECT.id) {
      onLoad(MOCK_BRAND_PROJECT);
      onClose();
      setLoadingId(null);
      return;
    }
    // Otherwise fetch full project from API
    try {
      const res = await fetch(`/api/projects?id=${summary.id}`);
      const json = await res.json();
      if (!json.error && json.data) {
        onLoad(json.data as BrandProject);
        onClose();
      }
    } catch {
      // fallback: pass the summary itself — stages will be null
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="font-heading font-bold text-base text-white">Load a Brand Project</h2>
            <p className="text-xs text-slate-400 mt-0.5">Resume where you left off or start fresh.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#FF542E]/60 transition"
            />
          </div>
        </div>

        {/* Project List */}
        <div className="px-6 py-3 max-h-72 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-5 h-5 text-slate-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading projects...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-500">No projects found.</p>
            </div>
          ) : (
            filtered.map((p) => {
              const stageColor = STAGE_COLORS[p.current_stage] || STAGE_COLORS[1];
              const isDemo = p.id === MOCK_BRAND_PROJECT.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleLoadProject(p)}
                  disabled={loadingId === p.id}
                  className="w-full text-left p-3.5 rounded-xl glass-card border border-white/5 hover:border-white/15 hover:bg-white/5 transition group flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                      {isDemo && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8FF54]/10 border border-[#E8FF54]/20 text-[#E8FF54] shrink-0">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${stageColor}`}>
                        Stage {p.current_stage}: {STAGE_LABELS[p.current_stage]}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(p.updated_at)}
                      </span>
                    </div>
                  </div>
                  {loadingId === p.id ? (
                    <Loader2 className="w-4 h-4 text-[#FF542E] animate-spin shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-[#FF542E] transition shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-slate-300 hover:text-white hover:border-white/40 hover:bg-white/5 transition text-xs font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Start a New Brand Project
          </button>
        </div>
      </div>
    </div>
  );
}
