-- Backward-compatible preferences and provider-language fields for the live project.

alter table public.profiles
  add column if not exists preferred_currency text not null default 'INR';

alter table public.worker_profiles
  add column if not exists service_languages text[] not null default '{}';

alter table public.profiles
  drop constraint if exists profiles_preferred_currency_check;
alter table public.profiles
  add constraint profiles_preferred_currency_check
  check (preferred_currency ~ '^[A-Z]{3}$');

create index if not exists worker_profiles_service_languages_idx
  on public.worker_profiles using gin(service_languages);

grant select (preferred_language, preferred_currency)
  on public.profiles to authenticated;
grant select (service_languages)
  on public.worker_profiles to anon, authenticated;