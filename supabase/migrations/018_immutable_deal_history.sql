create unique index if not exists deals_one_per_listing_participant_pair_idx
on public.deals (listing_id, seller_id, buyer_id)
where buyer_id is not null;

create or replace function public.reserve_listing_from_conversation(
  p_conversation_id uuid
)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation public.conversations;
  v_listing public.listings;
  v_finished_deal public.deals;
begin
  select *
  into v_conversation
  from public.conversations
  where id = p_conversation_id;

  if not found then
    raise exception 'Conversation not found';
  end if;

  select *
  into v_finished_deal
  from public.deals
  where listing_id = v_conversation.listing_id
    and seller_id = v_conversation.seller_id
    and buyer_id = v_conversation.buyer_id
    and status in ('confirmed', 'cancelled')
  order by created_at desc
  limit 1;

  if v_finished_deal.id is not null then
    raise exception 'Deal is already finished';
  end if;

  select *
  into v_listing
  from public.listings
  where id = v_conversation.listing_id
    and user_id = auth.uid()
    and user_id = v_conversation.seller_id;

  if not found then
    raise exception 'Only listing owner can reserve listing';
  end if;

  update public.listings
  set status = 'reserved',
      updated_at = now()
  where id = v_listing.id
  returning * into v_listing;

  if v_conversation.buyer_id is not null then
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
      'Объявление забронировано для вас',
      v_listing.title,
      v_listing.id,
      p_conversation_id
    );
  end if;

  return v_listing;
end;
$$;

create or replace function public.create_deal_from_conversation(
  p_conversation_id uuid
)
returns public.deals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation public.conversations;
  v_listing public.listings;
  v_deal public.deals;
  v_created boolean := false;
begin
  select *
  into v_conversation
  from public.conversations
  where id = p_conversation_id;

  if not found then
    raise exception 'Conversation not found';
  end if;

  if v_conversation.buyer_id is null then
    raise exception 'Buyer is required';
  end if;

  select *
  into v_listing
  from public.listings
  where id = v_conversation.listing_id
    and user_id = auth.uid()
    and user_id = v_conversation.seller_id;

  if not found then
    raise exception 'Only listing owner can create a deal';
  end if;

  select *
  into v_deal
  from public.deals
  where listing_id = v_listing.id
    and seller_id = auth.uid()
    and buyer_id = v_conversation.buyer_id
  order by created_at desc
  limit 1;

  if v_deal.id is not null and v_deal.status in ('confirmed', 'cancelled') then
    raise exception 'Deal is already finished';
  end if;

  if v_deal.id is null then
    insert into public.deals (
      listing_id,
      seller_id,
      buyer_id,
      status
    )
    values (
      v_listing.id,
      auth.uid(),
      v_conversation.buyer_id,
      'pending'
    )
    returning * into v_deal;

    v_created := true;
  end if;

  update public.listings
  set status = 'reserved',
      updated_at = now()
  where id = v_listing.id;

  if v_created and v_deal.status = 'pending' then
    insert into public.notifications (
      user_id,
      type,
      title,
      body,
      listing_id,
      deal_id,
      conversation_id
    )
    values (
      v_conversation.buyer_id,
      'deal_confirmation',
      'Сделка состоялась?',
      v_listing.title,
      v_listing.id,
      v_deal.id,
      p_conversation_id
    );
  end if;

  return v_deal;
end;
$$;

create or replace function public.respond_to_deal(
  p_deal_id uuid,
  p_confirmed boolean
)
returns public.deals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deal public.deals;
  v_listing public.listings;
  v_conversation public.conversations;
begin
  select *
  into v_deal
  from public.deals
  where id = p_deal_id
    and buyer_id = auth.uid()
    and status = 'pending';

  if not found then
    raise exception 'Pending deal not found';
  end if;

  update public.deals
  set status = case when p_confirmed then 'confirmed' else 'cancelled' end,
      confirmed_at = case when p_confirmed then now() else null end
  where id = p_deal_id
    and status = 'pending'
  returning * into v_deal;

  select *
  into v_listing
  from public.listings
  where id = v_deal.listing_id;

  select *
  into v_conversation
  from public.conversations
  where listing_id = v_deal.listing_id
    and buyer_id = v_deal.buyer_id
    and seller_id = v_deal.seller_id
  order by updated_at desc
  limit 1;

  update public.listings
  set status = case when p_confirmed then 'sold' else 'active' end,
      updated_at = now()
  where id = v_deal.listing_id;

  if p_confirmed then
    update public.profiles
    set successful_deals = coalesce(successful_deals, 0) + 1,
        updated_at = now()
    where id in (v_deal.seller_id, v_deal.buyer_id);
  end if;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    listing_id,
    deal_id,
    conversation_id
  )
  values (
    v_deal.seller_id,
    case when p_confirmed then 'deal_confirmed' else 'deal_cancelled' end,
    case
      when p_confirmed then 'Покупатель подтвердил сделку'
      else 'Покупатель не подтвердил сделку'
    end,
    coalesce(v_listing.title, 'Choi'),
    v_deal.listing_id,
    v_deal.id,
    v_conversation.id
  );

  if p_confirmed then
    insert into public.notifications (
      user_id,
      type,
      title,
      body,
      listing_id,
      deal_id,
      conversation_id
    )
    values
      (
        v_deal.seller_id,
        'review_request',
        'Как прошла сделка?',
        'Оставьте короткий отзыв о покупателе.',
        v_deal.listing_id,
        v_deal.id,
        v_conversation.id
      ),
      (
        v_deal.buyer_id,
        'review_request',
        'Как прошла сделка?',
        'Оставьте короткий отзыв о продавце.',
        v_deal.listing_id,
        v_deal.id,
        v_conversation.id
      );
  end if;

  return v_deal;
end;
$$;

revoke all on function public.reserve_listing_from_conversation(uuid) from public;
revoke all on function public.create_deal_from_conversation(uuid) from public;
revoke all on function public.respond_to_deal(uuid, boolean) from public;

grant execute on function public.reserve_listing_from_conversation(uuid) to authenticated;
grant execute on function public.create_deal_from_conversation(uuid) to authenticated;
grant execute on function public.respond_to_deal(uuid, boolean) to authenticated;
