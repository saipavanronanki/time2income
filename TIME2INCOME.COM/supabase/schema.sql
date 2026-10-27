-- Time Economy Marketplace: starter schema for Supabase PostgreSQL.
-- Run only in a new/test project after reviewing. This is a foundation, not a complete production schema.

create extension if not exists pgcrypto;

-- Private-ish account profile. Do not store passwords here; Supabase Auth handles credentials.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  country text,
  city text,
  preferred_language text not null default 'en',
  roles text[] not null default array['customer']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_roles_allowed check (roles <@ array['customer','worker']::text[])
);

-- Public-facing worker data only. Keep email, phone, address and identity documents out of this table.
create table if not exists public.worker_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text,
  skills text[] not null default '{}',
  bio text,
  work_preference text not null default 'both' check (work_preference in ('local','remote','both')),
  hourly_rate numeric(12,2) check (hourly_rate is null or hourly_rate >= 0),
  currency_code char(3) not null default 'INR',
  service_city text,
  service_country text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 120),
  description text,
  category_id uuid references public.service_categories(id) on delete set null,
  work_type text not null default 'local' check (work_type in ('local','remote','either')),
  city text,
  country text,
  budget_min numeric(12,2) check (budget_min is null or budget_min >= 0),
  budget_max numeric(12,2) check (budget_max is null or budget_max >= 0),
  currency_code char(3) not null default 'INR',
  status text not null default 'open' check (status in ('draft','open','assigned','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_min is null or budget_max is null or budget_max >= budget_min)
);

create table if not exists public.task_offers (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete restrict,
  message text,
  proposed_price numeric(12,2) not null check (proposed_price >= 0),
  currency_code char(3) not null default 'INR',
  proposed_start timestamptz,
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(task_id, worker_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete set null,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  worker_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  booking_type text not null check (booking_type in ('hourly','fixed','shift')),
  starts_at timestamptz,
  ends_at timestamptz,
  agreed_price numeric(12,2) not null check (agreed_price >= 0),
  currency_code char(3) not null default 'INR',
  status text not null default 'requested' check (status in ('requested','accepted','confirmed','in_progress','completed','cancelled','disputed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or ends_at > starts_at),
  check (customer_id <> worker_id)
);

create index if not exists tasks_status_created_idx on public.tasks(status, created_at desc);
create index if not exists tasks_customer_idx on public.tasks(customer_id, created_at desc);
create index if not exists worker_profiles_published_idx on public.worker_profiles(is_published, service_country, service_city);
create index if not exists offers_task_idx on public.task_offers(task_id, created_at desc);
create index if not exists bookings_customer_idx on public.bookings(customer_id, created_at desc);
create index if not exists bookings_worker_idx on public.bookings(worker_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.worker_profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_offers enable row level security;
alter table public.bookings enable row level security;

-- Profiles: authenticated users can read basic display profiles for marketplace matching;
-- only the owner can insert/update their own row.
create policy "authenticated users read profiles" on public.profiles
  for select to authenticated using (true);
create policy "users insert own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "users update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Worker directory only exposes published public worker profiles to authenticated users.
create policy "read published worker profiles" on public.worker_profiles
  for select to authenticated using (is_published = true or user_id = (select auth.uid()));
create policy "worker inserts own profile" on public.worker_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "worker updates own profile" on public.worker_profiles
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "worker deletes own profile" on public.worker_profiles
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "authenticated users read active categories" on public.service_categories
  for select to authenticated using (is_active = true);

-- Signed-in users can browse open tasks and always see their own tasks.
create policy "read open tasks or own tasks" on public.tasks
  for select to authenticated using (status = 'open' or customer_id = (select auth.uid()));
create policy "customers insert own tasks" on public.tasks
  for insert to authenticated with check (customer_id = (select auth.uid()));
create policy "customers update own tasks" on public.tasks
  for update to authenticated using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));
create policy "customers delete own draft tasks" on public.tasks
  for delete to authenticated using (customer_id = (select auth.uid()) and status = 'draft');

-- Offers: only the worker who made an offer and the owner of the related task can read it.
create policy "task owner or offer worker reads offers" on public.task_offers
  for select to authenticated using (
    worker_id = (select auth.uid()) or exists (
      select 1 from public.tasks t where t.id = task_offers.task_id and t.customer_id = (select auth.uid())
    )
  );
create policy "workers create own offers on open tasks" on public.task_offers
  for insert to authenticated with check (
    worker_id = (select auth.uid()) and exists (
      select 1 from public.tasks t where t.id = task_offers.task_id and t.status = 'open' and t.customer_id <> (select auth.uid())
    )
  );
create policy "workers update own pending offers" on public.task_offers
  for update to authenticated using (worker_id = (select auth.uid()) and status = 'pending')
  with check (worker_id = (select auth.uid()));
create policy "workers delete own pending offers" on public.task_offers
  for delete to authenticated using (worker_id = (select auth.uid()) and status = 'pending');

-- Booking details are visible only to the customer and worker on the booking.
create policy "participants read bookings" on public.bookings
  for select to authenticated using (customer_id = (select auth.uid()) or worker_id = (select auth.uid()));
create policy "customer creates booking request" on public.bookings
  for insert to authenticated with check (customer_id = (select auth.uid()) and customer_id <> worker_id);
create policy "participants update booking" on public.bookings
  for update to authenticated using (customer_id = (select auth.uid()) or worker_id = (select auth.uid()))
  with check (customer_id = (select auth.uid()) or worker_id = (select auth.uid()));

-- Note: production booking transitions and overlapping-time prevention should be enforced
-- with server-side logic/database constraints before public launch. Do not rely on client UI alone.
