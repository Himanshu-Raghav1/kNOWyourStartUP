/**
 * src/lib/llm/gemini.ts
 * Google Gemini LLM Client Wrapper for Deep Strategic Reasoning (Stage 1 Discovery & Stage 5 Critique).
 * 
 * Directives:
 * - Uses the @google/generative-ai SDK.
 * - Model: gemini-2.5-pro or gemini-3.8-flash (configurable via GEMINI_MODEL).
 * - Enforces responseMimeType: "application/json" and explicit responseSchema.
 * - Performs exactly 1 automatic retry on failure.
 * - Never uses 'any' types.
 */

import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { ChallengeData, DiscoverData } from "@/types";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Safely sanitize GEMINI_MODEL: if undefined or non-existent (e.g. "gemini-3.8-flash"), use high-speed stable model
const rawGeminiModel = (process.env.GEMINI_MODEL || "").trim();
export const GEMINI_MODEL =
  !rawGeminiModel || rawGeminiModel.includes("3.8") || !rawGeminiModel.startsWith("gemini-")
    ? "gemini-1.5-flash"
    : rawGeminiModel;

// ============================================================================
// STAGE 1 — PHASE 0: IDEA INTERPRETATIONS (2-3 plain-English readings of the raw idea)
// ============================================================================

export interface IdeaInterpretation {
  id: string;           // short slug e.g. "interp_a"
  title: string;        // 4-7 word headline summarising this take on the idea
  summary: string;      // 1-2 sentences describing what the idea is — in casual, simple language
  whoItsFor: string;    // plain description of who this is aimed at, no jargon
  whatItDoes: string;   // one sentence on the core thing this product/service does
  // Quadrant pre-fill fields — populated so picking this card instantly fills Stage 1 boxes:
  coreVision: string;   // the big dream / what success looks like for this interpretation
  coreProblem: string;  // the real pain this version solves and why current options fail
  personaOptions: string[]; // 3-5 specific types of real people who would love this version
  domainLabel: string;  // short label for this product space, e.g. "Pet Care Apps"
}

export interface Stage1InterpretResult {
  interpretations: IdeaInterpretation[];
}

export const STAGE1_INTERPRET_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    interpretations: {
      type: SchemaType.ARRAY,
      description: "Exactly 2 or 3 different plain-English interpretations of the raw idea. Each is a meaningfully distinct reading. Each interpretation must be self-contained — it includes the big dream, the core problem, and the target personas FOR THAT VERSION of the idea.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Short slug like 'interp_a'" },
          title: { type: SchemaType.STRING, description: "4-7 word casual headline for this interpretation, e.g. 'A marketplace where sitters compete'" },
          summary: { type: SchemaType.STRING, description: "1-2 plain-English sentences describing this version of the idea. No jargon. Casual tone." },
          whoItsFor: { type: SchemaType.STRING, description: "One short phrase for the main user, e.g. 'Dog owners who travel frequently'" },
          whatItDoes: { type: SchemaType.STRING, description: "One sentence: what the product physically/digitally does, e.g. 'Lets pet owners post jobs and nearby sitters apply with their rate and availability'" },
          coreVision: { type: SchemaType.STRING, description: "2-3 sentences about the big dream for THIS version — what does success look like, how does it change people's lives? Plain language, honest and specific." },
          coreProblem: { type: SchemaType.STRING, description: "2-3 sentences describing the actual pain this version solves. Be concrete — say what sucks about the current options and why people need THIS solution." },
          personaOptions: {
            type: SchemaType.ARRAY,
            description: "3-5 specific, realistic types of real people who would love this version of the product. Each should feel like a real person, not a category. E.g. 'Dog owners who work 9-5 and can't leave early' not 'dog lovers'.",
            items: { type: SchemaType.STRING }
          },
          domainLabel: { type: SchemaType.STRING, description: "Short 2-4 word label for what type of product this is, e.g. 'Pet Care Marketplace', 'Fitness App', 'Learning Platform'" }
        },
        required: ["id", "title", "summary", "whoItsFor", "whatItDoes", "coreVision", "coreProblem", "personaOptions", "domainLabel"]
      }
    }
  },
  required: ["interpretations"]
};

// ============================================================================
// STAGE 1 — PHASE 1: CLARIFY QUESTIONS (2-3 simple questions to understand the idea)
// ============================================================================

export interface ClarifyQuestion {
  id: string;
  question: string;
  hint: string; // one-line context for why this matters, in plain English
  options: string[];
}

export interface Stage1ClarifyResult {
  questions: ClarifyQuestion[];
}

