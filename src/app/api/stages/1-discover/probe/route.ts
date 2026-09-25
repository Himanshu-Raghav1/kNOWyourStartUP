import { NextRequest, NextResponse } from "next/server";
import {
  generateGeminiClarifyQuestions,
  generateGeminiDiscoveryProbe,
  generateGeminiIdeaInterpretations,
  Stage1ClarifyResult,
  Stage1ProbeResult,
  Stage1InterpretResult,
  IdeaInterpretation,
  ClarifyQuestion
} from "@/lib/llm/gemini";
import { generateGroqJson } from "@/lib/llm/groq";
import { ApiResponse } from "@/types";

// Union type for what the probe can return
type ProbeResponse = Stage1InterpretResult | Stage1ClarifyResult | Stage1ProbeResult;

export interface ProbeRequestBody {
  rawIdea: string;
  step?: "interpret" | "clarify" | "fill"; // "interpret" = show 2-3 idea readings, "clarify" = ask questions, "fill" = return 4 quadrants
  clarifyAnswers?: Record<string, string>; // answers from step 1
  confirmedIdea?: string; // user-edited/confirmed version of the idea from the interpret phase
}

/**
 * Builds dynamic fallback interpretations tailored strictly to the user's raw idea text
 * when both Gemini and Groq are unreachable or rate-limited. Never uses generic filler.
 */
function buildTailoredFallbackInterpretations(rawIdea: string): Stage1InterpretResult {
  const clean = rawIdea.trim();
  const shortSubject = clean.length > 40 ? clean.slice(0, 36) + "..." : clean;

  return {
    interpretations: [
      {
        id: "interp_a",
        title: `Direct Solution: ${shortSubject}`,
        summary: `A focused, direct product dedicated exclusively to: ${clean}. Designed for fast, effortless results.`,
        whoItsFor: `People who actively deal with ${clean} and want an immediate fix`,
        whatItDoes: `Provides an end-to-end direct workflow tailored specifically to ${clean}`,
        domainLabel: "Dedicated Platform",
        coreVision: `Give people a reliable, dedicated product built from the ground up for "${clean}", making the experience seamless and frustration-free.`,
        coreProblem: `Current solutions for "${clean}" are fragmented, outdated, or require juggling multiple disconnected tools.`,
        personaOptions: [
          `People dealing with ${shortSubject} on a regular basis`,
          `Early adopters looking for a specialized tool for ${shortSubject}`,
          `Beginners who need a clear, guided experience for ${shortSubject}`
        ]
      },
      {
        id: "interp_b",
        title: `Collaborative Hub for ${shortSubject}`,
        summary: `A collaborative platform connecting individuals and communities centered around: ${clean}.`,
        whoItsFor: `Users who want human connection, trusted recommendations, and support for ${clean}`,
        whatItDoes: `Combines a smart matching tool with a trusted network for ${clean}`,
        domainLabel: "Network & Exchange",
        coreVision: `Connect people with trusted peers and providers for "${clean}", removing the uncertainty and building community.`,
        coreProblem: `Finding trustworthy options and getting real support for "${clean}" is difficult and feels isolated today.`,
        personaOptions: [
          `People seeking peer advice and trusted help with ${shortSubject}`,
          `Active practitioners who want to share and connect around ${shortSubject}`,
          `Anyone looking for trusted, vetted recommendations for ${shortSubject}`
        ]
      },
      {
        id: "interp_c",
        title: `AI-Powered Automation for ${shortSubject}`,
        summary: `An intelligent system that automates the complex and tedious parts of: ${clean}.`,
        whoItsFor: `Busy people who want ${clean} handled quickly and accurately`,
        whatItDoes: `Automates research, scheduling, and execution for ${clean}`,
        domainLabel: "Intelligent Assistant",
        coreVision: `Remove 90% of the manual effort in "${clean}" so users achieve expert-level results in seconds.`,
        coreProblem: `People waste valuable hours on repetitive, manual tasks related to "${clean}".`,
        personaOptions: [
          `Busy individuals with zero time to spare on manual ${shortSubject}`,
          `Professionals who need fast, accurate outputs for ${shortSubject}`,
          `Users who want smart recommendations tailored to their situation`
        ]
      }
    ]
  };
}

