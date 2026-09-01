# APERTURE

A trusted creator network and peer-to-peer creative gear marketplace for India's visual creator economy.

> Gear rental is the wedge. Trust infrastructure and verified professional identity are the product. The Verified Credit Graph is the moat.

The SRS is the source of truth. This README covers what is built, how to run it, and what is deliberately not built yet.

---

## Status

**Phases 1–3 complete.** Foundation, database and RLS, auth, onboarding, profiles, public Creator Passport.

| Phase | Scope | State |
|---|---|---|
| 1 | Tooling, design system, CI guards, VerificationStrip | ✅ |
| 2 | Schema, RLS on 79 tables, exposure caps, blocker fixes | ✅ |
| 3 | Phone OTP + OAuth, onboarding, profiles, Passport | ✅ |
| 3.5 | **Full UI build against the HomeQuest visual reference** | ✅ |
| 4 | Portfolio, storage buckets, server-side EXIF stripping | ⬜ next |
| 5 | Communities, events, messaging → **ships to real users** | ⬜ |
| 6 | Gear catalogue, listings, search | ⬜ |
| 7 | Booking engine, state machine, exposure enforcement | ⬜ |
| 8 | Handover, condition reports, Razorpay, deposits | ⬜ |
| 9 | Reviews, disputes, admin | ⬜ |
| 10 | Hardening, rate limiting, pen test | ⬜ |

Phase 5 ships before Phase 6–8 on purpose. Communities are the cold-start solution: strangers renting ₹2L cameras to strangers is a hard sell, acquaintances renting to acquaintances is not.

---

## Setup

```bash
npm install
cp .env.example .env.local          # fill in Supabase keys

npx supabase start                  # local Postgres + Auth + Storage
npx supabase db reset               # runs migrations + seed
npm run db:types                    # generate src/lib/database.types.ts

npm run dev
```

`npm run dev` alone is enough to browse the whole public site: every public page
reads from `src/lib/content/catalogue.ts` rather than the database, so the UI can
be built and reviewed without Supabase running. Supabase is still required for
auth, onboarding and anything behind `/dashboard`.

**Local Supabase needs Docker.** If image pulls fail with
`docker-credential-desktop: executable file not found`, remove the stale
`credsStore` key from `~/.docker/config.json` — it points at an uninstalled
Docker Desktop.

**Create the hosted project in `ap-south-1` (Mumbai).** Region migration means downtime and a full data move, and it matters for DPDP comfort. This is a one-way door.

### Verify before committing

```bash
npm run verify   # typecheck + lint + RLS coverage + secret containment
```

---

## Architecture

```
Browser ──anon key + user JWT──▶ Postgres (RLS enforced)
   │
   ├─ Server Components ──────▶ createClient()      src/lib/supabase/server.ts
   ├─ Server Actions ─────────▶ createClient()      RLS applies
   └─ Route Handlers ─────────▶ createAdminClient() RLS BYPASSED — verify caller first
                                                    src/lib/supabase/admin.ts
```

Three clients, three trust levels. `admin.ts` is `import "server-only"` and CI fails the build if `SERVICE_ROLE` appears anywhere else.

### Directory layout

```
src/
  app/
    (public)/          SSR, indexable — landing, /c/[username]
    (auth)/            login, OTP, OAuth callback
    (app)/             authenticated — onboarding, dashboard, settings
  components/
    verification-strip.tsx   the signature component
    site/                    header, footer
    cards/                   gear, creator, event, community
    ui/                      section heading, search, filters, FAQ
  lib/
    supabase/{server,browser,admin}.ts
    validation/profile.ts    Zod — the actual boundary
    domain/actions.ts        Server Actions
    money.ts                 minor units only, never float
    distance.ts              buckets only, never numeric
supabase/
  migrations/
    0001_initial_schema.sql          79 tables from SRS Appendix A
    0002_rls_policies.sql            RLS, column grants, triggers, RPCs
    0003_blockers_and_exposure.sql   C-1/C-2/C-3 fixes + exposure caps
  seed.sql
scripts/
  check-rls.mjs        fails build if any public table lacks RLS
  check-secrets.mjs    fails build on service-role leakage
```

---

## Security

### The four rules that shaped the code

1. **Money is `bigint` minor units + currency.** Never float. `src/lib/money.ts` is the only renderer.
2. **Distance is a bucket, never a number.** A numeric distance from three query points trilaterates to a home address (threat T-19). `search_creators` orders by bucket, not raw distance.
3. **Booking status changes only via `SECURITY DEFINER` RPC.** No UPDATE policy on `rental_bookings` at all.
4. **The service-role key exists in two places** — Vercel server env and Supabase function secrets. Enforced by CI, not by discipline.

### Three layers protecting `profiles`

RLS is row-scoped and cannot stop a user updating their own `credibility_tier`. So:

1. **Column grants** — `authenticated` may update 16 named columns. Nothing else.
2. **Trigger** — `tg_protect_profile_columns` reverts protected columns for any non-service-role update. Insurance against a future `SECURITY DEFINER` RPC bypassing the grants.
3. **Server Actions** — never construct an update object containing a protected column.

