-- =====================================================================
-- APERTURE — PostgreSQL / Supabase schema
-- Version 1.0  ·  21 Aug 2026
-- Target: Postgres 15+ on Supabase
--
-- CONVENTIONS
--   * UUID v4 primary keys everywhere (id uuid pk default gen_random_uuid())
--   * All money stored as integer minor units (paise) + currency char(3).
--     NEVER float. NEVER numeric-without-currency.
--   * created_at / updated_at timestamptz NOT NULL DEFAULT now()
--   * Soft delete via deleted_at timestamptz NULL on user-authored content
--   * All FKs explicit with ON DELETE behaviour stated
--   * Enums as Postgres enum types (cheap, self-documenting, indexable)
--   * Every table that RLS touches has an owner-identifying column
--   * app_private schema holds anything the client must never reach
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";
create extension if not exists "btree_gist";
create extension if not exists "unaccent";

create schema if not exists app_private;
create schema if not exists app_public;

-- =====================================================================
-- 1. ENUMS
-- =====================================================================

create type user_role as enum (
  'user','creator','gear_owner','community_admin','moderator','admin','super_admin'
);

create type profile_type as enum ('individual','business','studio');

create type verification_tier as enum ('t0','t1','t2','t3','t4');

create type verification_kind as enum (
  'email','phone','government_id','liveness','address','bank_account',
  'gear_ownership','portfolio','professional','student','gstin'
);

create type verification_status as enum ('pending','in_review','verified','rejected','expired');

create type gear_condition as enum ('excellent','good','fair','needs_repair');

create type listing_status as enum ('draft','active','paused','archived','suspended');

create type booking_status as enum (
  'requested','accepted','declined','expired','payment_pending','confirmed',
  'awaiting_handover','active','awaiting_return','returned','under_inspection',
  'completed','cancelled_by_renter','cancelled_by_owner','no_show','disputed'
);

create type payment_status as enum (
  'created','authorized','captured','partially_refunded','refunded','failed','voided'
);

create type payout_status as enum ('pending','processing','paid','failed','on_hold','reversed');

create type hold_status as enum ('blocked','partially_captured','captured','released','failed');

create type protection_tier as enum ('none','basic','plus','third_party');

create type cancellation_policy as enum ('flexible','moderate','strict');

create type handoff_kind as enum ('pickup','return');

create type dispute_status as enum ('opened','responding','under_review','resolved','appealed','closed');

create type dispute_category as enum (
  'damage','non_return','missing_accessory','not_as_described','late_return',
  'no_show','payment','behaviour','safety','other'
);

create type connection_edge as enum (
  'connected','collaborated_with','credited_by','rented_from','rented_to',
  'hired','worked_for','co_attended','endorsed'
);

create type community_role as enum ('owner','moderator','member');
create type join_policy as enum ('open','request','invite_only');

create type project_status as enum ('planning','active','wrapped','completed','cancelled','archived');
create type credit_status as enum ('proposed','claimed','verified','disputed','revoked');

create type visibility as enum ('public','authenticated','connections','private');

create type notification_channel as enum ('in_app','email','push','sms','whatsapp');

-- =====================================================================
-- 2. IDENTITY & PROFILES
-- =====================================================================

-- auth.users is managed by Supabase Auth. profiles is our 1:1 extension.
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  username            citext unique not null,
  display_name        text not null,
  profile_type        profile_type not null default 'individual',
  headline            text,
  bio                 text,
  avatar_path         text,
  cover_path          text,
  city                text,
  state               text,
  country_code        char(2) not null default 'IN',
  -- precise location: SERVICE ROLE ONLY. Never selected by client policies.
  location_precise    geography(Point,4326),
  -- coarsened point used for all public display
  location_coarse     geography(Point,4326),
  location_radius_m   integer not null default 3000
                        check (location_radius_m in (1000,3000,10000,50000)),
  locality_label      text,
  languages           text[] not null default '{}',
  primary_role        text,
  verification_tier   verification_tier not null default 't0',
  is_available        boolean not null default true,
  availability_note   text,
  day_rate_minor      bigint check (day_rate_minor >= 0),
  currency            char(3) not null default 'INR',
  show_rate           boolean not null default false,
  -- reputation: SERVER WRITE ONLY (see RLS + triggers)
  credibility_identity      smallint not null default 0 check (credibility_identity between 0 and 100),
  credibility_reliability   smallint not null default 0 check (credibility_reliability between 0 and 100),
  credibility_peer          smallint not null default 0 check (credibility_peer between 0 and 100),
  credibility_contribution  smallint not null default 0 check (credibility_contribution between 0 and 100),
  credibility_tier          smallint not null default 0 check (credibility_tier between 0 and 4),
  completed_rentals   integer not null default 0,
  completed_projects  integer not null default 0,
  response_rate       numeric(4,3),
  response_median_min integer,
  last_active_at      timestamptz,
  onboarding_step     text,
  is_suspended        boolean not null default false,
  suspended_reason    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);
create index profiles_city_idx        on public.profiles (city) where deleted_at is null;
create index profiles_coarse_gix      on public.profiles using gist (location_coarse);
create index profiles_username_trgm   on public.profiles using gin (username gin_trgm_ops);
create index profiles_display_trgm    on public.profiles using gin (display_name gin_trgm_ops);
create index profiles_tier_idx        on public.profiles (credibility_tier desc, last_active_at desc);

-- Roles are stored, not derived, for auth-token performance; but they are
-- ONLY writable by service role. See 08-SUPABASE-RLS §3.
create table public.user_roles (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        user_role not null,
  granted_by  uuid references public.profiles(id) on delete set null,
  granted_at  timestamptz not null default now(),
  expires_at  timestamptz,
  primary key (user_id, role)
);

