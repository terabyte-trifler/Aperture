import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import type { Community } from "@/lib/content/catalogue";
import { photo } from "@/lib/content/images";
import { cn } from "@/lib/cn";

/**
 * Community card — the reference's services treatment: a photograph
 * with the label sitting inside it under a gradient, rather than in a
 * box below it.
 */
export function CommunityCard({
  community,
  className,
}: {
  community: Community;
  className?: string;
}) {
  return (
    <Link
      href={`/communities/${community.slug}`}
      className={cn("group block", className)}
    >
      <div className="card-media aspect-[3/4]">
        <Image
          src={photo(community.cover, 640, 0.75)}
          alt={community.name}
          fill
          unoptimized
          sizes="(min-width: 1100px) 25vw, (min-width: 700px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="scrim" />

        <div className="absolute inset-x-5 bottom-5 text-white">
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">
            {community.city}
          </p>
          <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em]">
            {community.name}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-white/75">
            {community.blurb}
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/85">
            <Users className="h-4 w-4" aria-hidden />
            <span className="numeric">
              {community.memberLabel ?? community.members.toLocaleString("en-IN")}
            </span>
            members
          </p>
        </div>
      </div>
    </Link>
  );
}
