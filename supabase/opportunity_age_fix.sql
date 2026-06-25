-- Adds age requirements and cleans up legacy Online-as-city values.
-- Safe to run multiple times.

alter table public.opportunities
  add column if not exists min_age integer;

alter table public.opportunities
  drop constraint if exists opportunities_min_age_check;

alter table public.opportunities
  add constraint opportunities_min_age_check
  check (min_age is null or (min_age >= 0 and min_age <= 120));

create index if not exists opportunities_min_age_idx
  on public.opportunities (min_age);

update public.organizations
set city = 'Astana',
    updated_at = now()
where lower(coalesce(city, '')) = 'online';

update public.opportunities
set city = 'Kazakhstan',
    format = 'Online',
    updated_at = now()
where lower(coalesce(city, '')) = 'online';
