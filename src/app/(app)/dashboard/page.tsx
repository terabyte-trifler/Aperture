import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Package, Wallet } from "lucide-react";

import { VerificationStrip, TierBadge } from "@/components/verification-strip";
import { GearCard } from "@/components/cards/gear-card";
import { EventCard } from "@/components/cards/event-card";
import { SectionHeading } from "@/components/ui/section";
import { photo } from "@/lib/content/images";
import { formatMoney } from "@/lib/money";
import { CREATORS, EVENTS, gearByOwner } from "@/lib/content/catalogue";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Dashboard.
 *
 * Functional, but built from the same parts as the public site — same
 * type, same spacing, same cards, photography where it earns its place.
 * No sidebar, no admin chrome. The moment this feels like a different
 * product, the trust the public pages built goes with it.
 *
 * Reads sample data until auth and Supabase are wired up in Phase 3.
 */
export default function DashboardPage() {
  const me = CREATORS[0]!;
  const myGear = gearByOwner(me.username);
  const upcoming = EVENTS.slice(0, 3);

  const earnings = myGear.reduce(
    (sum, g) => sum + g.rateMinor * g.completedRentals,
    0,
  );

  return (
    <main id="main" className="bg-canvas pb-24 pt-28 md:pt-32">
      <div className="shell">
        {/* Identity */}
        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-sand-deep">
              <Image
                src={photo(me.portrait, 200, 1)}
                alt=""
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="eyebrow">Signed in as</p>
              <h1 className="display-sub mt-1.5 text-ink">{me.name}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <TierBadge tier={me.tier} />
            <Link href={`/c/${me.username}`} className="btn btn-ghost btn-sm">
              View public passport
            </Link>
          </div>
        </div>

        {/* Numbers */}
        <div className="grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-3">
          <Tile
            icon={Package}
            label="Items listed"
            value={String(myGear.length)}
          />
          <Tile
            icon={Wallet}
            label="Earned to date"
            value={formatMoney(earnings)}
          />
          <Tile
            icon={CalendarDays}
            label="Rentals completed"
            value={String(me.stats.rentals)}
          />
        </div>

        {/* Verification */}
        <div className="mt-6 rounded-lg bg-sand p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg text-ink">Your verification</h2>
            <Link href="/settings" className="link-underline text-sm text-ink-muted">
              Manage
            </Link>
          </div>
          <VerificationStrip className="mt-5" states={me.verification} />
          <p className="mt-5 text-sm text-ink-faint">
            Every step you complete raises the value of gear you can hold and
            lowers the deposits you are asked for.
          </p>
        </div>

        {/* Listings */}
        <section className="pt-20">
          <SectionHeading
            eyebrow="Your listings"
            title="Gear you lend out."
            action={{ href: "/gear", label: "Browse the marketplace" }}
          />

          {myGear.length > 0 ? (
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {myGear.map((g) => (
                <GearCard key={g.slug} gear={g} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-lg border border-line p-10 text-center">
              <p className="text-lg text-ink-muted">
                Nothing listed yet.
              </p>
              <Link href="/for-owners" className="btn btn-primary mt-6">
                List your first item
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
        </section>

        {/* Events */}
        <section className="pt-20">
          <SectionHeading
            eyebrow="Your calendar"
            title="Coming up near you."
            action={{ href: "/events", label: "All events" }}
          />
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-canvas p-7">
      <Icon className="h-5 w-5 text-ink-faint" aria-hidden />
      <p className="numeric mt-5 text-3xl font-medium text-ink">{value}</p>
      <p className="mt-1.5 text-sm text-ink-muted">{label}</p>
    </div>
  );
}
