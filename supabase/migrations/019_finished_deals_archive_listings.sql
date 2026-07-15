update public.listings
set status = 'archived',
    updated_at = now()
where status <> 'archived'
  and exists (
    select 1
    from public.deals
    where deals.listing_id = listings.id
      and deals.status = 'confirmed'
  );

create or replace function public.prevent_reopen_finished_listing()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status in ('active', 'reserved')
    and exists (
      select 1
      from public.deals
      where deals.listing_id = old.id
        and deals.status = 'confirmed'
    )
  then
    raise exception 'Finished deal listing cannot be returned to sale';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_reopen_finished_listing on public.listings;

create trigger prevent_reopen_finished_listing
before update of status on public.listings
for each row execute function public.prevent_reopen_finished_listing();

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
  set status = case when p_confirmed then 'archived' else 'active' end,
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

revoke all on function public.respond_to_deal(uuid, boolean) from public;
grant execute on function public.respond_to_deal(uuid, boolean) to authenticated;
