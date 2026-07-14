alter table public.listings enable row level security;
alter table public.listing_images enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant select on public.listing_images to anon, authenticated;
grant insert, update, delete on public.listing_images to authenticated;

alter table public.listings
alter column status set default 'active';

update public.listings
set status = 'active'
where status is null;

drop policy if exists "Active listings are readable by everyone" on public.listings;
drop policy if exists "Listing owners can read own listings" on public.listings;
drop policy if exists "Users create own listings" on public.listings;
drop policy if exists "Users update own listings" on public.listings;
drop policy if exists "Users delete own listings" on public.listings;
drop policy if exists listings_public_read_active on public.listings;
drop policy if exists listings_insert_own on public.listings;
drop policy if exists listings_update_own on public.listings;
drop policy if exists listings_delete_own on public.listings;

create policy listings_public_read_active
on public.listings
for select
to anon, authenticated
using (
  status = 'active'
  or user_id = (select auth.uid())
);

create policy listings_insert_own
on public.listings
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and coalesce(status, 'active') = 'active'
);

create policy listings_update_own
on public.listings
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy listings_delete_own
on public.listings
for delete
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Listing images are readable by everyone" on public.listing_images;
drop policy if exists listing_images_public_read on public.listing_images;

create policy listing_images_public_read
on public.listing_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and (
        listings.status = 'active'
        or listings.user_id = (select auth.uid())
      )
  )
);
