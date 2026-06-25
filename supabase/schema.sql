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
  birth_date date,
  university text,
  languages text[] not null default '{}',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  volunteer_hours integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auth signup can return session = null when email confirmation is enabled.
-- This security-definer trigger creates the profile inside the database, where
-- it does not need to weaken profiles RLS for anonymous browser clients.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, role, city, birth_date)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    case
      when new.raw_user_meta_data ->> 'role' in ('volunteer', 'organization')
        then new.raw_user_meta_data ->> 'role'
      else 'volunteer'
    end,
    coalesce(nullif(new.raw_user_meta_data ->> 'city', ''), 'Astana'),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

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
  min_age integer check (min_age is null or (min_age >= 0 and min_age <= 120)),
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

create sequence if not exists public.certificate_number_seq;

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
drop policy if exists "Profiles are readable by owner" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
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

-- Organization application updates go through this transaction-safe RPC.
create or replace function public.update_application_status_with_hours(
  p_application_id uuid,
  p_new_status text,
  p_new_hours integer default 0
)
returns public.applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application public.applications%rowtype;
  v_new_hours integer;
  v_old_contribution integer;
  v_new_contribution integer;
  v_delta integer;
  v_profile_rows integer;
begin
  if p_new_status not in ('pending', 'accepted', 'rejected', 'completed', 'cancelled') then
    raise exception 'Invalid application status';
  end if;

  select app.*
  into v_application
  from public.applications app
  where app.id = p_application_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;

  if not exists (
    select 1
    from public.opportunities opp
    join public.organizations org on org.id = opp.organization_id
    where opp.id = v_application.opportunity_id
      and org.owner_id = auth.uid()
  ) then
    raise exception 'Only the owning organization can update this application';
  end if;

  v_new_hours := case when p_new_status = 'completed' then greatest(coalesce(p_new_hours, 0), 0) else 0 end;
  if p_new_status = 'completed' and v_new_hours < 1 then
    raise exception 'Volunteer hours are required when completing an application';
  end if;

  v_old_contribution := case when v_application.status = 'completed' then v_application.volunteer_hours else 0 end;
  v_new_contribution := case when p_new_status = 'completed' then v_new_hours else 0 end;
  v_delta := v_new_contribution - v_old_contribution;

  if v_delta <> 0 then
    update public.profiles
    set volunteer_hours = greatest(0, volunteer_hours + v_delta),
        updated_at = now()
    where user_id = v_application.user_id;

    get diagnostics v_profile_rows = row_count;
    if v_profile_rows <> 1 then
      raise exception 'Volunteer profile not found';
    end if;
  end if;

  update public.applications
  set status = p_new_status,
      completed_at = case
        when p_new_status = 'completed' then coalesce(v_application.completed_at, now())
        else null
      end,
      volunteer_hours = v_new_hours,
      updated_at = now()
  where id = p_application_id
  returning * into v_application;

  return v_application;
end;
$$;

revoke all on function public.update_application_status_with_hours(uuid, text, integer) from public, anon;
grant execute on function public.update_application_status_with_hours(uuid, text, integer) to authenticated;

drop policy if exists "Organization owners can update applications for own opportunities" on public.applications;

-- Saved opportunities: users save/unsave only for themselves.
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

-- Certificates: immutable records issued by the owning organization through an RPC.
drop policy if exists "Users can read own certificates" on public.certificates;
create policy "Users can read own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

drop policy if exists "Organization owners can read certificates for own opportunities" on public.certificates;
create policy "Organization owners can read certificates for own opportunities"
  on public.certificates for select
  using (
    exists (
      select 1 from public.organizations org
      where org.id = certificates.organization_id
        and org.owner_id = auth.uid()
    )
  );

drop policy if exists "Organization owners can create certificates for completed own applications" on public.certificates;

create or replace function public.issue_certificate_for_application(p_application_id uuid)
returns public.certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application public.applications%rowtype;
  v_opportunity public.opportunities%rowtype;
  v_organization public.organizations%rowtype;
  v_profile public.profiles%rowtype;
  v_certificate public.certificates%rowtype;
  v_number text;
begin
  select * into v_application from public.applications where id = p_application_id for update;
  if not found then raise exception 'Application not found'; end if;
  if v_application.status <> 'completed' or v_application.volunteer_hours <= 0 then
    raise exception 'Application must be completed with volunteer hours';
  end if;

  select * into v_opportunity from public.opportunities where id = v_application.opportunity_id;
  if not found or not v_opportunity.certificate_available then
    raise exception 'Certificate is not available for this opportunity';
  end if;

  select * into v_organization from public.organizations where id = v_opportunity.organization_id;
  if not found or v_organization.owner_id <> auth.uid() then
    raise exception 'Only the owning organization can issue this certificate';
  end if;

  select * into v_certificate from public.certificates where application_id = p_application_id;
  if found then return v_certificate; end if;

  select * into v_profile from public.profiles where user_id = v_application.user_id;
  if not found then raise exception 'Volunteer profile not found'; end if;

  loop
    v_number := 'KH-' || extract(year from now())::text || '-' || lpad(nextval('public.certificate_number_seq')::text, 4, '0');
    insert into public.certificates (
      application_id, user_id, opportunity_id, organization_id, certificate_number,
      volunteer_name, organization_name, opportunity_title, city, volunteer_hours, issued_at
    )
    values (
      v_application.id, v_application.user_id, v_opportunity.id, v_organization.id, v_number,
      coalesce(nullif(v_profile.full_name, ''), 'KomekHub volunteer'),
      v_organization.name, v_opportunity.title, v_opportunity.city, v_application.volunteer_hours, now()
    )
    on conflict do nothing
    returning * into v_certificate;

    if v_certificate.id is not null then exit; end if;
    select * into v_certificate from public.certificates where application_id = p_application_id;
    if found then exit; end if;
  end loop;
  return v_certificate;
end;
$$;

revoke all on function public.issue_certificate_for_application(uuid) from public, anon;
grant execute on function public.issue_certificate_for_application(uuid) to authenticated;

create or replace function public.issue_certificate_after_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed'
     and new.volunteer_hours > 0
     and exists (
       select 1 from public.opportunities opp
       where opp.id = new.opportunity_id
         and opp.certificate_available = true
     )
  then
    perform public.issue_certificate_for_application(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists issue_certificate_on_application_completion on public.applications;
create trigger issue_certificate_on_application_completion
  after insert or update of status, volunteer_hours on public.applications
  for each row execute function public.issue_certificate_after_completion();

create or replace function public.protect_issued_certificate_application()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.certificates where application_id = old.id)
     and (new.status <> 'completed' or new.volunteer_hours <> old.volunteer_hours)
  then
    raise exception 'Issued certificate locks completed status and volunteer hours';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_issued_certificate_application on public.applications;
create trigger protect_issued_certificate_application
  before update of status, volunteer_hours on public.applications
  for each row execute function public.protect_issued_certificate_application();

-- No update/delete policies for certificates: issued certificates are immutable.

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
  where upper(c.certificate_number) = upper(trim(search_certificate_number))
  limit 1;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
