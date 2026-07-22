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
  v_recipient uuid;
  v_title text;
  v_body text;
begin
  perform public.release_expired_reservations();

  select *
  into v_request
  from public.reservation_requests
  where id = p_request_id
    and status = 'pending'
    and auth.uid() in (buyer_id, seller_id)
    and requested_by <> auth.uid();

  if not found then
    raise exception 'Reservation request not found';
  end if;

  if v_request.expires_at <= now() then
    update public.reservation_requests
    set status = 'expired',
        responded_at = now()
    where id = p_request_id;

    raise exception 'Reservation request expired';
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
    and user_id = v_request.seller_id
    and status in ('active', 'reserved');

  v_recipient := v_request.requested_by;
  v_title := case
    when auth.uid() = v_request.buyer_id then 'Покупатель подтвердил время'
    else 'Бронь принята'
  end;
  v_body := 'Бронь действует до ' || to_char(v_request.expires_at, 'HH24:MI');

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    listing_id,
    conversation_id
  )
  values (
    v_recipient,
    'listing_reserved',
    v_title,
    v_body,
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
  v_title text;
begin
  select *
  into v_request
  from public.reservation_requests
  where id = p_request_id
    and status = 'pending'
    and auth.uid() in (buyer_id, seller_id)
    and requested_by <> auth.uid();

  if not found then
    raise exception 'Reservation request not found';
  end if;

  update public.reservation_requests
  set status = 'declined',
      responded_at = now()
  where id = p_request_id
  returning * into v_request;

  v_title := case
    when auth.uid() = v_request.buyer_id then 'Покупатель отклонил время'
    else 'Бронь отклонена'
  end;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    listing_id,
    conversation_id
  )
  values (
    v_request.requested_by,
    'system',
    v_title,
    'Предложенное время не подошло',
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
    raise exception 'Only seller can suggest reservation time';
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
    v_conversation.buyer_id,
    'listing_reserved',
    'Продавец назначил время',
    'Подтвердите, подходит ли время встречи: ' || to_char(v_request.requested_for, 'HH24:MI'),
    v_listing.id,
    p_conversation_id
  );

  return v_request;
end;
$$;

revoke all on function public.accept_reservation_request(uuid) from public;
revoke all on function public.decline_reservation_request(uuid) from public;
revoke all on function public.reserve_listing_for_buyer(uuid, timestamptz, text) from public;

grant execute on function public.accept_reservation_request(uuid) to authenticated;
grant execute on function public.decline_reservation_request(uuid) to authenticated;
grant execute on function public.reserve_listing_for_buyer(uuid, timestamptz, text) to authenticated;
