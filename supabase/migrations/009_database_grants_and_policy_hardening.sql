grant usage on schema public to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;

grant select on public.listing_images to anon, authenticated;
grant insert, update, delete on public.listing_images to authenticated;

grant select, insert, delete on public.favorites to authenticated;

grant select, insert, update on public.conversations to authenticated;
grant select, insert, update on public.messages to authenticated;

grant select, insert, update on public.deals to authenticated;
grant select, update on public.notifications to authenticated;

grant execute on function public.create_deal_for_listing(uuid, uuid) to authenticated;

drop policy if exists "Listing owners can read own listings" on public.listings;
create policy "Listing owners can read own listings"
on public.listings
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Listing owners update images" on public.listing_images;
create policy "Listing owners update images"
on public.listing_images
for update
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = (select auth.uid())
  )
);

update public.profiles
set
  name = coalesce(
    nullif(public.profiles.name, ''),
    nullif(split_part(auth_users.email, '@', 1), ''),
    'Choi user'
  ),
  updated_at = now()
from auth.users as auth_users
where public.profiles.id = auth_users.id
  and coalesce(public.profiles.name, '') = '';
