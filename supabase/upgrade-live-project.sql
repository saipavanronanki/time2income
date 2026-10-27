-- Upgrade the existing TIME2INCOME project schema without dropping user data.

alter table public.categories
  add column if not exists is_active boolean not null default true;

insert into public.categories (name) values
  ('Home services'),
  ('Driving & delivery'),
  ('Digital & creative'),
  ('Office support'),
  ('Education'),
  ('Personal help')
on conflict (name) do update set is_active = true;

alter table public.worker_profiles
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists work_preference text,
  add column if not exists service_city text,
  add column if not exists service_country text,
  add column if not exists is_published boolean not null default false;

update public.worker_profiles
set work_preference = case
      when work_preference in ('local', 'remote', 'both') then work_preference
      when work_mode in ('local', 'remote', 'both') then work_mode
      else 'both'
    end,
    service_city = coalesce(service_city, city),
    service_country = coalesce(service_country, country)
  where work_preference is null
     or (service_city is null and city is not null)
     or (service_country is null and country is not null);

alter table public.worker_profiles
  alter column work_preference set default 'both',
  alter column work_preference set not null;
alter table public.worker_profiles
  drop constraint if exists worker_profiles_work_preference_check;
alter table public.worker_profiles
  add constraint worker_profiles_work_preference_check
  check (work_preference in ('local', 'remote', 'both'));

alter table public.bookings
  add column if not exists title text,
  add column if not exists booking_type text not null default 'hourly',
  add column if not exists updated_at timestamptz not null default now();
update public.bookings b
set title = coalesce(nullif(trim(w.headline), ''), 'Service booking')
from public.worker_profiles w
where w.user_id = b.worker_id and (b.title is null or trim(b.title) = '');
update public.bookings
set title = 'Service booking'
where title is null or trim(title) = '';
alter table public.bookings alter column title set not null;

alter table public.worker_profiles
  drop constraint if exists worker_profiles_publish_complete;
alter table public.worker_profiles
  add constraint worker_profiles_publish_complete check (
    not is_published or (
      nullif(trim(headline), '') is not null
      and nullif(trim(bio), '') is not null
      and hourly_rate is not null
      and hourly_rate > 0
      and nullif(trim(service_country), '') is not null
      and category_id is not null
    )
  );

drop policy if exists "authenticated users read profiles" on public.profiles;
drop policy if exists "profiles_read_authenticated" on public.profiles;
drop policy if exists "public reads published provider names" on public.profiles;
drop policy if exists "users read own or published provider names" on public.profiles;
create policy "public reads published provider names" on public.profiles
  for select to anon using (
    exists (
      select 1 from public.worker_profiles w
      where w.user_id = profiles.id and w.is_published = true
    )
  );
create policy "users read own or published provider names" on public.profiles
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
  );
revoke select on public.profiles from anon, authenticated;
grant select (id, display_name) on public.profiles to anon, authenticated;

drop policy if exists "workers_read_authenticated" on public.worker_profiles;
drop policy if exists "public reads published worker profiles" on public.worker_profiles;
create policy "public reads published worker profiles" on public.worker_profiles
  for select to anon, authenticated using (
    is_published = true or user_id = (select auth.uid())
  );
revoke select on public.worker_profiles from anon, authenticated;
grant select (
  user_id, headline, bio, skills, category_id, work_preference,
  hourly_rate, currency_code, service_city, service_country, is_published
) on public.worker_profiles to anon, authenticated;

drop policy if exists "categories_read_public" on public.categories;
drop policy if exists "public reads active categories" on public.categories;
create policy "public reads active categories" on public.categories
  for select to anon, authenticated using (is_active = true);

drop policy if exists "bookings_insert_customer" on public.bookings;
drop policy if exists "customer creates booking request" on public.bookings;
revoke insert on public.bookings from anon, authenticated;
drop policy if exists "bookings_update_participants" on public.bookings;
drop policy if exists "participants update booking" on public.bookings;
revoke update on public.bookings from anon, authenticated;

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check check (
  status in ('requested', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled', 'declined', 'disputed')
);

create or replace function public.request_booking(p_worker_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  provider public.worker_profiles%rowtype;
  booking_row public.bookings%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in is required.' using errcode = '42501';
  end if;
  if p_worker_id = auth.uid() then
    raise exception 'You cannot request a booking with your own profile.' using errcode = '42501';
  end if;

  select * into provider
  from public.worker_profiles
  where user_id = p_worker_id and is_published = true
  for update;
  if not found then
    raise exception 'This provider is not available for booking.' using errcode = 'P0002';
  end if;
  if exists (
    select 1 from public.bookings b
    where b.customer_id = auth.uid()
      and b.worker_id = p_worker_id
      and b.status in ('requested', 'accepted', 'confirmed', 'in_progress')
  ) then
    raise exception 'You already have an active booking with this provider.' using errcode = '23505';
  end if;

  insert into public.bookings (
    customer_id, worker_id, title, booking_type, agreed_price, currency_code, status
  ) values (
    auth.uid(), p_worker_id, coalesce(nullif(trim(provider.headline), ''), 'Service booking'),
    'hourly', provider.hourly_rate, provider.currency_code, 'requested'
  ) returning * into booking_row;

  return booking_row;
end;
$$;
revoke all on function public.request_booking(uuid) from public, anon;
grant execute on function public.request_booking(uuid) to authenticated;

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
  else
    raise exception 'This booking action is not allowed.' using errcode = '42501';
  end if;

  return booking_row;
end;
$$;
revoke all on function public.respond_to_booking(uuid, text) from public, anon;
grant execute on function public.respond_to_booking(uuid, text) to authenticated;