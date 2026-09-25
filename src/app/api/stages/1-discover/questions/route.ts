import { NextRequest, NextResponse } from "next/server";
import { generateGroqJson } from "@/lib/llm/groq";

interface QuestionGenerationRequest {
  idea: string;
}

export interface TailoredInterviewOptions {
  domain: string;
  consultantReaction: string;
  audienceOptions: string[];
  workaroundOptions: string[];
  superpowerOptions: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuestionGenerationRequest;
    const idea = body.idea?.trim();

    if (!idea) {
      return NextResponse.json(
        { error: true, message: "Idea is required to generate interview questions." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a world-class senior partner at a top brand strategy agency (like Wolff Olins, Pentagram, Collins).
A founder just walked in and shared their raw product idea.
Your job is to analyze the idea and generate 4 hyper-tailored, realistic, and acute options for:
1. Target Audience Segments (hyper-specific niches experiencing hair-on-fire pain for THIS exact idea).
2. Broken Current Workarounds (the messy, duct-taped tools or manual habits they use today for THIS domain).
3. Non-negotiable Superpowers/Constraints (the specific value propositions that would make them switch).

You must return ONLY a valid JSON object matching this schema:
{
  "domain": string, // e.g. "Fintech / Creator Economy", "Collaborative EdTech", "Developer Tooling"
  "consultantReaction": string, // 1-2 sentence sharp strategic observation about this market opportunity
  "audienceOptions": string[], // Exactly 4 specific audience persona strings
  "workaroundOptions": string[], // Exactly 4 specific painful alternative/workaround strings
  "superpowerOptions": string[] // Exactly 4 specific product superpower/constraint strings
}

Do not return generic options. Make every option deeply relevant to the specific product idea. Return valid JSON only.`;

    const userPrompt = `Product Idea: "${idea}"

Generate the 4 tailored audience segments, 4 broken workarounds, and 4 product superpowers for this specific idea.`;

    const result = await generateGroqJson<TailoredInterviewOptions>({
      systemPrompt,
      userPrompt,
      temperature: 0.5
    });

    return NextResponse.json({
      error: false,
      data: result
    });
  } catch (error: unknown) {
    console.warn("[Questions Route Error]: Falling back to local heuristics:", error);
    return NextResponse.json(
      { error: true, message: "Failed to generate dynamic questions via LLM." },
      { status: 500 }
    );
  }
}
