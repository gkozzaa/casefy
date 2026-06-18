-- Casefy — Supabase schema for auth-linked entitlements.
-- Run this in the Supabase SQL editor after enabling Auth.

-- Per-user profile holding billing + usage state.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  is_pro      boolean not null default false,
  cases_used  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can read and update only their own row.
create policy "profiles are self-readable"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are self-updatable"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic increment used after a case completes.
create or replace function public.increment_cases_used(uid uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.profiles set cases_used = cases_used + 1 where id = uid;
$$;
