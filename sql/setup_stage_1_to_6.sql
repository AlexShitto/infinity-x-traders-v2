create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'free' check (role in ('free', 'vip_elite', 'admin')),
  subscription_status text not null default 'inactive' check (subscription_status in ('inactive', 'active', 'expired', 'cancelled')),
  subscription_plan text not null default 'free',
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  symbol text not null default 'XAUUSD',
  direction text not null check (direction in ('BUY', 'SELL')),
  status text not null default 'draft' check (status in ('draft', 'active', 'waiting', 'closed', 'cancelled')),
  session text,
  entry numeric,
  stop_loss numeric,
  tp1 numeric,
  tp2 numeric,
  tp3 numeric,
  confidence int default 50 check (confidence >= 0 and confidence <= 100),
  summary text,
  logic text,
  is_vip_only boolean not null default true,
  created_by uuid references public.profiles(id),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  email text,
  plan text not null default 'vip_elite',
  amount numeric not null default 49,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid', 'failed')),
  provider text default 'manual',
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_signals_updated_at on public.signals;
create trigger set_signals_updated_at
before update on public.signals
for each row execute function public.set_updated_at();

drop trigger if exists set_payment_requests_updated_at on public.payment_requests;
create trigger set_payment_requests_updated_at
before update on public.payment_requests
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, subscription_status, subscription_plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'free',
    'inactive',
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

create or replace function public.is_vip_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and (
      role = 'admin'
      or (
        role = 'vip_elite'
        and subscription_status = 'active'
        and (subscription_expires_at is null or subscription_expires_at > now())
      )
    )
  );
$$;

alter table public.profiles enable row level security;
alter table public.signals enable row level security;
alter table public.payment_requests enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists signals_read_allowed on public.signals;
create policy signals_read_allowed
on public.signals
for select
using (is_vip_only = false or public.is_vip_or_admin());

drop policy if exists signals_admin_manage on public.signals;
create policy signals_admin_manage
on public.signals
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists payment_requests_own_insert on public.payment_requests;
create policy payment_requests_own_insert
on public.payment_requests
for insert
with check (user_id = auth.uid());

drop policy if exists payment_requests_own_or_admin_select on public.payment_requests;
create policy payment_requests_own_or_admin_select
on public.payment_requests
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists payment_requests_admin_update on public.payment_requests;
create policy payment_requests_admin_update
on public.payment_requests
for update
using (public.is_admin())
with check (public.is_admin());

insert into public.signals (symbol, direction, status, session, entry, stop_loss, tp1, tp2, tp3, confidence, summary, logic, is_vip_only, published_at)
values
('XAUUSD', 'BUY', 'active', 'New York', 2332.50, 2318.00, 2340.00, 2350.00, 2360.00, 84, 'Bullish reclaim from manipulation zone.', 'Low raid, manipulation, sharp reclaim, pullback into origin demand zone.', true, now()),
('EURUSD', 'BUY', 'active', 'London', 1.08750, 1.08200, 1.09600, null, null, 72, 'Public sample signal preview.', 'Free/public signal example for testing.', false, now())
on conflict do nothing;

-- After creating your admin user in Supabase Authentication, run this separately with your email:
-- insert into public.profiles (id, email, full_name, role, subscription_status, subscription_plan)
-- select id, email, 'Munashe Alexander Shitto', 'admin', 'active', 'admin'
-- from auth.users where email = 'munashealexandershitto@gmail.com'
-- on conflict (id) do update set role='admin', subscription_status='active', subscription_plan='admin';