export const STAGE1_CLARIFY_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      description: "Exactly 2 to 3 simple, friendly clarifying questions (NOT branding jargon) to understand the product idea better",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Short slug like 'product_type'" },
          question: { type: SchemaType.STRING, description: "A short, friendly plain-English question like 'What kind of product is this?'" },
          hint: { type: SchemaType.STRING, description: "One casual sentence explaining why this question helps" },
          options: {
            type: SchemaType.ARRAY,
            description: "2 to 4 short, plain, clickable answer options",
            items: { type: SchemaType.STRING }
          }
        },
        required: ["id", "question", "hint", "options"]
      }
    }
  },
  required: ["questions"]
};

// ============================================================================
// STAGE 1 — PHASE 2: QUADRANT FILL (fills 4 sections using idea + clarification answers)
// ============================================================================

export interface AmbiguityItem {
  id: string;
  question: string;
  contextWhyItMatters: string;
  options: string[];
}

export interface Stage1ProbeResult {
  domainName: string;
  coreVision: string;
  coreProblem: string;
  personaOptions: string[];
  ambiguities: AmbiguityItem[];
}

export const STAGE1_PROBE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    domainName: {
      type: SchemaType.STRING,
      description: "A simple label for the type of product/market (e.g. 'Fitness Apps', 'B2B SaaS', 'Education Tools')"
    },
    coreVision: {
      type: SchemaType.STRING,
      description: "One or two sentences about the big change this product could bring to people's lives — written simply"
    },
    coreProblem: {
      type: SchemaType.STRING,
      description: "A plain-English description of the main pain or problem this product fixes and why current solutions fall short"
    },
    personaOptions: {
      type: SchemaType.ARRAY,
      description: "4 to 6 real, specific types of people who would love this product the most — described simply and concisely",
      items: { type: SchemaType.STRING }
    },
    ambiguities: {
      type: SchemaType.ARRAY,
      description: "0 to 2 very specific follow-up questions that are ONLY about details unique to THIS product idea that are still unclear after reading the idea and answers. NEVER ask generic questions like 'How will you make money?', 'What is your business model?', 'What stage are you at?', or 'What is your pricing?'. Ask ONLY about something concrete and specific to this particular idea that you genuinely cannot infer. Each question must mention something specific from the idea. If nothing is genuinely unclear, return an empty array.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          question: { type: SchemaType.STRING, description: "A specific question about THIS idea only. Must reference something concrete from the idea. Never ask about business model, pricing, funding, or marketing in general." },
          contextWhyItMatters: { type: SchemaType.STRING, description: "One casual sentence explaining what part of the product this affects, e.g. 'This changes how the matching works between dog owners and sitters'." },
          options: {
            type: SchemaType.ARRAY,
            description: "3-4 specific, realistic options tailored to THIS idea. Not generic.",
            items: { type: SchemaType.STRING }
          }
        },
        required: ["id", "question", "contextWhyItMatters", "options"]
      }
    }
  },
  required: ["domainName", "coreVision", "coreProblem", "personaOptions", "ambiguities"]
};

// ============================================================================
// STAGE 1 SYNTHESIS SCHEMA: Formal DiscoverData Contract
// ============================================================================

export const STAGE1_SYNTHESIS_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    rawIdea: { type: SchemaType.STRING },
    problemStatement: {
      type: SchemaType.STRING,
      description: "A sharpened, unvarnished problem statement defining the acute systemic failure"
    },
    targetAudience: {
      type: SchemaType.OBJECT,
      properties: {
        primarySegment: { type: SchemaType.STRING },
        demographics: { type: SchemaType.STRING },
        psychographics: { type: SchemaType.STRING },
        coreMotivations: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        },
        acutePainPoints: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        }
      },
      required: [
        "primarySegment",
        "demographics",
        "psychographics",
        "coreMotivations",
        "acutePainPoints"
      ]
    },
    keyConstraints: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    primaryValueHook: { type: SchemaType.STRING }
  },
  required: [
    "rawIdea",
    "problemStatement",
    "targetAudience",
    "keyConstraints",
    "primaryValueHook"
  ]
};

// ============================================================================
// STAGE 5 CHALLENGE SCHEMA
// ============================================================================

export const CHALLENGE_RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    overallCohesionScore: {
      type: SchemaType.INTEGER,
      description: "Overall alignment and cohesion score between 0 and 100"
    },
    critiqueItems: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          category: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["cliche", "contradiction", "audience_mismatch", "scalability_risk"]
          },
          severity: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["high", "medium", "low"]
          },
          description: { type: SchemaType.STRING },
          affectedStages: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          actionableRemedy: { type: SchemaType.STRING }
        },
        required: ["id", "category", "severity", "description", "affectedStages", "actionableRemedy"]
      }
    },
    proposedAlternatives: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          originalElement: { type: SchemaType.STRING },
          critiqueRef: { type: SchemaType.STRING },
          alternativeProposal: { type: SchemaType.STRING },
          reasoning: { type: SchemaType.STRING }
        },
        required: ["originalElement", "critiqueRef", "alternativeProposal", "reasoning"]
      }
    },
    verdictSummary: { type: SchemaType.STRING },
    passedValidation: { type: SchemaType.BOOLEAN }
  },
  required: [
    "overallCohesionScore",
    "critiqueItems",
    "proposedAlternatives",
    "verdictSummary",
    "passedValidation"
  ]
};

