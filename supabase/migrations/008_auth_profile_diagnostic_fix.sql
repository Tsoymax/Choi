do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'public.profiles table does not exist';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'id'
      and data_type = 'uuid'
  ) then
    raise exception 'public.profiles.id must be uuid';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint constraint_info
    join pg_class table_info on table_info.oid = constraint_info.conrelid
    join pg_namespace namespace_info on namespace_info.oid = table_info.relnamespace
    where namespace_info.nspname = 'public'
      and table_info.relname = 'profiles'
      and constraint_info.contype = 'f'
      and constraint_info.confrelid = 'auth.users'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_id_auth_users_fkey
    foreign key (id) references auth.users(id) on delete cascade;
  end if;
end $$;

insert into public.profiles (
  id,
  name,
  address_type
)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data->>'name', ''),
    nullif(u.raw_user_meta_data->>'full_name', ''),
    split_part(u.email, '@', 1),
    'Пользователь'
  ),
  'aka'
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
)
on conflict (id) do nothing;

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists profiles_public_select on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_public_select
on public.profiles
for select
using (true);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    name,
    district,
    address_type
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
    'aka'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
