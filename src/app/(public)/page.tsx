import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, BadgeCheck, Camera, Compass, Users } from "lucide-react";

import { SectionHeading } from "@/components/ui/section";
import { GearCard } from "@/components/cards/gear-card";
import { CreatorCard } from "@/components/cards/creator-card";
import { CommunityCard } from "@/components/cards/community-card";
import { Faq } from "@/components/ui/faq";
import { photo, pick } from "@/lib/content/images";
import { COMMUNITIES, CREATORS, FAQS, GEAR, STORIES } from "@/lib/content/catalogue";
import { LAUNCH_CITY } from "@/lib/env";

export default function HomePage() {
  const city = LAUNCH_CITY;

  return (
    <main id="main">
      <Hero city={city} />
      <Disciplines />
      <FeaturedGear />
      <FeaturedCreators />
      <EditorialStory />
      <HowItWorks />
      <Ecosystem />
      <CommunitySection />
      <CreatorStories />
      <FinalCta />
      <FaqSection />
    </main>
  );
}

/* ── 2. Hero ─────────────────────────────────────────────────────── */

function Hero({ city }: { city: string }) {
  return (
    <section className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden bg-forest-deep pb-16 pt-40 md:pb-24">
      <Image
        src={photo(pick("atWork", 0), 1920, 1.6)}
        alt="A photographer working on location"
        fill
        unoptimized
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="scrim-full" />

      <div className="shell relative">
        <h1 className="display-hero max-w-[16ch] text-white">
          Access the gear. Find your people. Build your reputation.
        </h1>

        <p className="mt-8 max-w-xl text-lg text-white/75">
          APERTURE is where India&rsquo;s visual creators rent gear, find
          collaborators, and build a professional reputation backed by real
          work.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/gear" className="btn btn-accent">
            Explore Gear
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/creators" className="btn btn-on-photo">
            Discover Creators
          </Link>
        </div>

        <p className="mt-10 text-sm text-white/55">
          Live in {city}. Mumbai next.
        </p>
      </div>
    </section>
  );
}

/* ── 3. Disciplines strip ────────────────────────────────────────── */

const DISCIPLINES = [
  "Photography",
  "Filmmaking",
  "Wedding Creators",
  "Visual Artists",
  "Production Teams",
];

