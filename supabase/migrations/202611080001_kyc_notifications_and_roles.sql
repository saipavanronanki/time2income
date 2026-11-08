-- Migration: 202611080001_kyc_notifications_and_roles.sql
-- Description: Sets up conditional KYC verification tables, user notification tracking, and admin role enforcement with RLS.

begin;

-- 1. KYC Submissions & Documents
create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('not_started', 'pending', 'under_review', 'approved', 'rejected', 'resubmission_required')),
  full_name text not null,
  document_type text not null check (document_type in ('passport', 'driving_license', 'national_id', 'residence_permit')),
  notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kyc_documents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.kyc_submissions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_path text not null,
  file_type text not null,
  file_size integer not null,
  created_at timestamptz not null default now()
);

-- Ensure private KYC Storage Bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc-documents',
  'kyc-documents',
  false, -- private bucket!
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
on conflict (id) do nothing;

-- 2. Admin Helper Function
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select coalesce(auth.jwt()->'app_metadata'->>'role' in ('admin', 'moderator'), false)
      or coalesce((auth.jwt()->'app_metadata'->>'is_admin')::boolean, false)
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and 'admin' = any(roles)
      );
$$;

-- 3. Row Level Security for KYC
alter table public.kyc_submissions enable row level security;
alter table public.kyc_documents enable row level security;

-- Users can only view their own KYC submissions; Admins can view all
drop policy if exists "users read own kyc" on public.kyc_submissions;
create policy "users read own kyc" on public.kyc_submissions
  for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());

-- Users can insert their own KYC submissions
drop policy if exists "users create own kyc" on public.kyc_submissions;
create policy "users create own kyc" on public.kyc_submissions
  for insert to authenticated
  with check (user_id = auth.uid());

-- Only admins can update KYC status (e.g. approve or reject)
drop policy if exists "admins update kyc submissions" on public.kyc_submissions;
create policy "admins update kyc submissions" on public.kyc_submissions
  for update to authenticated
  using (public.is_platform_admin());

-- Documents access restricted to owner and admins
drop policy if exists "users read own kyc documents" on public.kyc_documents;
create policy "users read own kyc documents" on public.kyc_documents
  for select to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "users upload own kyc documents" on public.kyc_documents;
create policy "users upload own kyc documents" on public.kyc_documents
  for insert to authenticated
  with check (user_id = auth.uid());

-- Storage policies for private kyc-documents bucket
drop policy if exists "users upload own kyc storage" on storage.objects;
create policy "users upload own kyc storage" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "users and admins read kyc storage" on storage.objects;
create policy "users and admins read kyc storage" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (split_part(name, '/', 1) = auth.uid()::text or public.is_platform_admin())
  );

-- 4. In-App Notification Helper
create or replace function public.create_user_notification(
  p_user_id uuid,
  p_event_type text,
  p_title text,
  p_body text,
  p_task_id uuid default null,
  p_booking_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notification_id uuid;
begin
  insert into public.user_notifications (user_id, event_type, title, body, task_id, booking_id)
  values (p_user_id, p_event_type, p_title, p_body, p_task_id, p_booking_id)
  returning id into v_notification_id;
  return v_notification_id;
end;
$$;

grant execute on function public.create_user_notification to authenticated, service_role;

-- 5. Enable Realtime on user_notifications if publication exists
do $$ begin
  alter publication supabase_realtime add table public.user_notifications;
exception when duplicate_object then null; when undefined_object then null; end $$;

commit;
