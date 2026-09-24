/**
 * src/lib/llm/gemini.ts
 * Google Gemini LLM Client Wrapper for Deep Reasoning & Critique (Stage 5 Validator).
 * 
 * Directives:
 * - Uses the @google/generative-ai SDK.
 * - Model: gemini-2.5-pro or gemini-3-flash (configurable via GEMINI_MODEL).
 * - Enforces responseMimeType: "application/json" and explicit responseSchema.
 * - Detects cliches, flags contradictions, and proposes actionable alternatives.
 * - Performs exactly 1 automatic retry on failure.
 * - Never uses 'any' types.
 */

import { GoogleGenerativeAI, SchemaType, ResponseSchema } from "@google/generative-ai";
import { ChallengeData } from "@/types";

const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiApiKey);

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";

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
            enum: ["cliche", "contradiction", "audience_mismatch", "scalability_risk"]
          },
          severity: {
            type: SchemaType.STRING,
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

export interface GeminiCritiqueOptions {
  systemInstruction?: string;
  prompt: string;
}

/**
 * Executes adversarial Stage 5 critique using Google Gemini with structured JSON schema.
 */
export async function generateGeminiCritique(
  options: GeminiCritiqueOptions
): Promise<ChallengeData> {
  const { systemInstruction, prompt } = options;

  let attempts = 0;
  const maxAttempts = 2; // Initial + 1 retry

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: systemInstruction || "You are an adversarial venture brand critic and positioning validator.",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: CHALLENGE_RESPONSE_SCHEMA,
          temperature: 0.2
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (!text) {
        throw new Error("Empty response received from Gemini API.");
      }

      const parsed: ChallengeData = JSON.parse(text) as ChallengeData;
      return parsed;
    } catch (error: unknown) {
      if (attempts >= maxAttempts) {
        throw error;
      }
      console.warn(`[Gemini Critique Retry] Attempt ${attempts} failed. Retrying once...`, error);
    }
  }

  throw new Error("Failed to generate structured critique data from Gemini after retry.");
}