create table public.user_settings (
  user_id                   uuid primary key references public.profiles(id) on delete cascade,
  vis_profile               visibility not null default 'public',
  vis_portfolio             visibility not null default 'public',
  vis_gear_owned            visibility not null default 'public',
  vis_rental_history        visibility not null default 'public',
  vis_collab_history        visibility not null default 'public',
  vis_credibility_detail    visibility not null default 'private',
  vis_online_status         visibility not null default 'public',
  vis_event_attendance      visibility not null default 'authenticated',
  discoverable_on_radar     boolean not null default true,
  allow_messages_from       text not null default 'verified'
                              check (allow_messages_from in ('anyone','verified','connections')),
  notif_prefs               jsonb not null default '{}'::jsonb,
  locale                    text not null default 'en-IN',
  timezone                  text not null default 'Asia/Kolkata',
  updated_at                timestamptz not null default now()
);

create table public.user_devices (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  device_hash    text not null,
  user_agent     text,
  last_ip        inet,
  last_city      text,
  trusted        boolean not null default false,
  first_seen_at  timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  revoked_at     timestamptz,
  unique (user_id, device_hash)
);
create index user_devices_hash_idx on public.user_devices (device_hash);

create table public.user_consents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  purpose       text not null,
  policy_version text not null,
  granted       boolean not null,
  ip            inet,
  created_at    timestamptz not null default now()
);
create index user_consents_user_idx on public.user_consents (user_id, purpose, created_at desc);

-- ---------------------------------------------------------------------
-- KYC — lives in app_private. NO client-facing RLS policy grants SELECT.
-- ---------------------------------------------------------------------
create table app_private.identity_verifications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  kind               verification_kind not null,
  status             verification_status not null default 'pending',
  provider           text,
  provider_ref       text,
  -- NEVER store raw Aadhaar/PAN. Hash + last4 only.
  document_hash      text,
  document_last4     text,
  legal_name         text,
  date_of_birth      date,
  match_score        numeric(4,3),
  document_paths     text[] default '{}',   -- private bucket keys, purged at +90d
  reviewed_by        uuid references public.profiles(id) on delete set null,
  review_notes       text,
  rejection_reason   text,
  verified_at        timestamptz,
  expires_at         timestamptz,
  purge_after        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idv_user_kind_idx on app_private.identity_verifications (user_id, kind, status);

-- Client-safe projection of verification state.
create table public.verification_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        verification_kind not null,
  status      verification_status not null,
  verified_at timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, kind)
);

-- =====================================================================
-- 3. SKILLS, ROLES, PORTFOLIO
-- =====================================================================

create table public.skills (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  category   text not null,
  is_active  boolean not null default true
);

create table public.creator_skills (
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  skill_id        uuid not null references public.skills(id) on delete cascade,
  proficiency     smallint check (proficiency between 1 and 5),
  years_experience smallint,
  endorsement_count integer not null default 0,
  primary key (profile_id, skill_id)
);
create index creator_skills_skill_idx on public.creator_skills (skill_id);

create table public.creator_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_slug  text not null,
  is_primary boolean not null default false,
  primary key (profile_id, role_slug)
);

create table public.portfolio_collections (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  description  text,
  cover_item_id uuid,
  project_id   uuid,
  visibility   visibility not null default 'public',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index portfolio_collections_profile_idx on public.portfolio_collections (profile_id) where deleted_at is null;

create table public.portfolio_items (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  collection_id  uuid references public.portfolio_collections(id) on delete set null,
  media_type     text not null default 'image' check (media_type in ('image','video_embed')),
  storage_path   text,
  embed_url      text,
  width          integer,
  height         integer,
  blurhash       text,
  title          text,
  description    text,
  role_performed text,
  shot_on        date,
  tags           text[] not null default '{}',
  gear_model_ids uuid[] not null default '{}',
  visibility     visibility not null default 'public',
  sort_order     integer not null default 0,
  is_featured    boolean not null default false,
  exif_stripped  boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  check (storage_path is not null or embed_url is not null)
);
create index portfolio_items_profile_idx on public.portfolio_items (profile_id, sort_order) where deleted_at is null;
create index portfolio_items_tags_gin    on public.portfolio_items using gin (tags);

-- Multi-author attribution on a single artefact.
create table public.portfolio_credits (
  id                 uuid primary key default gen_random_uuid(),
  portfolio_item_id  uuid not null references public.portfolio_items(id) on delete cascade,
  credited_profile_id uuid not null references public.profiles(id) on delete cascade,
  role               text not null,
  status             credit_status not null default 'proposed',
  responded_at       timestamptz,
  created_at         timestamptz not null default now(),
  unique (portfolio_item_id, credited_profile_id, role)
);

-- =====================================================================
-- 4. GEAR CATALOGUE  (canonical, platform-curated)
-- =====================================================================

create table public.gear_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  parent_id   uuid references public.gear_categories(id) on delete restrict,
  icon        text,
  sort_order  integer not null default 0,
  attribute_schema jsonb not null default '{}'::jsonb  -- drives dynamic listing forms
);

create table public.gear_brands (
  id    uuid primary key default gen_random_uuid(),
  slug  text unique not null,
  name  text not null,
  logo_path text
);

create table public.gear_models (
  id                     uuid primary key default gen_random_uuid(),
  brand_id               uuid not null references public.gear_brands(id) on delete restrict,
  category_id            uuid not null references public.gear_categories(id) on delete restrict,
  slug                   text unique not null,
  model_name             text not null,
  variant                text,
  released_year          smallint,
  msrp_minor             bigint,
  replacement_value_minor bigint,
  currency               char(3) not null default 'INR',
  image_path             text,
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  unique (brand_id, model_name, variant)
);
create index gear_models_cat_idx  on public.gear_models (category_id) where is_active;
create index gear_models_trgm     on public.gear_models using gin (model_name gin_trgm_ops);

-- Typed EAV powering search facets and the compatibility engine.
create table public.gear_model_attributes (
  gear_model_id uuid not null references public.gear_models(id) on delete cascade,
  attribute_key text not null,
  value_text    text,
  value_num     numeric,
  value_bool    boolean,
  unit          text,
  primary key (gear_model_id, attribute_key)
);
create index gear_attr_key_text_idx on public.gear_model_attributes (attribute_key, value_text);
create index gear_attr_key_num_idx  on public.gear_model_attributes (attribute_key, value_num);

