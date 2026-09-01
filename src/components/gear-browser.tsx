"use client";

import { useMemo, useState } from "react";
import { GearCard } from "@/components/cards/gear-card";
import { FilterRow } from "@/components/ui/filter-row";
import { CATEGORY_LABEL, type Category, type Gear } from "@/lib/content/catalogue";

const OPTIONS = (Object.keys(CATEGORY_LABEL) as Category[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

export function GearBrowser({ gear }: { gear: Gear[] }) {
  const [category, setCategory] = useState("all");

  const shown = useMemo(
    () => (category === "all" ? gear : gear.filter((g) => g.category === category)),
    [gear, category],
  );

  return (
    <>
      <div className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-center md:justify-between">
        <FilterRow options={OPTIONS} onChange={setCategory} />
        <p className="shrink-0 text-sm text-ink-muted">
          <span className="numeric">{shown.length}</span>{" "}
          {shown.length === 1 ? "item" : "items"}
        </p>
      </div>

      {shown.length > 0 ? (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g, i) => (
            <GearCard key={g.slug} gear={g} priority={i < 3} />
          ))}
        </div>
      ) : (
        <p className="mt-16 text-lg text-ink-muted">
          Nothing listed in this category yet.
        </p>
      )}
    </>
  );
}