// ============================================================================
// GENERATOR FUNCTIONS WITH RETRY LOGIC
// ============================================================================

export interface GeminiRequestOptions {
  systemInstruction?: string;
  prompt: string;
  responseSchema: ResponseSchema;
  temperature?: number;
}

/**
 * Executes a structured Google Gemini API request with schema enforcement and exactly 1 retry.
 */
export async function generateGeminiStructuredJson<T>(
  options: GeminiRequestOptions
): Promise<T> {
  const { systemInstruction, prompt, responseSchema, temperature = 0.3 } = options;

  let attempts = 0;
  const maxAttempts = 2; // Initial + 1 retry

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: systemInstruction || "You are an elite, authoritative Brand Architect and Venture Strategist.",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: temperature
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) {
        throw new Error("Empty response received from Gemini API.");
      }

      const parsed = JSON.parse(text) as T;
      return parsed;
    } catch (error: unknown) {
      if (attempts >= maxAttempts) {
        throw error;
      }
      console.warn(`[Gemini Structured Retry] Attempt ${attempts} failed. Retrying once...`, error);
    }
  }

  throw new Error("Failed to generate structured data from Gemini after retry.");
}

/**
 * Stage 1 — Phase 0: Generates 2-3 distinct, FULLY SELF-CONTAINED interpretations of the raw idea.
 * Each interpretation pre-fills ALL quadrant fields (vision, problem, personas, domainLabel)
 * so when the user picks one, no second AI call is needed — the boxes fill instantly.
 */
export async function generateGeminiIdeaInterpretations(
  rawIdea: string
): Promise<Stage1InterpretResult> {
  const trimmedIdea = rawIdea.trim();
  const systemInstruction = `You are an elite startup co-founder and product strategist.
A founder just shared their rough idea: "${trimmedIdea}".

YOUR HIGHEST PRIORITY:
Directly adopt and prioritize the EXACT words, industry, audience, and mechanics given in the founder's raw idea.
NEVER generate generic, vague, or hardcoded options like "a simple self-service tool" or "a generic community".
If the founder mentions dogs, every option MUST be about dogs.
If the founder mentions food, architecture, finance, crypto, or education, every option MUST be tailored to that exact domain.

Generate 2 or 3 GENUINELY DIFFERENT, practical product takes for THIS SPECIFIC IDEA.
Each interpretation must be self-contained:
1. title: 5-7 punchy words capturing this specific angle (e.g. "On-Demand Dog Sitting Marketplace" or "Peer-to-Peer Dog Host Exchange")
2. summary: 1-2 plain-English sentences describing how THIS version works using the founder's concept.
3. whoItsFor: The specific real person who needs this (e.g. "Working dog owners commuting 8+ hours/day")
4. whatItDoes: Exactly what the product does in everyday words
5. coreVision: The inspiring big dream for THIS specific product
6. coreProblem: The actual friction it eliminates in this specific market
7. personaOptions: 3-5 hyper-specific real personas who would love this version
8. domainLabel: Concise 2-4 word product label (e.g. "Pet Care Marketplace")

Plain language only. Zero corporate buzzwords. Output strictly valid JSON matching the schema.`;

  const prompt = `The founder's raw startup idea is:
"${trimmedIdea}"

Extract the founder's core topic and words. Produce 2-3 tailored interpretations anchored directly to their idea. Return valid JSON only.`;

  return generateGeminiStructuredJson<Stage1InterpretResult>({
    systemInstruction,
    prompt,
    responseSchema: STAGE1_INTERPRET_SCHEMA,
    temperature: 0.5
  });
}


/**
 * Stage 1 — Phase 1: Generates 2-3 simple clarifying questions to understand the raw idea better.
 * Questions MUST be specific to the startup idea, not generic business questions.
 */