function Disciplines() {
  return (
    <section className="relative z-10 bg-lime py-7">
      <div className="shell flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <p className="shrink-0 text-[0.9375rem] font-medium text-ink">
          Trusted by creators across India
        </p>
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 lg:gap-x-12">
          {DISCIPLINES.map((d) => (
            <li
              key={d}
              className="text-[0.9375rem] font-medium tracking-[-0.01em] text-ink/70"
            >
              {d}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 4. Featured gear ────────────────────────────────────────────── */

function FeaturedGear() {
  return (
    <section className="bg-canvas">
      <div className="shell section-pad">
        <SectionHeading
          eyebrow="Marketplace"
          title="Gear creators trust."
          lede="Rent professional cameras, lenses, lighting, audio equipment and more from verified creators near you."
          action={{ href: "/gear", label: "Browse all gear" }}
        />

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {GEAR.slice(0, 6).map((g, i) => (
            <GearCard key={g.slug} gear={g} priority={i < 3} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 5. Featured creators ────────────────────────────────────────── */

function FeaturedCreators() {
  return (
    <section className="sheet bg-sand">
      <div className="shell section-pad">
        <SectionHeading
          eyebrow="The network"
          title="Meet creators worth working with."
          lede="Every profile is a professional record: verified identity, completed work, and reviews that can only follow a real booking."
          action={{ href: "/creators", label: "See all creators" }}
        />

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {CREATORS.slice(0, 4).map((c) => (
            <CreatorCard key={c.username} creator={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 6. Editorial story ──────────────────────────────────────────── */

const PROOFS = [
  "You have worked with real people",
  "You have completed real projects",
  "You have handled real equipment",
  "You have earned trust, and it is on the record",
];

function EditorialStory() {
  return (
    <section className="sheet relative overflow-hidden bg-forest-deep">
      <Image
        src={photo(pick("atWork", 1), 1920, 1.7)}
        alt=""
        fill
        unoptimized
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/92 via-forest-deep/60 to-transparent" />

      <div className="shell relative section-pad">
        <div className="max-w-xl rounded-lg bg-canvas p-8 md:p-12">
          <h2 className="display-section text-ink">
            Your work deserves more than follower counts.
          </h2>

          <p className="mt-6 text-lg text-ink-muted">
            Instagram shows your work. APERTURE proves your word.
          </p>

          <ul className="mt-10">
            {PROOFS.map((p, i) => (
              <li
                key={p}
                className="flex items-baseline gap-5 border-t border-line py-5 last:border-b"
              >
                <span className="numeric text-sm text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[1.0625rem] text-ink">{p}</span>
              </li>
            ))}
          </ul>

          <Link href="/how-it-works" className="btn btn-primary mt-10">
            How the record is built
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 7. How APERTURE works ───────────────────────────────────────── */

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Find gear, creators and opportunities near you, filtered by distance rather than by who paid for placement.",
  },
  {
    n: "02",
    title: "Connect",
    body: "Message verified creators, join a community, and turn a city full of strangers into people you have actually met.",
  },
  {
    n: "03",
    title: "Create",
    body: "Rent equipment, crew a shoot, collaborate and deliver. Payment sits in escrow until the gear is safely back.",
  },
  {
    n: "04",
    title: "Build trust",
    body: "Every completed interaction adds to a professional identity that travels with you, off this platform included.",
  },
];

function HowItWorks() {
  return (
    <section className="sheet bg-canvas">
      <div className="shell section-pad">
        <SectionHeading
          eyebrow="The mechanism"
          title="How APERTURE works."
          lede="Four steps, each one producing a record. That record is what makes the next booking easier, and what settles the argument if something goes wrong."
        />

        <ol className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="border-t border-ink pt-6">
              <span className="numeric text-sm text-ink-faint">{s.n}</span>
              <h3 className="mt-6 text-2xl font-medium tracking-[-0.03em] text-ink">
                {s.title}
              </h3>
              <p className="mt-3 text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 8. Ecosystem ────────────────────────────────────────────────── */

const SERVICES = [
  {
    title: "Rent gear",
    body: "Access professional equipment the day you need it.",
    href: "/gear",
    img: pick("cameras", 0),
    icon: Camera,
  },
  {
    title: "List your gear",
    body: "Turn equipment that works forty days a year into income.",
    href: "/for-owners",
    img: pick("lenses", 2),
    icon: BadgeCheck,
  },
  {
    title: "Find creators",
    body: "Photographers, filmmakers, editors and collaborators nearby.",
    href: "/creators",
    img: pick("production", 1),
    icon: Compass,
  },
  {
    title: "Build your reputation",
    body: "A professional identity backed by work you actually did.",
    href: "/how-it-works",
    img: pick("atWork", 3),
    icon: Users,
  },
];

function Ecosystem() {
  return (
    <section className="sheet bg-sand">
      <div className="shell section-pad">
        <SectionHeading
          eyebrow="The ecosystem"
          title="Four ways in."
          lede="Most people arrive for the gear and stay for the network. Both doors lead to the same place."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ title, body, href, img, icon: Icon }) => (
            <Link key={title} href={href} className="group block">
              <div className="card-media aspect-[3/4]">
                <Image
                  src={photo(img, 900, 0.75)}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 1100px) 25vw, (min-width: 700px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="scrim" />

                <div className="absolute inset-x-5 bottom-5 text-white">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-white/15 backdrop-blur">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-xl font-medium tracking-[-0.025em]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-white/75">{body}</p>
                </div>

                <ArrowUpRight
                  className="absolute right-5 top-5 h-5 w-5 text-white/70 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 9. Communities ──────────────────────────────────────────────── */

function CommunitySection() {
  return (
    <section className="sheet bg-forest">
      <div className="shell section-pad">
        <SectionHeading
          invert
          eyebrow="Communities"
          title="Creativity happens together."
          lede="Find your creative community, attend photowalks and meet people who understand your craft."
          action={{ href: "/communities", label: "All communities" }}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COMMUNITIES.map((c) => (
            <CommunityCard key={c.slug} community={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 10. Creator stories ─────────────────────────────────────────── */

function CreatorStories() {
  return (
    <section className="sheet bg-canvas">
      <div className="shell section-pad">
        <SectionHeading
          eyebrow="Creator stories"
          title="What changes once the record exists."
          action={{ href: "/creators", label: "Read all stories" }}
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
  );
}

/* ── 11. Final CTA ───────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="sheet relative overflow-hidden bg-forest-deep">
      <Image
        src={photo(pick("community", 4), 1920, 2.2)}
        alt=""
        fill
        unoptimized
        sizes="100vw"
        className="object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/80 to-forest-deep/50" />

      <div className="shell relative section-pad text-center">
        <h2 className="display-section mx-auto max-w-[18ch] text-white">
          Your next project starts with the right people.
        </h2>
        <p className="mx-auto mt-6 max-w-measure text-lg text-white/70">
          Find the gear, collaborators and creative community you need.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/login?intent=join" className="btn btn-accent">
            Join APERTURE
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/gear" className="btn btn-on-photo">
            Explore gear first
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 12. FAQ ─────────────────────────────────────────────────────── */

function FaqSection() {
  return (
    <section className="sheet bg-canvas">
      <div className="shell section-pad">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.6fr]">
          <SectionHeading eyebrow="Questions" title="Before you start." />
          <Faq items={FAQS} />
        </div>
      </div>
    </section>
  );
}
