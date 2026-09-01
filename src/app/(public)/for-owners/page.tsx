import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/ui/section";
import { photo, pick } from "@/lib/content/images";

export const metadata: Metadata = {
  title: "For gear owners",
  description:
    "Your kit works forty days a year. Listing it is how it pays its own EMI — with exposure caps, blocked deposits and condition reports behind every rental.",
};

export default function ForOwnersPage() {
  return (
    <main id="main">
      <section className="relative flex min-h-[74svh] flex-col justify-end overflow-hidden bg-forest-deep pb-16 pt-40">
        <Image
          src={photo(pick("lenses", 3), 1800, 1.9)}
          alt=""
          fill
          unoptimized
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="scrim-full" />

        <div className="shell relative">
          <h1 className="display-hero max-w-[17ch] text-white">
            You own ₹4 lakh of gear. It works forty days a year.
          </h1>
          <p className="mt-7 max-w-xl text-lg text-white/75">
            Listing it here is not a favour to strangers. It is how the kit pays
            its own EMI.
          </p>
          <Link href="/login?intent=join" className="btn btn-accent mt-9">
            List your gear
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="sheet bg-canvas">
        <div className="shell section-pad">
          <SectionHeading
            eyebrow="The arithmetic"
            title="Idle equipment is the most expensive kind."
            lede="A body that shoots thirty or forty days a year still depreciates twelve months a year. The question is not whether to lend it out, it is who you are willing to lend it to."
          />

          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {[
              ["You set the terms", "Your rate, your dates, your pickup point. Approve every request by hand, or switch on instant booking for renters above a tier you choose."],
              ["Every renter is verified", "Nobody can request your gear without a government ID matched to a live selfie. You see exactly how far their verification goes before you answer."],
              ["Exposure caps apply", "A renter can only hold so much value at once. Someone new cannot book your cinema body on their first day, however keen they are."],
            ].map(([title, body]) => (
              <div key={title} className="border-t border-ink pt-6">
                <h3 className="text-xl text-ink">{title}</h3>
                <p className="mt-3 text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sheet bg-sand">
        <div className="shell section-pad">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <figure className="card-media aspect-[4/5]">
              <Image
                src={photo(pick("atWork", 7), 900, 0.8)}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </figure>

            <div>
              <h2 className="display-section text-ink">
                When something does go wrong.
              </h2>
              <p className="mt-6 max-w-measure text-lg text-ink-muted">
                It will, eventually. What matters is whether there is a record.
              </p>

              <ul className="mt-10">
                {[
                  "Timestamped condition photographs from both sides, at handover and return",
                  "An accessory checklist ticked off in person, item by item",
                  "A deposit already blocked, so recovery is not a negotiation",
                  "A dispute process with a human being at the end of it",
                ].map((item, i) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-5 border-t border-line py-5 last:border-b"
                  >
                    <span className="numeric text-sm text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="sheet bg-forest">
        <div className="shell section-pad text-center">
          <h2 className="display-section mx-auto max-w-[20ch] text-white">
            Put the kit to work.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/login?intent=join" className="btn btn-accent">
              List your gear
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/how-it-works#protection" className="btn btn-on-photo">
              How protection works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
