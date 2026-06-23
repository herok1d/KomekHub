alter table public.opportunities
  add column if not exists status text not null default 'recruiting';

alter table public.opportunities
  drop constraint if exists opportunities_status_check;

alter table public.opportunities
  add constraint opportunities_status_check
  check (status in ('recruiting', 'closed', 'in_progress', 'completed'));

create index if not exists opportunities_status_idx on public.opportunities(status);

update public.opportunities
set status = 'recruiting'
where status is null;
