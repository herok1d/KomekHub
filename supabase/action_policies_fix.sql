-- Apply once in Supabase SQL Editor for an existing KomekHub project.
-- The unique constraints in schema.sql prevent duplicate saves and applications.

alter table public.saved_opportunities enable row level security;
alter table public.applications enable row level security;

drop policy if exists "Users can read own saved opportunities" on public.saved_opportunities;
create policy "Users can read own saved opportunities"
  on public.saved_opportunities for select
  using (auth.uid() = user_id);

drop policy if exists "Users can save opportunities for themselves" on public.saved_opportunities;
create policy "Users can save opportunities for themselves"
  on public.saved_opportunities for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can unsave own opportunities" on public.saved_opportunities;
create policy "Users can unsave own opportunities"
  on public.saved_opportunities for delete
  using (auth.uid() = user_id);

drop policy if exists "Logged in users can apply" on public.applications;
create policy "Logged in users can apply"
  on public.applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own applications" on public.applications;
create policy "Users can read own applications"
  on public.applications for select
  using (auth.uid() = user_id);

drop policy if exists "Organization owners can read applications for own opportunities" on public.applications;
create policy "Organization owners can read applications for own opportunities"
  on public.applications for select
  using (
    exists (
      select 1
      from public.opportunities opp
      join public.organizations org on org.id = opp.organization_id
      where opp.id = applications.opportunity_id
        and org.owner_id = auth.uid()
    )
  );
