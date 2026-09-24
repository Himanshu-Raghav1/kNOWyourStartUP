# Team Task Division & Parallel Development Roadmap
**Repository**: [kNOWyourStartUP](https://github.com/Himanshu-Raghav1/kNOWyourStartUP)  
**System Architecture**: 6-Stage Sequential AI Brand Intelligence Pipeline  
**Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Groq API (Llama 3.3 70B), Google Gemini 2.5 Pro.

---

## 1. Quick Start Protocol (All Members)

When you clone this repository, run the following setup commands:

```bash
# 1. Install dependencies
bun install
# or: npm install

# 2. Configure environment variables
cp .env.local.example .env.local

# 3. Launch local dev server
bun run dev
# or: npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

> [!IMPORTANT]
> **Zero-Token Local UI Development**:
> You do **not** need live API keys to start building your UI components!
> Open `http://localhost:3000/wizard?mode=mock` to instantly load the pre-populated 6-stage reference brand project (**"Campfire"**) from `src/lib/mockBrandData.ts`.

---

## 2. Git Collaboration & Sandbox Rules

To ensure zero merge conflicts and allow all 4 members to work simultaneously:
1. **Branch Naming**: Each member creates their own feature branch off `main`.
2. **Strict Scope Containment**: Work **only** within your designated component folders and stage API routes.
3. **Immutable Contracts**: Do **not** modify `src/types/index.ts` without team consensus. Downstream stages consume only the pruned JSON contracts defined there.
4. **Pull Request Protocol**: When your stage UI and prompt logic are complete, create a PR targeting `main`.

---

## 3. Team Member Assignments

```
                                  TEAM DIVISION
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │ MEMBER 1: Lead Integrator (Wizard Shell, Supabase State Sync, Export Brand Kit) │
 └───────────────────────────────┬─────────────────────────────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│       MEMBER 2       │ │       MEMBER 3       │ │       MEMBER 4       │
│  Strategy Specialist │ │  Creative & Visual   │ │  Critic & Launch     │
│  Stage 1: Discover   │ │  Stage 3: Shape      │ │  Stage 5: Challenge  │
│  Stage 2: Position   │ │  Stage 4: Visualize  │ │  Stage 6: Deliver    │
│  (Groq Llama 3.3)    │ │  (Groq Llama 3.3)    │ │  (Gemini + Groq)     │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

### MEMBER 1: Lead Orchestrator (Wizard Shell, Database & Export)
* **Branch**: `feat/core-wizard-persistence`
* **Owned Files & Folders**:
  - `src/app/wizard/page.tsx` (Wizard master shell)
  - `src/app/api/projects/route.ts` (Project state persistence endpoint)
  - `src/components/shared/` (Header, Stepper bar, Stage indicators)
  - `supabase/schema.sql` (Supabase database setup)

#### Data Contracts:
- Full `BrandProject` entity from `src/types/index.ts`.

#### Step-by-Step Task Checklist:
- [ ] **Task 1.1 - Supabase Sync**: Connect `src/lib/supabaseClient.ts` to your Supabase instance. Verify that project updates persist to `discover_data`, `position_data`, etc.
- [ ] **Task 1.2 - Resume / History Modal**: Allow users to resume an existing project by UUID or load recent projects from the database.
- [ ] **Task 1.3 - Export Brand Kit**: Build an "Export Brand Kit" button in the header that compiles all completed stages into a clean, downloadable Markdown document or printable PDF.
- [ ] **Task 1.4 - Integration**: Review PRs from Members 2, 3, and 4, and plug their modular stage components into `src/app/wizard/page.tsx`.

---

### MEMBER 2: Strategy Specialist (Stages 1 & 2: Discover + Position)
* **Branch**: `feat/stage1-stage2-strategy`
* **Owned Files & Folders**:
  - `src/components/stage1-discover/` (Discovery interview and acute pain point UI)
  - `src/components/stage2-position/` (Market positioning card, competitive matrix)
  - `src/app/api/stages/1-discover/route.ts` (Groq Discovery route)
  - `src/app/api/stages/2-position/route.ts` (Groq Positioning route)

#### Data Contracts:
- **Input**: Raw founder idea (`string`)
- **Stage 1 Output**: `DiscoverData` (`problemStatement`, `targetAudience`, `keyConstraints`, `primaryValueHook`)
- **Stage 2 Output**: `PositionData` (`marketCategory`, `coreDifferentiator`, `valueProposition`, `positioningStatement`)

#### Step-by-Step Task Checklist:
- [ ] **Task 2.1 - Discovery UI (`stage1-discover`)**: Build an interactive card displaying the founder's raw input, extracted problem statement, and acute pain points with warning tags.
- [ ] **Task 2.2 - Positioning Hero (`stage2-position`)**: Build a prominent quote card displaying the positioning statement:
  > *"For [target] who [need], [Brand] is the [category] that [benefit] unlike [alternative]."*
- [ ] **Task 2.3 - Competitive Matrix**: Display the status-quo alternative and the unique competitive angle.
- [ ] **Task 2.4 - Groq Prompt Tuning**: Test `1-discover` and `2-position` with various rough sentences. Ensure prompts reject generic buzzwords and enforce high specificity.

---

### MEMBER 3: Creative Identity & Design Director (Stages 3 & 4: Shape + Visualize)
* **Branch**: `feat/stage3-stage4-creative`
* **Owned Files & Folders**:
  - `src/components/stage3-shape/` (Naming territories, Brand Voice "Do/Don't Say" grid)
  - `src/components/stage4-visualize/` (Color palette swatches, Typography pairing, Visual bento)
  - `src/app/api/stages/3-shape/route.ts` (Groq Naming & Voice route)
  - `src/app/api/stages/4-visualize/route.ts` (Groq Visual Brief route)

#### Data Contracts:
- **Input**: Pruned `PositionData` (Stage 2)
- **Stage 3 Output**: `ShapeData` (`namingTerritories`, `selectedName`, `brandVoice`, `taglineCandidates`)
- **Stage 4 Output**: `VisualizeData` (`colorPalette`, `typography`, `compositionStyle`, `logoAndSymbolConcepts`)

#### Step-by-Step Task Checklist:
- [ ] **Task 3.1 - Naming Territory Explorer (`stage3-shape`)**: Build interactive cards for the 4 naming styles (Invented, Evocative, Descriptive, Compound) with memorability scores, domain ideas, and a "Select Name" toggle.
- [ ] **Task 3.2 - Brand Voice Grid**: Create a two-column component displaying "Traits to Embody" (with behavioral quote examples) and "Traits to Avoid" (with strict anti-corporate rules).
- [ ] **Task 3.3 - Color Swatch Palette (`stage4-visualize`)**: Build 5 visual color cards displaying the hex code, emotional association, and a 1-click "Copy Hex" button.
- [ ] **Task 3.4 - Typography Pairing Card**: Render sample heading and body typography with the AI's design rationale.

---

### MEMBER 4: Adversarial Critic & Launch Strategist (Stages 5 & 6: Challenge + Deliver)
* **Branch**: `feat/stage5-stage6-challenge-deliver`
* **Owned Files & Folders**:
  - `src/components/stage5-challenge/` (Gemini Cohesion Scorecard, Cliche Flags, 1-Click Remedy Replacer)
  - `src/components/stage6-deliver/` (Landing Page Hero Mockup, Social Launch Post tabs, Brand Guardrails)
  - `src/app/api/stages/5-challenge/route.ts` (Google Gemini 2.5 Pro Adversarial Reasoner)
  - `src/app/api/stages/6-deliver/route.ts` (Groq Launch Kit Generator)

#### Data Contracts:
- **Input**: Stages 1–4 structured JSON (`DiscoverData`, `PositionData`, `ShapeData`, `VisualizeData`)
- **Stage 5 Output**: `ChallengeData` (`overallCohesionScore`, `critiqueItems`, `proposedAlternatives`)
- **Stage 6 Output**: `DeliverData` (`oneLinePitch`, `elevatorPitch`, `landingPageHero`, `launchSocialPosts`, `brandGuardrails`)

#### Step-by-Step Task Checklist:
- [ ] **Task 4.1 - Gemini Cohesion Scorecard (`stage5-challenge`)**: Build the 0–100 score dial and severity-tagged alert cards (Cliche, Contradiction, Audience Mismatch).
- [ ] **Task 4.2 - Actionable Remedy Replacer**: Allow the user to view Gemini's proposed alternative and click "Apply Remedy" to update their brand system.
- [ ] **Task 4.3 - Landing Page Hero Mockup (`stage6-deliver`)**: Build a real-time hero section preview with headline, subheadline, and primary/secondary CTA buttons.
- [ ] **Task 4.4 - Social Campaign Copy Cards**: Create tabbed cards for Twitter/X, LinkedIn, and Product Hunt launch posts with a 1-click "Copy Post" button.

---

## 4. How Downstream Stages Connect

Data flows **only as pruned JSON objects** from upstream to downstream:

```
[Founder Input] ──► Stage 1 (DiscoverData)
                          │
                          ▼
                    Stage 2 (PositionData)
                          │
                          ├─────────────────────────┐
                          ▼                         ▼
                    Stage 3 (ShapeData)       Stage 4 (VisualizeData)
                          │                         │
                          └───────────┬─────────────┘
                                      ▼
                                Stage 5 (ChallengeData - Gemini)
                                      │
                                      ▼
                                Stage 6 (DeliverData - Launch Kit)
```

No conversational history is passed between stages. Each stage receives strictly typed parameters, guaranteeing clean, predictable, and token-efficient AI generation.
