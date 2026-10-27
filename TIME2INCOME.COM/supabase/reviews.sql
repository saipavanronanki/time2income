-- Reviews for completed bookings. Run once in the Supabase SQL editor.
-- Only the customer of a completed booking may review it, once per booking.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  worker_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);

-- An older reviews table may already exist with reviewee_id instead of worker_id.
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'reviews' and column_name = 'reviewee_id')
     and not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'reviews' and column_name = 'worker_id') then
    alter table public.reviews rename column reviewee_id to worker_id;
  end if;
end $$;

create index if not exists reviews_worker_idx on public.reviews(worker_id, created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "reviews are public to signed-in users" on public.reviews;
create policy "reviews are public to signed-in users" on public.reviews
  for select to authenticated using (true);

drop policy if exists "customer reviews own completed booking" on public.reviews;
create policy "customer reviews own completed booking" on public.reviews
  for insert to authenticated with check (
    reviewer_id = (select auth.uid())
    and exists (
      select 1 from public.bookings b
      where b.id = reviews.booking_id
        and b.customer_id = (select auth.uid())
        and b.worker_id = reviews.worker_id
        and b.status = 'completed'
    )
  );