-- Adapter graph for "compatible with adapter" verdicts.
create table public.gear_adapters (
  id                   uuid primary key default gen_random_uuid(),
  gear_model_id        uuid not null references public.gear_models(id) on delete cascade,
  mount_in             text not null,
  mount_out            text not null,
  supports_autofocus   boolean not null default false,
  has_optics           boolean not null default false,
  exposure_loss_stops  numeric(3,1) not null default 0,
  notes                text
);
create index gear_adapters_mounts_idx on public.gear_adapters (mount_in, mount_out);

-- =====================================================================
-- 5. LISTINGS & PASSPORTS
-- =====================================================================

-- A physical asset owned by a user. Survives listings and re-listings.
create table public.gear_assets (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid not null references public.profiles(id) on delete cascade,
  gear_model_id         uuid not null references public.gear_models(id) on delete restrict,
  passport_code         text unique not null default ('GP-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,6))),
  serial_number_hash    text,        -- hashed; raw serial in app_private
  serial_last4          text,
  purchase_year         smallint,
  purchase_invoice_path text,
  ownership_verified    boolean not null default false,
  condition             gear_condition not null default 'good',
  shutter_count         integer,
  last_inspected_at     timestamptz,
  total_rentals         integer not null default 0,
  total_income_minor    bigint not null default 0,
  purchase_price_minor  bigint,
  currency              char(3) not null default 'INR',
  is_retired            boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);
create index gear_assets_owner_idx  on public.gear_assets (owner_id) where deleted_at is null;
create index gear_assets_serial_idx on public.gear_assets (serial_number_hash) where serial_number_hash is not null;

create table app_private.gear_serials (
  gear_asset_id uuid primary key references public.gear_assets(id) on delete cascade,
  serial_number text not null,
  created_at    timestamptz not null default now()
);
-- Cross-owner duplicate serial = strong stolen-goods signal.
create unique index gear_serials_unique_idx on app_private.gear_serials (lower(serial_number));

create table public.gear_issues (
  id            uuid primary key default gen_random_uuid(),
  gear_asset_id uuid not null references public.gear_assets(id) on delete cascade,
  description   text not null,
  severity      smallint not null default 1 check (severity between 1 and 3),
  declared_by   uuid references public.profiles(id) on delete set null,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create table public.gear_inspections (
  id            uuid primary key default gen_random_uuid(),
  gear_asset_id uuid not null references public.gear_assets(id) on delete cascade,
  inspected_by  uuid not null references public.profiles(id) on delete cascade,
  condition     gear_condition not null,
  checklist     jsonb not null default '{}'::jsonb,
  photo_paths   text[] not null default '{}',
  notes         text,
  created_at    timestamptz not null default now()
);
create index gear_inspections_asset_idx on public.gear_inspections (gear_asset_id, created_at desc);

-- The rentable offer. One asset may have at most one active listing.
create table public.gear_listings (
  id                    uuid primary key default gen_random_uuid(),
  gear_asset_id         uuid not null references public.gear_assets(id) on delete cascade,
  owner_id              uuid not null references public.profiles(id) on delete cascade,
  gear_model_id         uuid not null references public.gear_models(id) on delete restrict,
  category_id           uuid not null references public.gear_categories(id) on delete restrict,
  title                 text not null,
  description           text,
  condition             gear_condition not null default 'good',
  quantity              integer not null default 1 check (quantity > 0),
  replacement_value_minor bigint not null check (replacement_value_minor > 0),
  day_rate_minor        bigint not null check (day_rate_minor > 0),
  week_rate_minor       bigint,
  month_rate_minor      bigint,
  currency              char(3) not null default 'INR',
  min_days              smallint not null default 1,
  max_days              smallint,
  accessories           jsonb not null default '[]'::jsonb,
  pickup_locality       text,
  pickup_location_coarse geography(Point,4326),
  pickup_notes          text,
  delivery_available    boolean not null default false,
  delivery_fee_minor    bigint,
  delivery_radius_km    smallint,
  cancellation_policy   cancellation_policy not null default 'moderate',
  instant_book          boolean not null default false,
  instant_book_min_tier smallint not null default 3,
  status                listing_status not null default 'draft',
  view_count            integer not null default 0,
  booking_count         integer not null default 0,
  search_vector         tsvector,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  deleted_at            timestamptz
);
create unique index gear_listings_one_active_per_asset
  on public.gear_listings (gear_asset_id) where status in ('active','paused') and deleted_at is null;
create index gear_listings_owner_idx  on public.gear_listings (owner_id) where deleted_at is null;
create index gear_listings_model_idx  on public.gear_listings (gear_model_id) where status='active';
create index gear_listings_geo_gix    on public.gear_listings using gist (pickup_location_coarse);
create index gear_listings_fts_gin    on public.gear_listings using gin (search_vector);
create index gear_listings_price_idx  on public.gear_listings (category_id, day_rate_minor) where status='active';

create table public.gear_listing_images (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.gear_listings(id) on delete cascade,
  storage_path text not null,
  width       integer,
  height      integer,
  blurhash    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index gear_listing_images_listing_idx on public.gear_listing_images (listing_id, sort_order);

-- Availability. Exclusion constraint makes double-booking structurally impossible.
create table public.gear_availability_blocks (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.gear_listings(id) on delete cascade,
  unit_index  smallint not null default 0,     -- for quantity > 1
  period      tstzrange not null,
  reason      text not null default 'booking'
                check (reason in ('booking','blackout','maintenance','hold')),
  booking_id  uuid,
  created_at  timestamptz not null default now(),
  exclude using gist (listing_id with =, unit_index with =, period with &&)
);
create index gear_avail_listing_idx on public.gear_availability_blocks (listing_id);
create index gear_avail_period_gix  on public.gear_availability_blocks using gist (period);

-- Bundles
create table public.gear_bundles (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references public.profiles(id) on delete cascade,
  title               text not null,
  description         text,
  bundle_day_rate_minor bigint not null,
  currency            char(3) not null default 'INR',
  status              listing_status not null default 'draft',
  template_slug       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create table public.gear_bundle_items (
  bundle_id   uuid not null references public.gear_bundles(id) on delete cascade,
  listing_id  uuid not null references public.gear_listings(id) on delete cascade,
  is_required boolean not null default true,
  sort_order  integer not null default 0,
  primary key (bundle_id, listing_id)
);

-- =====================================================================
-- 6. BOOKINGS
-- =====================================================================

create table public.rental_bookings (
  id                    uuid primary key default gen_random_uuid(),
  reference             text unique not null,        -- human-readable, e.g. APR-8F2K19
  renter_id             uuid not null references public.profiles(id) on delete restrict,
  owner_id              uuid not null references public.profiles(id) on delete restrict,
  bundle_id             uuid references public.gear_bundles(id) on delete set null,
  status                booking_status not null default 'requested',
  start_at              timestamptz not null,
  end_at                timestamptz not null,
  rental_days           smallint not null check (rental_days > 0),
  pickup_mode           text not null default 'pickup' check (pickup_mode in ('pickup','delivery')),
  pickup_address_id     uuid,
  -- money (all minor units, server-computed, never client-supplied)
  currency              char(3) not null default 'INR',
  subtotal_minor        bigint not null,
  discount_minor        bigint not null default 0,
  delivery_fee_minor    bigint not null default 0,
  protection_tier       protection_tier not null default 'basic',
  protection_fee_minor  bigint not null default 0,
  renter_fee_minor      bigint not null default 0,
  owner_commission_minor bigint not null default 0,
  tax_minor             bigint not null default 0,
  total_charge_minor    bigint not null,            -- what renter pays
  owner_payout_minor    bigint not null,            -- what owner receives
  deposit_minor         bigint not null default 0,
  total_replacement_value_minor bigint not null default 0,
  -- lifecycle
  request_expires_at    timestamptz,
  accepted_at           timestamptz,
  declined_at           timestamptz,
  decline_reason        text,
  confirmed_at          timestamptz,
  handover_at           timestamptz,
  returned_at           timestamptz,
  completed_at          timestamptz,
  cancelled_at          timestamptz,
  cancelled_by          uuid references public.profiles(id) on delete set null,
  cancellation_reason   text,
  inspection_deadline   timestamptz,
  agreement_id          uuid,
  renter_message        text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (end_at > start_at),
  check (renter_id <> owner_id)
);
create index bookings_renter_idx  on public.rental_bookings (renter_id, created_at desc);
create index bookings_owner_idx   on public.rental_bookings (owner_id, created_at desc);
create index bookings_status_idx  on public.rental_bookings (status) where status not in ('completed','cancelled_by_renter','cancelled_by_owner','declined','expired');
create index bookings_dates_idx   on public.rental_bookings (start_at, end_at);

create table public.rental_items (
  id                      uuid primary key default gen_random_uuid(),
  booking_id              uuid not null references public.rental_bookings(id) on delete cascade,
  listing_id              uuid not null references public.gear_listings(id) on delete restrict,
  gear_asset_id           uuid not null references public.gear_assets(id) on delete restrict,
  unit_index              smallint not null default 0,
  quantity                smallint not null default 1,
  day_rate_minor          bigint not null,
  line_total_minor        bigint not null,
  replacement_value_minor bigint not null,
  accessories_expected    jsonb not null default '[]'::jsonb,
  created_at              timestamptz not null default now()
);
create index rental_items_booking_idx on public.rental_items (booking_id);
create index rental_items_asset_idx   on public.rental_items (gear_asset_id);

create table public.rental_addresses (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references public.rental_bookings(id) on delete cascade,
  line1        text not null,
  line2        text,
  landmark     text,
  locality     text,
  city         text not null,
  state        text not null,
  pincode      text not null,
  contact_name text,
  contact_phone text,
  created_at   timestamptz not null default now()
);

create table public.rental_agreements (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null unique references public.rental_bookings(id) on delete cascade,
  template_version text not null,
  document_path text,
  terms_snapshot jsonb not null,
  renter_accepted_at timestamptz,
  renter_ip     inet,
  owner_accepted_at  timestamptz,
  owner_ip      inet,
  created_at    timestamptz not null default now()
);

create table public.rental_handoffs (
  id             uuid primary key default gen_random_uuid(),
  booking_id     uuid not null references public.rental_bookings(id) on delete cascade,
  kind           handoff_kind not null,
  otp_hash       text,
  otp_expires_at timestamptz,
  otp_attempts   smallint not null default 0,
  confirmed_by   uuid references public.profiles(id) on delete set null,
  confirmed_at   timestamptz,
  location       geography(Point,4326),
  created_at     timestamptz not null default now(),
  unique (booking_id, kind)
);

create table public.rental_condition_reports (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.rental_bookings(id) on delete cascade,
  rental_item_id  uuid not null references public.rental_items(id) on delete cascade,
  kind            handoff_kind not null,
  submitted_by    uuid not null references public.profiles(id) on delete restrict,
  is_unilateral   boolean not null default false,
  condition       gear_condition not null,
  checklist       jsonb not null default '{}'::jsonb,
  accessories_present jsonb not null default '[]'::jsonb,
  photo_paths     text[] not null default '{}',
  notes           text,
  serial_confirmed boolean not null default false,
  server_captured_at timestamptz not null default now(),
  created_at      timestamptz not null default now()
);
create index rcr_booking_idx on public.rental_condition_reports (booking_id, kind);

-- =====================================================================
-- 7. MONEY
-- =====================================================================

create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid references public.rental_bookings(id) on delete restrict,
  project_id          uuid,
  payer_id            uuid not null references public.profiles(id) on delete restrict,
  purpose             text not null default 'rental'
                        check (purpose in ('rental','deposit','subscription','ticket','engagement','fee')),
  provider            text not null default 'razorpay',
  provider_order_id   text,
  provider_payment_id text,
  provider_signature  text,
  method              text,
  amount_minor        bigint not null check (amount_minor > 0),
  currency            char(3) not null default 'INR',
  status              payment_status not null default 'created',
  captured_at         timestamptz,
  failure_code        text,
  failure_reason      text,
  idempotency_key     text unique,
  raw_webhook         jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create unique index payments_provider_payment_idx on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;
create index payments_booking_idx on public.payments (booking_id);

create table public.deposits (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null unique references public.rental_bookings(id) on delete restrict,
  amount_minor        bigint not null,
  currency            char(3) not null default 'INR',
  mechanism           text not null check (mechanism in ('upi_block','card_preauth','wallet_hold','none')),
  provider_ref        text,
  status              hold_status not null default 'blocked',
  blocked_at          timestamptz,
  expires_at          timestamptz,
  captured_minor      bigint not null default 0,
  capture_reason      text,
  released_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.refunds (
  id                uuid primary key default gen_random_uuid(),
  payment_id        uuid not null references public.payments(id) on delete restrict,
  amount_minor      bigint not null check (amount_minor > 0),
  reason            text not null,
  provider_refund_id text,
  status            text not null default 'pending',
  initiated_by      uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

create table public.payout_accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  kind            text not null check (kind in ('bank','vpa')),
  account_last4   text,
  ifsc            text,
  vpa_masked      text,
  holder_name     text,
  name_match      boolean,
  provider_contact_id text,
  provider_fund_account_id text,
  is_default      boolean not null default false,
  verified_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index payout_accounts_user_idx on public.payout_accounts (user_id);

create table public.payouts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete restrict,
  booking_id          uuid references public.rental_bookings(id) on delete restrict,
  payout_account_id   uuid references public.payout_accounts(id) on delete restrict,
  gross_minor         bigint not null,
  commission_minor    bigint not null default 0,
  tds_minor           bigint not null default 0,
  tcs_minor           bigint not null default 0,
  net_minor           bigint not null,
  currency            char(3) not null default 'INR',
  status              payout_status not null default 'pending',
  provider_payout_id  text,
  scheduled_for       timestamptz,
  paid_at             timestamptz,
  hold_reason         text,
  failure_reason      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index payouts_user_idx   on public.payouts (user_id, created_at desc);
create index payouts_status_idx on public.payouts (status) where status in ('pending','processing','on_hold');

-- Immutable double-entry-ish ledger. Append only.
create table public.ledger_entries (
  id            bigserial primary key,
  entry_group   uuid not null,
  account       text not null,   -- 'platform_revenue','owner_payable','protection_reserve','tax_payable','escrow'
  user_id       uuid references public.profiles(id) on delete set null,
  booking_id    uuid references public.rental_bookings(id) on delete set null,
  direction     char(1) not null check (direction in ('D','C')),
  amount_minor  bigint not null check (amount_minor > 0),
  currency      char(3) not null default 'INR',
  memo          text,
  created_at    timestamptz not null default now()
);
create index ledger_group_idx on public.ledger_entries (entry_group);
create index ledger_booking_idx on public.ledger_entries (booking_id);

create table public.tax_documents (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references public.rental_bookings(id) on delete set null,
  kind          text not null check (kind in ('rental_invoice','commission_invoice','credit_note')),
  issuer_id     uuid references public.profiles(id) on delete set null,
  recipient_id  uuid references public.profiles(id) on delete set null,
  invoice_number text unique not null,
  gstin_issuer  text,
  gstin_recipient text,
  taxable_minor bigint not null,
  cgst_minor    bigint not null default 0,
  sgst_minor    bigint not null default 0,
  igst_minor    bigint not null default 0,
  total_minor   bigint not null,
  document_path text,
  issued_at     timestamptz not null default now()
);

-- =====================================================================
-- 8. SUBSCRIPTIONS
-- =====================================================================

create table public.subscription_plans (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  audience      text not null check (audience in ('creator','owner','business')),
  price_minor   bigint not null,
  currency      char(3) not null default 'INR',
  interval      text not null check (interval in ('month','year')),
  features      jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true
);

create table public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  plan_id             uuid not null references public.subscription_plans(id) on delete restrict,
  status              text not null default 'active'
                        check (status in ('trialing','active','past_due','cancelled','expired')),
  provider_sub_id     text,
  current_period_start timestamptz not null,
  current_period_end  timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id, status);

-- =====================================================================
-- 9. REVIEWS
-- =====================================================================

create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  context_type  text not null check (context_type in ('rental','project','engagement')),
  context_id    uuid not null,
  author_id     uuid not null references public.profiles(id) on delete cascade,
  subject_id    uuid not null references public.profiles(id) on delete cascade,
  direction     text not null check (direction in ('renter_to_owner','owner_to_renter','peer')),
  rating        smallint not null check (rating between 1 and 5),
  sub_ratings   jsonb not null default '{}'::jsonb,
  body          text,
  is_published  boolean not null default false,
  published_at  timestamptz,
  editable_until timestamptz,
  reply_body    text,
  reply_at      timestamptz,
  is_hidden     boolean not null default false,
  hidden_reason text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (context_type, context_id, author_id, direction),
  check (author_id <> subject_id)
);
create index reviews_subject_idx on public.reviews (subject_id, is_published, created_at desc);

-- =====================================================================
-- 10. GRAPH / CONNECTIONS
-- =====================================================================

create table public.creator_connections (
  id             uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references public.profiles(id) on delete cascade,
  to_profile_id   uuid not null references public.profiles(id) on delete cascade,
  edge_type      connection_edge not null,
  evidence_type  text,
  evidence_id    uuid,
  weight         numeric(4,3) not null default 0.1,
  status         text not null default 'active'
                   check (status in ('pending','active','disputed','revoked')),
  context_label  text,        -- e.g. "met at Sunday Street Walk"
  created_at     timestamptz not null default now(),
  disputed_at    timestamptz,
  unique (from_profile_id, to_profile_id, edge_type, evidence_id),
  check (from_profile_id <> to_profile_id)
);
create index conn_from_idx on public.creator_connections (from_profile_id, edge_type) where status='active';
create index conn_to_idx   on public.creator_connections (to_profile_id, edge_type) where status='active';

-- =====================================================================
-- 11. MESSAGING
-- =====================================================================

create table public.conversations (
  id            uuid primary key default gen_random_uuid(),
  context_type  text not null default 'direct'
                  check (context_type in ('direct','booking','project','community','event')),
  context_id    uuid,
  title         text,
  created_by    uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz,
  created_at    timestamptz not null default now()
);
create index conversations_context_idx on public.conversations (context_type, context_id);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  role            text not null default 'member',
  joined_at       timestamptz not null default now(),
  last_read_at    timestamptz,
  muted_until     timestamptz,
  left_at         timestamptz,
  primary key (conversation_id, profile_id)
);
create index conv_participants_profile_idx on public.conversation_participants (profile_id) where left_at is null;

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text,
  attachments     jsonb not null default '[]'::jsonb,
  system_kind     text,
  is_masked       boolean not null default false,
  flagged_reason  text,
  created_at      timestamptz not null default now(),
  edited_at       timestamptz,
  deleted_at      timestamptz
);
create index messages_conv_idx on public.messages (conversation_id, created_at desc);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- =====================================================================
-- 12. COMMUNITIES & EVENTS
-- =====================================================================

create table public.communities (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  city          text,
  community_type text,
  cover_path    text,
  rules         text,
  join_policy   join_policy not null default 'open',
  member_count  integer not null default 0,
  is_official   boolean not null default false,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index communities_city_idx on public.communities (city) where deleted_at is null;

create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  role         community_role not null default 'member',
  status       text not null default 'active' check (status in ('pending','active','banned')),
  joined_at    timestamptz not null default now(),
  banned_until timestamptz,
  primary key (community_id, profile_id)
);
create index community_members_profile_idx on public.community_members (profile_id) where status='active';

create table public.community_posts (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  body         text not null,
  image_paths  text[] not null default '{}',
  is_pinned    boolean not null default false,
  is_announcement boolean not null default false,
  comment_count integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index community_posts_idx on public.community_posts (community_id, created_at desc) where deleted_at is null;

create table public.community_post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  parent_id  uuid references public.community_post_comments(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index post_comments_idx on public.community_post_comments (post_id, created_at);

create table public.events (
  id             uuid primary key default gen_random_uuid(),
  community_id   uuid references public.communities(id) on delete set null,
  organiser_id   uuid not null references public.profiles(id) on delete cascade,
  slug           text unique not null,
  title          text not null,
  description    text,
  cover_path     text,
  event_type     text not null default 'photowalk',
  starts_at      timestamptz not null,
  ends_at        timestamptz,
  timezone       text not null default 'Asia/Kolkata',
  venue_name     text,
  venue_address  text,
  venue_location geography(Point,4326),
  city           text,
  capacity       integer,
  attendee_count integer not null default 0,
  waitlist_count integer not null default 0,
  is_paid        boolean not null default false,
  ticket_price_minor bigint,
  currency       char(3) not null default 'INR',
  checkin_code   text,
  status         text not null default 'published'
                   check (status in ('draft','published','cancelled','completed')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index events_starts_idx on public.events (starts_at) where status='published';
create index events_city_idx   on public.events (city, starts_at);
create index events_geo_gix    on public.events using gist (venue_location);

create table public.event_attendees (
  event_id     uuid not null references public.events(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'going'
                 check (status in ('going','waitlist','cancelled','attended','no_show')),
  is_visible   boolean not null default true,
  payment_id   uuid references public.payments(id) on delete set null,
  rsvp_at      timestamptz not null default now(),
  checked_in_at timestamptz,
  primary key (event_id, profile_id)
);
create index event_attendees_profile_idx on public.event_attendees (profile_id);

-- =====================================================================
-- 13. PROJECTS, CREDITS, OPPORTUNITIES
-- =====================================================================

create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  slug          text unique,
  title         text not null,
  brief         text,
  project_type  text,
  cover_path    text,
  city          text,
  shoot_start   date,
  shoot_end     date,
  status        project_status not null default 'planning',
  visibility    visibility not null default 'private',
  budget_minor  bigint,
  currency      char(3) not null default 'INR',
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index projects_owner_idx on public.projects (owner_id) where deleted_at is null;

create table public.project_members (
  project_id  uuid not null references public.projects(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  role        text not null,
  is_lead     boolean not null default false,
  status      text not null default 'active' check (status in ('invited','active','declined','removed')),
  joined_at   timestamptz not null default now(),
  primary key (project_id, profile_id)
);
create index project_members_profile_idx on public.project_members (profile_id) where status='active';

create table public.project_tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  title       text not null,
  description text,
  assignee_id uuid references public.profiles(id) on delete set null,
  due_at      timestamptz,
  is_done     boolean not null default false,
  sort_order  integer not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index project_tasks_project_idx on public.project_tasks (project_id, sort_order);

create table public.project_files (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  file_name   text not null,
  mime_type   text,
  size_bytes  bigint,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table public.project_credits (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  role          text not null,
  credit_line   text not null,
  status        credit_status not null default 'proposed',
  confirmed_by  uuid[] not null default '{}',
  self_confirmed_at timestamptz,
  verified_at   timestamptz,
  created_at    timestamptz not null default now(),
  unique (project_id, profile_id, role)
);
create index project_credits_profile_idx on public.project_credits (profile_id, status);

create table public.project_expenses (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  added_by    uuid not null references public.profiles(id) on delete cascade,
  label       text not null,
  amount_minor bigint not null,
  currency    char(3) not null default 'INR',
  category    text,
  receipt_path text,
  incurred_on date,
  created_at  timestamptz not null default now()
);

create table public.opportunities (
  id            uuid primary key default gen_random_uuid(),
  poster_id     uuid not null references public.profiles(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  kind          text not null default 'collaboration'
                  check (kind in ('collaboration','paid_gig','crew_call','casting')),
  title         text not null,
  description   text,
  role_needed   text not null,
  skills_needed text[] not null default '{}',
  city          text,
  location      geography(Point,4326),
  starts_at     timestamptz,
  ends_at       timestamptz,
  is_paid       boolean not null default false,
  budget_min_minor bigint,
  budget_max_minor bigint,
  currency      char(3) not null default 'INR',
  status        text not null default 'open' check (status in ('open','filled','closed','expired')),
  application_count integer not null default 0,
  search_vector tsvector,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index opportunities_open_idx on public.opportunities (status, starts_at) where status='open';
create index opportunities_fts_gin  on public.opportunities using gin (search_vector);
create index opportunities_geo_gix  on public.opportunities using gist (location);

create table public.opportunity_applications (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  applicant_id   uuid not null references public.profiles(id) on delete cascade,
  message        text,
  portfolio_item_ids uuid[] not null default '{}',
  quoted_rate_minor bigint,
  status         text not null default 'submitted'
                   check (status in ('submitted','shortlisted','accepted','declined','withdrawn')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (opportunity_id, applicant_id)
);

create table public.engagements (
  id              uuid primary key default gen_random_uuid(),
  opportunity_id  uuid references public.opportunities(id) on delete set null,
  project_id      uuid references public.projects(id) on delete set null,
  hirer_id        uuid not null references public.profiles(id) on delete restrict,
  creator_id      uuid not null references public.profiles(id) on delete restrict,
  role            text not null,
  amount_minor    bigint not null,
  currency        char(3) not null default 'INR',
  hirer_fee_minor bigint not null default 0,
  creator_fee_minor bigint not null default 0,
  status          text not null default 'agreed'
                    check (status in ('agreed','funded','in_progress','delivered','released','disputed','cancelled')),
  funded_at       timestamptz,
  released_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (hirer_id <> creator_id)
);

-- =====================================================================
-- 14. DISPUTES, REPORTS, MODERATION
-- =====================================================================

create table public.disputes (
  id             uuid primary key default gen_random_uuid(),
  reference      text unique not null,
  booking_id     uuid references public.rental_bookings(id) on delete restrict,
  engagement_id  uuid references public.engagements(id) on delete restrict,
  raised_by      uuid not null references public.profiles(id) on delete restrict,
  against        uuid not null references public.profiles(id) on delete restrict,
  category       dispute_category not null,
  status         dispute_status not null default 'opened',
  description    text not null,
  claimed_minor  bigint,
  currency       char(3) not null default 'INR',
  response_due_at timestamptz,
  responded_at   timestamptz,
  response_body  text,
  assigned_to    uuid references public.profiles(id) on delete set null,
  resolution     text,
  resolution_rationale text,
  awarded_to     uuid references public.profiles(id) on delete set null,
  awarded_minor  bigint,
  resolved_at    timestamptz,
  resolved_by    uuid references public.profiles(id) on delete set null,
  appeal_body    text,
  appealed_at    timestamptz,
  closed_at      timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index disputes_booking_idx on public.disputes (booking_id);
create index disputes_status_idx  on public.disputes (status) where status <> 'closed';

create table public.dispute_evidence (
  id           uuid primary key default gen_random_uuid(),
  dispute_id   uuid not null references public.disputes(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  kind         text not null,
  storage_path text,
  reference_id uuid,
  note         text,
  created_at   timestamptz not null default now()
);

create table public.protection_claims (
  id            uuid primary key default gen_random_uuid(),
  dispute_id    uuid not null references public.disputes(id) on delete restrict,
  booking_id    uuid not null references public.rental_bookings(id) on delete restrict,
  claimant_id   uuid not null references public.profiles(id) on delete restrict,
  claim_type    text not null check (claim_type in ('damage','non_return','theft')),
  claimed_minor bigint not null,
  deductible_minor bigint not null default 0,
  approved_minor bigint,
  status        text not null default 'submitted'
                  check (status in ('submitted','in_review','approved','partially_approved','rejected','paid')),
  fir_number    text,
  fir_path      text,
  reviewer_id   uuid references public.profiles(id) on delete set null,
  decision_notes text,
  reported_at   timestamptz not null default now(),
  decided_at    timestamptz,
  paid_at       timestamptz
);

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references public.profiles(id) on delete cascade,
  target_type   text not null check (target_type in ('profile','listing','message','post','comment','event','review','community','opportunity')),
  target_id     uuid not null,
  reason        text not null,
  details       text,
  status        text not null default 'open' check (status in ('open','in_review','actioned','dismissed')),
  severity      smallint not null default 1,
  assigned_to   uuid references public.profiles(id) on delete set null,
  resolution    text,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);
create index reports_status_idx on public.reports (status, severity desc, created_at);
create index reports_target_idx on public.reports (target_type, target_id);

create table public.admin_actions (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references public.profiles(id) on delete restrict,
  action      text not null,
  target_type text not null,
  target_id   uuid,
  before_state jsonb,
  after_state jsonb,
  reason      text not null,
  created_at  timestamptz not null default now()
);
create index admin_actions_actor_idx  on public.admin_actions (actor_id, created_at desc);
create index admin_actions_target_idx on public.admin_actions (target_type, target_id);

create table public.audit_logs (
  id          bigserial primary key,
  actor_id    uuid,
  actor_kind  text not null default 'user' check (actor_kind in ('user','system','admin','webhook')),
  event       text not null,
  entity_type text,
  entity_id   uuid,
  payload     jsonb,
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_event_idx  on public.audit_logs (event, created_at desc);

create table public.fraud_signals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  booking_id  uuid references public.rental_bookings(id) on delete cascade,
  signal      text not null,
  score       smallint not null,
  details     jsonb,
  status      text not null default 'open' check (status in ('open','cleared','confirmed')),
  created_at  timestamptz not null default now()
);
create index fraud_signals_user_idx on public.fraud_signals (user_id, created_at desc);

-- =====================================================================
-- 15. NOTIFICATIONS & SEARCH SUPPORT
-- =====================================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        text not null,
  title       text not null,
  body        text,
  action_url  text,
  entity_type text,
  entity_id   uuid,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc) where read_at is null;

create table public.notification_deliveries (
  id              uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  channel         notification_channel not null,
  template_key    text,
  status          text not null default 'queued'
                    check (status in ('queued','sent','delivered','failed','suppressed')),
  provider_ref    text,
  error           text,
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index notif_deliveries_status_idx on public.notification_deliveries (status, created_at);

create table public.search_queries (
  id          bigserial primary key,
  user_id     uuid references public.profiles(id) on delete set null,
  entity      text not null,
  query       text,
  filters     jsonb,
  city        text,
  result_count integer not null default 0,
  clicked_id  uuid,
  created_at  timestamptz not null default now()
);
create index search_queries_zero_idx on public.search_queries (entity, city, created_at desc) where result_count = 0;

create table public.saved_searches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  entity      text not null,
  label       text,
  filters     jsonb not null,
  alerts_on   boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.favorites (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('listing','profile','event','community','opportunity')),
  target_id   uuid not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

-- =====================================================================
-- 16. TRIGGERS
-- =====================================================================

create or replace function public.tg_set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_settings','gear_assets','gear_listings','gear_bundles',
    'rental_bookings','payments','deposits','payouts','subscriptions','reviews',
    'communities','community_posts','events','projects','opportunities',
    'opportunity_applications','engagements','disputes'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.tg_set_updated_at()', t);
  end loop;
end $$;

-- Listing search vector
create or replace function public.tg_listing_search_vector() returns trigger
language plpgsql as $$
declare brand_name text; model_name text;
begin
  select b.name, m.model_name into brand_name, model_name
  from public.gear_models m join public.gear_brands b on b.id = m.brand_id
  where m.id = new.gear_model_id;
  new.search_vector :=
      setweight(to_tsvector('simple', unaccent(coalesce(brand_name,''))), 'A')
   || setweight(to_tsvector('simple', unaccent(coalesce(model_name,''))), 'A')
   || setweight(to_tsvector('english', unaccent(coalesce(new.title,''))), 'B')
   || setweight(to_tsvector('english', unaccent(coalesce(new.description,''))), 'C')
   || setweight(to_tsvector('simple', unaccent(coalesce(new.pickup_locality,''))), 'C');
  return new;
end $$;
create trigger listing_search_vector
  before insert or update of title, description, gear_model_id, pickup_locality
  on public.gear_listings for each row execute function public.tg_listing_search_vector();

-- Double-blind review publication
create or replace function public.tg_publish_reviews() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.reviews
      where context_type = new.context_type and context_id = new.context_id) >= 2 then
    update public.reviews
       set is_published = true, published_at = now()
     where context_type = new.context_type and context_id = new.context_id
       and is_published = false;
  end if;
  return new;
end $$;
create trigger publish_reviews after insert on public.reviews
  for each row execute function public.tg_publish_reviews();

-- Community member count
create or replace function public.tg_community_member_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.communities c set member_count = (
    select count(*) from public.community_members m
    where m.community_id = c.id and m.status = 'active'
  ) where c.id = coalesce(new.community_id, old.community_id);
  return coalesce(new, old);
end $$;
create trigger community_member_count
  after insert or update or delete on public.community_members
  for each row execute function public.tg_community_member_count();

-- Duplicate-serial fraud alert
create or replace function public.tg_serial_dupe_check() returns trigger
language plpgsql security definer set search_path = app_private, public as $$
declare other_owner uuid;
begin
  select ga.owner_id into other_owner
  from app_private.gear_serials gs
  join public.gear_assets ga on ga.id = gs.gear_asset_id
  where lower(gs.serial_number) = lower(new.serial_number)
    and gs.gear_asset_id <> new.gear_asset_id
  limit 1;
  if other_owner is not null then
    insert into public.fraud_signals (user_id, signal, score, details)
    values ((select owner_id from public.gear_assets where id = new.gear_asset_id),
            'duplicate_serial_across_owners', 90,
            jsonb_build_object('other_owner', other_owner));
  end if;
  return new;
end $$;
create trigger serial_dupe_check after insert on app_private.gear_serials
  for each row execute function public.tg_serial_dupe_check();

-- =====================================================================
-- 17. HELPER FUNCTIONS USED BY RLS
-- =====================================================================

create or replace function public.current_profile_id() returns uuid
language sql stable as $$ select auth.uid() $$;

create or replace function public.has_role(r user_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = r
      and (ur.expires_at is null or ur.expires_at > now())
  );
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_role('moderator') or public.has_role('admin') or public.has_role('super_admin');
$$;

create or replace function public.is_conversation_participant(conv uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = conv and cp.profile_id = auth.uid() and cp.left_at is null
  );
$$;

create or replace function public.is_project_member(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.project_members pm
    where pm.project_id = p and pm.profile_id = auth.uid() and pm.status = 'active'
  );
$$;

create or replace function public.is_community_moderator(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.community_members cm
    where cm.community_id = c and cm.profile_id = auth.uid()
      and cm.role in ('owner','moderator') and cm.status = 'active'
  );
$$;

create or replace function public.is_booking_party(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rental_bookings rb
    where rb.id = b and (rb.renter_id = auth.uid() or rb.owner_id = auth.uid())
  );
$$;

create or replace function public.is_blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- Concurrent aggregate exposure for a renter. Enforced at acceptance.
create or replace function public.renter_open_exposure_minor(p uuid) returns bigint
language sql stable security definer set search_path = public as $$
  select coalesce(sum(rb.total_replacement_value_minor), 0)
  from public.rental_bookings rb
  where rb.renter_id = p
    and rb.status in ('confirmed','awaiting_handover','active','awaiting_return','returned','under_inspection','disputed');
$$;
