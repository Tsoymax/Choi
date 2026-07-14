alter table public.listings
add column if not exists latitude double precision;

alter table public.listings
add column if not exists longitude double precision;
