create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  listing_id uuid references public.listings(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_type_check check (type in ('deal_confirmation', 'message', 'system', 'trust_level'))
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their notifications" on public.notifications;
create policy "Users can view their notifications"
on public.notifications
for select
using (auth.uid() = user_id);

drop policy if exists "Users can mark their notifications read" on public.notifications;
create policy "Users can mark their notifications read"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.create_deal_for_listing(
  p_listing_id uuid,
  p_buyer_id uuid default null
)
returns public.deals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.listings;
  v_deal public.deals;
begin
  select *
  into v_listing
  from public.listings
  where id = p_listing_id
    and user_id = auth.uid();

  if not found then
    raise exception 'Only listing owner can create a deal';
  end if;

  insert into public.deals (
    listing_id,
    seller_id,
    buyer_id,
    status,
    confirmed_at
  )
  values (
    p_listing_id,
    auth.uid(),
    p_buyer_id,
    case when p_buyer_id is null then 'confirmed' else 'pending' end,
    case when p_buyer_id is null then now() else null end
  )
  returning * into v_deal;

  update public.listings
  set status = 'sold',
      updated_at = now()
  where id = p_listing_id
    and user_id = auth.uid();

  if p_buyer_id is not null then
    insert into public.notifications (
      user_id,
      type,
      title,
      body,
      listing_id,
      deal_id
    )
    values (
      p_buyer_id,
      'deal_confirmation',
      'Сделка состоялась?',
      v_listing.title,
      p_listing_id,
      v_deal.id
    );
  end if;

  return v_deal;
end;
$$;

revoke all on function public.create_deal_for_listing(uuid, uuid) from public;
grant execute on function public.create_deal_for_listing(uuid, uuid) to authenticated;
