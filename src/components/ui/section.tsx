import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Section heading.
 *
 * Two arrangements, both taken from the reference: centred for the big
 * listing blocks, and left with a trailing link for the ones that scroll
 * on to a fuller page.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  action,
  invert = false,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  action?: { href: string; label: string };
  invert?: boolean;
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        centered && "md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", centered && "text-center")}>
        {eyebrow && (
          <p className={cn("eyebrow mb-4", invert && "text-white/55")}>{eyebrow}</p>
        )}
        <h2
          className={cn(
            "display-section",
            invert ? "text-white" : "text-ink",
          )}
        >
          {title}
        </h2>
        {lede && (
          <p
            className={cn(
              "mt-5 max-w-measure text-lg",
              centered && "mx-auto",
              invert ? "text-white/70" : "text-ink-muted",
            )}
          >
            {lede}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 text-[0.9375rem] font-medium",
            invert ? "text-white" : "text-ink",
          )}
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}
