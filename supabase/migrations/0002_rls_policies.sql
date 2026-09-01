-- ═══════════════════════════════════════════════════════════════════════
-- 0002_rls_policies.sql
-- Row Level Security for every table in `public`.
--
-- PRINCIPLES
--   1. RLS on everything. A table without policies is a bug, not a default.
--   2. Deny by default. No USING (true) except genuine public catalogue.
--   3. One policy per operation. FOR ALL is unauditable.
--   4. Column grants + trigger for anything the client must never write.
--   5. app_private is not in the exposed schema list — unreachable regardless.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Enable RLS everywhere in public ──────────────────────────────────
do $$
declare t record;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
    execute format('alter table public.%I force row level security', t.tablename);
  end loop;
end $$;

-- app_private: RLS on, zero policies. Service role only.
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'app_private'
  loop
    execute format('alter table app_private.%I enable row level security', t.tablename);
  end loop;
end $$;

revoke all on all tables in schema app_private from anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- PROFILES — the privilege-escalation surface
-- ═══════════════════════════════════════════════════════════════════════

create policy profiles_select on public.profiles for select
using (deleted_at is null and not is_suspended);

create policy profiles_select_own on public.profiles for select to authenticated
using (id = auth.uid());

create policy profiles_update_own on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

-- Layer 2: column grants. RLS is row-scoped and cannot do this.
revoke update on public.profiles from authenticated;
grant update (
  display_name, headline, bio, avatar_path, cover_path,
  city, state, locality_label, languages, primary_role,
  is_available, availability_note, day_rate_minor, show_rate,
  location_radius_m, username, onboarding_step
) on public.profiles to authenticated;

-- Layer 3: trigger. Insurance against a SECURITY DEFINER RPC bypassing grants.
create or replace function public.tg_protect_profile_columns() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     and auth.role() is distinct from 'service_role' then
    new.verification_tier        := old.verification_tier;
    new.credibility_identity     := old.credibility_identity;
    new.credibility_reliability  := old.credibility_reliability;
    new.credibility_peer         := old.credibility_peer;
    new.credibility_contribution := old.credibility_contribution;
    new.credibility_tier         := old.credibility_tier;
    new.completed_rentals        := old.completed_rentals;
    new.completed_projects       := old.completed_projects;
    new.response_rate            := old.response_rate;
    new.is_suspended             := old.is_suspended;
    new.suspended_reason         := old.suspended_reason;
    new.location_precise         := old.location_precise;
    new.profile_type             := old.profile_type;
  end if;
  return new;
end $$;

create trigger protect_profile_columns before update on public.profiles
  for each row execute function public.tg_protect_profile_columns();

-- Username: lowercase, safe charset, reserved words blocked.
create table if not exists public.reserved_usernames (name citext primary key);
insert into public.reserved_usernames (name) values
  ('admin'),('api'),('app'),('aperture'),('support'),('help'),('about'),
  ('login'),('signup'),('settings'),('dashboard'),('c'),('gear'),('creators'),
  ('communities'),('events'),('legal'),('privacy'),('terms'),('billing'),
  ('root'),('system'),('null'),('undefined')
on conflict do nothing;
alter table public.reserved_usernames enable row level security;
create policy reserved_read on public.reserved_usernames for select using (true);

alter table public.profiles
  add constraint username_format
  check (username ~ '^[a-z0-9][a-z0-9_-]{2,29}$');

create or replace function public.tg_username_not_reserved() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.reserved_usernames where name = new.username) then
    raise exception 'That username is not available' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger username_not_reserved before insert or update of username
  on public.profiles for each row execute function public.tg_username_not_reserved();

-- ═══════════════════════════════════════════════════════════════════════
-- ROLES — zero client writes. This is the #1 Supabase production vuln.
-- ═══════════════════════════════════════════════════════════════════════

create policy user_roles_select_own on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.is_staff());
-- No INSERT / UPDATE / DELETE policy. Grants happen via service-role only.

-- ═══════════════════════════════════════════════════════════════════════
-- SETTINGS, DEVICES, CONSENTS
-- ═══════════════════════════════════════════════════════════════════════