export async function generateGeminiClarifyQuestions(
  rawIdea: string
): Promise<Stage1ClarifyResult> {
  const systemInstruction = `You help people turn rough startup ideas into brands.

A person just shared their idea. Ask 2 to 3 SHORT, SPECIFIC questions to fill in the gaps that are genuinely unclear FROM THIS EXACT IDEA.

CRITICAL RULES — break any of these and you have failed:
- Every question MUST be about something SPECIFIC to this exact idea. Reference actual things from the idea.
- NEVER ask: "What stage are you at?", "How will you make money?", "Who is your target audience?", "What is your business model?", or ANY generic business question.
- Questions must feel like a curious friend asking a follow-up, not a consultant doing an intake form.
- Options must be short, concrete, and SPECIFIC to this idea — not generic categories.
- Plain everyday language only. Zero jargon.

Good example for a pet-sitting idea:
  Q: "Will pet sitters come to the owner's home, or will owners drop pets off somewhere?"
  Options: ["Sitters come to the owner's home", "Owners drop pets at the sitter's place", "Both — owners can choose"]

Bad example (NEVER DO THIS):
  Q: "What stage are you at?" — too generic, not specific to the idea
  Q: "Who is your target audience?" — generic, we can infer this
  Q: "What's your business model?" — generic, irrelevant at this stage

Return JSON with exactly 2 to 3 questions.`;

  const prompt = `The startup idea: "${rawIdea.trim()}"

Ask 2-3 short, specific questions about details that are genuinely unclear from reading this idea. Each question and its options must directly reference something from this specific idea.`;

  return generateGeminiStructuredJson<Stage1ClarifyResult>({
    systemInstruction,
    prompt,
    responseSchema: STAGE1_CLARIFY_SCHEMA,
    temperature: 0.5
  });
}

/**
 * Stage 1 — Phase 2: Fills the 4 discovery sections using raw idea + clarification answers.
 */
export async function generateGeminiDiscoveryProbe(
  rawIdea: string,
  clarifyAnswers?: Record<string, string>
): Promise<Stage1ProbeResult> {
  const answersText = clarifyAnswers && Object.keys(clarifyAnswers).length > 0
    ? `\n\nThe founder clarified:\n${Object.entries(clarifyAnswers).map(([k, v]) => `- ${k}: "${v}"`).join("\n")}`
    : "";

  const systemInstruction = `You help people understand and build their startup ideas. A person has shared a product idea.

Your job: fill in 4 key discovery sections. Be specific to THIS idea — never write generic filler.

For the 'ambiguities' array:
- Only include a question if something is GENUINELY unclear and SPECIFIC to this product.
- NEVER ask: "How will you make money?", "What is your business model?", "What stage are you at?", "Who is your target audience?", or any generic question.
- Each ambiguity question must reference something concrete from the product idea.
- If nothing is genuinely ambiguous, return an empty ambiguities array.
- Options must be specific to this idea, not generic buckets.

Write everything in plain, simple language — like explaining it to a smart friend, not writing a business report.
Return JSON strictly matching the schema.`;

  const prompt = `The startup idea: "${rawIdea.trim()}"${answersText}

Fill in the discovery sections. Make every question and every persona option specific to this exact idea.`;

  return generateGeminiStructuredJson<Stage1ProbeResult>({
    systemInstruction,
    prompt,
    responseSchema: STAGE1_PROBE_SCHEMA,
    temperature: 0.4
  });
}

/**
 * Stage 1 Synthesis: Generates the canonical DiscoverData JSON contract using Gemini.
 */
export async function generateGeminiDiscoverySynthesis(
  rawIdea: string,
  vision: string,
  problem: string,
  selectedPersonas: string[],
  ambiguityAnswers: Record<string, string>
): Promise<DiscoverData> {
  const systemInstruction = `You help founders build their brand from a rough idea.
Using their raw idea, vision, problem description, target people, and any clarifying answers they gave, write a clear brand discovery summary.
Use plain, easy-to-read language — no business jargon.
Respond strictly in JSON matching the schema.`;

  const prompt = `Build the discovery summary for this brand:
Raw Idea: "${rawIdea}"
Vision: "${vision}"
Problem: "${problem}"
Target People: ${JSON.stringify(selectedPersonas)}
Extra Context: ${JSON.stringify(ambiguityAnswers)}

Write it clearly so the founder can understand and share it.`;

  return generateGeminiStructuredJson<DiscoverData>({
    systemInstruction,
    prompt,
    responseSchema: STAGE1_SYNTHESIS_SCHEMA,
    temperature: 0.3
  });
}

/**
 * Stage 5 Critique: Executes adversarial critique using Google Gemini.
 */
export async function generateGeminiCritique(
  options: { systemInstruction?: string; prompt: string }
): Promise<ChallengeData> {
  return generateGeminiStructuredJson<ChallengeData>({
    systemInstruction: options.systemInstruction || "You are an adversarial venture brand critic and positioning validator.",
    prompt: options.prompt,
    responseSchema: CHALLENGE_RESPONSE_SCHEMA,
    temperature: 0.2
  });
}
