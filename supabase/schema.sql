-- KomekHub complete Supabase schema.
-- Run this first in Supabase SQL Editor on an empty project.

create extension if not exists pgcrypto;

-- 1. Profiles store app-specific user data linked to Supabase auth.users.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text,
  role text not null default 'volunteer' check (role in ('volunteer', 'organization')),
  city text,
  avatar_url text,
  university text,
  languages text[] not null default '{}',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  volunteer_hours integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Organizations are owned by authenticated users.
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  city text,
  logo_url text,
  contact_email text,
  phone text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Opportunities are volunteer listings published by organizations.
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  description text not null,
  city text not null,
  category text not null,
  format text not null,
  schedule text,
  languages text[] not null default '{}',
  badges text[] not null default '{}',
  requirements text,
  benefits text,
  volunteer_hours integer not null default 0,
  certificate_available boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Applications connect volunteers to opportunities.
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  message text,
  completed_at timestamptz,
  volunteer_hours integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

-- 5. Saved opportunities let volunteers bookmark listings.
create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

-- 6. Certificates are immutable records issued after completed applications.
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade not null unique,
  user_id uuid references auth.users(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  certificate_number text unique not null,
  volunteer_name text not null,
  organization_name text not null,
  opportunity_title text not null,
  city text not null,
  volunteer_hours integer not null check (volunteer_hours > 0),
  issued_at timestamptz not null default now(),
  certificate_url text
);

-- Helpful indexes for lookups and joins.
create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists organizations_owner_id_idx on public.organizations(owner_id);
create index if not exists opportunities_organization_id_idx on public.opportunities(organization_id);
create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_opportunity_id_idx on public.applications(opportunity_id);
create index if not exists saved_opportunities_user_id_idx on public.saved_opportunities(user_id);
create index if not exists certificates_certificate_number_idx on public.certificates(certificate_number);

-- Enable RLS for every table.
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.certificates enable row level security;

-- Profiles: users manage only their own profile.
create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Organizations: public read, owners manage their own organizations.
create policy "Organizations are publicly readable"
  on public.organizations for select
  using (true);

create policy "Owners can create organizations"
  on public.organizations for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own organizations"
  on public.organizations for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete own organizations"
  on public.organizations for delete
  using (auth.uid() = owner_id);

-- Opportunities: public read, organization owners manage listings for their organizations.
create policy "Opportunities are publicly readable"
  on public.opportunities for select
  using (true);

create policy "Organization owners can create opportunities"
  on public.opportunities for insert
  with check (
    exists (
      select 1 from public.organizations org
      where org.id = opportunities.organization_id
        and org.owner_id = auth.uid()
    )
  );

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

create policy "Organization owners can delete own opportunities"
  on public.opportunities for delete
  using (
    exists (
      select 1 from public.organizations org
      where org.id = opportunities.organization_id
        and org.owner_id = auth.uid()
    )
  );

-- Applications: volunteers apply/read own; organization owners read and update applications for their opportunities.
create policy "Logged in users can apply"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "Users can read own applications"
  on public.applications for select
  using (auth.uid() = user_id);

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

create policy "Organization owners can update applications for own opportunities"
  on public.applications for update
  using (
    exists (
      select 1
      from public.opportunities opp
      join public.organizations org on org.id = opp.organization_id
      where opp.id = applications.opportunity_id
        and org.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.opportunities opp
      join public.organizations org on org.id = opp.organization_id
      where opp.id = applications.opportunity_id
        and org.owner_id = auth.uid()
    )
  );

-- Saved opportunities: users save/unsave only for themselves.
create policy "Users can read own saved opportunities"
  on public.saved_opportunities for select
  using (auth.uid() = user_id);

create policy "Users can save opportunities for themselves"
  on public.saved_opportunities for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave own opportunities"
  on public.saved_opportunities for delete
  using (auth.uid() = user_id);

-- Certificates: users read their own. Public verification uses the limited RPC below.
create policy "Users can read own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

create policy "Organization owners can create certificates for completed own applications"
  on public.certificates for insert
  with check (
    exists (
      select 1
      from public.applications app
      join public.opportunities opp on opp.id = app.opportunity_id
      join public.organizations org on org.id = opp.organization_id
      where app.id = certificates.application_id
        and app.status = 'completed'
        and org.owner_id = auth.uid()
        and certificates.user_id = app.user_id
        and certificates.opportunity_id = app.opportunity_id
        and certificates.organization_id = org.id
    )
  );

-- No update/delete policies for certificates: issued certificates are immutable in the MVP.

-- Public verification endpoint with limited fields.
create or replace function public.verify_certificate(search_certificate_number text)
returns table (
  certificate_number text,
  volunteer_name text,
  organization_name text,
  opportunity_title text,
  city text,
  volunteer_hours integer,
  issued_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    c.certificate_number,
    c.volunteer_name,
    c.organization_name,
    c.opportunity_title,
    c.city,
    c.volunteer_hours,
    c.issued_at
  from public.certificates c
  where c.certificate_number = search_certificate_number
  limit 1;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
