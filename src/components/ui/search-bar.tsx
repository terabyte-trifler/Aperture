"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Discovery bar.
 *
 * Four fields on one rule, the way a property search reads on the
 * reference. It filters nothing yet — booking arrives in Phase 7 — so
 * it is deliberately inert rather than pretending to work.
 */
export function SearchBar({ className }: { className?: string }) {
  const [what, setWhat] = useState("");

  return (
    <form
      className={cn(
        "grid gap-px overflow-hidden rounded-lg bg-line md:grid-cols-[1.6fr_1fr_1fr_auto]",
        className,
      )}
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="bg-canvas px-6 py-5">
        <span className="block text-xs font-medium text-ink-faint">
          What are you looking for?
        </span>
        <input
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="Camera, lens, lighting, drone…"
          className="mt-1.5 w-full bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-ink-faint"
        />
      </label>

      <label className="bg-canvas px-6 py-5">
        <span className="block text-xs font-medium text-ink-faint">Location</span>
        <input
          placeholder="Pune"
          className="mt-1.5 w-full bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-ink-faint"
        />
      </label>

      <label className="bg-canvas px-6 py-5">
        <span className="block text-xs font-medium text-ink-faint">Dates</span>
        <input
          placeholder="Add dates"
          className="mt-1.5 w-full bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-ink-faint"
        />
      </label>

      <div className="flex items-center bg-canvas p-3">
        <button type="submit" className="btn btn-primary h-full w-full md:w-auto">
          <Search className="h-4 w-4" aria-hidden />
          Search
        </button>
      </div>
    </form>
  );
}
