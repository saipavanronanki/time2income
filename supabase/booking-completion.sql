begin;

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check check (
  status in (
    'requested', 'accepted', 'confirmed', 'in_progress',
    'completion_pending', 'completed', 'cancelled', 'declined', 'disputed'
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
        and b.status in (
          'requested', 'accepted', 'confirmed', 'in_progress',
          'completion_pending', 'disputed'
        )
    )
  );

create or replace function public.respond_to_booking(p_booking_id uuid, p_action text)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  booking_row public.bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in is required.' using errcode = '42501';
  end if;

  select * into booking_row
  from public.bookings
  where id = p_booking_id
  for update;
  if not found then
    raise exception 'Booking not found.' using errcode = 'P0002';
  end if;

  if booking_row.customer_id = auth.uid()
     and p_action = 'cancel'
     and booking_row.status in ('requested', 'accepted') then
    update public.bookings
    set status = 'cancelled', updated_at = now()
    where id = p_booking_id
    returning * into booking_row;
  elsif booking_row.worker_id = auth.uid()
        and p_action in ('accept', 'reject')
        and booking_row.status = 'requested' then
    update public.bookings
    set status = case when p_action = 'accept' then 'accepted' else 'declined' end,
        updated_at = now()
    where id = p_booking_id
    returning * into booking_row;
  elsif booking_row.worker_id = auth.uid()
        and p_action = 'start'
        and booking_row.status in ('accepted', 'confirmed') then
    update public.bookings
    set status = 'in_progress', updated_at = now()
    where id = p_booking_id
    returning * into booking_row;
  elsif booking_row.worker_id = auth.uid()
        and p_action = 'complete'
        and booking_row.status = 'in_progress' then
    update public.bookings
    set status = 'completion_pending', updated_at = now()
    where id = p_booking_id
    returning * into booking_row;
  elsif booking_row.customer_id = auth.uid()
        and p_action = 'confirm_complete'
        and booking_row.status = 'completion_pending' then
    update public.bookings
    set status = 'completed', updated_at = now()
    where id = p_booking_id
    returning * into booking_row;

    if booking_row.task_id is not null then
      update public.tasks
      set status = 'completed'
      where id = booking_row.task_id and status = 'assigned';
    end if;
  elsif booking_row.customer_id = auth.uid()
        and p_action = 'dispute'
        and booking_row.status = 'completion_pending' then
    update public.bookings
    set status = 'disputed', updated_at = now()
    where id = p_booking_id
    returning * into booking_row;
  else
    raise exception 'This booking action is not allowed.' using errcode = '42501';
  end if;

  return booking_row;
end;
$$;

revoke all on function public.respond_to_booking(uuid, text) from public, anon;
grant execute on function public.respond_to_booking(uuid, text) to authenticated;

commit;