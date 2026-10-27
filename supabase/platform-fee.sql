begin;

create table if not exists public.platform_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  receipt text not null unique,
  amount integer not null check (amount > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('created', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.platform_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  razorpay_payment_id text not null unique,
  activated_at timestamptz not null default now()
);

create unique index if not exists platform_payments_one_pending_per_user_idx
  on public.platform_payments (user_id)
  where status = 'created';

alter table public.platform_payments enable row level security;
alter table public.platform_entitlements enable row level security;
revoke all on public.platform_payments, public.platform_entitlements from public, anon, authenticated;

create or replace function public.has_active_platform_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_entitlements e
    where e.user_id = auth.uid()
  );
$$;

revoke all on function public.has_active_platform_access() from public, anon;
grant execute on function public.has_active_platform_access() to authenticated;

do $$
declare
  table_name text;
  protected_tables text[] := array[
    'profiles', 'worker_profiles', 'categories', 'tasks', 'task_offers',
    'bookings', 'booking_messages', 'user_notifications'
  ];
begin
  foreach table_name in array protected_tables loop
    execute format('drop policy if exists %I on public.%I', 'require paid platform activation', table_name);
    execute format(
      'create policy %I on public.%I as restrictive for all to authenticated using (public.has_active_platform_access()) with check (public.has_active_platform_access())',
      'require paid platform activation',
      table_name
    );
  end loop;
end;
$$;

do $$
begin
  if to_regclass('public.reviews') is not null then
    execute 'drop policy if exists "require paid platform activation" on public.reviews';
    execute 'create policy "require paid platform activation" on public.reviews as restrictive for all to authenticated using (public.has_active_platform_access()) with check (public.has_active_platform_access())';
  end if;
end;
$$;

drop policy if exists "require paid worker portfolio access" on storage.objects;
create policy "require paid worker portfolio access" on storage.objects
  as restrictive for all to authenticated
  using (
    bucket_id <> 'worker-portfolio' or public.has_active_platform_access()
  )
  with check (
    bucket_id <> 'worker-portfolio' or public.has_active_platform_access()
  );

create or replace function public.enforce_platform_activation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.has_active_platform_access() then
    raise exception 'Complete the platform activation payment before using TIME2INCOME.'
      using errcode = '42501';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.enforce_platform_activation() from public, anon, authenticated;

do $$
begin
  if to_regclass('public.reviews') is not null then
    execute 'drop trigger if exists require_paid_platform_activation on public.reviews';
    execute 'create trigger require_paid_platform_activation before insert or update or delete on public.reviews for each row execute function public.enforce_platform_activation()';
  end if;
end;
$$;

do $$
declare
  table_name text;
  protected_tables text[] := array[
    'profiles', 'worker_profiles', 'tasks', 'task_offers', 'bookings',
    'booking_messages', 'user_notifications'
  ];
begin
  foreach table_name in array protected_tables loop
    execute format('drop trigger if exists require_paid_platform_activation on public.%I', table_name);
    execute format(
      'create trigger require_paid_platform_activation before insert or update or delete on public.%I for each row execute function public.enforce_platform_activation()',
      table_name
    );
  end loop;
end;
$$;

commit;
