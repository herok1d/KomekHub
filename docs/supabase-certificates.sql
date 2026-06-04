-- Optional Supabase migration for the KomekHub certificate MVP.
-- The current app is frontend-only; this file documents the intended backend shape.

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id),
  user_id uuid not null references auth.users(id),
  opportunity_id uuid not null references public.opportunities(id),
  organization_id uuid not null references public.organizations(id),
  certificate_number text unique not null,
  volunteer_name text not null,
  organization_name text not null,
  opportunity_title text not null,
  city text not null,
  volunteer_hours integer not null check (volunteer_hours > 0),
  issued_at timestamptz not null default now(),
  certificate_url text
);

alter table public.applications
  add column if not exists completed_at timestamptz,
  add column if not exists volunteer_hours integer not null default 0;

alter table public.certificates enable row level security;

create policy "Users can read own certificates"
  on public.certificates
  for select
  using (auth.uid() = user_id);

create policy "Organizations can create certificates for own opportunities"
  on public.certificates
  for insert
  with check (
    exists (
      select 1
      from public.opportunities o
      join public.organizations org on org.id = o.organization_id
      where o.id = certificates.opportunity_id
        and org.owner_id = auth.uid()
        and org.id = certificates.organization_id
    )
  );

create policy "Public certificate verification"
  on public.certificates
  for select
  using (certificate_number is not null);

create policy "No certificate edits after issuance"
  on public.certificates
  for update
  using (false);

create policy "No certificate deletion after issuance"
  on public.certificates
  for delete
  using (false);
