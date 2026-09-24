Implementation Plan and Problem Statement: AI-Powered Brand Intelligence Product
1. Problem Statement Overview
The core challenge is to build an AI-powered product that transforms an incomplete, rough product or startup idea into a structured, useful, and launch-ready brand system. Founders typically begin with a single rough sentence, such as wanting to create an app that helps students find teammates. This initial idea lacks a defined audience, sharpened problem, established position, distinct personality, credible name, visual direction, and consistent voice.
The objective is to create a working product where an AI workflow meaningfully improves the reasoning, distinctiveness, and consistency of brand decisions, rather than merely outputting generic text. The system must explicitly avoid the "one-prompt trap" where a single idea is fed into one giant prompt to produce a single answer. Instead, the product must break the problem into deliberate stages, preserve context, and demonstrate how the system improves or checks its own work.
Required Output System
The final working experience must produce an exportable or shareable kit containing:
Idea and audience analysis.
Positioning and value proposition.
Brand personality and principles.
Naming directions with rationale.
Tagline and one-line pitch.
Visual design brief.
Brand voice and sample messages.
Consistency or quality checks.
Launch-ready content or assets.
2. Solution Architecture & Technical Stack
To manage context and API costs effectively, the application will use a decoupled, state-driven architecture.
Frontend: TypeScript React (Next.js or Vite) tailored for an interactive, step-by-step wizard UI.
Backend State Management: Supabase PostgreSQL database to store structured JSON outputs at each stage, ensuring progress is saved and users can pause/resume without losing AI context.
AI Pipeline: Stateless multiple API requests using Google Gemini (or Groq) to enforce strict JSON schemas at each stage.
Development Environment: Google Antigravity IDE utilizing branch mode for isolated subagent execution to prevent merge conflicts.
3. The 6-Stage AI Workflow Implementation
The application will execute a sequential prompt chain where the structured JSON output of one stage serves as the constrained context for the next.
Stage 1: Discover: The UI interviews the user to clarify the idea, constraints, and open questions. The AI extracts the core problem and target user into a concise JSON object before branding begins.
Stage 2: Position: The system defines the category, differentiator, value proposition, and competitive angle based on the Stage 1 JSON.
Stage 3: Shape: The AI develops naming territories with rationales, brand voice, and a message hierarchy. It selects three to five personality traits justified against the intended audience, explicitly including traits to avoid.
Stage 4: Visualize: The strategy is translated into a structured visual brief containing typography, color moods, composition, symbols, and imagery styles, alongside concepts to avoid.
Stage 5: Challenge: A critical evaluation loop checks if the name, tagline, voice, visuals, and launch message feel cohesive. It detects cliches, bias, and audience mismatches, flags conflicts, and proposes better alternatives.
Stage 6: Deliver: The system generates a landing-page headline, a one-line pitch, and social launch content while protecting the selected brand personality.
4. Antigravity IDE Collaboration Protocol
To execute parallel development among four team members without overwriting shared architecture, the team will adhere to a strict sandbox protocol.
Phase 1: Foundation (The Driver): One team leader initializes the main branch, generating the Next.js shell, Supabase schema.sql, and a global types.ts file defining the exact JSON contracts for all six stages. A mockBrandData.ts file is generated so the frontend team can build UI components immediately without consuming AI API tokens.
Phase 2: Sandbox Execution (The Branches): Team members isolate their Antigravity workspaces using branch mode (e.g., feat/stage1-discover). When prompting Antigravity, developers must explicitly restrict the agent from modifying files outside of their assigned directory and mandate an "Implementation Plan" artifact for review before code execution.
Phase 3: Integration (The Integrator Agent): Once local branches are completed, the team leader merges them into an integration branch. A fresh Antigravity agent is tasked strictly with wiring the isolated UI components into the global wizard flow, relying on types.ts to manage state transitions.

