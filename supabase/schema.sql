-- 24 SHIFT - Full Stack D2C schema
-- Run this SQL in Supabase SQL editor before starting API integrations.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  line text not null,
  name text not null,
  short_description text not null,
  description text not null,
  currency text not null default 'BRL',
  active boolean not null default true,
  provisional boolean not null default false,
  image text not null,
  price_cents integer,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  amount_cents integer not null,
  currency text not null default 'BRL',
  active boolean not null default true,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists prices_product_active_unique
  on public.prices (product_id)
  where active = true;

create table if not exists public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  status text not null default 'open',
  payment_status text not null default 'unpaid',
  customer_email text,
  subtotal_cents integer not null,
  shipping_cents integer not null,
  total_cents integer not null,
  currency text not null default 'BRL',
  items jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checkout_sessions_status_created_at_idx
  on public.checkout_sessions (status, created_at);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  payment_status text not null default 'unknown',
  customer_email text,
  customer_name text,
  postal_code text,
  postal_code_normalized text,
  postal_code_valid boolean not null default false,
  validation_flags jsonb not null default '{}'::jsonb,
  subtotal_cents integer not null,
  shipping_cents integer not null,
  total_cents integer not null,
  currency text not null default 'BRL',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  slug text not null,
  line text not null,
  name text not null,
  quantity integer not null,
  unit_price_cents integer not null,
  total_price_cents integer not null,
  created_at timestamptz not null default now()
);

create unique index if not exists order_items_order_product_unique
  on public.order_items (order_id, product_id);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  email_normalized text,
  cep text,
  cep_normalized text,
  message text not null,
  source text not null default 'site',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.contacts add column if not exists email_normalized text;
alter table public.contacts add column if not exists cep text;
alter table public.contacts add column if not exists cep_normalized text;

alter table public.orders add column if not exists postal_code text;
alter table public.orders add column if not exists postal_code_normalized text;
alter table public.orders add column if not exists postal_code_valid boolean not null default false;
alter table public.orders add column if not exists validation_flags jsonb not null default '{}'::jsonb;

create index if not exists contacts_email_normalized_idx
  on public.contacts (email_normalized);

create index if not exists contacts_cep_normalized_idx
  on public.contacts (cep_normalized);

create index if not exists orders_postal_code_valid_idx
  on public.orders (postal_code_valid, created_at);

create index if not exists orders_postal_code_invalid_idx
  on public.orders (created_at)
  where postal_code_valid = false;

create table if not exists public.automation_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  stripe_event_id text unique,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.automation_events(id) on delete cascade,
  task_type text not null,
  status text not null default 'pending',
  due_at timestamptz not null,
  next_attempt_at timestamptz not null,
  retries integer not null default 0,
  payload jsonb not null,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists automation_tasks_status_next_attempt_idx
  on public.automation_tasks (status, next_attempt_at);

create unique index if not exists automation_tasks_event_task_unique
  on public.automation_tasks (event_id, task_type);

create table if not exists public.automation_outbox (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.automation_tasks(id) on delete cascade,
  event_type text not null,
  endpoint text not null,
  payload jsonb not null,
  status text not null default 'queued',
  response jsonb,
  error text,
  dispatched_at timestamptz not null default now()
);
