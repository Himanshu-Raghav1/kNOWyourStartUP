-- ============================================================================
-- Supabase Schema: AI-Powered Brand Intelligence System
-- Table: public.projects
-- ============================================================================

-- Ensure the UUID extension is enabled
create extension if not exists "uuid-ossp";

-- Projects table storing discrete stage state as structured JSONB
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null default 'Untitled Brand Project',
  current_stage smallint not null default 1 check (current_stage between 1 and 6),
  discover_data jsonb default null,
  position_data jsonb default null,
  shape_data jsonb default null,
  visualize_data jsonb default null,
  challenge_data jsonb default null,
  deliver_data jsonb default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments on table and columns for documentation
comment on table public.projects is 'Brand intelligence projects with sequential JSONB stage outputs';
comment on column public.projects.discover_data is 'Stage 1: Core problem, target audience profile, and constraints';
comment on column public.projects.position_data is 'Stage 2: Category, value proposition, and competitive differentiation';
comment on column public.projects.shape_data is 'Stage 3: Naming territories, brand voice, and personality traits';
comment on column public.projects.visualize_data is 'Stage 4: Visual design brief, color palettes, and typography pairings';
comment on column public.projects.challenge_data is 'Stage 5: Gemini adversarial reasoning, cliche detection, and remedies';
comment on column public.projects.deliver_data is 'Stage 6: Launch kit, headline, pitch, social posts, and guardrails';

-- Automatic updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger binding to projects table
drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.handle_updated_at();

-- Fast lookup indexes
create index if not exists idx_projects_created_at on public.projects (created_at desc);
create index if not exists idx_projects_current_stage on public.projects (current_stage);

-- Optional Row Level Security (RLS) setup
alter table public.projects enable row level security;

-- Default permissive policy for hackathon/development environment
create policy "Allow all actions for anonymous/authenticated users"
  on public.projects
  for all
  using (true)
  with check (true);
