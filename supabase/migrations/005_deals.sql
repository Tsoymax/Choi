do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_status_check'
  ) then
    alter table public.listings
    add constraint listings_status_check
    check (status in ('active', 'reserved', 'sold', 'archived'));
  end if;
end $$;

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  constraint deals_status_check check (status in ('pending', 'confirmed', 'cancelled'))
);

create unique index if not exists deals_one_active_per_listing_idx
on public.deals (listing_id)
where status in ('pending', 'confirmed');

alter table public.deals enable row level security;

drop policy if exists "Users can view their deals" on public.deals;
create policy "Users can view their deals"
on public.deals
for select
using (auth.uid() = seller_id or auth.uid() = buyer_id);

drop policy if exists "Listing owners can create deals" on public.deals;
create policy "Listing owners can create deals"
on public.deals
for insert
with check (
  auth.uid() = seller_id
  and exists (
    select 1
    from public.listings
    where listings.id = deals.listing_id
      and listings.user_id = auth.uid()
  )
);

drop policy if exists "Buyers can confirm or cancel their deals" on public.deals;
create policy "Buyers can confirm or cancel their deals"
on public.deals
for update
using (auth.uid() = buyer_id)
with check (
  auth.uid() = buyer_id
  and status in ('confirmed', 'cancelled')
);

