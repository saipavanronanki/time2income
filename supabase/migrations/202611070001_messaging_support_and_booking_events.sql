-- TIME2INCOME messaging add-ons
-- Apply in Supabase SQL Editor after reviewing existing policies.

create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'General support',
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists support_conversations_customer_recent_idx on public.support_conversations(customer_id,last_message_at desc);
create index if not exists support_messages_conversation_recent_idx on public.support_messages(conversation_id,created_at);

create or replace function public.is_t2i_support_agent()
returns boolean language sql stable security definer set search_path=public,auth as $$
  select coalesce(auth.jwt()->'app_metadata'->>'role' in ('support','admin'),false)
      or coalesce((auth.jwt()->'app_metadata'->>'support_agent')::boolean,false);
$$;

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "support conversations visible to owner or support" on public.support_conversations;
create policy "support conversations visible to owner or support" on public.support_conversations
for select to authenticated using (customer_id=auth.uid() or public.is_t2i_support_agent());

drop policy if exists "support messages visible to owner or support" on public.support_messages;
create policy "support messages visible to owner or support" on public.support_messages
for select to authenticated using (
  public.is_t2i_support_agent() or exists(select 1 from public.support_conversations c where c.id=conversation_id and c.customer_id=auth.uid())
);
drop policy if exists "support messages sent by participant" on public.support_messages;
create policy "support messages sent by participant" on public.support_messages
for insert to authenticated with check (
  sender_id=auth.uid() and exists(
    select 1 from public.support_conversations c where c.id=conversation_id
      and (c.customer_id=auth.uid() or public.is_t2i_support_agent()) and c.status='open'
  )
);

grant select on public.support_conversations, public.support_messages to authenticated;
grant insert on public.support_messages to authenticated;

create or replace function public.start_support_conversation(p_subject text default 'General support')
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in is required.'; end if;
  insert into public.support_conversations(customer_id,subject)
  values(auth.uid(),left(coalesce(nullif(trim(p_subject),''),'General support'),120)) returning id into v_id;
  return v_id;
end; $$;
grant execute on function public.start_support_conversation(text) to authenticated;

create or replace function public.close_support_conversation(p_conversation_id uuid)
returns void language plpgsql security definer set search_path=public,auth as $$
begin
  update public.support_conversations set status='closed',updated_at=now()
  where id=p_conversation_id and (customer_id=auth.uid() or public.is_t2i_support_agent());
  if not found then raise exception 'Support request not found or access denied.'; end if;
end; $$;
grant execute on function public.close_support_conversation(uuid) to authenticated;

create or replace function public.touch_support_conversation()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  update public.support_conversations set updated_at=now(),last_message_at=new.created_at where id=new.conversation_id;
  return new;
end; $$;
drop trigger if exists support_message_touch_conversation on public.support_messages;
create trigger support_message_touch_conversation after insert on public.support_messages
for each row execute function public.touch_support_conversation();

-- Timeline events are separate from user-authored messages and cannot be forged by clients.
create table if not exists public.booking_chat_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null,
  title text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists booking_chat_events_booking_time_idx on public.booking_chat_events(booking_id,created_at);
alter table public.booking_chat_events enable row level security;
drop policy if exists "booking participants read chat events" on public.booking_chat_events;
create policy "booking participants read chat events" on public.booking_chat_events
for select to authenticated using (exists(
  select 1 from public.bookings b where b.id=booking_id and auth.uid() in (b.customer_id,b.worker_id)
));
grant select on public.booking_chat_events to authenticated;

create or replace function public.log_booking_chat_lifecycle_event()
returns trigger language plpgsql security definer set search_path=public as $$
declare n jsonb; o jsonb; v_status text; old_status text; v_pay text; old_pay text; v_refund text; old_refund text; v_title text; v_detail text;
begin
  n:=to_jsonb(new);
  if tg_op='INSERT' then
    insert into public.booking_chat_events(booking_id,event_type,title,detail,metadata)
    values(new.id,'booking_created','Booking request created','A booking conversation is now available to the customer and provider.',jsonb_build_object('status',n->>'status'));
  else
    o:=to_jsonb(old);
    v_status:=coalesce(n->>'status',''); old_status:=coalesce(o->>'status','');
    if v_status<>old_status then
      v_title:=case v_status when 'accepted' then 'Booking accepted' when 'in_progress' then 'Work started' when 'completion_pending' then 'Completion requested' when 'completed' then 'Booking completed' when 'cancelled' then 'Booking cancelled' when 'disputed' then 'Booking under review' else 'Booking updated' end;
      insert into public.booking_chat_events(booking_id,event_type,title,detail,metadata)
      values(new.id,'booking_status',v_title,'Booking status changed to '||replace(v_status,'_',' ')||'.',jsonb_build_object('from',old_status,'to',v_status));
    end if;
    -- Detect common payment/refund status column names without assuming every deployment has them.
    v_pay:=coalesce(n->>'payment_status',n->>'payment_state',n->>'transaction_status','');
    old_pay:=coalesce(o->>'payment_status',o->>'payment_state',o->>'transaction_status','');
    if v_pay is distinct from old_pay and lower(v_pay) in ('paid','captured','succeeded','successful','completed','verified') then
      insert into public.booking_chat_events(booking_id,event_type,title,detail,metadata)
      values(new.id,'payment_confirmed','Payment confirmed','The payment provider or server marked this booking payment as confirmed.',jsonb_build_object('payment_status',v_pay));
    end if;
    v_refund:=coalesce(n->>'refund_status',n->>'refund_state',''); old_refund:=coalesce(o->>'refund_status',o->>'refund_state','');
    if v_refund is distinct from old_refund and lower(v_refund) in ('refunded','processed','succeeded','completed') then
      insert into public.booking_chat_events(booking_id,event_type,title,detail,metadata)
      values(new.id,'refund_processed','Refund processed','The refund status was updated by the payment workflow.',jsonb_build_object('refund_status',v_refund));
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists booking_chat_lifecycle_insert on public.bookings;
create trigger booking_chat_lifecycle_insert after insert on public.bookings
for each row execute function public.log_booking_chat_lifecycle_event();
drop trigger if exists booking_chat_lifecycle_update on public.bookings;
create trigger booking_chat_lifecycle_update after update on public.bookings
for each row execute function public.log_booking_chat_lifecycle_event();

-- Enable Realtime for support messages. If already published, this block safely skips it.
do $$ begin
  alter publication supabase_realtime add table public.support_messages;
exception when duplicate_object then null; when undefined_object then null; end $$;
