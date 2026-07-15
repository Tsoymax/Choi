alter table public.profiles
add column if not exists role text not null default 'user';

alter table public.profiles
add column if not exists is_blocked boolean not null default false;

alter table public.profiles
add column if not exists blocked_until timestamptz;

alter table public.profiles
add column if not exists block_reason text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
    add constraint profiles_role_check
    check (role in ('user', 'moderator', 'admin'));
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'listings_status_check'
  ) then
    alter table public.listings drop constraint listings_status_check;
  end if;

  alter table public.listings
  add constraint listings_status_check
  check (status in ('active', 'reserved', 'sold', 'archived', 'hidden', 'blocked'));
end $$;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  reported_user_id uuid references auth.users(id) on delete cascade,
  reason text not null,
  comment text,
  status text not null default 'open',
  moderator_note text,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint reports_status_check check (status in ('open', 'reviewing', 'resolved', 'rejected')),
  constraint reports_target_check check (listing_id is not null or reported_user_id is not null)
);

create unique index if not exists reports_one_active_listing_report_idx
on public.reports (reporter_id, listing_id)
where listing_id is not null and status in ('open', 'reviewing');

create unique index if not exists reports_one_active_user_report_idx
on public.reports (reporter_id, reported_user_id)
where reported_user_id is not null and status in ('open', 'reviewing');

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id),
  target_user_id uuid references auth.users(id),
  listing_id uuid references public.listings(id),
  report_id uuid references public.reports(id),
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);

