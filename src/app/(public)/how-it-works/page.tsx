import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Camera, Check, HandCoins, ScanFace } from "lucide-react";

import { Faq } from "@/components/ui/faq";
import { SectionHeading } from "@/components/ui/section";
import { VerificationStrip } from "@/components/verification-strip";
import { photo, pick } from "@/lib/content/images";
import { FAQS } from "@/lib/content/catalogue";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Verification, escrow, handover and reviews — the mechanism behind every APERTURE rental.",
};

const STAGES = [
  {
    icon: ScanFace,
    n: "01",
    title: "Verify once",
    body: "Government photo ID and a live selfie, usually cleared in under five minutes. Address and bank verification follow and unlock higher tiers. Each step raises the value of gear you can hold and lowers the deposit you are asked for.",
    img: pick("portraits", 1),
  },
  {
    icon: Camera,
    n: "02",
    title: "Book and pay into escrow",
    body: "Your money is held by APERTURE, not handed to a stranger. The deposit is blocked in your account rather than charged. The owner is paid only after the gear comes back.",
    img: pick("cameras", 0),
  },
  {
    icon: Check,
    n: "03",
    title: "Meet and hand over",
    body: "Both of you photograph the item and tick off every accessory. A six-digit code confirms the handover. That checklist and those photographs are the condition report, and they are what settles any later argument.",
    img: pick("atWork", 4),
  },
  {
    icon: HandCoins,
    n: "04",
    title: "Return and get reviewed",
    body: "Deposit released within 24 hours of a clean return. Both sides review each other and both reviews are revealed at the same time, so neither can react to the other.",
    img: pick("production", 3),
  },
];

export default function HowItWorksPage() {
  return (
    <main id="main">
      <section className="bg-canvas pt-32 md:pt-40">
        <div className="shell pb-16">
          <h1 className="display-hero max-w-[15ch] text-ink">
            The mechanism is the trust story.
          </h1>
          <p className="mt-7 max-w-measure text-lg text-ink-muted">
            Most marketplaces hide the machinery behind marketing copy. Ours is
            the only thing a competitor cannot copy, so here it is in full.
          </p>
        </div>
      </section>

      <section className="sheet bg-sand">
        <div className="shell section-pad">
          <div className="flex flex-col gap-20 md:gap-28">
            {STAGES.map(({ icon: Icon, n, title, body, img }, i) => (
              <div
                key={n}
                className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
                  i % 2 === 1 ? "md:[&>figure]:order-first" : ""
                }`}
              >
                <div>
                  <span className="numeric text-sm text-ink-faint">{n}</span>
                  <span className="mt-5 grid h-12 w-12 place-items-center rounded-md bg-forest">
                    <Icon className="h-5 w-5 text-lime" aria-hidden />
                  </span>
                  <h2 className="display-sub mt-6 text-ink">{title}</h2>
                  <p className="mt-4 max-w-measure text-lg text-ink-muted">
                    {body}
                  </p>
                </div>

                <figure className="card-media aspect-[4/3]">
                  <Image
                    src={photo(img, 900, 1.33)}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </figure>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="verification" className="sheet scroll-mt-24 bg-canvas">
        <div className="shell section-pad">
          <SectionHeading
            eyebrow="The strip"
            title="One row, the same everywhere."
            lede="The verification strip renders identically on a passport, a listing, a booking screen and a search result. Same order, same meaning, so it can be read at a glance."
          />

          <div className="mt-12 rounded-lg bg-sand p-8 md:p-12">
            <p className="text-sm text-ink-muted">A fully verified creator</p>
            <VerificationStrip
              className="mt-4"
              states={{
                email: "verified",
                phone: "verified",
                government_id: "verified",
                address: "verified",
                bank_account: "verified",
                professional: "verified",
              }}
            />

            <p className="mt-10 text-sm text-ink-muted">Someone partway through</p>
            <VerificationStrip
              className="mt-4"
              states={{
                email: "verified",
                phone: "verified",
                government_id: "verified",
                address: "pending",
                bank_account: "none",
                professional: "none",
              }}
            />

            <p className="mt-10 max-w-measure text-sm text-ink-faint">
              Order runs from the cheapest signal to the most expensive, so
              scanning left to right tells you how far someone has actually
              gone. Meaning is never carried by colour alone — every state
              carries an icon and a label.
            </p>
          </div>
        </div>
      </section>

      <section id="protection" className="sheet scroll-mt-24 bg-forest">
        <div className="shell section-pad">
          <SectionHeading
            invert
            eyebrow="Protection"
            title="What is covered, and what is not."
            lede="Stated plainly, because implying blanket insurance is how these platforms lose people's trust the first time something breaks."
          />

          <div className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {[
              ["Exposure caps", "Every renter carries a limit on the total value of gear they can hold at any one moment. It rises with verification and with a clean history."],
              ["Blocked deposits", "Deposits are blocked on the renter's card, not charged. Released within 24 hours of a clean return."],
              ["Condition reports", "Timestamped photographs and an accessory checklist from both sides, at handover and at return."],
              ["What is not covered", "Loss of income from a failed shoot, damage from operating outside the stated conditions, and anything the condition report shows was already there."],
            ].map(([title, body]) => (
              <div key={title} className="border-t border-white/20 pt-6">
                <h3 className="text-xl text-white">{title}</h3>
                <p className="mt-3 text-white/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sheet bg-canvas">
        <div className="shell section-pad">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.6fr]">
            <SectionHeading eyebrow="Questions" title="Still wondering." />
            <Faq items={FAQS} />
          </div>

          <div className="mt-20 flex flex-wrap gap-3">
            <Link href="/login?intent=join" className="btn btn-primary">
              Get verified
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/gear" className="btn btn-ghost">
              Browse gear first
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
