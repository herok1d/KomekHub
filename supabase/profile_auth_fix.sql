-- Apply this file once in the Supabase SQL Editor for an existing KomekHub project.
-- It fixes profile creation when email confirmation causes auth.signUp to return
-- a user with session = null.

alter table public.profiles enable row level security;

alter table public.profiles
  add column if not exists birth_date date;

drop policy if exists "Profiles are readable by owner" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

-- Backfill profiles for auth users created before this fix.
insert into public.profiles (user_id, full_name, role, city, birth_date)
select
  users.id,
  coalesce(nullif(users.raw_user_meta_data ->> 'full_name', ''), split_part(users.email, '@', 1)),
  case
    when users.raw_user_meta_data ->> 'role' in ('volunteer', 'organization')
      then users.raw_user_meta_data ->> 'role'
    else 'volunteer'
  end,
  coalesce(nullif(users.raw_user_meta_data ->> 'city', ''), 'Astana'),
  nullif(users.raw_user_meta_data ->> 'birth_date', '')::date
from auth.users as users
on conflict (user_id) do nothing;
