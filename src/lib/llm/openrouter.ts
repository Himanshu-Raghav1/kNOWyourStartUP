/**
 * src/lib/llm/openrouter.ts
 * OpenRouter LLM Client Wrapper for Deep Adversarial Critique & Challenge (Stage 5).
 * Configured with Qwen (qwen/qwen3.8-27b) or custom OpenRouter model.
 */

const openRouterApiKey =
  process.env.OPENROUTER_API_KEY ||
  process.env.openrouter_api ||
  "";

export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "qwen/qwen3.8-27b";

export interface OpenRouterGenerationOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Extracts and parses valid JSON from LLM output, stripping markdown fences if present.
 */
function extractJson<T>(text: string): T {
  let cleaned = text.trim();

  // Strip markdown code fences anywhere in text
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) {
    cleaned = match[1].trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  // Find outermost JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned) as T;
}

/**
 * Executes a structured JSON prompt against OpenRouter API with 1 retry.
 */
export async function generateOpenRouterJson<T>(
  options: OpenRouterGenerationOptions
): Promise<T> {
  const {
    systemPrompt = "You are an elite, unsparing brand critic and venture positioning auditor.",
    userPrompt,
    temperature = 0.2,
    maxTokens = 2500
  } = options;

  if (!openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "HTTP-Referer": "https://knowyourstartup.app",
          "X-Title": "kNOWyourStartUP",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
          reasoning: { max_tokens: 400 }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenRouter HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const choice = data.choices?.[0];
      const content = choice?.message?.content || choice?.message?.reasoning;
      if (!content) {
        throw new Error("Empty content received from OpenRouter.");
      }

      const parsed = extractJson<T>(content);
      return parsed;
    } catch (error: unknown) {
      if (attempts >= maxAttempts) {
        throw error;
      }
      console.warn(`[OpenRouter Retry] Attempt ${attempts} failed. Retrying once...`, error);
    }
  }

  throw new Error("Failed to generate structured data from OpenRouter after retry.");
}
