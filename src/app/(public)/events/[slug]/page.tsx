import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

import { EventCard } from "@/components/cards/event-card";
import { SectionHeading } from "@/components/ui/section";
import { photo } from "@/lib/content/images";
import { formatMoney } from "@/lib/money";
import { EVENTS, communityBy, creatorBy, eventBy } from "@/lib/content/catalogue";

export const dynamicParams = false;

export function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = eventBy(slug);
  if (!e) return { title: "Event not found" };
  return { title: e.title, description: e.blurb };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = eventBy(slug);
  if (!event) notFound();

  const organiser = event.organiser ? creatorBy(event.organiser) : undefined;
  const community = event.communitySlug ? communityBy(event.communitySlug) : undefined;
  const others = EVENTS.filter((e) => e.slug !== event.slug).slice(0, 3);
  const isPast = event.status === "past";
  // Only some events carry an attendance figure; the rest keep it in their
  // own system and we do not guess at it.
  const spotsLeft =
    event.attending === undefined ? undefined : event.capacity - event.attending;

  const dateLabel = new Date(`${event.date}T00:00:00`).toLocaleDateString(
    "en-IN",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <main id="main">
      <section className="relative flex min-h-[58svh] flex-col justify-end overflow-hidden bg-forest-deep pb-14 pt-40">
        <Image
          src={photo(event.cover, 1800, 2)}
          alt=""
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="scrim" />

        <div className="shell relative">
          <p className="eyebrow text-white/60">{event.kind}</p>
          <h1 className="display-hero mt-4 max-w-[16ch] text-white">
            {event.title}
          </h1>
        </div>
      </section>

      <section className="sheet bg-canvas">
        <div className="shell section-pad">
          <div className="grid gap-12 lg:grid-cols-[1.7fr_1fr] lg:gap-16">
            <div>
              <p className="max-w-measure text-xl leading-relaxed text-ink">
                {event.blurb}
              </p>

              <dl className="mt-12 grid gap-x-8 gap-y-7 border-t border-line pt-10 sm:grid-cols-2">
                <Detail icon={CalendarDays} label="Date" value={dateLabel} />
                <Detail icon={Clock} label="Starts" value={event.time} numeric />
                <Detail
                  icon={MapPin}
                  label="Where"
                  value={`${event.venue}, ${event.city}`}
                />
                <Detail
                  icon={Users}
                  label={event.attending === undefined ? "Capacity" : "Attending"}
                  value={
                    event.attending === undefined
                      ? `${event.capacity} places`
                      : `${event.attending} of ${event.capacity}`
                  }
                  numeric
                />
              </dl>

              {!organiser && community && (
                <div className="mt-12 border-t border-line pt-10">
                  <h2 className="display-sub text-ink">Organised by</h2>
                  <Link
                    href={`/communities/${community.slug}`}
                    className="mt-6 flex items-center gap-4"
                  >
                    <div className="relative h-14 w-14 overflow-hidden rounded-md bg-sand-deep">
                      <Image
                        src={photo(community.cover, 160, 1)}
                        alt=""
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-ink">
                        {community.name}
                      </span>
                      <span className="block text-sm text-ink-muted">
                        {community.city} · community walk
                      </span>
                    </div>
                  </Link>
                  <p className="mt-5 max-w-measure text-sm text-ink-faint">
                    No individual host is named on this walk. The community
                    publishes it without one, and inventing a name here would
                    be worse than leaving it out.
                  </p>
                </div>
              )}

              {organiser && (
                <div className="mt-12 border-t border-line pt-10">
                  <h2 className="display-sub text-ink">Organised by</h2>
                  <Link
                    href={`/c/${organiser.username}`}
                    className="mt-6 flex items-center gap-4"
                  >
                    <div className="relative h-14 w-14 overflow-hidden rounded-md bg-sand-deep">
                      <Image
                        src={photo(organiser.portrait, 160, 1)}
                        alt={organiser.name}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-ink">
                        {organiser.name}
                      </span>
                      <span className="block text-sm text-ink-muted">
                        {organiser.role} · {organiser.city}
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-lg border border-line bg-canvas p-7">
                <p className="numeric text-4xl font-medium text-ink">
                  {event.priceMinor === 0 ? "Free" : formatMoney(event.priceMinor)}
                </p>

                <p className="mt-3 text-sm text-ink-muted">
                  {isPast ? (
                    "This walk has been. Registrations are closed."
                  ) : spotsLeft === undefined ? (
                    <>
                      <span className="numeric">{event.capacity}</span> places,
                      first come
                    </>
                  ) : spotsLeft > 0 ? (
                    <>
                      <span className="numeric">{spotsLeft}</span> of{" "}
                      <span className="numeric">{event.capacity}</span> places
                      left
                    </>
                  ) : (
                    "This one is full — join the waitlist"
                  )}
                </p>

                {isPast ? (
                  community?.external?.site ? (
                    <a
                      href={community.external.site}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn btn-ghost mt-7 w-full"
                    >
                      See the next walk
                    </a>
                  ) : (
                    <Link href="/events" className="btn btn-ghost mt-7 w-full">
                      Find an upcoming walk
                    </Link>
                  )
                ) : (
                  <Link href="/login" className="btn btn-primary mt-7 w-full">
                    {spotsLeft !== undefined && spotsLeft <= 0 ? "Join waitlist" : "RSVP"}
                  </Link>
                )}

                <p className="mt-4 text-center text-sm text-ink-faint">
                  {isPast
                    ? "Walks run most weekends."
                    : "Free to cancel up to 24 hours before."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="sheet bg-sand">
        <div className="shell section-pad">
          <SectionHeading
            eyebrow="Also on"
            title="More to turn up to."
            action={{ href: "/events", label: "All events" }}
          />
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  numeric = false,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  numeric?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-1 h-5 w-5 shrink-0 text-ink-faint" aria-hidden />
      <div>
        <dt className="text-sm text-ink-faint">{label}</dt>
        <dd className={`mt-1 text-ink ${numeric ? "numeric" : ""}`}>{value}</dd>
      </div>
    </div>
  );
}
