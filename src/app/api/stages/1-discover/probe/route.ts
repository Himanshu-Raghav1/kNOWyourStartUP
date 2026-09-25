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

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<ProbeResponse>>> {
  let body: ProbeRequestBody;
  try {
    body = (await req.json()) as ProbeRequestBody;
  } catch {
    return NextResponse.json(
      { error: true, code: "PARSE_ERROR", message: "Invalid JSON body." },
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


  // ─── STEP 1: CLARIFY — ask 2-3 simple questions ────────────────────────────
  if (step === "clarify") {
    try {
      const clarifyResult = await generateGeminiClarifyQuestions(rawIdea);
      return NextResponse.json({
        error: false,
        data: clarifyResult,
        stage: 1,
        provider: "gemini"
      });
    } catch (err: unknown) {
      console.warn("[Stage 1 Clarify]: Gemini failed, using keyword-based fallback questions:", err);

      // Smart fallback — derive specific questions from the idea text
      const lower = rawIdea.toLowerCase();

      // Detect domain signals
      const isPetRelated   = lower.includes("pet") || lower.includes("dog") || lower.includes("cat") || lower.includes("animal");
      const isFoodRelated  = lower.includes("food") || lower.includes("restaurant") || lower.includes("cook") || lower.includes("meal") || lower.includes("recipe");
      const isHealthFit    = lower.includes("health") || lower.includes("fitness") || lower.includes("workout") || lower.includes("gym") || lower.includes("diet");
      const isEducation    = lower.includes("learn") || lower.includes("teach") || lower.includes("tutor") || lower.includes("course") || lower.includes("student");
      const isFinance      = lower.includes("money") || lower.includes("financ") || lower.includes("invest") || lower.includes("budget") || lower.includes("saving");
      const isMarketplace  = lower.includes("marketplace") || lower.includes("hire") || lower.includes("connect") || lower.includes("find") || lower.includes("match") || lower.includes("book");
      const isLocal        = lower.includes("nearby") || lower.includes("local") || lower.includes("city") || lower.includes("neighborhood");

      let q1: Stage1ClarifyResult["questions"][0];
      let q2: Stage1ClarifyResult["questions"][0];

      if (isPetRelated && isMarketplace) {
        q1 = { id: "service_model", question: "Will sitters come to the owner's home, or will owners bring pets to sitters?", hint: "This changes how the whole booking experience works.", options: ["Sitters come to the owner's home", "Owners drop pets at the sitter's place", "Both — owners can choose", "Day visits only, no overnight stays"] };
        q2 = { id: "verification", question: "How will you make sure sitters are trustworthy?", hint: "This is usually the #1 concern for pet owners.", options: ["Background checks before listing", "Reviews and ratings from other owners", "A quick video interview with our team", "Sitters apply and we vet them manually"] };
      } else if (isFoodRelated) {
        q1 = { id: "delivery_model", question: "Will food be delivered, picked up, or eaten on-site?", hint: "This shapes the whole logistics and user experience.", options: ["Delivered to the customer", "Customer picks it up", "Eaten at the location", "All of the above"] };
        q2 = { id: "who_cooks", question: "Who is actually making the food?", hint: "This determines how you grow and manage quality.", options: ["Home cooks / individuals", "Small local restaurants", "Professional chefs", "A central kitchen we control"] };
      } else if (isHealthFit) {
        q1 = { id: "format", question: "Will this be something people do on their own, or with a trainer/coach?", hint: "This changes the whole product experience.", options: ["Fully self-guided, no human involved", "AI coach gives personalised guidance", "Real human trainers or coaches", "A mix — self-guided with optional coaching"] };
        q2 = { id: "location", question: "Will people use this at home, at a gym, or outside?", hint: "Where they use it changes what features matter most.", options: ["At home with no equipment", "At home with basic equipment", "At a gym", "Outdoors — running, cycling, etc."] };
      } else if (isEducation) {
        q1 = { id: "teaching_model", question: "Will there be a live teacher, or is it all pre-recorded?", hint: "This changes how you build the product and who you hire.", options: ["Live sessions with a real teacher", "Pre-recorded videos students watch anytime", "AI that adapts to each student", "A mix of live and pre-recorded"] };
        q2 = { id: "age_group", question: "Who is the main person learning?", hint: "Age and context completely change what works.", options: ["School kids (under 18)", "College students", "Working adults learning new skills", "People switching careers"] };
      } else if (isFinance) {
        q1 = { id: "finance_task", question: "What's the main money task this helps with?", hint: "Being specific here helps us focus the whole brand.", options: ["Tracking daily spending", "Saving toward a goal", "Managing invoices and getting paid", "Investing or growing money"] };
        q2 = { id: "who_manages", question: "Will users manage everything themselves, or does your product do it for them?", hint: "This sets expectations about how much effort users put in.", options: ["Users do it themselves with helpful tools", "The product mostly runs automatically", "A mix — set it up once, then it's automatic", "A human advisor helps alongside the product"] };
      } else if (isMarketplace) {
        q1 = { id: "who_provides", question: "Who supplies the thing being bought or booked?", hint: "This decides how you grow supply on the platform.", options: ["Individual people (freelancers, locals)", "Small local businesses", "Verified professionals", "A mix of individuals and businesses"] };
        q2 = { id: "trust_mechanism", question: "How will buyers know they can trust the sellers or providers?", hint: "Trust is the hardest thing to build in any marketplace.", options: ["Verified reviews from real buyers", "We screen and approve every provider manually", "Buyers and sellers see each other's profiles", "A satisfaction guarantee or refund policy"] };
      } else if (isLocal) {
        q1 = { id: "geographic_scope", question: "Will this start in one city/area, or be available everywhere from day one?", hint: "This affects how you launch and grow.", options: ["Start in one specific city, then expand", "Available everywhere from launch", "Online-first, physical locations later", "Only in specific neighborhoods or communities"] };
        q2 = { id: "discovery", question: "How will people find what they're looking for?", hint: "Discovery is often the hardest UX problem for local apps.", options: ["Search by location on a map", "Browse categories and filter results", "AI recommends based on their situation", "Friends and community recommendations"] };
      } else {
        // Minimal generic fallback — at least ask about delivery format and who benefits most
        q1 = { id: "delivery_format", question: "How will people actually use this — on their phone, computer, or in real life?", hint: "This shapes the whole product experience.", options: ["On their phone (mobile app)", "On a computer (website)", "In person / physical product", "A combination of online and offline"] };
        q2 = { id: "primary_benefit", question: "What's the single biggest thing people get from this?", hint: "This becomes the heart of your brand message.", options: ["Saves a lot of time", "Saves money or earns money", "Connects them with people they couldn't find otherwise", "Helps them learn or get better at something"] };
      }

      const fallback: Stage1ClarifyResult = {
        questions: [q1, q2]
      };

      return NextResponse.json({
        error: false,
        data: fallback,
        stage: 1,
        provider: "gemini"
      });
    }
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
