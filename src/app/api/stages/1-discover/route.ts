import { NextRequest, NextResponse } from "next/server";
import { generateGeminiDiscoverySynthesis } from "@/lib/llm/gemini";
import { generateGroqJson } from "@/lib/llm/groq";
import { DiscoverData, ApiResponse } from "@/types";

/**
 * ============================================================================
 * STAGE 1: DISCOVERY SYNTHESIS API ROUTE
 * Endpoint: POST /api/stages/1-discover
 * Primary Provider: Google Gemini (gemini-2.5-pro / gemini-3.8-flash)
 * Fallback Provider: Groq (llama-3.3-70b-versatile)
 * ============================================================================
 */

interface Stage1RequestBody {
  rawIdea: string;
  vision?: string;
  problem?: string;
  selectedPersonas?: string[];
  ambiguityAnswers?: Record<string, string>;
  additionalContext?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<DiscoverData>>> {
  try {
    const body = (await req.json()) as Stage1RequestBody;

    if (!body.rawIdea || typeof body.rawIdea !== "string" || body.rawIdea.trim().length === 0) {
      return NextResponse.json(
        {
          error: true,
          code: "VALIDATION_ERROR",
          message: "A non-empty 'rawIdea' string is required for Stage 1 (Discover)."
        },
        { status: 400 }
      );
    }

    const rawIdea = body.rawIdea.trim();
    const vision = body.vision?.trim() || "";
    const problem = body.problem?.trim() || "";
    const selectedPersonas = body.selectedPersonas && body.selectedPersonas.length > 0
      ? body.selectedPersonas
      : [body.additionalContext || "Core venture target segment"];
    const ambiguityAnswers = body.ambiguityAnswers || {};

    // 1. Primary Execution: Deep Reasoning with Google Gemini
    try {
      const geminiResult = await generateGeminiDiscoverySynthesis(
        rawIdea,
        vision,
        problem,
        selectedPersonas,
        ambiguityAnswers
      );

      return NextResponse.json({
        error: false,
        data: geminiResult,
        stage: 1,
        provider: "gemini"
      });
    } catch (geminiError: unknown) {
      console.warn("[Stage 1 Gemini Warning]: Falling back to Groq Llama 3.3:", geminiError);

      // 2. High-speed Fallback: Groq Llama 3.3
      const systemPrompt = `You are a world-class Brand Architect.
Synthesize the founder's raw spark, validated existential vision, root problem breakdown, selected stakeholder personas, and clarification responses into a rigorous DiscoverData JSON contract.
Return ONLY valid JSON matching this schema:
{
  "rawIdea": string,
  "problemStatement": string,
  "targetAudience": {
    "primarySegment": string,
    "demographics": string,
    "psychographics": string,
    "coreMotivations": string[],
    "acutePainPoints": string[]
  },
  "keyConstraints": string[],
  "primaryValueHook": string
}`;

      const userPrompt = `Raw Spark: "${rawIdea}"
Core Vision: "${vision}"
Root Friction: "${problem}"
Selected Stakeholder Personas: ${JSON.stringify(selectedPersonas)}
Clarification Constraints: ${JSON.stringify(ambiguityAnswers)}
Context: "${body.additionalContext || ""}"

Synthesize the formal DiscoverData contract.`;

      const groqResult = await generateGroqJson<DiscoverData>({
        systemPrompt,
        userPrompt,
        temperature: 0.3
      });

      return NextResponse.json({
        error: false,
        data: groqResult,
        stage: 1,
        provider: "groq"
      });
    }
  } catch (error: unknown) {
    console.error("[Stage 1 Discover Error]:", error);
    return NextResponse.json(
      {
        error: true,
        code: "LLM_PARSE_FAILURE",
        message: "Failed to generate structured discovery architecture."
      },
      { status: 500 }
    );
  }
}
