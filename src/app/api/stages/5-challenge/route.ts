import { NextRequest, NextResponse } from "next/server";
import { generateGeminiCritique } from "@/lib/llm/gemini";
import { DiscoverData, PositionData, ShapeData, VisualizeData, ChallengeData, ApiResponse } from "@/types";

/**
 * ============================================================================
 * STAGE 5: CHALLENGE API ROUTE (Gemini Adversarial Validation & Critique)
 * Endpoint: POST /api/stages/5-challenge
 * Provider: Google Gemini (gemini-2.5-pro / gemini-3-flash)
 * ============================================================================
 * 
 * 1. EXPECTED INPUT PAYLOAD:
 * {
 *   "discoverData": DiscoverData,   // Pruned JSON from Stage 1
 *   "positionData": PositionData,   // Pruned JSON from Stage 2
 *   "shapeData": ShapeData,         // Pruned JSON from Stage 3
 *   "visualizeData": VisualizeData  // Pruned JSON from Stage 4
 * }
 * 
 * 2. LLM PROMPT STRATEGY:
 * - Employs Google Gemini API via @google/generative-ai SDK.
 * - Deep reasoning agent acts as an unsparing brand critic and stress-tester.
 * - Enforces responseMimeType: "application/json" and explicit responseSchema.
 * - Inspects consistency across all 4 upstream stages:
 *   a) Cliche detection (tired startup tropes, overused tech buzzwords)
 *   b) Contradiction flags (e.g., casual irreverent voice vs corporate rigid visual palette)
 *   c) Audience mismatch risks (e.g., student target vs enterprise enterprise-priced tone)
 *   d) Scalability or domain friction risks
 * - Calculates an overall cohesion score (0-100) and supplies actionable alternative proposals.
 * 
 * 3. EXPECTED JSON OUTPUT SHAPE:
 * ChallengeData (see src/types/index.ts)
 * 
 * 4. ERROR HANDLING & RETRY:
 * - Validates all 4 required upstream objects.
 * - Automatic 1-retry in generateGeminiCritique.
 * - Returns standardized HTTP 500 error envelope if parsing or validation fails.
 */

interface Stage5RequestBody {
  discoverData: DiscoverData;
  positionData: PositionData;
  shapeData: ShapeData;
  visualizeData: VisualizeData;
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<ChallengeData>>> {
  try {
    const body = (await req.json()) as Stage5RequestBody;

    if (!body.discoverData || !body.positionData || !body.shapeData || !body.visualizeData) {
      return NextResponse.json(
        {
          error: true,
          code: "UPSTREAM_DATA_MISSING",
          message: "Stages 1 through 4 data (discover, position, shape, visualize) are all required for Stage 5."
        },
        { status: 400 }
      );
    }

    const systemInstruction = `You are an elite, unsparing brand critic and venture positioning auditor.
Your job is to critically evaluate a nascent brand system across its first 4 stages: Discovery, Positioning, Shaping (Naming/Voice), and Visuals.
Scrutinize every detail for:
1. Startup clichés and tropes.
2. Contradictions between the stated brand personality, audience needs, and visual aesthetics.
3. Target audience mismatches or unrealistic adoption assumptions.
4. Concrete, superior alternative propositions.

You MUST respond strictly in valid JSON adhering to the provided JSON Schema.`;

    // Specific pruned context: send only essential elements to reduce token footprint by ~80%
    const disc = body.discoverData;
    const pos = body.positionData;
    const shape = body.shapeData;
    const vis = body.visualizeData;

    const colorsSummary = vis.colorPalette?.map((c) => `${c.name} (${c.hex}, ${c.usageRole})`).join("; ") || "Primary & Secondary Palette";
    const voiceSummary = shape.brandVoice?.toneDescriptors?.join(", ") || "Direct, modern";

    const prompt = `Adversarially evaluate this brand system:
1. DISCOVERY:
- Raw Idea: "${disc.rawIdea}"
- Target Audience: "${disc.targetAudience?.primarySegment}"
- Core Problem: "${disc.problemStatement}"

2. POSITIONING:
- Category: "${pos.marketCategory}"
- Core Differentiator: "${pos.coreDifferentiator}"
- Positioning Statement: "${pos.positioningStatement}"

3. IDENTITY & VOICE:
- Brand Name: "${shape.selectedName}"
- Tagline: "${shape.selectedTagline}"
- Voice Descriptors: "${voiceSummary}"

4. VISUAL IDENTITY:
- Colors: "${colorsSummary}"
- Fonts: "${vis.typography?.headingFont} (headings) + ${vis.typography?.bodyFont} (body)"

Perform a thorough critique. Identify genuine flaws, cliches, or contradictions, calculate the cohesion score, and recommend concrete fixes.`;

    try {
      const result = await generateGeminiCritique({
        systemInstruction,
        prompt
      });

      return NextResponse.json({
        error: false,
        data: result,
        stage: 5,
        provider: "gemini"
      });
    } catch (geminiErr: unknown) {
      console.warn("[Stage 5 Challenge]: Gemini rate limit or error, using Groq fallback:", geminiErr);

      // Groq fallback if Gemini hits rate limits
      const { generateGroqJson } = await import("@/lib/llm/groq");
      const groqResult = await generateGroqJson<ChallengeData>({
        systemPrompt: systemInstruction + "\nRespond strictly in valid JSON matching the ChallengeData schema.",
        userPrompt: prompt,
        temperature: 0.2
      });

      return NextResponse.json({
        error: false,
        data: groqResult,
        stage: 5,
        provider: "groq"
      });
    }
  } catch (error: unknown) {
    console.error("[Stage 5 Challenge Error]:", error);
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

