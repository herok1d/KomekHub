-- Run once in Supabase SQL Editor for an existing KomekHub project.
-- Atomically updates an application status and keeps profile volunteer hours consistent.

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

-- Status changes must go through the RPC so profile hours cannot drift.
drop policy if exists "Organization owners can update applications for own opportunities" on public.applications;
