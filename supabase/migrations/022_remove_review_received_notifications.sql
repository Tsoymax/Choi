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

  delete from public.notifications
  where type = 'review_received'
    and user_id = p_reviewed_user_id
    and deal_id = p_deal_id;

  return v_review;
end;
$$;

revoke all on function public.submit_deal_review(uuid, uuid, text, text, text[]) from public;
grant execute on function public.submit_deal_review(uuid, uuid, text, text, text[]) to authenticated;
