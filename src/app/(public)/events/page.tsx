import type { Metadata } from "next";
import { EventCard } from "@/components/cards/event-card";
import { SectionHeading } from "@/components/ui/section";
import { EVENTS } from "@/lib/content/catalogue";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Photowalks, workshops, screenings and meetups run by creators across India.",
};

export default function EventsPage() {
  const byDate = (a: { date: string }, b: { date: string }) =>
    a.date.localeCompare(b.date);

  const upcoming = EVENTS.filter((e) => e.status !== "past").sort(byDate);
  const past = EVENTS.filter((e) => e.status === "past").sort(byDate).reverse();

  return (
    <main id="main">
      <section className="bg-canvas pt-32 md:pt-40">
        <div className="shell pb-16">
          <h1 className="display-hero max-w-[14ch] text-ink">
            Show up. Shoot something. Meet everyone.
          </h1>
          <p className="mt-7 max-w-measure text-lg text-ink-muted">
            Photowalks, workshops and screenings run by the people already on
            APERTURE. Most are free.
          </p>
        </div>
      </section>

      <section className="sheet bg-sand">
        <div className="shell section-pad">
          <SectionHeading eyebrow="Open now" title="Coming up." />
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </div>
      </section>

      {past.length > 0 && (
        <section className="sheet bg-canvas">
          <div className="shell section-pad">
            <SectionHeading
              eyebrow="The record"
              title="Walks that have been."
              lede="Past events stay listed rather than disappearing. A community that can show a year of Saturdays is making a stronger claim than one advertising only its next event."
            />
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