### `app_private` is unreachable

KYC documents and raw serial numbers live in `app_private`, which is **not in the PostgREST exposed schema list** (`supabase/config.toml`). Even a catastrophically misconfigured policy in `public` cannot reach it.

### The control that must not be dropped

`check_renter_exposure()` enforces three independent limits: per-transaction, **concurrent aggregate across all owners**, and velocity. The second is the one that defeats "rent from six owners in one weekend and disappear" — the fraud that shut down Wedio's UK operation.

It must be called inside a `SERIALIZABLE` transaction in `rpc_respond_booking`. Two concurrent acceptances must not both pass. Test this before the booking module ships.

### Known limitations — stated honestly

| Gap | Consequence | Fixed in |
|---|---|---|
| **No rate limiting** | A scripted OTP run costs real money in SMS. This is SRS gap M-2. | Phase 10 (Upstash) |
| **Deposit mechanism unconfirmed** | Whether UPI single-block is available to a marketplace of our category is unanswered by Razorpay and Cashfree. `DepositProvider` will be an interface with card pre-auth implemented and `upi_block` throwing. | Phase 8, blocked on PSP |
| **Damage waiver not legally reviewed** | The protection product cannot launch without written counsel on the IRDAI position. | Blocking, pre-beta |
| **`location_precise` never populated** | Set server-side from a city-centroid geocode. Proximity search returns nothing until Phase 6. | Phase 6 |
| **No pgTAP suite yet** | RLS is asserted by CI coverage, not by cross-user attack tests. | Phase 2 completion |

Do not describe this application as secure until the Phase 10 audit is done and the pen test findings are closed.

---

## Design

Full direction in `DESIGN-DIRECTION.md`. The short version:

**Ground is 18% neutral grey** — the surface photographers calibrate against, and the one background on which a photograph renders honestly. Not cream, not near-black, not a SaaS gradient.

**Deep for browsing work, Paper for reading facts.** Browse gear on Deep. Read a Passport, agreement, invoice or condition report on Paper. Users learn the split in a session and it does real navigational work.

**`--verified` is the only saturated colour.** It appears on verification state and the primary action, nowhere else. The moment it accents a heading it stops meaning anything and the verification strip stops being scannable.

**IBM Plex** throughout, because it ships Sans, Mono *and* Devanagari from one family. Hindi and Marathi are V2 requirements; choosing a face without Devanagari now means re-typesetting later.

All numerics are `font-variant-numeric: tabular-nums`. Misaligned rupee columns read as amateurish in exactly the screens where trust is being established.

---

## Deliberately not built

From the SRS DO NOT BUILD YET list. Each of these is a good idea that would consume a disproportionate share of a small team before there is evidence anyone wants the core product.

Social feed · follower counts · algorithmic ranking · native apps · multi-city launch · cross-owner cart · shipping · blockchain credits · fractional gear ownership · model/talent persona (needs the full physical-safety build first) · paid job marketplace · Algolia/Typesense · microservices · own insurance product · gamification · video hosting.

Community **posts and comments** are also cut from MVP per SRS §18 — a community is a member list and an event calendar. Resist the feed.


---

## Pages

| Route | What it is |
|---|---|
| `/` | Landing — hero, disciplines, gear, creators, editorial, how it works, ecosystem, communities, stories, CTA, FAQ |
| `/gear` | Marketplace with search and category filters |
| `/gear/[slug]` | Listing — gallery, accessories, condition, owner, booking panel |
| `/creators` | Creator directory |
| `/c/[username]` | Creator Passport — portfolio-first, credentials beside it |
| `/communities`, `/communities/[slug]` | Communities and their calendars |
| `/events`, `/events/[slug]` | Photowalks, workshops, screenings |
| `/how-it-works` | Verification, escrow, handover, reviews, protection |
| `/for-owners` | The owner-side argument |
| `/login` | Phone OTP, split composition |
| `/dashboard` | Authenticated home — same visual system, no admin chrome |

## Development content

`src/lib/content/catalogue.ts` holds the demo cast, listings, communities and
events; `src/lib/content/images.ts` holds a curated Unsplash set grouped by
subject. Every photo id in it was taken from a live search and returns 200 —
none are guessed.

**One community in there is real.** `photowalks-in-pune` is
[Photowalks in Pune](https://photowalksinpune.com) — its name, its published
counts ("100+", carried across as written rather than rounded into a
precise-looking figure), its twelve walks and its photographs, which are served
from that project's own deployment rather than copied here so the credit and
the hosting stay with it. No host is named on any walk: the source data leaves
`hostUsername` unset on purpose, and the community is credited instead.

**Everyone else in there is invented.** Names, studios, quotes and figures are
development placeholders and must not reach production: the entire proposition
is verified trust, and shipping invented credentials would undo it. The footer
says so on every page. Replace with real data at Phase 4.

Images are served straight from the Unsplash CDN with `unoptimized`, so no build
cache is written and nothing is stored locally. Real creator uploads move to
Supabase Storage in Phase 4, at which point `next.config.ts` should drop the
`images.unsplash.com` remote pattern.
