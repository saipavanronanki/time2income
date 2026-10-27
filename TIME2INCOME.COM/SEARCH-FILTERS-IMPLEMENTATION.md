# TIME2INCOME advanced search update

This source-only update adds marketplace search controls to the existing homepage. It does not deploy the site or execute any SQL against Supabase.

## Added filters

- Shared service/task category filter populated from the app's existing `categories` table (`id`, `name`, `is_active`).
- Provider minimum/maximum hourly rate using `worker_profiles.hourly_rate` and `currency_code`.
- Local/in-person versus remote/online service filter using `worker_profiles.work_preference`.
- Provider date availability check using overlapping active `bookings` records (`worker_id`, `starts_at`, `ends_at`, `status`). It is a best-effort check against bookings visible under current RLS policies, not a provider-published schedule. The existing policies may hide other customers’ bookings, so this cannot guarantee availability until the project adds a privacy-safe availability lookup or provider-managed schedule. The UI warns when access policies prevent verification.
- Minimum customer rating using actual `reviews.rating` rows grouped by `reviews.worker_id`; providers with no visible reviews do not qualify for a rating threshold.
- Skills keyword matching against the existing provider headline/category/skills tags.
- Distance radius using browser geolocation and provider `service_latitude`/`service_longitude` coordinates. A location permission is required; profiles without coordinates cannot match a radius.
- Job/task work type, pay type, and min/max task budget filters in the existing “Find work” mode.

## Existing schema compatibility notes

The application code and `supabase/upgrade-live-project.sql` use the existing `public.categories` table and legacy task columns such as `work_mode`, `pricing_type`, `budget`, and `scheduled_start`. The starter `supabase/schema.sql` uses different names (`service_categories`, `work_type`, `budget_min`/`budget_max`) and therefore is not a definitive description of the currently deployed schema. This update follows the existing application query names and does not rewrite database schema files.

The optional `supabase/provider-location-coordinates.sql` migration adds provider coordinate columns. The provider directory now falls back to loading profiles without coordinates if those columns are missing or inaccessible, so ordinary search can still load; radius filtering will require usable coordinates.

## Validation and limitations

- JavaScript syntax checks passed for `app.js`, `auth.js`, `payment.js`, `localization.js`, and `currency.js`.
- The homepage was checked for duplicate HTML IDs; none were found.
- This ZIP has not been connected to the live Supabase project in this environment. Real results still depend on the deployed schema, data, and RLS permissions. No production database or deployment was changed.


## Location suggestions testing mode

The homepage location field now offers local, hard-coded sample suggestions for several Indian cities/areas and a Remote / Online option. Selecting a physical location attaches demo coordinates for exercising the distance filter. This does not call an external geocoding API and is not production geocoding; remove or replace the mock list with a real provider before deployment.
