create table if not exists public.listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint listing_views_listing_viewer_key unique (listing_id, viewer_id)
);

create index if not exists listing_views_listing_id_idx
on public.listing_views (listing_id);

create index if not exists listing_views_viewer_id_idx
on public.listing_views (viewer_id);

alter table public.listing_views enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.listing_views to authenticated;

drop policy if exists listing_views_select_own on public.listing_views;
create policy listing_views_select_own
on public.listing_views
for select
to authenticated
using (viewer_id = (select auth.uid()));

create or replace function public.record_listing_view(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_viewer_id uuid := auth.uid();
  v_owner_id uuid;
begin
  if v_viewer_id is null then
    return;
  end if;

  select user_id
  into v_owner_id
  from public.listings
  where id = p_listing_id
    and status in ('active', 'reserved');

  if v_owner_id is null or v_owner_id = v_viewer_id then
    return;
  end if;

  insert into public.listing_views (listing_id, viewer_id)
  values (p_listing_id, v_viewer_id)
  on conflict (listing_id, viewer_id) do nothing;
end;
$$;

revoke all on function public.record_listing_view(uuid) from public;
grant execute on function public.record_listing_view(uuid) to authenticated;

create or replace function public.get_listing_engagement_metrics(p_listing_ids uuid[])
returns table (
  listing_id uuid,
  views_count bigint,
  likes_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with requested as (
    select distinct unnest(p_listing_ids) as listing_id
  )
  select
    requested.listing_id,
    coalesce(views.count, 0) as views_count,
    coalesce(favorites.count, 0) as likes_count
  from requested
  join public.listings
    on listings.id = requested.listing_id
   and (
      listings.status in ('active', 'reserved')
      or listings.user_id = auth.uid()
   )
  left join lateral (
    select count(*) as count
    from public.listing_views
    where listing_views.listing_id = requested.listing_id
  ) views on true
  left join lateral (
    select count(*) as count
    from public.favorites
    where favorites.listing_id = requested.listing_id
  ) favorites on true;
$$;

revoke all on function public.get_listing_engagement_metrics(uuid[]) from public;
grant execute on function public.get_listing_engagement_metrics(uuid[]) to anon, authenticated;
