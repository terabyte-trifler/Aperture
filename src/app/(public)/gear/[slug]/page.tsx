import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, Check, MapPin, ShieldCheck, Star, Zap } from "lucide-react";

import { VerificationStrip } from "@/components/verification-strip";
import { GearCard } from "@/components/cards/gear-card";
import { SectionHeading } from "@/components/ui/section";
import { photo } from "@/lib/content/images";
import { formatMoney } from "@/lib/money";
import {
  CATEGORY_LABEL,
  GEAR,
  creatorBy,
  gearBy,
} from "@/lib/content/catalogue";

export const dynamicParams = false;

export function generateStaticParams() {
  return GEAR.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gear = gearBy(slug);
  if (!gear) return { title: "Listing not found" };
  return { title: gear.name, description: gear.description };
}

export default async function GearDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gear = gearBy(slug);
  if (!gear) notFound();

  const owner = creatorBy(gear.ownerUsername);
  const related = GEAR.filter(
    (g) => g.slug !== gear.slug && g.category === gear.category,
  ).slice(0, 3);

  return (
    <main id="main">
      {/* Gallery */}
      <section className="bg-canvas pt-28 md:pt-32">
        <div className="shell">
          <nav className="flex items-center gap-2 py-6 text-sm text-ink-faint">
            <Link href="/gear" className="link-underline hover:text-ink">
              Gear
            </Link>
            <span aria-hidden>/</span>
            <span className="text-ink-muted">{CATEGORY_LABEL[gear.category]}</span>
          </nav>

          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <div className="card-media aspect-[4/3] md:aspect-[3/2]">
              <Image
                src={photo(gear.images[0]!, 1600, 1.5)}
                alt={gear.name}
                fill
                unoptimized
                priority
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover"
              />
              {gear.instantBook && gear.available && (
                <span className="chip-on-photo absolute left-5 top-5 bg-lime/95">
                  <Zap className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
                  Instant book
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
              {gear.images.slice(1, 4).map((img, i) => (
                <div key={img + i} className="card-media aspect-[4/3] md:aspect-auto">
                  <Image
                    src={photo(img, 700, 1.4)}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 33vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detail + booking */}
      <section className="bg-canvas">
        <div className="shell py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">{CATEGORY_LABEL[gear.category]}</p>
              <h1 className="display-section mt-3 text-ink">{gear.name}</h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.9375rem] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-ink-faint" aria-hidden />
                  {gear.area}, {gear.city}
                  <span className="numeric text-ink-faint">· {gear.distanceKm} km</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-ink-faint" aria-hidden />
                  <span className="numeric">{gear.rating}</span>
                  <span className="text-ink-faint">
                    (<span className="numeric">{gear.completedRentals}</span> rentals)
                  </span>
                </span>
                <span
                  className={
                    gear.available
                      ? "inline-flex items-center gap-1.5 text-verified-edge"
                      : "inline-flex items-center gap-1.5 text-pending"
                  }
                >
                  <span
                    className={`h-2 w-2 rounded-full ${gear.available ? "bg-verified" : "bg-pending"}`}
                    aria-hidden
                  />
                  {gear.available ? "Available now" : "Booked this week"}
                </span>
              </div>

              <p className="mt-9 max-w-measure text-lg leading-relaxed text-ink">
                {gear.description}
              </p>

              {/* Accessories */}
              <div className="mt-12 border-t border-line pt-10">
                <h2 className="display-sub text-ink">What comes with it</h2>
                <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {gear.accessories.map((a) => (
                    <li key={a} className="flex items-start gap-3 text-ink-muted">
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-verified"
                        aria-hidden
                        strokeWidth={2.5}
                      />
                      {a}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-ink-faint">
                  Every item above is ticked off by both people at handover and
                  again at return. That checklist is the condition report.
                </p>
              </div>

              {/* Condition */}
              <div className="mt-12 border-t border-line pt-10">
                <h2 className="display-sub text-ink">Condition</h2>
                <p className="mt-4 text-lg text-ink-muted">{gear.condition}</p>
              </div>

              {/* Owner */}
              {owner && (
                <div className="mt-12 border-t border-line pt-10">
                  <h2 className="display-sub text-ink">The owner</h2>

                  <div className="mt-6 rounded-lg bg-sand p-6">
                    <div className="flex flex-wrap items-center justify-between gap-5">
                      <Link
                        href={`/c/${owner.username}`}
                        className="group flex items-center gap-4"
                      >
                        <div className="relative h-14 w-14 overflow-hidden rounded-md bg-sand-deep">
                          <Image
                            src={photo(owner.portrait, 160, 1)}
                            alt={owner.name}
                            fill
                            unoptimized
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="flex items-center gap-1.5 font-medium text-ink">
                            {owner.name}
                            {owner.tier >= 3 && (
                              <BadgeCheck
                                className="h-4 w-4 text-verified"
                                aria-label="Verified"
                                strokeWidth={2.25}
                              />
                            )}
                          </span>
                          <span className="text-sm text-ink-muted">
                            {owner.role} · {owner.city}
                          </span>
                        </div>
                      </Link>

                      <Link
                        href={`/c/${owner.username}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View passport
                      </Link>
                    </div>

                    <VerificationStrip
                      className="mt-6 border-t border-line pt-5"
                      size="sm"
                      states={owner.verification}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Booking panel */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-lg border border-line bg-canvas p-7">
                <p>
                  <span className="numeric text-4xl font-medium text-ink">
                    {formatMoney(gear.rateMinor)}
                  </span>
                  <span className="text-ink-faint"> / day</span>
                </p>

                <dl className="mt-7 space-y-3 border-t border-line pt-6 text-[0.9375rem]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Deposit blocked</dt>
                    <dd className="numeric text-ink">
                      {formatMoney(gear.depositMinor)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Pickup</dt>
                    <dd className="text-ink">{gear.area}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Booking</dt>
                    <dd className="text-ink">
                      {gear.instantBook ? "Instant" : "Owner approves"}
                    </dd>
                  </div>
                </dl>

                <Link
                  href="/login"
                  className="btn btn-primary mt-7 w-full"
                  aria-disabled={!gear.available}
                >
                  {gear.available ? "Send request" : "Join the waitlist"}
                </Link>

                <p className="mt-4 text-center text-sm text-ink-faint">
                  You are not charged until the owner accepts.
                </p>

                <div className="mt-7 flex gap-3 border-t border-line pt-6">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-verified"
                    aria-hidden
                  />
                  <p className="text-sm text-ink-muted">
                    The deposit is blocked in your account, not taken. It is
                    released within 24 hours of a clean return.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="sheet bg-sand">
          <div className="shell section-pad">
            <SectionHeading
              eyebrow="Similar"
              title="Other options nearby."
              action={{ href: "/gear", label: "All gear" }}
            />
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((g) => (
                <GearCard key={g.slug} gear={g} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
