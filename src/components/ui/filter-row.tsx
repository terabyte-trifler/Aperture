"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Category filter. Client-side only — it narrows what is already on the
 * page rather than pretending to query a database that is not there yet.
 */
export function FilterRow({
  options,
  onChange,
  className,
}: {
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [active, setActive] = useState("all");

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {[{ value: "all", label: "Everything" }, ...options].map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => {
            setActive(o.value);
            onChange?.(o.value);
          }}
          aria-pressed={active === o.value}
          className={cn(
            "rounded-sm border px-4 py-2.5 text-sm transition-colors duration-200",
            active === o.value
              ? "border-ink bg-ink text-ink-inverse"
              : "border-line bg-canvas text-ink-muted hover:border-ink-faint",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
