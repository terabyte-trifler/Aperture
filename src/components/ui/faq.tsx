"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * FAQ accordion. Hairline rules, no boxes, no chevrons that spin — the
 * reference keeps this section deliberately quiet and so does this.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-line">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                className="flex w-full items-start justify-between gap-8 py-7 text-left"
              >
                <span className="display-sub max-w-3xl text-ink">{item.q}</span>
                <Plus
                  className={cn(
                    "mt-1 h-5 w-5 shrink-0 text-ink-faint transition-transform duration-300 ease-out",
                    isOpen && "rotate-45",
                  )}
                  aria-hidden
                />
              </button>
            </h3>

            <div
              id={`faq-panel-${i}`}
              hidden={!isOpen}
              className="max-w-measure pb-8 text-lg text-ink-muted"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
