import { NextRequest, NextResponse } from "next/server";
import { generateGroqJson } from "@/lib/llm/groq";
import { DiscoverData, PositionData, ShapeData, ApiResponse } from "@/types";

/**
 * ============================================================================
 * STAGE 3: SHAPE API ROUTE (Naming & Voice)
 * Endpoint: POST /api/stages/3-shape
 * Provider: Groq (llama-3.3-70b-versatile)
 * ============================================================================
 * 
 * 1. EXPECTED INPUT PAYLOAD:
 * {
 *   "discoverData": DiscoverData, // Pruned JSON from Stage 1
 *   "positionData": PositionData  // Pruned JSON from Stage 2
 * }
 * 
 * 2. LLM PROMPT STRATEGY:
 * - Ingests strictly structured discovery and positioning JSON.
 * - Explores 4 distinct naming territories (invented, evocative, descriptive, compound) with domain concepts and rationales.
 * - Establishes brand voice: 3-5 personality traits justified against the target audience,
 *   explicitly including traits to avoid and concrete do/don't examples.
 * - Proposes high-impact taglines and 3 core messaging pillars.
 * 
 * 3. EXPECTED JSON OUTPUT SHAPE:
 * ShapeData (see src/types/index.ts)
 * 
 * 4. ERROR HANDLING & RETRY:
 * - Validates presence of discoverData and positionData.
 * - Wraps invocation in try/catch with 1 automatic retry on JSON parse failure.
 * - Emits standardized HTTP 500 fallback if generation fails.
 */

interface Stage3RequestBody {
  discoverData: DiscoverData;
  positionData: PositionData;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ShapeData>>> {
  try {
    const body = (await req.json()) as Stage3RequestBody;

    if (!body.discoverData || !body.positionData) {
      return NextResponse.json(
        {
          error: true,
          code: "UPSTREAM_DATA_MISSING",
          message: "Valid 'discoverData' (Stage 1) and 'positionData' (Stage 2) are required for Stage 3."
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a world-class creative brand director and naming specialist.
Using ONLY the structured discovery and positioning data provided, shape the identity, name options, and voice system.
You must output ONLY valid JSON adhering strictly to this schema:

{
  "selectedName": string,
  "namingTerritories": [
    {
      "name": string,
      "category": "invented" | "evocative" | "descriptive" | "compound",
      "rationale": string,
      "domainConcept": string,
      "memorabilityScore": number
    }
  ],
  "selectedTagline": string,
  "taglineCandidates": string[],
  "brandVoice": {
    "toneDescriptors": string[],
    "traitsToEmbody": [
      {
        "trait": string,
        "justification": string,
        "behavioralExample": string
      }
    ],
    "traitsToAvoid": string[],
    "doSayExamples": string[],
    "dontSayExamples": string[]
  },
  "messagingPillars": [
    {
      "pillar": string,
      "description": string
    }
  ]
}

No markdown code fences or narrative wrapping. Valid JSON only.`;

    // Specific pruned context: send only what Stage 3 Shaping & Naming actually needs
    const disc = body.discoverData;
    const pos = body.positionData;

    const userPrompt = `Brand Positioning Brief:
Product Concept: "${disc.rawIdea}"
Target Audience: "${disc.targetAudience?.primarySegment || pos.targetUserSummary}"
Category: "${pos.marketCategory}"
Core Differentiator: "${pos.coreDifferentiator}"
Value Proposition: "${pos.valueProposition}"
Positioning: "${pos.positioningStatement}"

Generate 4 diverse naming territories, select the strongest primary candidate, establish the voice with traits to embody and avoid, and provide taglines and messaging pillars.`;

    const result = await generateGroqJson<ShapeData>({
      systemPrompt,
      userPrompt,
      temperature: 0.5
    });


    return NextResponse.json({
      error: false,
      data: result,
      stage: 3,
      provider: "groq"
    });
  } catch (error: unknown) {
    console.error("[Stage 3 Shape Error]:", error);
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
