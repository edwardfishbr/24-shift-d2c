-- 24 SHIFT hardening migration (email/cep validation support + ops indexes)
-- Safe to run multiple times.

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
