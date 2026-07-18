create table if not exists public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  requested_for timestamptz not null,
  expires_at timestamptz not null,
  note text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint reservation_requests_status_check check (
    status in ('pending', 'accepted', 'declined', 'cancelled', 'expired')
  ),
  constraint reservation_requests_time_check check (expires_at > requested_for),
  constraint reservation_requests_participants_check check (
    requested_by in (buyer_id, seller_id)
  )
);

create unique index if not exists reservation_one_active_per_listing_idx
on public.reservation_requests (listing_id)
where status = 'accepted';

create index if not exists reservation_requests_conversation_created_idx
on public.reservation_requests (conversation_id, created_at desc);

create index if not exists reservation_requests_expiry_idx
on public.reservation_requests (status, expires_at);

alter table public.reservation_requests enable row level security;

grant select on public.reservation_requests to authenticated;

drop policy if exists reservation_requests_select_participants on public.reservation_requests;
create policy reservation_requests_select_participants
on public.reservation_requests
for select
to authenticated
using ((select auth.uid()) in (buyer_id, seller_id));

drop policy if exists reservation_requests_insert_participants on public.reservation_requests;
create policy reservation_requests_insert_participants
on public.reservation_requests
for insert
to authenticated
with check ((select auth.uid()) in (buyer_id, seller_id));

drop policy if exists reservation_requests_update_participants on public.reservation_requests;
create policy reservation_requests_update_participants
on public.reservation_requests
for update
to authenticated
using ((select auth.uid()) in (buyer_id, seller_id))
with check ((select auth.uid()) in (buyer_id, seller_id));

create or replace function public.release_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_released_count integer := 0;
begin
  with expired as (
    update public.reservation_requests
    set status = 'expired',
        responded_at = coalesce(responded_at, now())
    where status = 'accepted'
      and expires_at <= now()
    returning listing_id
  ),
  released_listings as (
    update public.listings
    set status = 'active',
        updated_at = now()
    where status = 'reserved'
      and id in (select listing_id from expired)
      and not exists (
        select 1
        from public.deals
        where deals.listing_id = listings.id
          and deals.status = 'confirmed'
      )
      and not exists (
        select 1
        from public.reservation_requests
        where reservation_requests.listing_id = listings.id
          and reservation_requests.status = 'accepted'
          and reservation_requests.expires_at > now()
      )
    returning id
  )
  select count(*)::integer
  into v_released_count
  from expired;

  return v_released_count;
end;
$$;

create or replace function public.request_reservation_from_conversation(
  p_conversation_id uuid,
  p_requested_for timestamptz,
  p_note text default null
)
returns public.reservation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation public.conversations;
  v_listing public.listings;
  v_request public.reservation_requests;
begin
  perform public.release_expired_reservations();

  select *
  into v_conversation
  from public.conversations
  where id = p_conversation_id
    and buyer_id = auth.uid();

  if not found then
    raise exception 'Only buyer can request reservation';
  end if;

  if p_requested_for <= now() then
    raise exception 'Reservation time must be in the future';
  end if;

  select *
  into v_listing
  from public.listings
  where id = v_conversation.listing_id
    and user_id = v_conversation.seller_id
    and status in ('active', 'reserved');

  if not found then
    raise exception 'Listing is not available for reservation';
  end if;

  if exists (
    select 1
    from public.deals
    where listing_id = v_listing.id
      and seller_id = v_conversation.seller_id
      and buyer_id = v_conversation.buyer_id
      and status in ('confirmed', 'cancelled')
  ) then
    raise exception 'Deal is already finished';
  end if;

  update public.reservation_requests
  set status = 'cancelled',
      responded_at = now()
  where conversation_id = p_conversation_id
    and status = 'pending';

  insert into public.reservation_requests (
    listing_id,
    conversation_id,
    buyer_id,
    seller_id,
    requested_by,
    status,
    requested_for,
    expires_at,
    note
  )
  values (
    v_listing.id,
    p_conversation_id,
    v_conversation.buyer_id,
    v_conversation.seller_id,
    auth.uid(),
    'pending',
    p_requested_for,
    p_requested_for + interval '30 minutes',
    nullif(trim(p_note), '')
  )
  returning * into v_request;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    listing_id,
    conversation_id
  )
  values (
    v_conversation.seller_id,
    'system',
    'Покупатель предложил бронь',
    v_listing.title,
    v_listing.id,
    p_conversation_id
  );

  return v_request;
end;
$$;

