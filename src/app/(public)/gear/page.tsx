import type { Metadata } from "next";
import { SearchBar } from "@/components/ui/search-bar";
import { GearBrowser } from "@/components/gear-browser";
import { GEAR } from "@/lib/content/catalogue";

export const metadata: Metadata = {
  title: "Explore gear",
  description:
    "Rent professional cameras, lenses, lighting, audio equipment, gimbals and drones from verified creators near you.",
};

export default function GearPage() {
  return (
    <main id="main">
      <section className="bg-canvas pt-32 md:pt-40">
        <div className="shell pb-14">
          <h1 className="display-hero max-w-[15ch] text-ink">
            Find the right gear for your next shoot.
          </h1>
          <p className="mt-7 max-w-measure text-lg text-ink-muted">
            Professional equipment from creators who use it themselves. Every
            owner is identity-verified, every deposit is blocked rather than
            charged, and every handover leaves a record.
          </p>

          <SearchBar className="mt-12" />
        </div>
      </section>

      <section className="sheet bg-sand">
        <div className="shell section-pad">
          <GearBrowser gear={GEAR} />
        </div>
      </section>
    </main>
  );
}
