import type { Metadata } from "next";
import Image from "next/image";
import { CreatorCard } from "@/components/cards/creator-card";
import { SectionHeading } from "@/components/ui/section";
import { photo } from "@/lib/content/images";
import { CREATORS, STORIES } from "@/lib/content/catalogue";

export const metadata: Metadata = {
  title: "Discover creators",
  description:
    "Photographers, filmmakers, editors and collaborators with a verified professional record.",
};

export default function CreatorsPage() {
  return (
    <main id="main">
      <section className="bg-canvas pt-32 md:pt-40">
        <div className="shell pb-16">
          <h1 className="display-hero max-w-[14ch] text-ink">
            Meet creators worth working with.
          </h1>
          <p className="mt-7 max-w-measure text-lg text-ink-muted">
            Every profile is a professional record rather than a follower
            count: verified identity, completed work, and reviews that can
            only follow a real booking.
          </p>
        </div>
      </section>

      <section className="sheet bg-sand">
        <div className="shell section-pad">
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {CREATORS.map((c) => (
              <CreatorCard key={c.username} creator={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="sheet bg-canvas">
        <div className="shell section-pad">
          <SectionHeading
            eyebrow="Creator stories"
            title="What changes once the record exists."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STORIES.map((s, i) => (
              <figure
                key={s.name}
                className={`rounded-lg bg-sand p-7 ${i % 2 === 1 ? "lg:mt-10" : ""}`}
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-sand-deep">
                  <Image
                    src={photo(s.portrait, 160, 1)}
                    alt=""
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <blockquote className="mt-6 text-[1.0625rem] leading-relaxed text-ink">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-7">
                  <span className="block font-medium text-ink">{s.name}</span>
                  <span className="block text-sm text-ink-muted">
                    {s.role} · {s.city}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
