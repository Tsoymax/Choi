alter table public.deal_reviews
add column if not exists is_hidden boolean not null default false;

alter table public.deal_review_tags
add column if not exists created_at timestamptz not null default now();

update public.deal_reviews
set is_hidden = true
where hidden_at is not null
  and is_hidden = false;

update public.deal_review_tags
set tag = case tag
  when '🤝 Вежливый' then 'polite'
  when 'рџ¤ќ Р’РµР¶Р»РёРІС‹Р№' then 'polite'
  when '💬 Быстро отвечает' then 'quick_reply'
  when 'рџ’¬ Р‘С‹СЃС‚СЂРѕ РѕС‚РІРµС‡Р°РµС‚' then 'quick_reply'
  when '📦 Всё соответствует описанию' then 'as_described'
  when 'рџ“¦ Р’СЃС‘ СЃРѕРѕС‚РІРµС‚СЃС‚РІСѓРµС‚ РѕРїРёСЃР°РЅРёСЋ' then 'as_described'
  when '⏰ Пунктуальный' then 'on_time'
  when 'вЏ° РџСѓРЅРєС‚СѓР°Р»СЊРЅС‹Р№' then 'on_time'
  when '👍 Сделка прошла отлично' then 'smooth_deal'
  when 'рџ‘Ќ РЎРґРµР»РєР° РїСЂРѕС€Р»Р° РѕС‚Р»РёС‡РЅРѕ' then 'smooth_deal'
  when '⚡ Быстро договорились' then 'easy_to_agree'
  when 'вљЎ Р‘С‹СЃС‚СЂРѕ РґРѕРіРѕРІРѕСЂРёР»РёСЃСЊ' then 'easy_to_agree'
  when '❌ Не пришёл' then 'no_show'
  when 'вќЊ РќРµ РїСЂРёС€С‘Р»' then 'no_show'
  when '❌ Не отвечал' then 'no_reply'
  when 'вќЊ РќРµ РѕС‚РІРµС‡Р°Р»' then 'no_reply'
  when '❌ Описание не совпало' then 'not_as_described'
  when 'вќЊ РћРїРёСЃР°РЅРёРµ РЅРµ СЃРѕРІРїР°Р»Рѕ' then 'not_as_described'
  when '❌ Отменил встречу' then 'cancelled_without_notice'
  when 'вќЊ РћС‚РјРµРЅРёР» РІСЃС‚СЂРµС‡Сѓ' then 'cancelled_without_notice'
  when '❌ Невежлив' then 'rude'
  when 'вќЊ РќРµРІРµР¶Р»РёРІ' then 'rude'
  else tag
end;

alter table public.deal_review_tags
drop constraint if exists deal_review_tags_allowed_tag_check;

alter table public.deal_review_tags
add constraint deal_review_tags_allowed_tag_check
check (
  tag in (
    'polite',
    'quick_reply',
    'as_described',
    'on_time',
    'smooth_deal',
    'easy_to_agree',
    'no_show',
    'no_reply',
    'not_as_described',
    'cancelled_without_notice',
    'rude'
  )
);

alter table public.notifications
drop constraint if exists notifications_type_check;

alter table public.notifications
add constraint notifications_type_check
check (
  type in (
    'message',
    'deal_confirmation',
    'deal_confirmed',
    'deal_cancelled',
    'trust_level',
    'offer_received',
    'offer_accepted',
    'offer_declined',
    'listing_reserved',
    'review_request',
    'review_received',
    'system'
  )
);

drop policy if exists deal_reviews_public_select_visible on public.deal_reviews;
create policy deal_reviews_public_select_visible
on public.deal_reviews
for select
to anon, authenticated
using (
  is_hidden = false
  and hidden_at is null
  and deleted_at is null
);

drop policy if exists deal_review_tags_public_select_visible on public.deal_review_tags;
create policy deal_review_tags_public_select_visible
on public.deal_review_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.deal_reviews
    where deal_reviews.id = deal_review_tags.review_id
      and deal_reviews.is_hidden = false
      and deal_reviews.hidden_at is null
      and deal_reviews.deleted_at is null
  )
);

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

create or replace function public.submit_deal_review(
  p_deal_id uuid,
  p_reviewed_user_id uuid,
  p_rating_type text,
  p_comment text default null,
  p_tags text[] default '{}'
)
returns public.deal_reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deal public.deals;
  v_review public.deal_reviews;
  v_clean_comment text;
  v_tag text;
  v_allowed_tags text[] := array[
    'polite',
    'quick_reply',
    'as_described',
    'on_time',
    'smooth_deal',
    'easy_to_agree',
    'no_show',
    'no_reply',
    'not_as_described',
    'cancelled_without_notice',
    'rude'
  ];
begin
  select *
  into v_deal
  from public.deals
  where id = p_deal_id
    and status = 'confirmed'
    and (
      seller_id = auth.uid()
      or buyer_id = auth.uid()
    );

  if not found then
    raise exception 'Confirmed participant deal not found';
  end if;

  if p_reviewed_user_id = auth.uid() then
    raise exception 'You cannot review yourself';
  end if;

  if p_reviewed_user_id not in (v_deal.seller_id, v_deal.buyer_id) then
    raise exception 'Reviewed user is not a deal participant';
  end if;

  if p_rating_type not in ('positive', 'negative') then
    raise exception 'Invalid rating type';
  end if;

  v_clean_comment := nullif(left(trim(coalesce(p_comment, '')), 300), '');

  insert into public.deal_reviews (
    deal_id,
    reviewer_id,
    reviewed_user_id,
    rating_type,
    comment
  )
  values (
    p_deal_id,
    auth.uid(),
    p_reviewed_user_id,
    p_rating_type,
    v_clean_comment
  )
  returning * into v_review;

  foreach v_tag in array coalesce(p_tags, '{}')
  loop
    v_tag := left(trim(v_tag), 80);

    if v_tag = any(v_allowed_tags) then
      insert into public.deal_review_tags (review_id, tag)
      values (v_review.id, v_tag);
    end if;
  end loop;

  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    deal_id
  )
  values (
    p_reviewed_user_id,
    'review_received',
    'О вас оставили отзыв',
    'Отзыв уже учтён в вашей репутации Choi.',
    p_deal_id
  );

  return v_review;
end;
$$;

revoke all on function public.respond_to_deal(uuid, boolean) from public;
revoke all on function public.submit_deal_review(uuid, uuid, text, text, text[]) from public;

grant execute on function public.respond_to_deal(uuid, boolean) to authenticated;
grant execute on function public.submit_deal_review(uuid, uuid, text, text, text[]) to authenticated;