create or replace function public.is_moderator()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('moderator', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.profile_role_for(p_user_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = p_user_id;
$$;

create or replace function public.current_profile_is_blocked()
returns boolean
language sql
security definer
set search_path = public
as $$
  select is_blocked from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_blocked_until()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  select blocked_until from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_block_reason()
returns text
language sql
security definer
set search_path = public
as $$
  select block_reason from public.profiles where id = auth.uid();
$$;

alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;

drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own
on public.reports for insert
to authenticated
with check (
  reporter_id = auth.uid()
  and (
    listing_id is null
    or exists (
      select 1
      from public.listings
      where listings.id = reports.listing_id
        and listings.user_id <> auth.uid()
    )
  )
  and (
    reported_user_id is null
    or reported_user_id <> auth.uid()
  )
);

drop policy if exists reports_select_own_or_moderator on public.reports;
create policy reports_select_own_or_moderator
on public.reports for select
to authenticated
using (reporter_id = auth.uid() or public.is_moderator());

drop policy if exists reports_update_moderator on public.reports;
create policy reports_update_moderator
on public.reports for update
to authenticated
using (public.is_moderator())
with check (public.is_moderator());

drop policy if exists moderation_actions_select_moderator on public.moderation_actions;
create policy moderation_actions_select_moderator
on public.moderation_actions for select
to authenticated
using (public.is_moderator());

drop policy if exists moderation_actions_insert_moderator on public.moderation_actions;
create policy moderation_actions_insert_moderator
on public.moderation_actions for insert
to authenticated
with check (public.is_moderator() and moderator_id = auth.uid());

drop policy if exists profiles_select_public on public.profiles;
drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy profiles_select_public
on public.profiles for select
using (true);

drop policy if exists profiles_update_own_safe on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own_safe
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_profile_role()
  and is_blocked = public.current_profile_is_blocked()
  and coalesce(blocked_until, 'epoch'::timestamptz) =
      coalesce(public.current_profile_blocked_until(), 'epoch'::timestamptz)
  and coalesce(block_reason, '') =
      coalesce(public.current_profile_block_reason(), '')
);

drop policy if exists profiles_update_moderator on public.profiles;
create policy profiles_update_moderator
on public.profiles for update
to authenticated
using (public.is_moderator())
with check (
  public.is_moderator()
  and (public.is_admin() or role = public.profile_role_for(id))
);

drop policy if exists listings_select_moderator on public.listings;
create policy listings_select_moderator
on public.listings for select
to authenticated
using (public.is_moderator());

drop policy if exists listings_update_moderator on public.listings;
create policy listings_update_moderator
on public.listings for update
to authenticated
using (public.is_moderator())
with check (public.is_moderator());

drop policy if exists listings_delete_moderator on public.listings;
create policy listings_delete_moderator
on public.listings for delete
to authenticated
using (public.is_moderator());

drop policy if exists listing_images_select_moderator on public.listing_images;
create policy listing_images_select_moderator
on public.listing_images for select
to authenticated
using (public.is_moderator());

create or replace function public.submit_report(
  p_listing_id uuid,
  p_reported_user_id uuid,
  p_reason text,
  p_comment text default null
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.listings;
  v_report public.reports;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_listing_id is null and p_reported_user_id is null then
    raise exception 'Report target required';
  end if;

  if p_reported_user_id = auth.uid() then
    raise exception 'Cannot report yourself';
  end if;

  if p_listing_id is not null then
    select * into v_listing from public.listings where id = p_listing_id;
    if not found then
      raise exception 'Listing not found';
    end if;
    if v_listing.user_id = auth.uid() then
      raise exception 'Cannot report your own listing';
    end if;
  end if;

  insert into public.reports (
    reporter_id,
    listing_id,
    reported_user_id,
    reason,
    comment
  )
  values (
    auth.uid(),
    p_listing_id,
    p_reported_user_id,
    p_reason,
    nullif(p_comment, '')
  )
  returning * into v_report;

  return v_report;
end;
$$;

create or replace function public.moderate_report(
  p_report_id uuid,
  p_action text,
  p_note text default null
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.reports;
  v_listing public.listings;
begin
  if not public.is_moderator() then
    raise exception 'Moderator role required';
  end if;

  select * into v_report from public.reports where id = p_report_id;
  if not found then
    raise exception 'Report not found';
  end if;

  if p_action in ('reviewing', 'resolve_report', 'reject_report') then
    update public.reports
    set status = case
      when p_action = 'reviewing' then 'reviewing'
      when p_action = 'reject_report' then 'rejected'
      else 'resolved'
    end,
        moderator_note = p_note,
        reviewed_by = auth.uid(),
        reviewed_at = case when p_action = 'reviewing' then reviewed_at else now() end
    where id = p_report_id
    returning * into v_report;
  elsif p_action in ('hide_listing', 'block_listing', 'restore_listing', 'delete_listing') then
    if v_report.listing_id is null then
      raise exception 'Listing report required';
    end if;

    if p_action = 'delete_listing' then
      delete from public.listings where id = v_report.listing_id;
    else
      update public.listings
      set status = case
        when p_action = 'hide_listing' then 'hidden'
        when p_action = 'block_listing' then 'blocked'
        when p_action = 'restore_listing' then 'active'
        else status
      end,
      updated_at = now()
      where id = v_report.listing_id
      returning * into v_listing;
    end if;

    update public.reports
    set status = 'resolved',
        moderator_note = p_note,
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_report_id
    returning * into v_report;
  elsif p_action in ('warn_user', 'block_user', 'temporary_block_user', 'unblock_user') then
    if v_report.reported_user_id is null then
      raise exception 'User report required';
    end if;

    update public.profiles
    set is_blocked = case
          when p_action in ('block_user', 'temporary_block_user') then true
          when p_action = 'unblock_user' then false
          else is_blocked
        end,
        blocked_until = case
          when p_action = 'temporary_block_user' then now() + interval '7 days'
          when p_action in ('block_user', 'unblock_user') then null
          else blocked_until
        end,
        block_reason = case
          when p_action in ('block_user', 'temporary_block_user') then p_note
          when p_action = 'unblock_user' then null
          else block_reason
        end,
        updated_at = now()
    where id = v_report.reported_user_id;

    update public.reports
    set status = 'resolved',
        moderator_note = p_note,
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where id = p_report_id
    returning * into v_report;
  else
    raise exception 'Unsupported moderation action';
  end if;

  insert into public.moderation_actions (
    moderator_id,
    target_user_id,
    listing_id,
    report_id,
    action,
    reason
  )
  values (
    auth.uid(),
    v_report.reported_user_id,
    v_report.listing_id,
    v_report.id,
    p_action,
    p_note
  );

  return v_report;
end;
$$;

create or replace function public.moderate_listing(
  p_listing_id uuid,
  p_action text,
  p_note text default null
)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.listings;
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can moderate listings';
  end if;

  if p_action not in ('hide_listing', 'block_listing', 'restore_listing', 'delete_listing') then
    raise exception 'Unsupported listing moderation action';
  end if;

  select * into v_listing from public.listings where id = p_listing_id;

  if not found then
    raise exception 'Listing not found';
  end if;

  if p_action = 'delete_listing' then
    delete from public.listings where id = p_listing_id returning * into v_listing;
  else
    update public.listings
    set status = case
          when p_action = 'hide_listing' then 'hidden'
          when p_action = 'block_listing' then 'blocked'
          when p_action = 'restore_listing' then 'active'
          else status
        end,
        updated_at = now()
    where id = p_listing_id
    returning * into v_listing;
  end if;

  insert into public.moderation_actions (
    moderator_id,
    target_user_id,
    listing_id,
    action,
    reason
  )
  values (
    auth.uid(),
    v_listing.user_id,
    p_listing_id,
    p_action,
    p_note
  );

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    listing_id
  )
  values (
    v_listing.user_id,
    'system',
    case
      when p_action = 'restore_listing' then 'Объявление снова опубликовано'
      when p_action = 'delete_listing' then 'Объявление удалено модератором'
      else 'Объявление проверено модерацией'
    end,
    coalesce(p_note, v_listing.title),
    case when p_action = 'delete_listing' then null else p_listing_id end
  );

  return v_listing;
end;
$$;

create or replace function public.moderate_user(
  p_user_id uuid,
  p_action text,
  p_note text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if not public.is_moderator() then
    raise exception 'Only moderators can moderate users';
  end if;

  if p_action not in ('warn_user', 'temporary_block_user', 'block_user', 'unblock_user') then
    raise exception 'Unsupported user moderation action';
  end if;

  update public.profiles
  set is_blocked = case
        when p_action in ('block_user', 'temporary_block_user') then true
        when p_action = 'unblock_user' then false
        else is_blocked
      end,
      blocked_until = case
        when p_action = 'temporary_block_user' then now() + interval '7 days'
        when p_action in ('block_user', 'unblock_user') then null
        else blocked_until
      end,
      block_reason = case
        when p_action in ('block_user', 'temporary_block_user') then p_note
        when p_action = 'unblock_user' then null
        else block_reason
      end,
      updated_at = now()
  where id = p_user_id
  returning * into v_profile;

  if not found then
    raise exception 'User profile not found';
  end if;

  insert into public.moderation_actions (
    moderator_id,
    target_user_id,
    action,
    reason
  )
  values (
    auth.uid(),
    p_user_id,
    p_action,
    p_note
  );

  insert into public.notifications (
    user_id,
    type,
    title,
    body
  )
  values (
    p_user_id,
    'system',
    case
      when p_action = 'warn_user' then 'Предупреждение от модерации'
      when p_action = 'unblock_user' then 'Профиль разблокирован'
      else 'Профиль ограничен модерацией'
    end,
    p_note
  );

  return v_profile;
end;
$$;

grant select, insert on public.reports to authenticated;
grant select, insert on public.moderation_actions to authenticated;
grant execute on function public.submit_report(uuid, uuid, text, text) to authenticated;
grant execute on function public.moderate_report(uuid, text, text) to authenticated;
grant execute on function public.moderate_listing(uuid, text, text) to authenticated;
grant execute on function public.moderate_user(uuid, text, text) to authenticated;
grant execute on function public.is_moderator() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.profile_role_for(uuid) to authenticated;
grant execute on function public.current_profile_is_blocked() to authenticated;
grant execute on function public.current_profile_blocked_until() to authenticated;
grant execute on function public.current_profile_block_reason() to authenticated;
