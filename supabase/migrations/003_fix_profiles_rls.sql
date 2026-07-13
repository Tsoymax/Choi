alter table public.profiles
add column if not exists phone text;

insert into public.profiles (id, name, address_type, district, phone)
select
  auth_users.id,
  coalesce(
    nullif(auth_users.raw_user_meta_data->>'name', ''),
    nullif(auth_users.raw_user_meta_data->>'full_name', ''),
    ''
  ) as name,
  'aka' as address_type,
  null as district,
  null as phone
from auth.users as auth_users
where not exists (
  select 1
  from public.profiles
  where profiles.id = auth_users.id
)
on conflict (id) do nothing;

update public.profiles
set
  name = coalesce(
    nullif(auth_users.raw_user_meta_data->>'name', ''),
    nullif(auth_users.raw_user_meta_data->>'full_name', ''),
    profiles.name
  ),
  updated_at = now()
from auth.users as auth_users
where profiles.id = auth_users.id
  and coalesce(profiles.name, '') = ''
  and (
    nullif(auth_users.raw_user_meta_data->>'name', '') is not null
    or nullif(auth_users.raw_user_meta_data->>'full_name', '') is not null
  );

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);
