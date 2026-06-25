-- Adds volunteer birth date support to profiles.
-- Safe to run multiple times.

alter table public.profiles
  add column if not exists birth_date date;

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