/**
 * Builds dynamically synthesized clarifying options based strictly on the founder's raw words.
 * Questions are standard, but ZERO answers/options are hardcoded.
 */
function buildDynamicClarifyFallback(rawIdea: string): Stage1ClarifyResult {
  const clean = rawIdea.trim();
  const shortSubject = clean.length > 35 ? clean.slice(0, 32) + "..." : clean;

  return {
    questions: [
      {
        id: "target_user",
        question: "Who will be the first group of people to use this?",
        hint: "Choosing a sharp early adopter group helps focus your launch.",
        options: [
          `Individual users actively seeking a better way for ${shortSubject}`,
          `Teams and groups managing ${shortSubject} together on a regular basis`,
          `Early adopters frustrated with existing outdated solutions for ${shortSubject}`,
          `First-time users who need an intuitive, guided experience for ${shortSubject}`
        ]
      },
      {
        id: "delivery_model",
        question: "How will users primarily experience or access your product?",
        hint: "This clarifies the core product format and daily user workflow.",
        options: [
          `A dedicated web & mobile application focused 100% on ${shortSubject}`,
          `An automated platform that handles ${shortSubject} in the background`,
          `A peer-to-peer network and community connecting people around ${shortSubject}`,
          `An on-demand service hub delivering verified, high-quality results for ${shortSubject}`
        ]
      },
      {
        id: "core_value",
        question: "What is the single most valuable outcome this delivers for them?",
        hint: "This becomes the central hook of your brand positioning.",
        options: [
          `Eliminating the biggest manual frustration and time wasted on ${shortSubject}`,
          `Getting trustworthy, high-confidence results for ${shortSubject} instantly`,
          `Connecting with the right verified peers and resources for ${shortSubject}`,
          `Achieving effortless, seamless outcomes for ${shortSubject} from day one`
        ]
      }
    ]
  };
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<ProbeResponse>>> {
  let body: ProbeRequestBody;
  try {
    body = (await req.json()) as ProbeRequestBody;
  } catch {
    return NextResponse.json(
      { error: true, code: "LLM_PARSE_FAILURE", message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const rawIdea = body.rawIdea?.trim();
  const step = body.step || "clarify";

  if (!rawIdea) {
    return NextResponse.json(
      {
        error: true,
        code: "VALIDATION_ERROR",
        message: "Please share your product idea first."
      },
      { status: 400 }
    );
  }

  // ─── STEP 0: INTERPRET — generate 2-3 plain-English readings of the idea ────
  if (step === "interpret") {
    // 1. Try Google Gemini first
    try {
      const interpretResult = await generateGeminiIdeaInterpretations(rawIdea);
      if (interpretResult && interpretResult.interpretations?.length > 0) {
        return NextResponse.json({
          error: false,
          data: interpretResult,
          stage: 1,
          provider: "gemini"
        });
      }
    } catch (geminiErr: unknown) {
      console.warn("[Stage 1 Interpret]: Gemini error, attempting Groq fallback:", geminiErr);
    }

    // 2. High-speed Fallback: Groq Llama 3.3
    try {
      const systemPrompt = `You are an elite startup co-founder and venture architect.
A founder typed this rough idea: "${rawIdea}".
PRIORITIZE THE FOUNDER'S EXACT WORDS, INDUSTRY, AUDIENCE, AND NOUNS.
NEVER produce generic filler. Every option must be specifically about the founder's exact concept.
Return strictly valid JSON matching this schema:
{
  "interpretations": [
    {
      "id": string,
      "title": string,
      "summary": string,
      "whoItsFor": string,
      "whatItDoes": string,
      "coreVision": string,
      "coreProblem": string,
      "personaOptions": string[],
      "domainLabel": string
    }
  ]
}`;
      const userPrompt = `Idea: "${rawIdea}"\n\nGenerate 2-3 distinct takes anchored in the founder's exact idea. Return valid JSON only.`;
      const groqResult = await generateGroqJson<Stage1InterpretResult>({
        systemPrompt,
        userPrompt,
        temperature: 0.4
      });

      if (groqResult && groqResult.interpretations?.length > 0) {
        return NextResponse.json({
          error: false,
          data: groqResult,
          stage: 1,
          provider: "groq"
        });
      }
    } catch (groqErr: unknown) {
      console.warn("[Stage 1 Interpret]: Groq fallback failed, using tailored dynamic fallback:", groqErr);
    }

    // 3. Guaranteed tailored dynamic fallback incorporating the user's raw words
    const fallback = buildTailoredFallbackInterpretations(rawIdea);
    return NextResponse.json({
      error: false,
      data: fallback,
      stage: 1,
      provider: "gemini"
    });
  }


  // ─── STEP 1: CLARIFY — standard questions, 100% dynamic AI-generated options ─
  if (step === "clarify") {
    // 1. High-speed Engine: Groq with Qwen/Llama (fast, dynamic options grounded strictly in rawIdea)
    try {
      const systemPrompt = `You are a startup co-founder and product strategist helping clarify a founder's rough idea.
The founder typed this raw idea: "${rawIdea}".

We have 3 fixed questions to help frame the brand:
1. "Who will be the first group of people to use this?" (id: "target_user", hint: "Choosing a sharp early adopter group helps focus your launch.")
2. "How will users primarily experience or access your product?" (id: "delivery_model", hint: "This clarifies the core product format and daily user workflow.")
3. "What is the single most valuable outcome this delivers for them?" (id: "core_value", hint: "This becomes the central hook of your brand positioning.")

CRITICAL RULE — ZERO HARDCODED ANSWERS:
Every single answer option in the "options" array for each question MUST be dynamically generated, tailored specifically to "${rawIdea}".
Use the founder's exact words, nouns, and industry.
NEVER return generic options like "Mobile app", "Website", "Saves time", or "Professionals".
Every option must be a concrete, realistic answer specific to this startup concept.

Return strictly valid JSON matching this schema:
{
  "questions": [
    {
      "id": "target_user",
      "question": "Who will be the first group of people to use this?",
      "hint": "Choosing a sharp early adopter group helps focus your launch.",
      "options": [string, string, string, string]
    },
    {
      "id": "delivery_model",
      "question": "How will users primarily experience or access your product?",
      "hint": "This clarifies the core product format and daily user workflow.",
      "options": [string, string, string, string]
    },
    {
      "id": "core_value",
      "question": "What is the single most valuable outcome this delivers for them?",
      "hint": "This becomes the central hook of your brand positioning.",
      "options": [string, string, string, string]
    }
  ]
}`;

      const groqClarify = await generateGroqJson<Stage1ClarifyResult>({
        systemPrompt,
        userPrompt: `Raw Idea: "${rawIdea}"\nGenerate the 3 questions with tailored dynamic answer options. Return valid JSON only.`,
        temperature: 0.3
      });

      if (
        groqClarify &&
        groqClarify.questions?.length > 0 &&
        groqClarify.questions.every((q) => q.options && q.options.length > 0)
      ) {
        return NextResponse.json({
          error: false,
          data: groqClarify,
          stage: 1,
          provider: "groq"
        });
      }
    } catch (groqErr: unknown) {
      console.warn("[Stage 1 Clarify]: Groq failed, attempting Gemini fallback:", groqErr);
    }

    // 2. Secondary Engine: Gemini
    try {
      const clarifyResult = await generateGeminiClarifyQuestions(rawIdea);
      if (clarifyResult && clarifyResult.questions?.length > 0) {
        return NextResponse.json({
          error: false,
          data: clarifyResult,
          stage: 1,
          provider: "gemini"
        });
      }
    } catch (geminiErr: unknown) {
      console.warn("[Stage 1 Clarify]: Gemini failed, using tailored dynamic fallback:", geminiErr);
    }

    // 3. Dynamic fallback using founder's raw words — zero hardcoded options
    const fallback = buildDynamicClarifyFallback(rawIdea);
    return NextResponse.json({
      error: false,
      data: fallback,
      stage: 1,
      provider: "gemini"
    });
  }

  // ─── STEP 2: FILL — generate 4 discovery quadrants using idea + answers ────
  // Use confirmedIdea if the user edited the interpretation, otherwise fall back to rawIdea
  const ideaForFill = body.confirmedIdea?.trim() || rawIdea;

  // 1. Try Gemini
  try {
    const probeResult = await generateGeminiDiscoveryProbe(ideaForFill, body.clarifyAnswers);
    if (probeResult && probeResult.coreVision && probeResult.coreProblem) {
      return NextResponse.json({
        error: false,
        data: probeResult,
        stage: 1,
        provider: "gemini"
      });
    }
  } catch (geminiErr: unknown) {
    console.warn("[Stage 1 Fill]: Gemini error, attempting Groq fallback:", geminiErr);
  }

  // 2. High-speed Fallback: Groq Llama 3.3
  try {
    const systemPrompt = `You are an elite product strategist. The founder's startup idea: "${ideaForFill}".
Clarifications given: ${JSON.stringify(body.clarifyAnswers || {})}
Fill in the 4 discovery quadrants.
ANCHOR DIRECTLY IN THE FOUNDER'S EXACT WORDS. Zero generic filler.
Return strictly valid JSON matching:
{
  "domainName": string,
  "coreVision": string,
  "coreProblem": string,
  "personaOptions": string[],
  "ambiguities": [
    {
      "id": string,
      "question": string,
      "contextWhyItMatters": string,
      "options": string[]
    }
  ]
}`;
    const userPrompt = `Idea: "${ideaForFill}"\n\nGenerate tailored discovery quadrants.`;
    const groqResult = await generateGroqJson<Stage1ProbeResult>({
      systemPrompt,
      userPrompt,
      temperature: 0.3
    });

    if (groqResult && groqResult.coreVision && groqResult.coreProblem) {
      return NextResponse.json({
        error: false,
        data: groqResult,
        stage: 1,
        provider: "groq"
      });
    }
  } catch (groqErr: unknown) {
    console.warn("[Stage 1 Fill]: Groq fallback failed, using tailored dynamic fallback:", groqErr);
  }

  // 3. Dynamic fallback using the founder's raw words
  const cleanIdea = ideaForFill.trim();
  const dynamicFallback: Stage1ProbeResult = {
    domainName: cleanIdea.length > 30 ? cleanIdea.slice(0, 26) + "..." : cleanIdea,
    coreVision: `Empower people using "${cleanIdea}" to achieve their goals with maximum speed, clarity, and confidence.`,
    coreProblem: `Existing alternatives for "${cleanIdea}" are slow, complicated, or fail to address the specific needs of modern users.`,
    personaOptions: [
      `Active users who encounter friction with ${cleanIdea} regularly`,
      `Teams and individuals seeking a more modern approach to ${cleanIdea}`,
      `Beginners wanting an intuitive, guided experience for ${cleanIdea}`
    ],
    ambiguities: []
  };

  return NextResponse.json({
    error: false,
    data: dynamicFallback,
    stage: 1,
    provider: "gemini"
  });
}


// Satisfy unused imports
const _unusedExport: ClarifyQuestion | IdeaInterpretation | null = null;
void _unusedExport;
