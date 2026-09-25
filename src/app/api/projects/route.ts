import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { BrandProject, ApiResponse } from "@/types";
import { MOCK_BRAND_PROJECT } from "@/lib/mockBrandData";

/**
 * ============================================================================
 * PROJECTS API ROUTE
 * Endpoints:
 * - GET  /api/projects?id=... (Fetch project by id, or list recent projects)
 * - GET  /api/projects?action=status (Check Supabase connection and table status)
 * - POST /api/projects        (Create or update project state in Supabase)
 * ============================================================================
 */

// In-memory fallback cache for development/demo when Supabase credentials are empty
const memoryStore = new Map<string, BrandProject>();
memoryStore.set(MOCK_BRAND_PROJECT.id, MOCK_BRAND_PROJECT);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    // Diagnostic endpoint: /api/projects?action=status
    if (action === "status") {
      if (!isSupabaseConfigured) {
        return NextResponse.json({
          configured: false,
          tableExists: false,
          message: "Supabase credentials are not configured in environment variables."
        });
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .limit(1);

      if (error) {
        return NextResponse.json({
          configured: true,
          tableExists: false,
          error: error.message,
          hint: "The 'projects' table was not found in your Supabase database. Please open your Supabase project > SQL Editor, paste the contents of 'supabase/schema.sql' and click Run."
        });
      }

      return NextResponse.json({
        configured: true,
        tableExists: true,
        message: "Supabase is fully connected and the 'projects' table is ready."
      });
    }

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
      if (isSupabaseConfigured) {
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
    if (isSupabaseConfigured) {
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

    let supabaseSync: {
      success: boolean;
      configured: boolean;
      error?: string;
      hint?: string;
    } = {
      success: false,
      configured: isSupabaseConfigured
    };

    // Persist to Supabase if configured
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("projects")
        .upsert(updatedProject, { onConflict: "id" });

      if (error) {
        const isTableMissing =
          error.message.includes("does not exist") ||
          error.message.includes("relation") ||
          error.code === "42P01";

        console.warn("[Supabase Sync Warning]:", error.message);
        supabaseSync = {
          success: false,
          configured: true,
          error: error.message,
          hint: isTableMissing
            ? "Table 'public.projects' has not been created yet in your Supabase project. In your Supabase dashboard, click 'SQL Editor', paste 'supabase/schema.sql' and click 'Run'."
            : error.message
        };
      } else {
        supabaseSync = {
          success: true,
          configured: true
        };
      }
    }

    return NextResponse.json({
      error: false,
      data: updatedProject,
      stage: updatedProject.current_stage,
      provider: "groq",
      supabaseSync
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

