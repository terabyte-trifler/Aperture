import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, MapPin, Zap } from "lucide-react";
import { CATEGORY_LABEL, type Gear, creatorBy } from "@/lib/content/catalogue";
import { photo } from "@/lib/content/images";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

/**
 * Gear card.
 *
 * Borderless and shadowless: the photograph is the card and the text
 * sits on the page beneath it, which is what keeps a grid of these
 * reading as editorial rather than as a shopping results page.
 */
export function GearCard({
  gear,
  priority = false,
  className,
}: {
  gear: Gear;
  priority?: boolean;
  className?: string;
}) {
  const owner = creatorBy(gear.ownerUsername);
  const verified = (owner?.tier ?? 0) >= 3;

  return (
    <Link
      href={`/gear/${gear.slug}`}
      className={cn("group block", className)}
    >
      <div className="card-media aspect-[4/3]">
        <Image
          src={photo(gear.images[0]!, 720, 1.333)}
          alt={gear.name}
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
          className="object-cover"
        />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <span className="chip-on-photo">
            {gear.available ? "Available" : "Booked this week"}
          </span>
          {gear.instantBook && gear.available && (
            <span className="chip-on-photo bg-lime/95">
              <Zap className="h-3.5 w-3.5" aria-hidden strokeWidth={2.5} />
              Instant
            </span>
          )}
        </div>
      </div>

      <div className="pt-5">
        <p className="eyebrow">{CATEGORY_LABEL[gear.category]}</p>

        <h3 className="mt-2.5 text-xl font-medium tracking-[-0.025em] text-ink">
          {gear.name}
        </h3>

        <p className="mt-2">
          <span className="numeric text-lg font-medium text-ink">
            {formatMoney(gear.rateMinor)}
          </span>
          <span className="text-[0.9375rem] text-ink-faint"> / day</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-ink-faint" aria-hidden />
            {gear.area}
            <span className="numeric text-ink-faint">· {gear.distanceKm} km</span>
          </span>
          {verified && (
            <span className="inline-flex items-center gap-1.5 text-verified-edge">
              <BadgeCheck className="h-4 w-4" aria-hidden strokeWidth={2.25} />
              Verified owner
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
