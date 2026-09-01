import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { Creator } from "@/lib/content/catalogue";
import { photo } from "@/lib/content/images";
import { cn } from "@/lib/cn";

/**
 * Creator card.
 *
 * A portrait, then a strip of that person's actual work. Showing three
 * frames of output under the name is what separates this from a social
 * profile card — you judge the creator on the work, not the avatar.
 */
export function CreatorCard({
  creator,
  className,
}: {
  creator: Creator;
  className?: string;
}) {
  return (
    <Link
      href={`/c/${creator.username}`}
      className={cn("group block", className)}
    >
      <div className="card-media aspect-[4/5]">
        <Image
          src={photo(creator.portrait, 600, 0.8)}
          alt={creator.name}
          fill
          unoptimized
          sizes="(min-width: 1100px) 25vw, (min-width: 700px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="scrim" />

        <div className="absolute inset-x-4 bottom-4">
          <div className="flex items-center gap-2 text-white">
            <h3 className="text-xl font-medium tracking-[-0.025em]">
              {creator.name}
            </h3>
            {creator.tier >= 3 && (
              <BadgeCheck
                className="h-[18px] w-[18px] text-lime"
                aria-label="Verified creator"
                strokeWidth={2.25}
              />
            )}
          </div>
          <p className="mt-1 text-sm text-white/80">{creator.role}</p>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm text-ink-muted">
          {creator.area}, {creator.city}
        </p>
        <p className="mt-1.5 text-sm text-ink-faint">
          {creator.skills.join(" · ")}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-1.5">
          {creator.work.slice(0, 3).map((w) => (
            <div
              key={w.src}
              className="relative aspect-square overflow-hidden rounded-sm bg-sand-deep"
            >
              <Image
                src={photo(w.src, 220, 1)}
                alt=""
                fill
                unoptimized
                sizes="120px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
