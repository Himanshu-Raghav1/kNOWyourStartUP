import { NextRequest, NextResponse } from "next/server";
import { generateGroqJson } from "@/lib/llm/groq";
import { PositionData, ShapeData, VisualizeData, ApiResponse } from "@/types";

/**
 * ============================================================================
 * STAGE 4: VISUALIZE API ROUTE (Design Brief)
 * Endpoint: POST /api/stages/4-visualize
 * Provider: Groq (llama-3.3-70b-versatile)
 * ============================================================================
 * 
 * 1. EXPECTED INPUT PAYLOAD:
 * {
 *   "positionData": PositionData, // Structured JSON from Stage 2
 *   "shapeData": ShapeData        // Structured JSON from Stage 3
 * }
 * 
 * 2. LLM PROMPT STRATEGY:
 * - Translates brand positioning and personality into an actionable visual design brief.
 * - Generates cohesive 5-swatch color palette with hex codes, usage roles, and psychological associations.
 * - Selects harmonious typography pairing (heading + body) with explicit design rationale.
 * - Defines composition style, 3 logo/symbol concepts, imagery direction, and concepts to avoid.
 * 
 * 3. EXPECTED JSON OUTPUT SHAPE:
 * VisualizeData (see src/types/index.ts)
 * 
 * 4. ERROR HANDLING & RETRY:
 * - Validates upstream positionData and shapeData payloads.
 * - Wrapped in try/catch with 1 automatic retry on JSON parse failure.
 * - Returns HTTP 500 error envelope if generation fails.
 */

interface Stage4RequestBody {
  positionData: PositionData;
  shapeData: ShapeData;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<VisualizeData>>> {
  try {
    const body = (await req.json()) as Stage4RequestBody;

    if (!body.positionData || !body.shapeData) {
      return NextResponse.json(
        {
          error: true,
          code: "UPSTREAM_DATA_MISSING",
          message: "Valid 'positionData' (Stage 2) and 'shapeData' (Stage 3) are required for Stage 4."
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a visionary brand identity designer and art director.
Translate the brand's positioning and voice into a structured visual design brief.
You must return ONLY valid JSON matching this schema:

{
  "colorPalette": [
    {
      "name": string,
      "hex": string,
      "usageRole": "primary" | "secondary" | "accent" | "background" | "surface",
      "emotionalAssociation": string
    }
  ],
  "typography": {
    "headingFont": string,
    "headingFallback": string,
    "bodyFont": string,
    "bodyFallback": string,
    "pairingRationale": string
  },
  "compositionStyle": string,
  "logoAndSymbolConcepts": string[],
  "imageryAndArtDirection": string[],
  "visualConceptsToAvoid": string[]
}

No markdown code fences or conversational text. Return valid JSON only.`;

    // Specific pruned context: send only what Stage 4 Visuals actually needs
    const pos = body.positionData;
    const shape = body.shapeData;
    const voiceTones = shape.brandVoice?.toneDescriptors?.join(", ") || "Confident, modern";
    const voiceTraits = shape.brandVoice?.traitsToEmbody?.map((t) => t.trait).join(", ") || "Direct, approachable";

    const userPrompt = `Brand Identity Inputs:
Brand Name: "${shape.selectedName}"
Tagline: "${shape.selectedTagline}"
Market Category: "${pos.marketCategory}"
Target Audience: "${pos.targetUserSummary}"
Core Differentiator: "${pos.coreDifferentiator}"
Brand Voice Tones: "${voiceTones}"
Key Personality Traits: "${voiceTraits}"

Create a distinctive, coherent visual brief tailored specifically for this brand name, audience, and market position.`;

    const result = await generateGroqJson<VisualizeData>({
      systemPrompt,
      userPrompt,
      temperature: 0.4
    });


    return NextResponse.json({
      error: false,
      data: result,
      stage: 4,
      provider: "groq"
    });
  } catch (error: unknown) {
    console.error("[Stage 4 Visualize Error]:", error);
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
