import type { Metadata } from "next";
import { CommunityCard } from "@/components/cards/community-card";
import { EventCard } from "@/components/cards/event-card";
import { SectionHeading } from "@/components/ui/section";
import { COMMUNITIES, EVENTS } from "@/lib/content/catalogue";

export const metadata: Metadata = {
  title: "Communities",
  description:
    "City-scale groups built around a craft. Photowalks, workshops and screenings across India.",
};

export default function CommunitiesPage() {
  return (
    <main id="main">
      <section className="bg-canvas pt-32 md:pt-40">
        <div className="shell pb-16">
          <h1 className="display-hero max-w-[13ch] text-ink">
            Creativity happens together.
          </h1>
          <p className="mt-7 max-w-measure text-lg text-ink-muted">
            Find your creative community, attend photowalks and meet people who
            understand your craft. Communities are how most people meet the
            person they end up renting from.
          </p>
        </div>
      </section>

      <section className="sheet bg-sand">
        <div className="shell section-pad">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMMUNITIES.map((c) => (
              <CommunityCard key={c.slug} community={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="sheet bg-canvas">
        <div className="shell section-pad">
          <SectionHeading
            eyebrow="Coming up"
            title="Next in the calendar."
            action={{ href: "/events", label: "All events" }}
          />
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {EVENTS.slice(0, 3).map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
