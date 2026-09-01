import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";

import { VerificationStrip, TierBadge } from "@/components/verification-strip";
import { GearCard } from "@/components/cards/gear-card";
import { SectionHeading } from "@/components/ui/section";
import { photo } from "@/lib/content/images";
import { CREATORS, creatorBy, gearByOwner } from "@/lib/content/catalogue";

export const dynamicParams = false;

export function generateStaticParams() {
  return CREATORS.map((c) => ({ username: c.username }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const creator = creatorBy(username);
  if (!creator) return { title: "Creator not found" };

  return {
    title: `${creator.name} — ${creator.role}`,
    description: creator.bio,
  };
}

/**
 * Creator Passport.
 *
 * The portfolio dominates and the credentials sit beside it. That
 * ordering is the whole argument: you are meant to judge the work
 * first and then find that the record backs it up.
 */
export default async function CreatorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = creatorBy(username);
  if (!creator) notFound();

  const gear = gearByOwner(creator.username);

  return (
    <main id="main">
      {/* Cover */}
      <section className="relative h-[46svh] min-h-[340px] overflow-hidden bg-forest-deep">
        <Image
          src={photo(creator.cover, 1920, 2.6)}
          alt=""
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 to-forest-deep/15" />
      </section>

      {/* Identity */}
      <section className="sheet bg-canvas">
        <div className="shell pb-16 pt-10 md:pb-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="relative -mt-24 h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-sand-deep ring-4 ring-canvas md:-mt-32 md:h-40 md:w-40">
                <Image
                  src={photo(creator.portrait, 400, 1)}
                  alt={creator.name}
                  fill
                  unoptimized
                  sizes="160px"
                  className="object-cover"
                />
              </div>

              <div>
                <h1 className="display-sub text-ink md:text-4xl">
                  {creator.name}
                </h1>
                <p className="mt-2 text-lg text-ink-muted">{creator.role}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[0.9375rem] text-ink-faint">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {creator.area}, {creator.city}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn btn-primary btn-sm">
                Message {creator.name.split(" ")[0]}
              </Link>
              {gear.length > 0 && (
                <a href="#gear" className="btn btn-ghost btn-sm">
                  See their gear
                </a>
              )}
            </div>
          </div>

          {/* Credentials */}
          <div className="mt-12 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="max-w-measure text-lg leading-relaxed text-ink">
                {creator.bio}
              </p>

              <ul className="mt-8 flex flex-wrap gap-2">
                {creator.skills.map((s) => (
                  <li
                    key={s}
                    className="rounded-sm border border-line bg-sand px-3 py-1.5 text-sm text-ink-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-sand p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-medium text-ink">Verification</h2>
                <TierBadge tier={creator.tier} />
              </div>

              <VerificationStrip
                className="mt-5"
                size="sm"
                states={creator.verification}
              />

              <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-line pt-6">
                <Stat label="Shoots completed" value={creator.stats.shoots} />
                <Stat label="Rentals completed" value={creator.stats.rentals} />
                <Stat label="Years working" value={creator.stats.years} />
                <Stat label="On time" value={`${creator.stats.onTime}%`} />
              </dl>

              <p className="mt-6 border-t border-line pt-4 text-xs text-ink-faint">
                Member since {creator.memberSince}. Every figure above counts
                completed transactions only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Selected work — the portfolio dominates */}
      <section className="sheet bg-sand">
        <div className="shell section-pad">
          <SectionHeading eyebrow="Portfolio" title="Selected work." />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creator.work.map((w, i) => (
              <figure key={w.src} className={i % 5 === 0 ? "sm:col-span-2" : ""}>
                <div
                  className={`card-media ${i % 5 === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}
                >
                  <Image
                    src={photo(w.src, i % 5 === 0 ? 1200 : 700, i % 5 === 0 ? 1.6 : 0.8)}
                    alt={w.caption}
                    fill
                    unoptimized
                    sizes="(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="pt-4 text-sm text-ink-muted">
                  {w.caption}
                  <span className="numeric text-ink-faint"> · {w.year}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Their gear */}
      {gear.length > 0 && (
        <section id="gear" className="sheet scroll-mt-24 bg-canvas">
          <div className="shell section-pad">
            <SectionHeading
              eyebrow="Available to rent"
              title={`Gear ${creator.name.split(" ")[0]} lends out.`}
              action={{ href: "/gear", label: "All gear" }}
            />
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {gear.map((g) => (
                <GearCard key={g.slug} gear={g} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Close */}
      <section className="sheet bg-forest">
        <div className="shell section-pad text-center">
          <h2 className="display-section mx-auto max-w-[20ch] text-white">
            Work with {creator.name.split(" ")[0]}, or build a record of your own.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/login?intent=join" className="btn btn-accent">
              Join APERTURE
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/creators" className="btn btn-on-photo">
              Browse more creators
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dd className="numeric text-2xl font-medium text-ink">{value}</dd>
      <dt className="mt-1 text-sm text-ink-muted">{label}</dt>
    </div>
  );
}
