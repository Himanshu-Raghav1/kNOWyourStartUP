/**
 * src/types/index.ts
 * Strict TypeScript Data Contracts for the 6-Stage Brand Intelligence System.
 * 
 * Directives:
 * 1. Zero Hallucination Policy: Types are exact and exhaustive.
 * 2. Downstream stages only receive pruned, structured JSON from upstream stages.
 * 3. Any types are strictly forbidden.
 */

// ============================================================================
// STAGE 1: DISCOVER DATA CONTRACT
// ============================================================================

export interface TargetAudienceProfile {
  primarySegment: string;
  demographics: string;
  psychographics: string;
  coreMotivations: string[];
  acutePainPoints: string[];
}

export interface DiscoverData {
  rawIdea: string;
  problemStatement: string;
  targetAudience: TargetAudienceProfile;
  keyConstraints: string[];
  primaryValueHook: string;
}

// ============================================================================
// STAGE 2: POSITION DATA CONTRACT
// ============================================================================

export interface CompetitiveDifferentiation {
  primaryCompetitorType: string;
  statusQuoAlternative: string;
  uniqueAngle: string;
}

export interface PositionData {
  marketCategory: string;
  targetUserSummary: string;
  coreDifferentiator: string;
  valueProposition: string;
  competitiveAngle: CompetitiveDifferentiation;
  positioningStatement: string;
}

// ============================================================================
// STAGE 3: SHAPE DATA CONTRACT (Naming & Voice)
// ============================================================================

export interface NamingOption {
  name: string;
  category: "invented" | "evocative" | "descriptive" | "compound";
  rationale: string;
  domainConcept: string;
  memorabilityScore: number; // 1 - 10
}

export interface BrandPersonalityTrait {
  trait: string;
  justification: string;
  behavioralExample: string;
}

export interface BrandVoice {
  toneDescriptors: string[];
  traitsToEmbody: BrandPersonalityTrait[];
  traitsToAvoid: string[];
  doSayExamples: string[];
  dontSayExamples: string[];
}

export interface MessagingPillar {
  pillar: string;
  description: string;
}

export interface ShapeData {
  selectedName: string;
  namingTerritories: NamingOption[];
  brandVoice: BrandVoice;
  taglineCandidates: string[];
  selectedTagline: string;
  messagingPillars: MessagingPillar[];
}

// ============================================================================
// STAGE 4: VISUALIZE DATA CONTRACT (Design Brief)
// ============================================================================

export interface ColorSwatch {
  name: string;
  hex: string;
  usageRole: "primary" | "secondary" | "accent" | "background" | "surface";
  emotionalAssociation: string;
}

export interface TypographySpec {
  headingFont: string;
  headingFallback: string;
  bodyFont: string;
  bodyFallback: string;
  pairingRationale: string;
}

export interface VisualizeData {
  colorPalette: ColorSwatch[];
  typography: TypographySpec;
  compositionStyle: string;
  logoAndSymbolConcepts: string[];
  imageryAndArtDirection: string[];
  visualConceptsToAvoid: string[];
}

// ============================================================================
// STAGE 5: CHALLENGE DATA CONTRACT (Gemini Reasoning & Critique)
// ============================================================================

export interface DetectedCritiqueItem {
  id: string;
  category: "cliche" | "contradiction" | "audience_mismatch" | "scalability_risk";
  severity: "high" | "medium" | "low";
  description: string;
  affectedStages: ("discover" | "position" | "shape" | "visualize")[];
  actionableRemedy: string;
}

export interface ProposedAlternative {
  originalElement: string;
  critiqueRef: string;
  alternativeProposal: string;
  reasoning: string;
}

export interface ChallengeData {
  overallCohesionScore: number; // 0 - 100
  critiqueItems: DetectedCritiqueItem[];
  proposedAlternatives: ProposedAlternative[];
  verdictSummary: string;
  passedValidation: boolean;
}

// ============================================================================
// STAGE 6: DELIVER DATA CONTRACT (Launch Kit)
// ============================================================================

export interface SocialLaunchPost {
  platform: "twitter" | "linkedin" | "product_hunt" | "instagram";
  hook: string;
  body: string;
  callToAction: string;
}

export interface BrandGuardrail {
  rule: string;
  whyItMatters: string;
}

export interface DeliverData {
  oneLinePitch: string;
  elevatorPitch: string;
  landingPageHero: {
    headline: string;
    subheadline: string;
    primaryCtaText: string;
    secondaryCtaText?: string;
  };
  launchSocialPosts: SocialLaunchPost[];
  brandGuardrails: BrandGuardrail[];
}

// ============================================================================
// SUPABASE DATABASE & PROJECT ENTITY
// ============================================================================

export interface BrandProject {
  id: string; // UUID v4
  title: string;
  current_stage: number; // 1 to 6
  created_at: string;
  updated_at: string;
  discover_data: DiscoverData | null;
  position_data: PositionData | null;
  shape_data: ShapeData | null;
  visualize_data: VisualizeData | null;
  challenge_data: ChallengeData | null;
  deliver_data: DeliverData | null;
}

// ============================================================================
// API REQUEST & RESPONSE ENVELOPES
// ============================================================================

export interface ApiSuccessResponse<T> {
  error: false;
  data: T;
  stage: number;
  provider: "groq" | "gemini";
}

export interface ApiErrorResponse {
  error: true;
  code: "LLM_PARSE_FAILURE" | "VALIDATION_ERROR" | "UPSTREAM_DATA_MISSING" | "INTERNAL_SERVER_ERROR";
  message: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