create or replace function public.accept_reservation_request(
  p_request_id uuid
)
returns public.reservation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.reservation_requests;
begin
  perform public.release_expired_reservations();

  select *
  into v_request
  from public.reservation_requests
  where id = p_request_id
    and seller_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Reservation request not found';
  end if;

  update public.reservation_requests
  set status = 'cancelled',
      responded_at = now()
  where listing_id = v_request.listing_id
    and status in ('pending', 'accepted')
    and id <> v_request.id;

  update public.reservation_requests
  set status = 'accepted',
      responded_at = now()
  where id = v_request.id
  returning * into v_request;

  update public.listings
  set status = 'reserved',
      updated_at = now()
  where id = v_request.listing_id
    and user_id = auth.uid()
    and status in ('active', 'reserved');

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    listing_id,
    conversation_id
  )
  values (
    v_request.buyer_id,
    'listing_reserved',
    'Бронь принята',
    'Объявление забронировано до ' || to_char(v_request.expires_at, 'HH24:MI'),
    v_request.listing_id,
    v_request.conversation_id
  );

  return v_request;
end;
$$;

create or replace function public.decline_reservation_request(
  p_request_id uuid
)
returns public.reservation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.reservation_requests;
begin
  select *
  into v_request
  from public.reservation_requests
  where id = p_request_id
    and seller_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Reservation request not found';
  end if;

  update public.reservation_requests
  set status = 'declined',
      responded_at = now()
  where id = p_request_id
  returning * into v_request;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    listing_id,
    conversation_id
  )
  values (
    v_request.buyer_id,
    'system',
    'Бронь отклонена',
    'Продавец не подтвердил предложенное время',
    v_request.listing_id,
    v_request.conversation_id
  );

  return v_request;
end;
$$;

create or replace function public.reserve_listing_for_buyer(
  p_conversation_id uuid,
  p_requested_for timestamptz,
  p_note text default null
)
returns public.reservation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation public.conversations;
  v_listing public.listings;
  v_request public.reservation_requests;
begin
  perform public.release_expired_reservations();

  select *
  into v_conversation
  from public.conversations
  where id = p_conversation_id
    and seller_id = auth.uid();

  if not found then
    raise exception 'Only seller can reserve listing';
  end if;

  if v_conversation.buyer_id is null then
    raise exception 'Buyer is required';
  end if;

  if p_requested_for <= now() then
    raise exception 'Reservation time must be in the future';
  end if;

  select *
  into v_listing
  from public.listings
  where id = v_conversation.listing_id
    and user_id = auth.uid()
    and status in ('active', 'reserved');

  if not found then
    raise exception 'Listing is not available for reservation';
  end if;

  update public.reservation_requests
  set status = 'cancelled',
      responded_at = now()
  where listing_id = v_listing.id
    and status in ('pending', 'accepted');

  insert into public.reservation_requests (
    listing_id,
    conversation_id,
    buyer_id,
    seller_id,
    requested_by,
    status,
    requested_for,
    expires_at,
    note,
    responded_at
  )
  values (
    v_listing.id,
    p_conversation_id,
    v_conversation.buyer_id,
    v_conversation.seller_id,
    auth.uid(),
    'accepted',
    p_requested_for,
    p_requested_for + interval '30 minutes',
    nullif(trim(p_note), ''),
    now()
  )
  returning * into v_request;

  update public.listings
  set status = 'reserved',
      updated_at = now()
  where id = v_listing.id;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    listing_id,
    conversation_id
  )
  values (
    v_conversation.buyer_id,
    'listing_reserved',
    'Продавец поставил бронь',
    'Бронь действует до ' || to_char(v_request.expires_at, 'HH24:MI'),
    v_listing.id,
    p_conversation_id
  );

  return v_request;
end;
$$;

revoke all on function public.release_expired_reservations() from public;
revoke all on function public.request_reservation_from_conversation(uuid, timestamptz, text) from public;
revoke all on function public.accept_reservation_request(uuid) from public;
revoke all on function public.decline_reservation_request(uuid) from public;
revoke all on function public.reserve_listing_for_buyer(uuid, timestamptz, text) from public;

grant execute on function public.release_expired_reservations() to anon, authenticated;
grant execute on function public.request_reservation_from_conversation(uuid, timestamptz, text) to authenticated;
grant execute on function public.accept_reservation_request(uuid) to authenticated;
grant execute on function public.decline_reservation_request(uuid) to authenticated;
grant execute on function public.reserve_listing_for_buyer(uuid, timestamptz, text) to authenticated;
