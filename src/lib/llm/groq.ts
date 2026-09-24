/**
 * src/lib/llm/groq.ts
 * Groq LLM Client Wrapper for High-Speed Generation (Stages 1, 2, 3, 4, 6).
 * 
 * Directives:
 * - Uses the openai Node.js SDK configured with Groq baseURL (https://api.groq.com/openai/v1).
 * - Default model: llama-3.3-70b-versatile.
 * - Enforces response_format: { type: "json_object" }.
 * - Performs exactly 1 automatic retry on JSON parse failure.
 * - Never uses 'any' types.
 */

import OpenAI from "openai";

const groqApiKey = process.env.GROQ_API_KEY || "";

export const groqClient = new OpenAI({
  apiKey: groqApiKey,
  baseURL: "https://api.groq.com/openai/v1"
});

export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export interface GroqGenerationOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Executes a structured JSON prompt against the Groq API with 1 automatic retry on parse failure.
 */
export async function generateGroqJson<T>(
  options: GroqGenerationOptions
): Promise<T> {
  const { systemPrompt, userPrompt, temperature = 0.4, maxTokens = 4096 } = options;

  let attempts = 0;
  const maxAttempts = 2; // Initial attempt + 1 retry

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await groqClient.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature,
        max_tokens: maxTokens
      });

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error("Empty response received from Groq LLM.");
      }

      const parsed: T = JSON.parse(rawContent) as T;
      return parsed;
    } catch (error: unknown) {
      if (attempts >= maxAttempts) {
        throw error;
      }
      // Log retry and execute the second attempt
      console.warn(`[Groq JSON Parse Retry] Attempt ${attempts} failed. Retrying once...`, error);
    }
  }

  throw new Error("Failed to generate structured data from Groq after retry.");
}
