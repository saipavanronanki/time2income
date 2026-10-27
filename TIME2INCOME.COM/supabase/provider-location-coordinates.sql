-- Add coarse, optional provider coordinates for client-side nearby ranking.
-- Apply this migration before deploying the matching app.js changes.
-- Provider coordinates are rounded in the browser and are visible only to
-- signed-in users through the existing published-profile RLS policy.

alter table public.worker_profiles
  add column if not exists service_latitude numeric(4,1),
  add column if not exists service_longitude numeric(4,1);

alter table public.worker_profiles
  drop constraint if exists worker_profiles_service_coordinates_valid;
alter table public.worker_profiles
  add constraint worker_profiles_service_coordinates_valid check (
    (service_latitude is null and service_longitude is null)
    or (
      service_latitude is not null
      and service_longitude is not null
      and service_latitude between -90 and 90
      and service_longitude between -180 and 180
    )
  );

revoke select on public.worker_profiles from anon;
revoke select (service_latitude, service_longitude)
  on public.worker_profiles from anon;
grant select (service_latitude, service_longitude)
  on public.worker_profiles to authenticated;
grant insert (service_latitude, service_longitude),
      update (service_latitude, service_longitude)
  on public.worker_profiles to authenticated;
