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
import { ApiResponse } from "@/types";

// Union type for what the probe can return
type ProbeResponse = Stage1InterpretResult | Stage1ClarifyResult | Stage1ProbeResult;

export interface ProbeRequestBody {
  rawIdea: string;
  step?: "interpret" | "clarify" | "fill"; // "interpret" = show 2-3 idea readings, "clarify" = ask questions, "fill" = return 4 quadrants
  clarifyAnswers?: Record<string, string>; // answers from step 1
  confirmedIdea?: string; // user-edited/confirmed version of the idea from the interpret phase
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
    try {
      const interpretResult = await generateGeminiIdeaInterpretations(rawIdea);
      return NextResponse.json({
        error: false,
        data: interpretResult,
        stage: 1,
        provider: "gemini"
      });
    } catch (err: unknown) {
      console.warn("[Stage 1 Interpret]: Gemini failed, using fallback interpretations:", err);

      // Friendly fallback interpretations
      const fallback: Stage1InterpretResult = {
        interpretations: [
          {
            id: "interp_a",
            title: "A simple tool for everyday people",
            summary: "A straightforward product that helps regular people solve a common problem in their daily life without needing any special knowledge.",
            whoItsFor: "Anyone who faces this frustration regularly",
            whatItDoes: "Makes the hard thing simple and fast to do on your own"
          },
          {
            id: "interp_b",
            title: "A community-based solution",
            summary: "A place where people with the same problem can connect, share tips, and help each other out — combined with a useful tool.",
            whoItsFor: "People who want both a tool and a community",
            whatItDoes: "Brings together helpful people and a practical tool in one place"
          },
          {
            id: "interp_c",
            title: "A professional service made easy",
            summary: "Takes something people normally hire a professional for and makes it affordable and doable by anyone, right from their phone.",
            whoItsFor: "People who can't afford or don't want to hire an expert",
            whatItDoes: "Guides you step-by-step through what a professional would normally do for you"
          }
        ]
      };

      return NextResponse.json({
        error: false,
        data: fallback,
        stage: 1,
        provider: "gemini"
      });
    }
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
  try {
    const probeResult = await generateGeminiDiscoveryProbe(ideaForFill, body.clarifyAnswers);
    return NextResponse.json({
      error: false,
      data: probeResult,
      stage: 1,
      provider: "gemini"
    });
  } catch (err: unknown) {
    console.warn("[Stage 1 Fill]: Gemini failed, using fallback quadrant content:", err);

    const lower = rawIdea.toLowerCase();
    const isFintech = lower.includes("financ") || lower.includes("money") || lower.includes("tax");
    const isEdtech = lower.includes("student") || lower.includes("campus") || lower.includes("learn");

    const fallback: Stage1ProbeResult = {
      domainName: isFintech ? "Financial Tools" : isEdtech ? "Education & Learning" : "Software & Technology",
      coreVision: isFintech
        ? "Help everyday people and small businesses manage their money without needing a finance degree."
        : isEdtech
        ? "Make learning easier and more effective for students everywhere."
        : "Help people get things done faster by removing the friction from their daily work.",
      coreProblem: isFintech
        ? "Most money management tools are built for accountants, not real people \u2014 they\u2019re confusing, expensive, and take forever to set up."
        : isEdtech
        ? "Students waste too much time on tools and coordination instead of actually learning."
        : "People juggle too many disconnected apps and end up spending more time managing tools than doing real work.",
      personaOptions: isFintech
        ? [
            "Freelancers who stress about invoices and taxes",
            "Small business owners without a finance team",
            "Side-hustle creators trying to track income",
            "Self-employed consultants needing simple bookkeeping"
          ]
        : isEdtech
        ? [
            "College students preparing for exams",
            "Working professionals learning new skills",
            "High school students needing extra help",
            "Teachers looking for better classroom tools"
          ]
        : [
            "Solo founders running everything themselves",
            "Small teams without dedicated IT support",
            "Remote workers managing scattered tools",
            "Busy professionals who want to save time"
          ],
      ambiguities: [
        {
          id: "business_model",
          question: "How do you plan to make money from this?",
          contextWhyItMatters: "This shapes how we talk about value and who we focus on.",
          options: [
            "Free trial, then monthly subscription",
            "One-time purchase",
            "Charge businesses, not individuals",
            "Free now, paid later"
          ]
        }
      ]
    };

    // Merge clarify answers into the domain label if useful
    const answers = body.clarifyAnswers || {};
    if (answers.product_type) {
      fallback.domainName = `${answers.product_type} \u2014 ${fallback.domainName}`;
    }

    return NextResponse.json({
      error: false,
      data: fallback,
      stage: 1,
      provider: "gemini"
    });
  }
}

// Satisfy unused imports
const _unusedExport: ClarifyQuestion | IdeaInterpretation | null = null;
void _unusedExport;
