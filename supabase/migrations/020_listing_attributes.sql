create table if not exists public.listing_attributes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  attribute_key text not null,
  attribute_value text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists listing_attributes_listing_key_idx
on public.listing_attributes (listing_id, attribute_key);

create index if not exists listing_attributes_listing_id_idx
on public.listing_attributes (listing_id);

alter table public.listing_attributes enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.listing_attributes to anon, authenticated;
grant insert, update, delete on public.listing_attributes to authenticated;

drop policy if exists listing_attributes_public_select on public.listing_attributes;
drop policy if exists listing_attributes_owner_insert on public.listing_attributes;
drop policy if exists listing_attributes_owner_update on public.listing_attributes;
drop policy if exists listing_attributes_owner_delete on public.listing_attributes;

create policy listing_attributes_public_select
on public.listing_attributes
for select
using (true);

create policy listing_attributes_owner_insert
on public.listing_attributes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_attributes.listing_id
      and listings.user_id = (select auth.uid())
  )
);

create policy listing_attributes_owner_update
on public.listing_attributes
for update
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_attributes.listing_id
      and listings.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.listings
    where listings.id = listing_attributes.listing_id
      and listings.user_id = (select auth.uid())
  )
);

create policy listing_attributes_owner_delete
on public.listing_attributes
for delete
to authenticated
using (
  exists (
    select 1
    from public.listings
    where listings.id = listing_attributes.listing_id
      and listings.user_id = (select auth.uid())
  )
);