create policy settings_select on public.user_settings for select to authenticated
using (user_id = auth.uid());
create policy settings_update on public.user_settings for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy devices_select on public.user_devices for select to authenticated
using (user_id = auth.uid());
create policy devices_revoke on public.user_devices for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy devices_delete on public.user_devices for delete to authenticated
using (user_id = auth.uid());

create policy consents_select on public.user_consents for select to authenticated
using (user_id = auth.uid());
create policy consents_insert on public.user_consents for insert to authenticated
with check (user_id = auth.uid());
-- Append-only: no UPDATE, no DELETE.

create policy verifications_select on public.verification_records for select to authenticated
using (user_id = auth.uid() or public.is_staff());
-- Writes: service role only.

-- ═══════════════════════════════════════════════════════════════════════
-- CATALOGUE — genuinely public read, staff write
-- ═══════════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  foreach t in array array['skills','gear_categories','gear_brands',
                           'gear_models','gear_model_attributes','gear_adapters']
  loop
    execute format(
      'create policy %I_public_read on public.%I for select using (true)', t, t);
    execute format(
      'create policy %I_staff_write on public.%I for insert to authenticated
       with check (public.is_staff())', t, t);
    execute format(
      'create policy %I_staff_update on public.%I for update to authenticated
       using (public.is_staff())', t, t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════
-- SKILLS / ROLES ON PROFILES
-- ═══════════════════════════════════════════════════════════════════════

create policy creator_skills_read on public.creator_skills for select using (true);
create policy creator_skills_write on public.creator_skills for insert to authenticated
with check (profile_id = auth.uid());
create policy creator_skills_update on public.creator_skills for update to authenticated
using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy creator_skills_delete on public.creator_skills for delete to authenticated
using (profile_id = auth.uid());

create policy creator_roles_read on public.creator_roles for select using (true);
create policy creator_roles_write on public.creator_roles for insert to authenticated
with check (profile_id = auth.uid());
create policy creator_roles_delete on public.creator_roles for delete to authenticated
using (profile_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════
-- PORTFOLIO
-- ═══════════════════════════════════════════════════════════════════════

create policy portfolio_items_read on public.portfolio_items for select
using (
  deleted_at is null and (
    visibility = 'public'
    or (visibility = 'authenticated' and auth.uid() is not null)
    or profile_id = auth.uid()
  )
);
create policy portfolio_items_insert on public.portfolio_items for insert to authenticated
with check (profile_id = auth.uid());
create policy portfolio_items_update on public.portfolio_items for update to authenticated
using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy portfolio_items_delete on public.portfolio_items for delete to authenticated
using (profile_id = auth.uid());

create policy portfolio_collections_read on public.portfolio_collections for select
using (deleted_at is null and (visibility = 'public' or profile_id = auth.uid()));
create policy portfolio_collections_write on public.portfolio_collections for insert to authenticated
with check (profile_id = auth.uid());
create policy portfolio_collections_update on public.portfolio_collections for update to authenticated
using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy portfolio_collections_delete on public.portfolio_collections for delete to authenticated
using (profile_id = auth.uid());

-- Credits: only the credited person may accept or decline.
create policy portfolio_credits_read on public.portfolio_credits for select
using (
  exists (select 1 from public.portfolio_items pi
          where pi.id = portfolio_item_id and pi.visibility = 'public')
  or credited_profile_id = auth.uid()
);
create policy portfolio_credits_propose on public.portfolio_credits for insert to authenticated
with check (
  exists (select 1 from public.portfolio_items pi
          where pi.id = portfolio_item_id and pi.profile_id = auth.uid())
);
create policy portfolio_credits_respond on public.portfolio_credits for update to authenticated
using (credited_profile_id = auth.uid())
with check (credited_profile_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════
-- BLOCKS
-- ═══════════════════════════════════════════════════════════════════════

create policy blocks_select on public.blocks for select to authenticated
using (blocker_id = auth.uid());
create policy blocks_insert on public.blocks for insert to authenticated
with check (blocker_id = auth.uid());
create policy blocks_delete on public.blocks for delete to authenticated
using (blocker_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════
-- REPORTS — reporter sees own, staff sees all
-- ═══════════════════════════════════════════════════════════════════════

create policy reports_select on public.reports for select to authenticated
using (reporter_id = auth.uid() or public.is_staff());
create policy reports_insert on public.reports for insert to authenticated
with check (reporter_id = auth.uid());
create policy reports_staff_update on public.reports for update to authenticated
using (public.is_staff());

-- ═══════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS / FAVOURITES / SAVED SEARCHES
-- ═══════════════════════════════════════════════════════════════════════

create policy notifications_select on public.notifications for select to authenticated
using (user_id = auth.uid());
create policy notifications_mark_read on public.notifications for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete on public.notifications for delete to authenticated
using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['favorites','saved_searches'] loop
    execute format('create policy %I_all_own on public.%I for select to authenticated
                    using (user_id = auth.uid())', t, t);
    execute format('create policy %I_ins on public.%I for insert to authenticated
                    with check (user_id = auth.uid())', t, t);
    execute format('create policy %I_del on public.%I for delete to authenticated
                    using (user_id = auth.uid())', t, t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════
-- STAFF-ONLY TABLES
-- ═══════════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  foreach t in array array['admin_actions','audit_logs','fraud_signals',
                           'ledger_entries','notification_deliveries','search_queries']
  loop
    execute format('create policy %I_staff_read on public.%I for select to authenticated
                    using (public.is_staff())', t, t);
  end loop;
end $$;

-- Users may log their own searches (feeds the zero-result supply signal).
create policy search_queries_own_insert on public.search_queries for insert to authenticated
with check (user_id = auth.uid() or user_id is null);

-- ═══════════════════════════════════════════════════════════════════════
-- NEW USER BOOTSTRAP
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.tg_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_username citext;
begin
  v_username := 'u' || substr(replace(new.id::text, '-', ''), 1, 12);

  insert into public.profiles (id, username, display_name, onboarding_step)
  values (
    new.id,
    v_username,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'New creator'),
    'intent'
  );

  insert into public.user_settings (user_id) values (new.id);
  insert into public.user_roles (user_id, role) values (new.id, 'user');

  insert into public.verification_records (user_id, kind, status, verified_at)
  select new.id, 'email', 'verified', now()
  where new.email_confirmed_at is not null;

  insert into public.verification_records (user_id, kind, status, verified_at)
  select new.id, 'phone', 'verified', now()
  where new.phone_confirmed_at is not null;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- Verification tier is derived, never client-set.
create or replace function public.recompute_verification_tier(p_user uuid)
returns verification_tier
language plpgsql security definer set search_path = public as $$
declare
  has_email boolean; has_phone boolean; has_id boolean;
  has_addr boolean; has_bank boolean; clean_rentals int; v_tier verification_tier;
begin
  select
    bool_or(kind = 'email'        and status = 'verified'),
    bool_or(kind = 'phone'        and status = 'verified'),
    bool_or(kind = 'government_id' and status = 'verified'),
    bool_or(kind = 'address'      and status = 'verified'),
    bool_or(kind = 'bank_account' and status = 'verified')
  into has_email, has_phone, has_id, has_addr, has_bank
  from public.verification_records where user_id = p_user;

  select completed_rentals into clean_rentals from public.profiles where id = p_user;

  v_tier := case
    when has_id and has_addr and has_bank and coalesce(clean_rentals,0) >= 3 then 't3'
    when has_id and has_phone then 't2'
    when has_phone then 't1'
    else 't0'
  end;

  update public.profiles set verification_tier = v_tier where id = p_user;
  return v_tier;
end $$;

create or replace function public.tg_verification_changed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_verification_tier(new.user_id);
  return new;
end $$;

create trigger verification_recompute
  after insert or update on public.verification_records
  for each row execute function public.tg_verification_changed();

-- ═══════════════════════════════════════════════════════════════════════
-- PUBLIC PROFILE READ — respects privacy settings, excludes blocked
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.get_public_profile(p_username citext)
returns table (
  id uuid, username citext, display_name text, headline text, bio text,
  avatar_path text, cover_path text, city text, locality_label text,
  languages text[], primary_role text, verification_tier verification_tier,
  credibility_tier smallint, completed_rentals integer, is_available boolean,
  day_rate_minor bigint, show_rate boolean, member_since timestamptz
)
language sql stable security definer set search_path = public as $$
  select p.id, p.username, p.display_name, p.headline, p.bio,
         p.avatar_path, p.cover_path, p.city, p.locality_label,
         p.languages, p.primary_role, p.verification_tier,
         p.credibility_tier, p.completed_rentals, p.is_available,
         case when p.show_rate then p.day_rate_minor end,
         p.show_rate, p.created_at
  from public.profiles p
  join public.user_settings s on s.user_id = p.id
  where p.username = p_username
    and p.deleted_at is null
    and not p.is_suspended
    and (s.vis_profile = 'public'
         or (s.vis_profile = 'authenticated' and auth.uid() is not null)
         or p.id = auth.uid())
    and not public.is_blocked_between(coalesce(auth.uid(), p.id), p.id);
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- CREATOR DISCOVERY — bucketed distance only, blocks respected
-- Fixes SRS C-7 (blocked users discoverable) and C-6 (ordinal distance leak)
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.search_creators(
  p_city        text default null,
  p_lat         double precision default null,
  p_lng         double precision default null,
  p_radius_km   integer default 25,
  p_skill_slugs text[] default null,
  p_role_slug   text default null,
  p_min_tier    smallint default 0,
  p_limit       integer default 24,
  p_offset      integer default 0
) returns table (
  id uuid, username citext, display_name text, headline text,
  avatar_path text, city text, locality_label text, primary_role text,
  verification_tier verification_tier, credibility_tier smallint,
  completed_rentals integer, distance_bucket text, skills text[]
)
language sql stable security definer set search_path = public as $$
  with base as (
    select p.*,
           case
             when p_lat is null or p.location_precise is null then null
             when st_distance(p.location_precise,
                  st_makepoint(p_lng, p_lat)::geography) < 2000  then 'under 2 km'
             when st_distance(p.location_precise,
                  st_makepoint(p_lng, p_lat)::geography) < 5000  then '2–5 km'
             when st_distance(p.location_precise,
                  st_makepoint(p_lng, p_lat)::geography) < 10000 then '5–10 km'
             else '10+ km'
           end as bucket
    from public.profiles p
    join public.user_settings s on s.user_id = p.id
    where p.deleted_at is null
      and not p.is_suspended
      and s.discoverable_on_radar
      and s.vis_profile in ('public','authenticated')
      and p.credibility_tier >= p_min_tier
      and (p_city is null or p.city ilike p_city)
      and (p_lat is null or (p.location_precise is not null
           and st_dwithin(p.location_precise,
                          st_makepoint(p_lng, p_lat)::geography,
                          p_radius_km * 1000)))
      and (p_role_slug is null or exists (
            select 1 from public.creator_roles cr
            where cr.profile_id = p.id and cr.role_slug = p_role_slug))
      and (p_skill_slugs is null or exists (
            select 1 from public.creator_skills cs
            join public.skills sk on sk.id = cs.skill_id
            where cs.profile_id = p.id and sk.slug = any(p_skill_slugs)))
      -- C-7: blocked users must not be discoverable in either direction
      and not public.is_blocked_between(coalesce(auth.uid(), p.id), p.id)
  )
  select b.id, b.username, b.display_name, b.headline, b.avatar_path,
         b.city, b.locality_label, b.primary_role, b.verification_tier,
         b.credibility_tier, b.completed_rentals, b.bucket,
         coalesce(array_agg(sk.name) filter (where sk.name is not null), '{}')
  from base b
  left join public.creator_skills cs on cs.profile_id = b.id
  left join public.skills sk on sk.id = cs.skill_id
  group by b.id, b.username, b.display_name, b.headline, b.avatar_path,
           b.city, b.locality_label, b.primary_role, b.verification_tier,
           b.credibility_tier, b.completed_rentals, b.bucket, b.last_active_at
  -- C-6: order by BUCKET, never raw distance. Ordinal distance across many
  -- queries reconstructs a home address (threat T-19).
  order by b.bucket nulls last, b.credibility_tier desc, b.last_active_at desc nulls last
  limit least(p_limit, 48) offset p_offset;
$$;

revoke execute on function public.search_creators from anon;
grant execute on function public.search_creators to anon, authenticated;

-- Username availability, rate-limit at the edge.
create or replace function public.username_available(p_username citext)
returns boolean
language sql stable security definer set search_path = public as $$
  select p_username ~ '^[a-z0-9][a-z0-9_-]{2,29}$'
     and not exists (select 1 from public.reserved_usernames where name = p_username)
     and not exists (select 1 from public.profiles where username = p_username);
$$;
