import { NextRequest, NextResponse } from "next/server";
import { generateGroqJson } from "@/lib/llm/groq";
import { PositionData, ShapeData, ChallengeData, DeliverData, ApiResponse } from "@/types";

/**
 * ============================================================================
 * STAGE 6: DELIVER API ROUTE (Launch Kit Generation)
 * Endpoint: POST /api/stages/6-deliver
 * Provider: Groq (llama-3.3-70b-versatile)
 * ============================================================================
 * 
 * 1. EXPECTED INPUT PAYLOAD:
 * {
 *   "positionData": PositionData,     // Structured JSON from Stage 2
 *   "shapeData": ShapeData,           // Structured JSON from Stage 3
 *   "challengeData"?: ChallengeData   // Structured JSON from Stage 5 (incorporating critique fixes)
 * }
 * 
 * 2. LLM PROMPT STRATEGY:
 * - Ingests pruned positioning, brand voice, and validated critique recommendations.
 * - Protects the established brand personality and voice guardrails.
 * - Generates high-converting landing page hero copy (headline, subheadline, CTAs).
 * - Drafts bespoke launch copy tailored for Twitter/X, LinkedIn, and Product Hunt.
 * - Establishes enduring brand guardrails specifying operational rules and why they matter.
 * 
 * 3. EXPECTED JSON OUTPUT SHAPE:
 * DeliverData (see src/types/index.ts)
 * 
 * 4. ERROR HANDLING & RETRY:
 * - Validates positionData and shapeData payloads.
 * - Wraps execution with 1 automatic retry on JSON parse failure.
 * - Returns standardized HTTP 500 error envelope if generation fails.
 */

interface Stage6RequestBody {
  positionData: PositionData;
  shapeData: ShapeData;
  challengeData?: ChallengeData;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<DeliverData>>> {
  try {
    const body = (await req.json()) as Stage6RequestBody;

    if (!body.positionData || !body.shapeData) {
      return NextResponse.json(
        {
          error: true,
          code: "UPSTREAM_DATA_MISSING",
          message: "Valid 'positionData' (Stage 2) and 'shapeData' (Stage 3) are required for Stage 6."
        },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a world-class growth copywriter and brand launch strategist.
Using the brand's validated positioning and voice guidelines (incorporating critical feedback), generate the complete launch kit.
You must return ONLY valid JSON matching this schema:

{
  "oneLinePitch": string,
  "elevatorPitch": string,
  "landingPageHero": {
    "headline": string,
    "subheadline": string,
    "primaryCtaText": string,
    "secondaryCtaText": string
  },
  "launchSocialPosts": [
    {
      "platform": "twitter" | "linkedin" | "product_hunt" | "instagram",
      "hook": string,
      "body": string,
      "callToAction": string
    }
  ],
  "brandGuardrails": [
    {
      "rule": string,
      "whyItMatters": string
    }
  ]
}

No markdown code fences or conversational text. Return valid JSON only.`;

    // Specific pruned context: send only what Stage 6 Launch Kit actually needs
    const pos = body.positionData;
    const shape = body.shapeData;
    const voiceTones = shape.brandVoice?.toneDescriptors?.join(", ") || "Direct, modern";
    const remedies = body.challengeData?.proposedAlternatives
      ?.map((a) => `${a.originalElement} -> ${a.alternativeProposal}`)
      .join("; ");

    const userPrompt = `Brand Launch Kit Brief:
Brand Name: "${shape.selectedName}"
Tagline: "${shape.selectedTagline}"
Target Audience: "${pos.targetUserSummary}"
Market Category: "${pos.marketCategory}"
Core Differentiator: "${pos.coreDifferentiator}"
Value Proposition: "${pos.valueProposition}"
Voice & Tone: "${voiceTones}"
${remedies ? `Validation Remedies to Incorporate: "${remedies}"\n` : ""}
Generate a high-impact, launch-ready asset kit that stays strictly faithful to the brand voice and guardrails.`;

    const result = await generateGroqJson<DeliverData>({
      systemPrompt,
      userPrompt,
      temperature: 0.4
    });


    return NextResponse.json({
      error: false,
      data: result,
      stage: 6,
      provider: "groq"
    });
  } catch (error: unknown) {
    console.error("[Stage 6 Deliver Error]:", error);
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
