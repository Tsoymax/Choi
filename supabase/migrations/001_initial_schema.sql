create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  district text,
  address_type text default 'aka',
  avatar_url text,
  successful_deals integer default 0,
  complaints integer default 0,
  phone_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  title text not null,
  description text not null,
  price numeric,
  currency text not null default 'UZS',
  negotiable boolean default false,
  district text not null,
  phone text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  image_url text not null,
  position integer default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade,
  buyer_id uuid references public.profiles(id) on delete cascade,
  seller_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint conversations_listing_buyer_seller_key unique (listing_id, buyer_id, seller_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  text text not null,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists listings_user_id_idx on public.listings(user_id);
create index if not exists listings_status_created_at_idx on public.listings(status, created_at desc);
create index if not exists listing_images_listing_id_idx on public.listing_images(listing_id);
create index if not exists conversations_buyer_id_idx on public.conversations(buyer_id);
create index if not exists conversations_seller_id_idx on public.conversations(seller_id);
create index if not exists messages_conversation_id_created_at_idx on public.messages(conversation_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, address_type)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1), 'Choi user'),
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

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
on public.profiles for select
using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Active listings are readable by everyone" on public.listings;
create policy "Active listings are readable by everyone"
on public.listings for select
using (status = 'active');

drop policy if exists "Users create own listings" on public.listings;
create policy "Users create own listings"
on public.listings for insert
with check (user_id = auth.uid());

drop policy if exists "Users update own listings" on public.listings;
create policy "Users update own listings"
on public.listings for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users delete own listings" on public.listings;
create policy "Users delete own listings"
on public.listings for delete
using (user_id = auth.uid());

drop policy if exists "Listing images are readable by everyone" on public.listing_images;
create policy "Listing images are readable by everyone"
on public.listing_images for select
using (true);

drop policy if exists "Listing owners create images" on public.listing_images;
create policy "Listing owners create images"
on public.listing_images for insert
with check (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = auth.uid()
  )
);

drop policy if exists "Listing owners delete images" on public.listing_images;
create policy "Listing owners delete images"
on public.listing_images for delete
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and listings.user_id = auth.uid()
  )
);

drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites"
on public.favorites for select
using (user_id = auth.uid());

drop policy if exists "Users create own favorites" on public.favorites;
create policy "Users create own favorites"
on public.favorites for insert
with check (user_id = auth.uid());

drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites"
on public.favorites for delete
using (user_id = auth.uid());

drop policy if exists "Conversation participants can read" on public.conversations;
create policy "Conversation participants can read"
on public.conversations for select
using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "Buyers create conversations with listing owner" on public.conversations;
create policy "Buyers create conversations with listing owner"
on public.conversations for insert
with check (
  buyer_id = auth.uid()
  and exists (
    select 1 from public.listings
    where listings.id = conversations.listing_id
      and listings.user_id = conversations.seller_id
  )
);

drop policy if exists "Conversation participants can update" on public.conversations;
create policy "Conversation participants can update"
on public.conversations for update
using (buyer_id = auth.uid() or seller_id = auth.uid())
with check (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "Message participants can read" on public.messages;
create policy "Message participants can read"
on public.messages for select
using (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
  )
);

drop policy if exists "Message participants can write" on public.messages;
create policy "Message participants can write"
on public.messages for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
  )
);

drop policy if exists "Message participants can update read state" on public.messages;
create policy "Message participants can update read state"
on public.messages for update
using (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())
  )
);
