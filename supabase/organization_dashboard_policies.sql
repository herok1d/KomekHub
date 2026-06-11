-- Run once in Supabase SQL Editor for an existing KomekHub project.
-- These policies support the organization dashboard without exposing unrelated data.

alter table public.organizations enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Owners can create organizations" on public.organizations;
create policy "Owners can create organizations"
  on public.organizations for insert
  with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.role = 'organization'
    )
  );

drop policy if exists "Owners can update own organizations" on public.organizations;
create policy "Owners can update own organizations"
  on public.organizations for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Organization owners can create opportunities" on public.opportunities;
create policy "Organization owners can create opportunities"
  on public.opportunities for insert
  with check (
    exists (
      select 1 from public.organizations org
      where org.id = opportunities.organization_id
        and org.owner_id = auth.uid()
    )
  );

drop policy if exists "Organization owners can update own opportunities" on public.opportunities;
create policy "Organization owners can update own opportunities"
  on public.opportunities for update
  using (
    exists (
      select 1 from public.organizations org
      where org.id = opportunities.organization_id
        and org.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organizations org
      where org.id = opportunities.organization_id
        and org.owner_id = auth.uid()
    )
  );

drop policy if exists "Organization owners can delete own opportunities" on public.opportunities;
create policy "Organization owners can delete own opportunities"
  on public.opportunities for delete
  using (
    exists (
      select 1 from public.organizations org
      where org.id = opportunities.organization_id
        and org.owner_id = auth.uid()
    )
  );

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

-- Application status updates intentionally have no direct update policy.
-- Run volunteer_hours_fix.sql and use its transaction-safe RPC instead.
drop policy if exists "Organization owners can update applications for own opportunities" on public.applications;

drop policy if exists "Organization owners can read applicant profiles" on public.profiles;
create policy "Organization owners can read applicant profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.applications app
      join public.opportunities opp on opp.id = app.opportunity_id
      join public.organizations org on org.id = opp.organization_id
      where app.user_id = profiles.user_id
        and org.owner_id = auth.uid()
    )
  );
