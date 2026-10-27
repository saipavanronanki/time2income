-- Restrict marketplace discovery and task data to signed-in accounts.

drop policy if exists "public reads published provider names" on public.profiles;
drop policy if exists "public reads published worker profiles" on public.worker_profiles;
drop policy if exists "public reads active categories" on public.categories;

drop policy if exists "authenticated reads published worker profiles" on public.worker_profiles;
create policy "authenticated reads published worker profiles" on public.worker_profiles
  for select to authenticated using (
    is_published = true or user_id = (select auth.uid())
  );

drop policy if exists "authenticated reads active categories" on public.categories;
create policy "authenticated reads active categories" on public.categories
  for select to authenticated using (is_active = true);

grant select on public.profiles to authenticated;
revoke all privileges on public.profiles from anon;
revoke select (id, display_name) on public.profiles from anon;

revoke all privileges on public.worker_profiles from anon;
revoke select (
  user_id, headline, bio, skills, category_id, work_preference,
  hourly_rate, currency_code, service_city, service_country, is_published,
  portfolio_images, service_languages
) on public.worker_profiles from anon;

revoke all privileges on public.categories from anon;
revoke all privileges on public.tasks from anon;
revoke all privileges on public.task_offers from anon;
revoke all privileges on public.bookings from anon;
