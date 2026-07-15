drop policy if exists listings_public_read_active on public.listings;

create policy listings_public_read_active
on public.listings
for select
to anon, authenticated
using (
  status in ('active', 'reserved')
  or user_id = (select auth.uid())
);

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
        listings.status in ('active', 'reserved')
        or listings.user_id = (select auth.uid())
      )
  )
);
