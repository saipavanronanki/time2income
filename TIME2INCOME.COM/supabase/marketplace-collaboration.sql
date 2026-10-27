-- Add worker portfolio images, booking messages, and in-app notifications.
-- Existing profiles, tasks, and bookings are preserved.

begin;

alter table public.worker_profiles
  add column if not exists portfolio_images text[] not null default '{}';

grant select (portfolio_images) on public.worker_profiles to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'worker-portfolio',
  'worker-portfolio',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do nothing;

drop policy if exists "workers upload own portfolio images" on storage.objects;
create policy "workers upload own portfolio images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'worker-portfolio'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "workers delete own portfolio images" on storage.objects;
create policy "workers delete own portfolio images" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'worker-portfolio'
    and split_part(name, '/', 1) = (select auth.uid())::text
  );

create table if not exists public.booking_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists booking_messages_booking_created_idx
  on public.booking_messages (booking_id, created_at);

alter table public.booking_messages enable row level security;
revoke all on public.booking_messages from public, anon, authenticated;
grant select, insert on public.booking_messages to authenticated;

drop policy if exists "booking participants read messages" on public.booking_messages;
create policy "booking participants read messages" on public.booking_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.customer_id = (select auth.uid()) or b.worker_id = (select auth.uid()))
    )
  );

drop policy if exists "booking participants send messages" on public.booking_messages;
create policy "booking participants send messages" on public.booking_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.customer_id = (select auth.uid()) or b.worker_id = (select auth.uid()))
        and b.status in ('requested', 'accepted', 'confirmed', 'in_progress')
    )
  );

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text not null,
  task_id uuid references public.tasks(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists user_notifications_user_created_idx
  on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;
revoke all on public.user_notifications from public, anon, authenticated;
grant select on public.user_notifications to authenticated;

drop policy if exists "users read own notifications" on public.user_notifications;
create policy "users read own notifications" on public.user_notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.user_notifications
  set read_at = now()
  where id = p_notification_id
    and user_id = auth.uid()
    and read_at is null;
$$;
revoke all on function public.mark_notification_read(uuid) from public, anon;
grant execute on function public.mark_notification_read(uuid) to authenticated;

create or replace function public.notify_task_offer_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_notifications (user_id, event_type, title, body, task_id)
  select t.customer_id, 'offer_received', 'New offer received',
         'A worker sent an offer on "' || t.title || '".', t.id
  from public.tasks t
  where t.id = new.task_id
    and t.customer_id <> new.worker_id;
  return new;
end;
$$;

create or replace function public.notify_task_offer_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  task_title text;
begin
  if new.status is not distinct from old.status
     or new.status not in ('accepted', 'rejected') then
    return new;
  end if;

  select title into task_title from public.tasks where id = new.task_id;
  insert into public.user_notifications (user_id, event_type, title, body, task_id)
  values (
    new.worker_id,
    'offer_' || new.status,
    case when new.status = 'accepted' then 'Offer accepted' else 'Offer declined' end,
    'Your offer on "' || coalesce(task_title, 'a task') || '" was ' || new.status || '.',
    new.task_id
  );
  return new;
end;
$$;

create or replace function public.notify_booking_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'requested' then
    insert into public.user_notifications (user_id, event_type, title, body, task_id, booking_id)
    values (new.worker_id, 'booking_requested', 'New booking request',
            'A customer requested "' || new.title || '".', new.task_id, new.id);
  end if;
  return new;
end;
$$;

create or replace function public.notify_booking_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_id uuid;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  recipient_id := case
    when auth.uid() = new.customer_id then new.worker_id
    else new.customer_id
  end;
  insert into public.user_notifications (user_id, event_type, title, body, task_id, booking_id)
  values (recipient_id, 'booking_' || new.status, 'Booking updated',
          'Booking "' || new.title || '" is now ' || new.status || '.', new.task_id, new.id);
  return new;
end;
$$;

create or replace function public.notify_booking_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  booking_row public.bookings%rowtype;
  recipient_id uuid;
begin
  select * into booking_row from public.bookings where id = new.booking_id;
  recipient_id := case
    when new.sender_id = booking_row.customer_id then booking_row.worker_id
    else booking_row.customer_id
  end;
  insert into public.user_notifications (user_id, event_type, title, body, task_id, booking_id)
  values (recipient_id, 'booking_message', 'New booking message',
          'You have a new message about "' || booking_row.title || '".',
          booking_row.task_id, booking_row.id);
  return new;
end;
$$;

drop trigger if exists task_offer_created_notification on public.task_offers;
create trigger task_offer_created_notification
  after insert on public.task_offers
  for each row execute function public.notify_task_offer_created();

drop trigger if exists task_offer_status_notification on public.task_offers;
create trigger task_offer_status_notification
  after update of status on public.task_offers
  for each row execute function public.notify_task_offer_status();

drop trigger if exists booking_created_notification on public.bookings;
create trigger booking_created_notification
  after insert on public.bookings
  for each row execute function public.notify_booking_created();

drop trigger if exists booking_status_notification on public.bookings;
create trigger booking_status_notification
  after update of status on public.bookings
  for each row execute function public.notify_booking_status();

drop trigger if exists booking_message_notification on public.booking_messages;
create trigger booking_message_notification
  after insert on public.booking_messages
  for each row execute function public.notify_booking_message();

revoke all on function public.notify_task_offer_created() from public, anon, authenticated;
revoke all on function public.notify_task_offer_status() from public, anon, authenticated;
revoke all on function public.notify_booking_created() from public, anon, authenticated;
revoke all on function public.notify_booking_status() from public, anon, authenticated;
revoke all on function public.notify_booking_message() from public, anon, authenticated;

commit;