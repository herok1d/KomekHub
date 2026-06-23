alter table public.applications
  add column if not exists volunteer_response text not null default 'pending',
  add column if not exists assigned_role text,
  add column if not exists organization_note text;

alter table public.applications
  drop constraint if exists applications_volunteer_response_check;

alter table public.applications
  add constraint applications_volunteer_response_check
  check (volunteer_response in ('pending', 'accepted', 'declined'));

create index if not exists applications_volunteer_response_idx on public.applications(volunteer_response);

create or replace function public.set_volunteer_response_on_accept()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    new.volunteer_response := 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists set_volunteer_response_on_accept on public.applications;
create trigger set_volunteer_response_on_accept
before update of status on public.applications
for each row
execute function public.set_volunteer_response_on_accept();
