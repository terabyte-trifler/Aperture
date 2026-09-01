import Link from "next/link";
import Image from "next/image";
import { MapPin, Users } from "lucide-react";
import type { CreatorEvent } from "@/lib/content/catalogue";
import { photo } from "@/lib/content/images";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function EventCard({
  event,
  className,
}: {
  event: CreatorEvent;
  className?: string;
}) {
  const d = new Date(`${event.date}T00:00:00`);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn("group flex h-full flex-col", className)}
    >
      <div className="card-media aspect-[3/2]">
        <Image
          src={photo(event.cover, 720, 1.5)}
          alt={event.coverAlt ?? event.title}
          fill
          unoptimized
          sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
          className="object-cover"
        />

        {/* Date block, the one place a calendar chip earns its keep. */}
        <div className="absolute left-4 top-4 rounded-md bg-canvas px-3 py-2 text-center">
          <span className="numeric block text-xl font-medium leading-none text-ink">
            {String(d.getDate()).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-xs uppercase tracking-wider text-ink-faint">
            {MONTH[d.getMonth()]}
          </span>
        </div>

        <span className="chip-on-photo absolute right-4 top-4">
          {event.status === "past" ? "Walk completed" : event.kind}
        </span>
      </div>

      {/* Column so the price line stays on one baseline across the row,
         however many lines a title takes. */}
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="text-xl font-medium tracking-[-0.025em] text-ink">
          {event.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-ink-faint" aria-hidden />
            {event.venue}, {event.city}
          </span>
          {/* Attendance only where we actually hold the number. */}
          {event.attending !== undefined && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-ink-faint" aria-hidden />
              <span className="numeric">{event.attending}</span> going
            </span>
          )}
          {event.theme && <span className="text-ink-faint">{event.theme}</span>}
        </div>

        <p className="mt-auto pt-3 text-sm font-medium text-ink">
          {event.priceMinor === 0 ? "Free" : formatMoney(event.priceMinor)}
        </p>
      </div>
    </Link>
  );
}
