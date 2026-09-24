/**
 * src/lib/mockBrandData.ts
 * 
 * Complete 6-Stage Reference Project for immediate zero-token UI development.
 * Based on the canonical problem statement:
 * "An app that helps university students find complementary project teammates
 * based on verified work styles and technical commitments."
 */

import { BrandProject } from "@/types";

export const MOCK_BRAND_PROJECT: BrandProject = {
  id: "e4a2c589-9817-4bf6-b514-f865f1a92021",
  title: "Campfire (Student Teammate Matcher)",
  current_stage: 6,
  created_at: "2026-09-24T18:00:00.000Z",
  updated_at: "2026-09-24T18:30:00.000Z",

  // STAGE 1: DISCOVER
  discover_data: {
    rawIdea: "I want to create an app that helps students find teammates for hackathons and class projects.",
    problemStatement:
      "University students routinely get paired with unresponsive or mismatched teammates on high-stakes projects, causing academic stress, uneven workloads, and missed hackathon deadlines due to a lack of verified accountability.",
    targetAudience: {
      primarySegment: "Undergraduate STEM & Design Students (Ages 18-23)",
      demographics: "CS, Engineering, and UI/UX majors at 4-year universities actively building portfolios.",
      psychographics:
        "Ambitious, project-driven, terrified of being stuck with freeloaders, highly collaborative but skeptical of traditional campus forums.",
      coreMotivations: [
        "Win hackathons and ship functional capstone projects",
        "Build a credible portfolio with reliable partners",
        "Avoid carrying entire team workloads alone"
      ],
      acutePainPoints: [
        "Teammates ghosting 48 hours before project submission",
        "Skill-level dishonesty during informal meetups",
        "Awkwardness of firing or confronting unproductive peers"
      ]
    },
    keyConstraints: [
      "Must not feel like a corporate recruiting tool like LinkedIn",
      "Must foster immediate trust and fast onboarding within 3 minutes",
      "Must work across both semester-long courses and 36-hour hackathons"
    ],
    primaryValueHook: "Find project partners with verified commitment scores and working-style compatibility."
  },

  // STAGE 2: POSITION
  position_data: {
    marketCategory: "Peer-to-Peer Collaborative Builder Network",
    targetUserSummary: "Driven university creators seeking high-accountability project partners",
    coreDifferentiator:
      "Proof-of-work commitment ratings and working-style matching instead of superficial resumes and static bios.",
    valueProposition:
      "Never get ghosted on a project again: connect with verified, like-minded student builders ready to ship.",
    competitiveAngle: {
      primaryCompetitorType: "Campus Discord Servers & Generic Student Portals",
      statusQuoAlternative: "Frantic last-minute WhatsApp group chats and awkward classroom announcements",
      uniqueAngle: "Objective commitment histories and reciprocal peer vouching before team formation"
    },
    positioningStatement:
      "For student builders who are tired of carrying unproductive group projects, Campfire is the peer builder network that guarantees committed teammates through verified working-style matching, unlike chaotic Discord channels or lifeless job boards."
  },

  // STAGE 3: SHAPE
  shape_data: {
    selectedName: "Campfire",
    namingTerritories: [
      {
        name: "Campfire",
        category: "evocative",
        rationale: "Conjures warmth, gathering around a common spark, shared stories, and camaraderie.",
        domainConcept: "joincampfire.app",
        memorabilityScore: 9
      },
      {
        name: "SquadUp",
        category: "compound",
        rationale: "Action-oriented and youthful, directly implies rallying a crew for a mission.",
        domainConcept: "squadup.dev",
        memorabilityScore: 7
      },
      {
        name: "Cohort",
        category: "descriptive",
        rationale: "Clean and academic, but risks feeling clinical and administrative.",
        domainConcept: "cohortapp.io",
        memorabilityScore: 6
      },
      {
        name: "Kith",
        category: "invented",
        rationale: "Old English root for familiar friends and collective knowledge; sharp and modern.",
        domainConcept: "kithbuilder.com",
        memorabilityScore: 8
      }
    ],
    selectedTagline: "Build with people who show up.",
    taglineCandidates: [
      "Build with people who show up.",
      "The end of group project ghosting.",
      "Gather your crew. Ship your vision.",
      "Where reliable student builders unite."
    ],
    brandVoice: {
      toneDescriptors: ["Candid", "Energizing", "Direct", "Empathetic"],
      traitsToEmbody: [
        {
          trait: "Relatable & Candid",
          justification: "Students distrust corporate jargon; they respect honest talk about group work friction.",
          behavioralExample: "Calling out 'project ghosting' directly instead of saying 'unoptimized team alignment'."
        },
        {
          trait: "Momentum-Driven",
          justification: "Inspires students from passive complaining to active building.",
          behavioralExample: "Ending copy with actionable momentum: 'Find your crew in 90 seconds.'"
        },
        {
          trait: "Fiercely Protective of Builders",
          justification: "Validates the pain of students who routinely carry freeloading teammates.",
          behavioralExample: "Rewarding consistent contributors with visible badges and peer vouching."
        }
      ],
      traitsToAvoid: [
        "Corporate HR jargon (e.g., 'synergize', 'talent pool', 'human capital')",
        "Overly childish gamification or cringe meme slang that ages poorly",
        "Pretentious Silicon Valley elitism"
      ],
      doSayExamples: [
        "No ghosting. No excuses. Just builders.",
        "Match by commit history and sleep schedules.",
        "Your project deserves teammates who care as much as you do."
      ],
      dontSayExamples: [
        "Leverage synergistic student human capital.",
        "Join our lit squad fam, no cap!",
        "A platform for pre-seed venture candidate acquisition."
      ]
    },
    messagingPillars: [
      {
        pillar: "Verified Accountability",
        description: "Reputation earned through shipped projects and peer attendance ratings."
      },
      {
        pillar: "Working-Style Compatibility",
        description: "Align on working hours, communication cadence, and ambition levels before saying yes."
      },
      {
        pillar: "Frictionless Assembly",
        description: "Form a complete 4-person hackathon team in minutes, not days."
      }
    ]
  },

  // STAGE 4: VISUALIZE
  visualize_data: {
    colorPalette: [
      {
        name: "Obsidian Core",
        hex: "#0E1015",
        usageRole: "background",
        emotionalAssociation: "Modern, focused developer canvas that feels grounded and premium."
      },
      {
        name: "Signal Ember",
        hex: "#FF542E",
        usageRole: "primary",
        emotionalAssociation: "Urgency, energy, creative spark, and the warmth of a literal campfire."
      },
      {
        name: "Electric Citron",
        hex: "#E8FF54",
        usageRole: "accent",
        emotionalAssociation: "High-contrast spark for notifications, verified tags, and active status."
      },
      {
        name: "Cool Slate",
        hex: "#1F242F",
        usageRole: "surface",
        emotionalAssociation: "Structured hierarchy for cards, profile tiles, and telemetry modules."
      },
      {
        name: "Starlight White",
        hex: "#F5F7FA",
        usageRole: "secondary",
        emotionalAssociation: "Crisp legibility for high-density typographical scanning."
      }
    ],
    typography: {
      headingFont: "Plus Jakarta Sans",
      headingFallback: "system-ui, sans-serif",
      bodyFont: "Inter",
      bodyFallback: "-apple-system, BlinkMacSystemFont, sans-serif",
      pairingRationale:
        "Plus Jakarta Sans delivers punchy, modern geometric authority in titles, while Inter provides neutral clarity for dense developer stats and teammate criteria."
    },
    compositionStyle: "Modular bento-grid layouts with subtle dark glassmorphic cards and crisp 1px borders.",
    logoAndSymbolConcepts: [
      "Geometric flame icon constructed from intersecting brackets `< />` forming a spark",
      "Minimalist campfire logs forming an abstract 'C' monogram",
      "Dynamic pulsing ember indicator signifying live project matchmaking"
    ],
    imageryAndArtDirection: [
      "Authentic photos of student collaborators in workshop settings with ambient warm lighting",
      "Close-up terminal screens and wireframe sketches over generic stock photos",
      "Dark-mode UI snippets highlighting verified teammate scorecards"
    ],
    visualConceptsToAvoid: [
      "Clichéd cartoon campfires with marshmallow sticks",
      "Generic corporate blue gradients reminiscent of LinkedIn or Zoom",
      "Uncanny 3D corporate cartoon characters (Corporate Memphis style)"
    ]
  },

  // STAGE 5: CHALLENGE (Gemini Adversarial Validation)
  challenge_data: {
    overallCohesionScore: 88,
    critiqueItems: [
      {
        id: "CRIT-01",
        category: "cliche",
        severity: "medium",
        description:
          "The name 'Campfire' combined with warm ember colors risks drifting into literal wilderness outdoor tropes if not anchored by tech-forward graphic restraint.",
        affectedStages: ["shape", "visualize"],
        actionableRemedy:
          "Strictly avoid wood or tent motifs; render the spark icon using code syntax symbols or stark geometric vectors."
      },
      {
        id: "CRIT-02",
        category: "contradiction",
        severity: "low",
        description:
          "Stating 'no corporate jargon' while referencing 'reciprocal peer vouching mechanisms' in the positioning statement creates slight tonal dissonance.",
        affectedStages: ["position", "shape"],
        actionableRemedy:
          "Simplify external marketing copy to 'teammate reviews' or 'verified track records' while reserving academic terminology for internal docs."
      },
      {
        id: "CRIT-03",
        category: "scalability_risk",
        severity: "medium",
        description:
          "Strict commitment scoring might alienate novice first-time hackathon attendees who have no prior project history.",
        affectedStages: ["discover", "position"],
        actionableRemedy:
          "Introduce a 'First-Timer Fast-Track' badge based on enthusiasm and quick skill self-assessment rather than historical review volume alone."
      }
    ],
    proposedAlternatives: [
      {
        originalElement: "Campfire literal fire icon",
        critiqueRef: "CRIT-01",
        alternativeProposal: "Monoline polygonal spark crafted from `{}` syntax brackets",
        reasoning: "Preserves the flame metaphor while firmly positioning the product in the developer/designer space."
      },
      {
        originalElement: "Reciprocal peer vouching",
        critiqueRef: "CRIT-02",
        alternativeProposal: "Teammate Proof",
        reasoning: "Direct, Punchy, fits the candid tone descriptor."
      }
    ],
    verdictSummary:
      "Exceptionally strong and distinctive positioning. The anti-ghosting value proposition directly addresses acute student pain. Addressing the visual cliche risk and first-timer onboarding will make the brand bulletproof.",
    passedValidation: true
  },

  // STAGE 6: DELIVER
  deliver_data: {
    oneLinePitch: "The verified teammate matching network where student builders ship without getting ghosted.",
    elevatorPitch:
      "Every semester, thousands of ambitious students join hackathons and capstones only to watch their grades and morale tank when teammates disappear. Campfire eliminates project ghosting by pairing student designers and engineers based on verified working styles, commitment stakes, and real proof of work. No fluff, no deadweight—just builders who ship.",
    landingPageHero: {
      headline: "Stop building with strangers who ghost.",
      subheadline:
        "Campfire matches university engineers and designers by work style, schedule, and verified track records. Find your hackathon crew in 3 minutes.",
      primaryCtaText: "Find Your Teammates",
      secondaryCtaText: "Explore Live Projects"
    },
    launchSocialPosts: [
      {
        platform: "twitter",
        hook: "Group projects don't have to be a horror story.",
        body:
          "We've all carried a 4-person team at 3 AM while someone contributed 'formatting.'\n\nWe built @CampfireApp to solve this permanently: match with student builders based on verified commitment scores and working hours.\n\nLaunching on 12 campuses today:",
        callToAction: "claim your handle -> joincampfire.app"
      },
      {
        platform: "linkedin",
        hook: "The #1 predictor of hackathon failure isn't technical skill—it's team accountability.",
        body:
          "Students don't need another generic networking site with inflated resume bullet points. They need to know: Will you show up? Do you code in TypeScript? Are you online at midnight or 6 AM?\n\nPleased to introduce Campfire: peer-matched collaborative teams for high-performing student creators.",
        callToAction: "Read our launch manifesto: joincampfire.app/manifesto"
      },
      {
        platform: "product_hunt",
        hook: "Campfire: Tinder for Hackathon Teams, Minus the Catfishing.",
        body:
          "Hey PH! We built Campfire because university team formation is fundamentally broken. We pair student builders using verified working styles, commitment deposits, and peer reviews so you never get stuck holding the bag again.",
        callToAction: "Check us out and share feedback for exclusive early student badges!"
      }
    ],
    brandGuardrails: [
      {
        rule: "Never use corporate recruiting terminology",
        whyItMatters: "The moment Campfire sounds like Handshake or LinkedIn, student peer trust evaporates."
      },
      {
        rule: "Keep the UI dark-mode first with sharp high-contrast accents",
        whyItMatters: "Reinforces late-night hackathon culture and high-utility developer aesthetics."
      },
      {
        rule: "Every claim of skill must be backed by a link or peer vouch",
        whyItMatters: "Accountability is the brand's cornerstone; unverifiable claims destroy core credibility."
      }
    ]
  }
};
