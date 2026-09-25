import { NextRequest, NextResponse } from "next/server";
import { generateOpenRouterJson, OPENROUTER_MODEL } from "@/lib/llm/openrouter";
import { DiscoverData, PositionData, ShapeData, VisualizeData, ChallengeData, ApiResponse } from "@/types";

/**
 * ============================================================================
 * STAGE 5: CHALLENGE API ROUTE (OpenRouter Adversarial Validation & Critique)
 * Endpoint: POST /api/stages/5-challenge
 * Primary Provider: OpenRouter (qwen/qwen3.8-27b or custom model)
 * Fallback Providers: Google Gemini (gemini-1.5-flash), Groq (llama-3.3-70b-versatile)
 * ============================================================================
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

    const disc = body.discoverData;
    const pos = body.positionData;
    const shape = body.shapeData;
    const vis = body.visualizeData;

    const colorsSummary = vis.colorPalette?.map((c) => `${c.name} (${c.hex}, ${c.usageRole})`).join("; ") || "Primary & Secondary Palette";
    const voiceSummary = shape.brandVoice?.toneDescriptors?.join(", ") || "Direct, modern";

    const systemInstruction = `You are an elite, unsparing brand critic and venture positioning auditor.
Your job is to critically evaluate a nascent brand system across its first 4 stages: Discovery, Positioning, Shaping, and Visuals.
THE PRODUCT BEING AUDITED IS STRICTLY DEFINED BY THE FOUNDER'S RAW IDEA: "${disc.rawIdea}".
Every single critique item, risk, remedy, and alternative proposal MUST be tailored specifically to "${disc.rawIdea}".
NEVER output generic startup feedback.

Scrutinize every detail for:
1. Startup clichés and tropes in this specific industry.
2. Contradictions between the stated brand personality, audience needs, and visual aesthetics.
3. Target audience mismatches or unrealistic adoption assumptions for "${disc.rawIdea}".
4. Concrete, superior alternative propositions specifically tailored to "${disc.rawIdea}".

CRITICAL INSTRUCTIONS:
- Be concise and direct. Keep each description to 1-2 punchy sentences.
- Generate 3-4 high-impact critiqueItems.
- Generate 2-3 concrete proposedAlternatives.

You MUST respond strictly in valid JSON adhering to this exact schema (no markdown, no conversational text):
{
  "overallCohesionScore": number (0-100),
  "critiqueItems": [
    {
      "id": string,
      "category": "cliche" | "contradiction" | "audience_mismatch" | "scalability_risk",
      "severity": "high" | "medium" | "low",
      "description": string,
      "affectedStages": string[],
      "actionableRemedy": string
    }
  ],
  "proposedAlternatives": [
    {
      "originalElement": string,
      "critiqueRef": string,
      "alternativeProposal": string,
      "reasoning": string
    }
  ],
  "verdictSummary": string,
  "passedValidation": boolean
}`;

    const prompt = `Adversarially evaluate this brand system built around the founder's raw idea:
CORE FOUNDER IDEA: "${disc.rawIdea}"

1. DISCOVERY:
- Problem Worth Solving: "${disc.problemStatement}"
- Primary Target Audience: "${disc.targetAudience?.primarySegment}"

2. POSITIONING:
- Market Category: "${pos.marketCategory}"
- Core Differentiator: "${pos.coreDifferentiator}"
- Positioning Statement: "${pos.positioningStatement}"

3. IDENTITY & VOICE:
- Brand Name: "${shape.selectedName}"
- Tagline: "${shape.selectedTagline}"
- Voice Descriptors: "${voiceSummary}"

4. VISUAL IDENTITY:
- Colors: "${colorsSummary}"
- Fonts: "${vis.typography?.headingFont} + ${vis.typography?.bodyFont}"

Perform a rigorous, honest critique. Anchor every critique on "${disc.rawIdea}". Output strictly valid JSON matching the schema.`;

    // Stage 5 Engine: OpenRouter with qwen/qwen3.8-27b exclusively
    try {
      const openRouterResult = await generateOpenRouterJson<ChallengeData>({
        systemPrompt: systemInstruction,
        userPrompt: prompt,
        temperature: 0.2,
        maxTokens: 3500
      });

      if (openRouterResult && typeof openRouterResult.overallCohesionScore === "number") {
        return NextResponse.json({
          error: false,
          data: openRouterResult,
          stage: 5,
          provider: "openrouter"
        });
      }

      throw new Error("OpenRouter returned invalid schema for Stage 5 critique.");
    } catch (openRouterErr: unknown) {
      console.error("[Stage 5 Challenge OpenRouter Error]:", openRouterErr);
      const msg = openRouterErr instanceof Error ? openRouterErr.message : "OpenRouter critique failed.";
      return NextResponse.json(
        {
          error: true,
          code: "OPENROUTER_ERROR",
          message: `Stage 5 challenge using OpenRouter (${OPENROUTER_MODEL}) failed: ${msg}`
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("[Stage 5 Challenge Error]:", error);
    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to run brand challenge audit."
      },
      { status: 500 }
    );
  }
}

