-- ============================================================
-- NUI Print Requests Table
-- Run this in: https://supabase.com/dashboard/project/jcgvkyizoimwbolhfpta/sql/new
-- ============================================================

-- 1. PRINT REQUESTS
-- Captures every client print request from /print page
create table if not exists public.print_requests (
  id              bigserial primary key,
  request_id      text unique not null,          -- e.g. PRINT-ABC123
  client_name     text not null,
  phone           text not null,
  address         text,
  qty_notes       text,                           -- "25 signs, 24x18"
  extra_notes     text,
  product         text not null,                  -- "Yard Signs (4mm Coro, 10 pack)"
  price           text,                           -- "$83"
  industry        text default 'general',         -- from URL param
  status          text default 'new'
                  check (status in ('new', 'in_production', 'shipped', 'delivered', 'cancelled')),
  signs365_order  text,                           -- Signs365 order number once placed
  tracking        text,                           -- shipping tracking number
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 2. Auto-update updated_at on any change
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists print_requests_updated_at on public.print_requests;
create trigger print_requests_updated_at
  before update on public.print_requests
  for each row execute function public.handle_updated_at();

-- 3. Indexes for common queries
create index if not exists idx_print_requests_status   on public.print_requests (status);
create index if not exists idx_print_requests_phone    on public.print_requests (phone);
create index if not exists idx_print_requests_industry on public.print_requests (industry);
create index if not exists idx_print_requests_created  on public.print_requests (created_at desc);

-- 4. Row Level Security — service role bypasses, anon blocked
alter table public.print_requests enable row level security;

-- Allow service role (used by Netlify functions) full access
create policy "Service role full access"
  on public.print_requests
  for all
  using (auth.role() = 'service_role');

-- 5. Verify the table was created
select column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'print_requests'
order by ordinal_position;
