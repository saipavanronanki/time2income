-- Enable worker offers on open tasks and customer-controlled offer decisions.

drop policy if exists "users read own or published provider names" on public.profiles;
drop policy if exists "users read own or marketplace participant names" on public.profiles;
create policy "users read own or marketplace participant names" on public.profiles
  for select to authenticated using (
    id = (select auth.uid())
    or exists (
      select 1 from public.worker_profiles w
      where w.user_id = profiles.id and w.is_published = true
    )
    or exists (
      select 1 from public.bookings b
      where (b.customer_id = (select auth.uid()) and b.worker_id = profiles.id)
         or (b.worker_id = (select auth.uid()) and b.customer_id = profiles.id)
    )
    or exists (
      select 1
      from public.task_offers o
      join public.tasks t on t.id = o.task_id
      where (t.customer_id = (select auth.uid()) and o.worker_id = profiles.id)
         or (o.worker_id = (select auth.uid()) and t.customer_id = profiles.id)
    )
  );

drop policy if exists "offers_update_own" on public.task_offers;
revoke update on public.task_offers from anon, authenticated;

create or replace function public.respond_to_task_offer(p_offer_id uuid, p_action text)
returns public.task_offers
language plpgsql
security definer
set search_path = ''
as $$
declare
  offer_row public.task_offers%rowtype;
  task_row public.tasks%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in is required.' using errcode = '42501';
  end if;

  select * into offer_row
  from public.task_offers
  where id = p_offer_id
  for update;
  if not found then
    raise exception 'Offer not found.' using errcode = 'P0002';
  end if;

  select * into task_row
  from public.tasks
  where id = offer_row.task_id
  for update;
  if not found then
    raise exception 'Task not found.' using errcode = 'P0002';
  end if;

  if p_action = 'withdraw'
     and offer_row.worker_id = auth.uid()
     and offer_row.status = 'pending' then
    update public.task_offers
    set status = 'withdrawn'
    where id = p_offer_id
    returning * into offer_row;
  elsif p_action in ('accept', 'reject')
        and task_row.customer_id = auth.uid()
        and task_row.status = 'open'
        and offer_row.status = 'pending' then
    update public.task_offers
    set status = case when p_action = 'accept' then 'accepted' else 'rejected' end
    where id = p_offer_id
    returning * into offer_row;

    if p_action = 'accept' then
      update public.task_offers
      set status = 'rejected'
      where task_id = task_row.id
        and id <> p_offer_id
        and status = 'pending';
      update public.tasks
      set status = 'assigned'
      where id = task_row.id;
      insert into public.bookings (
        task_id, customer_id, worker_id, title, booking_type,
        agreed_price, currency_code, status
      ) values (
        task_row.id, task_row.customer_id, offer_row.worker_id, task_row.title,
        task_row.pricing_type, offer_row.proposed_price, offer_row.currency_code, 'confirmed'
      );
    end if;
  else
    raise exception 'This offer action is not allowed.' using errcode = '42501';
  end if;

  return offer_row;
end;
$$;

revoke all on function public.respond_to_task_offer(uuid, text) from public, anon;
grant execute on function public.respond_to_task_offer(uuid, text) to authenticated;