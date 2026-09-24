import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { BrandProject, ApiResponse } from "@/types";
import { MOCK_BRAND_PROJECT } from "@/lib/mockBrandData";

/**
 * ============================================================================
 * PROJECTS API ROUTE
 * Endpoints:
 * - GET  /api/projects?id=... (Fetch project by id, or list recent projects)
 * - POST /api/projects        (Create or update project state in Supabase)
 * ============================================================================
 * 
 * Implements optimistic persistence pattern:
 * When an LLM stage completes, client posts the stage JSON to persist it in
 * the corresponding jsonb column of the projects table.
 */

// In-memory fallback cache for development/demo when Supabase credentials are empty
const memoryStore = new Map<string, BrandProject>();
memoryStore.set(MOCK_BRAND_PROJECT.id, MOCK_BRAND_PROJECT);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Check in-memory store first (for mock/demo mode)
      if (memoryStore.has(id)) {
        return NextResponse.json({
          error: false,
          data: memoryStore.get(id),
          stage: memoryStore.get(id)?.current_stage || 1,
          provider: "groq"
        });
      }

      // Try Supabase if configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          return NextResponse.json({
            error: false,
            data,
            stage: data.current_stage,
            provider: "groq"
          });
        }
      }

      // Return mock default if not found
      return NextResponse.json({
        error: false,
        data: MOCK_BRAND_PROJECT,
        stage: 6,
        provider: "groq"
      });
    }

    // List recent projects
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, current_stage, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          error: false,
          data,
          stage: 1,
          provider: "groq"
        });
      }
    }

    // Fallback list from memory store
    const list = Array.from(memoryStore.values()).map((p) => ({
      id: p.id,
      title: p.title,
      current_stage: p.current_stage,
      created_at: p.created_at,
      updated_at: p.updated_at
    }));

    return NextResponse.json({
      error: false,
      data: list,
      stage: 1,
      provider: "groq"
    });
  } catch (error: unknown) {
    console.error("[GET /api/projects error]:", error);
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch projects."
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const project = (await req.json()) as Partial<BrandProject>;

    const now = new Date().toISOString();
    const projectId = project.id || crypto.randomUUID();

    const updatedProject: BrandProject = {
      id: projectId,
      title: project.title || "Untitled Brand Project",
      current_stage: project.current_stage || 1,
      created_at: project.created_at || now,
      updated_at: now,
      discover_data: project.discover_data ?? null,
      position_data: project.position_data ?? null,
      shape_data: project.shape_data ?? null,
      visualize_data: project.visualize_data ?? null,
      challenge_data: project.challenge_data ?? null,
      deliver_data: project.deliver_data ?? null
    };

    // Store in memory
    memoryStore.set(projectId, updatedProject);

    // Persist to Supabase if configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from("projects")
        .upsert(updatedProject, { onConflict: "id" });

      if (error) {
        console.warn("[Supabase Sync Warning]: Could not persist to remote Supabase, kept in memory store:", error.message);
      }
    }

    return NextResponse.json({
      error: false,
      data: updatedProject,
      stage: updatedProject.current_stage,
      provider: "groq"
    });
  } catch (error: unknown) {
    console.error("[POST /api/projects error]:", error);
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to persist project."
      },
      { status: 500 }
    );
  }
}
