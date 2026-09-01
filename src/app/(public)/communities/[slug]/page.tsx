import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Instagram, Mail, MapPin, Users } from "lucide-react";

import { EventCard } from "@/components/cards/event-card";
import { CreatorCard } from "@/components/cards/creator-card";
import { SectionHeading } from "@/components/ui/section";
import { photo } from "@/lib/content/images";
import { COMMUNITIES, CREATORS, EVENTS, communityBy } from "@/lib/content/catalogue";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMMUNITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = communityBy(slug);
  if (!c) return { title: "Community not found" };
  return { title: c.name, description: c.blurb };
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = communityBy(slug);
  if (!community) notFound();

  // A community's own walks first; otherwise anything in its city.
  const own = EVENTS.filter((e) => e.communitySlug === community.slug);
  const events = (own.length > 0 ? own : EVENTS.filter(
    (e) => e.city === community.city || community.city === "Pan-India",
  ));
  const upcoming = events.filter((e) => e.status !== "past");
  const past = events.filter((e) => e.status === "past");

  const members = CREATORS.filter(
    (c) => c.city === community.city || community.city === "Pan-India",
  ).slice(0, 4);

  return (
    <main id="main">
      <section className="relative flex min-h-[62svh] flex-col justify-end overflow-hidden bg-forest-deep pb-14 pt-40">
        <Image
          src={photo(community.cover, 1800, 2)}
          alt=""
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="scrim" />

        <div className="shell relative">
          <p className="eyebrow text-white/60">{community.city}</p>
          <h1 className="display-hero mt-4 max-w-[14ch] text-white">
            {community.name}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">{community.blurb}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-white/80">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" aria-hidden />
              <span className="numeric">
                {community.memberLabel ?? community.members.toLocaleString("en-IN")}
              </span>
              members
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden />
              {community.city}
            </span>
            <span>{community.focus.join(" · ")}</span>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/login" className="btn btn-accent">
              Join this community
            </Link>
            {community.external?.site && (
              <a
                href={community.external.site}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-on-photo"
              >
                Visit their site
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </section>

      {(community.about || community.external) && (
        <section className="sheet bg-canvas">
          <div className="shell section-pad-sm">
            <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
              {community.about && (
                <p className="max-w-measure text-xl leading-relaxed text-ink">
                  {community.about}
                </p>
              )}

              {community.external && (
                <div className="rounded-lg bg-sand p-6">
                  <h2 className="text-sm font-medium text-ink">
                    Runs its own front door
                  </h2>
                  <p className="mt-2 text-sm text-ink-muted">
                    This community existed before APERTURE and keeps its own
                    site, its own channel and its own members.
                  </p>

                  <ul className="mt-5 space-y-3 border-t border-line pt-5 text-[0.9375rem]">
                    {community.external.site && (
                      <li>
                        <a
                          href={community.external.site}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="link-underline inline-flex items-center gap-2 text-ink"
                        >
                          <ArrowUpRight className="h-4 w-4 text-ink-faint" aria-hidden />
                          {community.external.site.replace(/^https?:\/\//, "")}
                        </a>
                      </li>
                    )}
                    {community.external.instagram && (
                      <li>
                        <a
                          href={community.external.instagram}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="link-underline inline-flex items-center gap-2 text-ink"
                        >
                          <Instagram className="h-4 w-4 text-ink-faint" aria-hidden />
                          @photowalksinpune
                        </a>
                      </li>
                    )}
                    {community.external.email && (
                      <li>
                        <a
                          href={`mailto:${community.external.email}`}
                          className="link-underline inline-flex items-center gap-2 text-ink"
                        >
                          <Mail className="h-4 w-4 text-ink-faint" aria-hidden />
                          {community.external.email}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="sheet bg-canvas">
          <div className="shell section-pad">
            <SectionHeading
              eyebrow="Calendar"
              title="What is coming up."
              action={{ href: "/events", label: "All events" }}
            />
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="sheet bg-canvas">
          <div className="shell section-pad">
            <SectionHeading
              eyebrow="The record"
              title="Walks that have been."
              lede="Past walks stay listed. A community that can show a year of Saturdays is making a stronger claim than one that only advertises the next one."
            />
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      {members.length > 0 && (
        <section className="sheet bg-sand">
          <div className="shell section-pad">
            <SectionHeading
              eyebrow="Members"
              title="Who you will meet."
              action={{ href: "/creators", label: "All creators" }}
            />
            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((c) => (
                <CreatorCard key={c.username} creator={c} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
