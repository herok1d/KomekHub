-- Run once in Supabase SQL Editor for an existing KomekHub project.
-- Installs safe certificate issuance and public limited verification.

create sequence if not exists public.certificate_number_seq;

alter table public.certificates enable row level security;
create unique index if not exists certificates_application_id_unique_idx on public.certificates(application_id);
create unique index if not exists certificates_number_unique_idx on public.certificates(certificate_number);

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

-- No direct insert/update/delete policies. Issuance is only available through the RPC.
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
  select * into v_application
  from public.applications
  where id = p_application_id
  for update;

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
  select c.certificate_number, c.volunteer_name, c.organization_name, c.opportunity_title,
         c.city, c.volunteer_hours, c.issued_at
  from public.certificates c
  where upper(c.certificate_number) = upper(trim(search_certificate_number))
  limit 1;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
