-- ═══════════════════════════════════════════════════════════════
-- APERTURE — blocker fixes (C-1, C-2, C-3) + exposure enforcement
-- Run after 0001_initial_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ─── C-2 · bookings are RPC-only ──────────────────────────────
drop policy if exists bookings_insert on public.rental_bookings;
-- No INSERT policy. No UPDATE policy. All writes via SECURITY DEFINER RPC.

-- Human-readable booking reference, server-generated.
create or replace function public.gen_booking_reference() returns text
language sql volatile as $$
  select 'APR-' || upper(substr(encode(gen_random_bytes(5),'hex'), 1, 7));
$$;

alter table public.rental_bookings
  alter column reference set default public.gen_booking_reference();

-- ─── C-1 · deposit policy as data, not scattered constants ────
create table public.deposit_rules (
  id                      uuid primary key default gen_random_uuid(),
  min_tier                verification_tier not null,
  requires_vouch          boolean not null default false,
  max_replacement_minor   bigint not null,
  deposit_pct             numeric(5,4) not null check (deposit_pct >= 0),
  deposit_min_minor       bigint not null default 0,
  requires_premium_cover  boolean not null default false,
  requires_manual_review  boolean not null default false,
  sort_order              smallint not null,
  is_active               boolean not null default true
);

insert into public.deposit_rules
  (min_tier, requires_vouch, max_replacement_minor, deposit_pct,
   deposit_min_minor, requires_premium_cover, requires_manual_review, sort_order)
values
  ('t1', false,    2500000, 0.3000,      0, false, false, 10),
  ('t2', false,   15000000, 0.1500, 200000, false, false, 20),
  ('t2', true,     7500000, 0.0000,      0, false, false, 25), -- vouched, subsidised
  ('t3', false,   15000000, 0.0000,      0, false, false, 30),
  ('t3', false,   50000000, 0.1000,      0, true,  false, 40),
  ('t4', false, 9223372036854775807, 0.1000, 0, true, true, 50);

alter table public.deposit_rules enable row level security;
create policy deposit_rules_read on public.deposit_rules for select using (is_active);

-- Community vouching for the launch cohort.
create table public.creator_vouches (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  voucher_id    uuid not null references public.profiles(id) on delete restrict,
  community_id  uuid references public.communities(id) on delete set null,
  note          text,
  revoked_at    timestamptz,
  created_at    timestamptz not null default now(),
  unique (profile_id, voucher_id),
  check (profile_id <> voucher_id)
);
alter table public.creator_vouches enable row level security;
create policy vouches_read on public.creator_vouches for select to authenticated
  using (profile_id = auth.uid() or voucher_id = auth.uid() or public.is_staff());
-- Writes are service-role only: vouching is a manual trust-ops action.

-- Platform-wide subsidised exposure ceiling. Single row, service-role writes.
create table public.platform_risk_limits (
  id                        boolean primary key default true check (id),
  subsidised_cap_minor      bigint not null default 50000000,  -- ₹5,00,000
  subsidised_open_minor     bigint not null default 0,
  high_value_paused         boolean not null default false,
  paused_reason             text,
  updated_at                timestamptz not null default now()
);
insert into public.platform_risk_limits (id) values (true);
alter table public.platform_risk_limits enable row level security;
create policy risk_limits_staff on public.platform_risk_limits
  for select using (public.is_staff());

-- ─── Exposure caps as data ────────────────────────────────────
create table public.exposure_limits (
  tier                        verification_tier primary key,
  max_per_transaction_minor   bigint not null,
  max_concurrent_minor        bigint not null,
  max_bookings_per_week       smallint not null,
  max_distinct_owners_72h     smallint not null
);
insert into public.exposure_limits values
  ('t0',        0,        0,  0, 0),
  ('t1',  2500000,  4000000,  3, 2),   -- C-9 fix: concurrent > per-transaction
  ('t2', 15000000, 15000000,  6, 3),
  ('t3', 15000000, 40000000, 12, 6),
  ('t4', 50000000,100000000, 30, 12);

alter table public.exposure_limits enable row level security;
create policy exposure_limits_read on public.exposure_limits for select using (true);

-- ─── The control that must not be dropped ─────────────────────
-- Returns NULL if the renter may proceed, else a human-readable refusal.
create or replace function public.check_renter_exposure(
  p_renter        uuid,
  p_new_value_minor bigint,
  p_owner         uuid
) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  v_tier      verification_tier;
  v_lim       public.exposure_limits%rowtype;
  v_open      bigint;
  v_week      integer;
  v_owners72  integer;
  v_paused    boolean;
begin
  select high_value_paused into v_paused from public.platform_risk_limits;
  if v_paused and p_new_value_minor > 15000000 then
    return 'High-value rentals are temporarily paused.';
  end if;

  select verification_tier into v_tier from public.profiles where id = p_renter;
  select * into v_lim from public.exposure_limits where tier = v_tier;

  if p_new_value_minor > v_lim.max_per_transaction_minor then
    return format('This item exceeds your per-rental limit of ₹%s. Verify your identity to raise it.',
                  to_char(v_lim.max_per_transaction_minor/100, 'FM9,99,99,999'));
  end if;

  v_open := public.renter_open_exposure_minor(p_renter);
  if v_open + p_new_value_minor > v_lim.max_concurrent_minor then
    return format('You are already holding ₹%s of equipment. Return an item to book more.',
                  to_char(v_open/100, 'FM9,99,99,999'));
  end if;

  select count(*) into v_week from public.rental_bookings
   where renter_id = p_renter and created_at > now() - interval '7 days'
     and status not in ('declined','expired','cancelled_by_renter');
  if v_week >= v_lim.max_bookings_per_week then
    return 'You have reached this week''s booking limit.';
  end if;

  select count(distinct owner_id) into v_owners72 from public.rental_bookings
   where renter_id = p_renter and created_at > now() - interval '72 hours'
     and status not in ('declined','expired','cancelled_by_renter');
  if v_owners72 >= v_lim.max_distinct_owners_72h and p_owner not in (
       select owner_id from public.rental_bookings
        where renter_id = p_renter and created_at > now() - interval '72 hours') then
    return 'Too many new rentals in a short period. Please try again in a day.';
  end if;

  return null;
end $$;

-- ─── C-3 · TCS from the first transaction ─────────────────────
alter table public.rental_bookings
  add column if not exists tcs_minor bigint not null default 0,
  add column if not exists tcs_rate  numeric(5,4) not null default 0.0050;

comment on column public.rental_bookings.tcs_minor is
  'TCS u/s 52 CGST Act, 0.5% of net taxable supply. Collected from MVP. GSTR-8 monthly.';

create table public.tax_periods (
  id             uuid primary key default gen_random_uuid(),
  period_month   date not null,
  state_code     char(2) not null,
  gross_minor    bigint not null default 0,
  tcs_minor      bigint not null default 0,
  filed_at       timestamptz,
  gstr8_ref      text,
  unique (period_month, state_code)
);
alter table public.tax_periods enable row level security;
create policy tax_periods_staff on public.tax_periods for select using (public.is_staff());
