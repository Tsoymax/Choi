alter table public.profiles
add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    name,
    district,
    address_type,
    phone
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Пользователь'
    ),
    null,
    'aka',
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (
  id,
  name,
  district,
  address_type,
  phone
)
select
  auth_users.id,
  coalesce(
    nullif(auth_users.raw_user_meta_data->>'name', ''),
    nullif(auth_users.raw_user_meta_data->>'full_name', ''),
    nullif(split_part(auth_users.email, '@', 1), ''),
    'Пользователь'
  ),
  null,
  'aka',
  null
from auth.users as auth_users
where not exists (
  select 1
  from public.profiles
  where profiles.id = auth_users.id
)
on conflict (id) do nothing;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
on public.profiles
for select
using (true);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
