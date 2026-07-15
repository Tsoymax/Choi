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
    'review_received',
    'system'
  )
);

create table if not exists public.deal_reviews (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles(id) on delete cascade,
  rating_type text not null,
  comment text,
  created_at timestamptz not null default now(),
  hidden_at timestamptz,
  deleted_at timestamptz,
  moderated_by uuid references auth.users(id) on delete set null,
  moderated_at timestamptz,
  moderation_reason text,
  constraint deal_reviews_rating_type_check check (rating_type in ('positive', 'negative')),
  constraint deal_reviews_not_self_check check (reviewer_id <> reviewed_user_id),
  constraint deal_reviews_comment_length_check check (char_length(coalesce(comment, '')) <= 300)
);

create table if not exists public.deal_review_tags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.deal_reviews(id) on delete cascade,
  tag text not null,
  constraint deal_review_tags_tag_length_check check (char_length(tag) between 1 and 80)
);

create unique index if not exists deal_reviews_one_per_reviewer_idx
on public.deal_reviews (deal_id, reviewer_id);

create index if not exists deal_reviews_reviewed_user_created_idx
on public.deal_reviews (reviewed_user_id, created_at desc)
where deleted_at is null;

create index if not exists deal_review_tags_review_id_idx
on public.deal_review_tags (review_id);

alter table public.deal_reviews enable row level security;
alter table public.deal_review_tags enable row level security;

grant select on public.deal_reviews to anon, authenticated;
grant select on public.deal_review_tags to anon, authenticated;
grant insert on public.deal_reviews to authenticated;
grant insert on public.deal_review_tags to authenticated;
grant update, delete on public.deal_reviews to authenticated;
grant delete on public.deal_review_tags to authenticated;

drop policy if exists deal_reviews_public_select_visible on public.deal_reviews;
create policy deal_reviews_public_select_visible
on public.deal_reviews
for select
to anon, authenticated
using (
  hidden_at is null
  and deleted_at is null
);

drop policy if exists deal_reviews_insert_participant on public.deal_reviews;
create policy deal_reviews_insert_participant
on public.deal_reviews
for insert
to authenticated
with check (
  reviewer_id = (select auth.uid())
  and reviewer_id <> reviewed_user_id
  and exists (
    select 1
    from public.deals
    where deals.id = deal_reviews.deal_id
      and deals.status = 'confirmed'
      and (
        deals.seller_id = (select auth.uid())
        or deals.buyer_id = (select auth.uid())
      )
      and reviewed_user_id in (deals.seller_id, deals.buyer_id)
      and reviewed_user_id <> (select auth.uid())
  )
);

drop policy if exists deal_reviews_update_moderator on public.deal_reviews;
create policy deal_reviews_update_moderator
on public.deal_reviews
for update
to authenticated
using (public.profile_role_for((select auth.uid())) in ('moderator', 'admin'))
with check (public.profile_role_for((select auth.uid())) in ('moderator', 'admin'));

drop policy if exists deal_reviews_delete_admin on public.deal_reviews;
create policy deal_reviews_delete_admin
on public.deal_reviews
for delete
to authenticated
using (public.profile_role_for((select auth.uid())) in ('moderator', 'admin'));

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
      and deal_reviews.hidden_at is null
      and deal_reviews.deleted_at is null
  )
);

drop policy if exists deal_review_tags_insert_own_review on public.deal_review_tags;
create policy deal_review_tags_insert_own_review
on public.deal_review_tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.deal_reviews
    where deal_reviews.id = deal_review_tags.review_id
      and deal_reviews.reviewer_id = (select auth.uid())
      and deal_reviews.created_at > now() - interval '5 minutes'
  )
);

drop policy if exists deal_review_tags_delete_moderator on public.deal_review_tags;
create policy deal_review_tags_delete_moderator
on public.deal_review_tags
for delete
to authenticated
using (public.profile_role_for((select auth.uid())) in ('moderator', 'admin'));

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

    if v_tag <> '' then
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
    'Вы получили новый отзыв',
    'Ваш отзыв помогает сделать Choi безопаснее.',
    p_deal_id
  );

  return v_review;
end;
$$;

revoke all on function public.submit_deal_review(uuid, uuid, text, text, text[]) from public;
grant execute on function public.submit_deal_review(uuid, uuid, text, text, text[]) to authenticated;
