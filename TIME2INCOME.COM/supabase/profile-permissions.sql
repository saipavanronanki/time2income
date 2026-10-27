-- Restore authenticated profile access for the existing legacy project.
-- Row-level security remains enabled and its existing policies still apply.

grant select on public.profiles to authenticated;
grant update (
  avatar_url, city, country_code, full_name, preferred_role, region, updated_at
) on public.profiles to authenticated;
