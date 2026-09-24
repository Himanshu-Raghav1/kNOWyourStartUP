1. Agent Operational Directives
Zero Hallucination Policy: If a feature request, data structure, or API implementation detail is ambiguous, you are strictly forbidden from guessing. You must halt execution, output a markdown block detailing the missing information, and ask a direct clarifying question.
Artifact-Driven Execution: You must generate a markdown Implementation Plan detailing file paths, data interfaces, and API routing logic before writing any executable code. Wait for explicit user approval.
Scope Containment: Adhere strictly to the assigned working directory. Do not modify global state wrappers, database schemas, or types.ts unless explicitly assigned the role of Foundation Architect.
2. Architecture & Tech Stack
Frontend: TypeScript, React (Next.js App Router), Tailwind CSS.
Backend/Database: Supabase (PostgreSQL) using @supabase/supabase-js.
AI Providers: Groq API (High-speed generation) and Google Gemini API (Complex reasoning).
Data Pattern: Step-by-step state progression. Do not pass conversational prose between stages. Downstream stages must only receive the pruned, structured JSON outputs from upstream stages.
3. Dual-LLM Implementation Protocol
This system routes tasks based on reasoning complexity. You must implement the correct API client based on the assigned stage.
A. Groq API (Stages 1, 2, 3, 4, 6)
Use Case: High-speed structural generation (Discover, Position, Shape, Visualize, Deliver).
Implementation: Use the openai Node.js SDK pointing to [https://api.groq.com/openai/v1](https://api.groq.com/openai/v1).
Model: llama-3.3-70b-versatile or llama-3.1-8b-instant.
Enforcement: Pass response_format: { type: "json_object" } in the payload. The system prompt must explicitly map the required JSON keys to the TypeScript interfaces defined in types.ts.
B. Google Gemini API (Stage 5)
Use Case: Deep reasoning, critique, and validation (Challenge stage).
Implementation: Use the @google/generative-ai SDK.
Model: gemini-2.5-pro or gemini-3-flash.
Enforcement: The prompt must command the model to detect cliches, flag contradictions, and propose alternatives based on the context from Stages 1-4. Enforce strict typing by passing responseMimeType: "application/json" and the explicit responseSchema object in the configuration.
4. Supabase State Persistence
All brand project data is stored in a single Supabase projects table using uuid primary keys.
Stage outputs are stored in dedicated jsonb columns: discover_data, position_data, shape_data, visualize_data, challenge_data, and deliver_data.
Client-Side Sync: The React client must maintain optimistic UI state. Upon successful LLM generation, the client executes a Supabase update mutation to persist the JSON payload to the respective column before navigating the user to the next stage.
5. Coding & Commenting Standards
Mandatory Comments: All API routes must include block comments explaining the expected input payload, the LLM prompt strategy, and the expected JSON output shape. All complex React state transitions must have inline comments explaining the logic.
Error Handling: Wrap all LLM invocations in a try/catch block. Implement exactly one automatic retry if the JSON parsing fails.
Fallback Response: If the retry fails, return a strict HTTP 500 response:
{ "error": true, "code": "LLM_PARSE_FAILURE", "message": "Failed to generate structured data." }
Type Safety: any types are strictly prohibited. All API responses and React component props must be strongly typed against
