import { NextRequest, NextResponse } from "next/server";
import { generateGroqJson } from "@/lib/llm/groq";
import { DiscoverData, ApiResponse } from "@/types";

/**
 * ============================================================================
 * STAGE 1: DISCOVER API ROUTE
 * Endpoint: POST /api/stages/1-discover
 * Provider: Groq (llama-3.3-70b-versatile)
 * ============================================================================
 * 
 * 1. EXPECTED INPUT PAYLOAD:
 * {
 *   "rawIdea": string;        // The raw, unrefined initial founder concept sentence/paragraph
 *   "additionalContext"?: string; // Optional domain, constraints, or student/market context
 * }
 * 
 * 2. LLM PROMPT STRATEGY:
 * - Directs Groq to act as an elite venture brand strategist and customer discovery interviewer.
 * - Extracts the acute customer problem from the raw text, avoiding generic fluff.
 * - Identifies primary audience segments, demographics, psychographics, motivations, and pain points.
 * - Constrains output to strict JSON adhering precisely to the DiscoverData interface.
 * 
 * 3. EXPECTED JSON OUTPUT SHAPE:
 * {
 *   "rawIdea": string,
 *   "problemStatement": string,
 *   "targetAudience": {
 *     "primarySegment": string,
 *     "demographics": string,
 *     "psychographics": string,
 *     "coreMotivations": string[],
 *     "acutePainPoints": string[]
 *   },
 *   "keyConstraints": string[],
 *   "primaryValueHook": string
 * }
 * 
 * 4. ERROR HANDLING & RETRY:
 * - Try/catch block wraps the invocation.
 * - Automatic 1-retry in generateGroqJson.
 * - Returns standardized HTTP 500 error envelope upon unrecoverable parse failure.
 */

interface Stage1RequestBody {
  rawIdea: string;
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

    const systemPrompt = `You are an elite venture brand strategist.
Your task is to take an incomplete, rough founder idea and extract the foundational brand discovery parameters.
You must output ONLY a valid JSON object matching the following TypeScript schema:

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
}

Do not include markdown blocks, backticks, or explanatory text. Return raw JSON only.`;

    const userPrompt = `Analyze this rough idea:
Raw Idea: "${body.rawIdea.trim()}"
${body.additionalContext ? `Additional Context: "${body.additionalContext.trim()}"` : ""}

Sharpen the problem, identify the real target audience, and extract the primary value hook.`;

    const result = await generateGroqJson<DiscoverData>({
      systemPrompt,
      userPrompt,
      temperature: 0.4
    });

    return NextResponse.json({
      error: false,
      data: result,
      stage: 1,
      provider: "groq"
    });
  } catch (error: unknown) {
    console.error("[Stage 1 Discover Error]:", error);
    return NextResponse.json(
      {
        error: true,
        code: "LLM_PARSE_FAILURE",
        message: "Failed to generate structured data."
      },
      { status: 500 }
    );
  }
}
