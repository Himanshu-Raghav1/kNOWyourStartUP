import { NextRequest, NextResponse } from "next/server";
import { generateGroqJson } from "@/lib/llm/groq";
import { DiscoverData, PositionData, ApiResponse } from "@/types";

/**
 * ============================================================================
 * STAGE 2: POSITION API ROUTE
 * Endpoint: POST /api/stages/2-position
 * Provider: Groq (llama-3.3-70b-versatile)
 * ============================================================================
 * 
 * 1. EXPECTED INPUT PAYLOAD:
 * {
 *   "discoverData": DiscoverData // Pruned, structured JSON from Stage 1
 * }
 * 
 * 2. LLM PROMPT STRATEGY:
 * - Ingests strictly the structured DiscoverData JSON (never raw conversational history).
 * - Formulates sharp market categorization, clear differentiation, value proposition,
 *   and competitive contrast against status-quo alternatives.
 * - Produces a rigorous positioning statement in classic venture syntax:
 *   "For [target user] who [need], [Product] is the [category] that [benefit] unlike [alternative]."
 * 
 * 3. EXPECTED JSON OUTPUT SHAPE:
 * {
 *   "marketCategory": string,
 *   "targetUserSummary": string,
 *   "coreDifferentiator": string,
 *   "valueProposition": string,
 *   "competitiveAngle": {
 *     "primaryCompetitorType": string,
 *     "statusQuoAlternative": string,
 *     "uniqueAngle": string
 *   },
 *   "positioningStatement": string
 * }
 * 
 * 4. ERROR HANDLING & RETRY:
 * - Try/catch block wraps the execution with single automatic retry.
 * - Returns 400 if upstream discoverData is missing.
 * - Fallback HTTP 500 error envelope if parsing fails.
 */

interface Stage2RequestBody {
  discoverData: DiscoverData;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<PositionData>>> {
  try {
    const body = (await req.json()) as Stage2RequestBody;

    if (!body.discoverData || !body.discoverData.problemStatement || !body.discoverData.targetAudience) {
      return NextResponse.json(
        {
          error: true,
          code: "UPSTREAM_DATA_MISSING",
          message: "Valid 'discoverData' from Stage 1 is required to generate Stage 2 (Position)."
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a positioning strategist specializing in category creation and distinct market differentiation.
Based ONLY on the structured discovery data provided, formulate the market positioning.
Output strictly valid JSON matching this TypeScript schema:

{
  "marketCategory": string,
  "targetUserSummary": string,
  "coreDifferentiator": string,
  "valueProposition": string,
  "competitiveAngle": {
    "primaryCompetitorType": string,
    "statusQuoAlternative": string,
    "uniqueAngle": string
  },
  "positioningStatement": string
}

Do not include markdown codeblocks or conversational text. Return valid JSON only.`;

    const userPrompt = `Synthesize positioning from this structured discovery context:
${JSON.stringify(body.discoverData, null, 2)}

Define the category, the sharpest differentiator, and the defensible positioning statement.`;

    const result = await generateGroqJson<PositionData>({
      systemPrompt,
      userPrompt,
      temperature: 0.3
    });

    return NextResponse.json({
      error: false,
      data: result,
      stage: 2,
      provider: "groq"
    });
  } catch (error: unknown) {
    console.error("[Stage 2 Position Error]:", error);
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
