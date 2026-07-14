alter table public.notifications
add column if not exists conversation_id uuid references public.conversations(id) on delete cascade;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'notifications_type_check'
      and conrelid = 'public.notifications'::regclass
  ) then
    alter table public.notifications
    drop constraint notifications_type_check;
  end if;
end $$;

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
    'system'
  )
);

alter table public.notifications enable row level security;

grant usage on schema public to anon, authenticated;
grant select, update on public.notifications to authenticated;

drop policy if exists "Users can view their notifications" on public.notifications;
drop policy if exists "Users can mark their notifications read" on public.notifications;
drop policy if exists notifications_select_own on public.notifications;
drop policy if exists notifications_update_own on public.notifications;
drop policy if exists notifications_insert_own on public.notifications;

create policy notifications_select_own
on public.notifications
for select
to authenticated
using (user_id = (select auth.uid()));

create policy notifications_update_own
on public.notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create index if not exists notifications_user_read_created_idx
on public.notifications (user_id, is_read, created_at desc);

create index if not exists notifications_conversation_id_idx
on public.notifications (conversation_id);

create or replace function public.create_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation public.conversations;
  v_listing public.listings;
  v_sender public.profiles;
  v_recipient uuid;
begin
  select *
  into v_conversation
  from public.conversations
  where id = new.conversation_id;

  if not found then
    return new;
  end if;

  if new.sender_id = v_conversation.buyer_id then
    v_recipient := v_conversation.seller_id;
  elsif new.sender_id = v_conversation.seller_id then
    v_recipient := v_conversation.buyer_id;
  else
    return new;
  end if;

  if v_recipient is null or v_recipient = new.sender_id then
    return new;
  end if;

  select *
  into v_listing
  from public.listings
  where id = v_conversation.listing_id;

  select *
  into v_sender
  from public.profiles
  where id = new.sender_id;

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
    'message',
    'Новое сообщение от ' || coalesce(v_sender.name, 'Choi'),
    coalesce(v_listing.title, left(new.text, 120)),
    v_conversation.listing_id,
    v_conversation.id
  );

  return new;
end;
$$;

drop trigger if exists on_message_created_notification on public.messages;
create trigger on_message_created_notification
after insert on public.messages
for each row execute function public.create_message_notification();

create or replace function public.create_deal_status_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = new.status then
    return new;
  end if;

  if new.status = 'confirmed' then
    insert into public.notifications (
      user_id,
      type,
      title,
      body,
      listing_id,
      deal_id
    )
    values (
      new.seller_id,
      'deal_confirmed',
      'Покупатель подтвердил сделку',
      'Доверие Choi растёт благодаря честным сделкам.',
      new.listing_id,
      new.id
    );
  elsif new.status = 'cancelled' then
    insert into public.notifications (
      user_id,
      type,
      title,
      body,
      listing_id,
      deal_id
    )
    values (
      new.seller_id,
      'deal_cancelled',
      'Покупатель не подтвердил сделку',
      'Можно уточнить детали в чате или вернуть объявление в продажу.',
      new.listing_id,
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_deal_status_notification on public.deals;
create trigger on_deal_status_notification
after update of status on public.deals
for each row execute function public.create_deal_status_notification();
