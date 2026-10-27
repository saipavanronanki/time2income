begin;

alter table public.platform_payments
  add column if not exists creation_lease_until timestamptz;

commit;
