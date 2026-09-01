import { Check, Clock, Minus, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The verification strip.
 *
 * Renders identically on the Creator Passport, on every gear listing, on
 * every booking screen and in search results. Same component, same order,
 * same meaning, everywhere — it is the product's visual signature and its
 * trust primitive in the same object.
 *
 * Order is fixed and deliberate: it runs from cheapest signal to most
 * expensive, so a reader scanning left to right sees how far someone has
 * actually gone. Do not reorder per surface.
 */

export type VerificationKind =
  | "email"
  | "phone"
  | "government_id"
  | "address"
  | "bank_account"
  | "professional";

export type VerificationState = "verified" | "pending" | "expired" | "none";

const ORDER: { kind: VerificationKind; label: string; proves: string }[] = [
  { kind: "email", label: "Email", proves: "A working email address" },
  { kind: "phone", label: "Phone", proves: "An Indian mobile number they control" },
  {
    kind: "government_id",
    label: "ID",
    proves: "Government photo ID matched to a live selfie",
  },
  { kind: "address", label: "Address", proves: "A verified residential address" },
  {
    kind: "bank_account",
    label: "Bank",
    proves: "A bank account in the same legal name",
  },
  {
    kind: "professional",
    label: "Business",
    proves: "A registered business or studio",
  },
];

const STATE_STYLE: Record<VerificationState, string> = {
  verified: "border-verified/25 bg-verified-soft text-verified-edge",
  pending: "border-pending/25 bg-pending-soft text-pending",
  expired: "border-flag/25 bg-flag-soft text-flag",
  none: "border-line bg-sand text-ink-faint",
};

const STATE_ICON: Record<VerificationState, typeof Check> = {
  verified: Check,
  pending: Clock,
  expired: ShieldAlert,
  none: Minus,
};

const STATE_WORD: Record<VerificationState, string> = {
  verified: "verified",
  pending: "being checked",
  expired: "needs renewing",
  none: "not verified",
};

export function VerificationStrip({
  states,
  size = "md",
  showLabels = true,
  className,
}: {
  states: Partial<Record<VerificationKind, VerificationState>>;
  size?: "sm" | "md";
  showLabels?: boolean;
  className?: string;
}) {
  const items = ORDER.filter(
    (i) => showLabels || (states[i.kind] ?? "none") !== "none",
  );

  return (
    <ul
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      aria-label="Verification status"
    >
      {items.map(({ kind, label, proves }) => {
        const state = states[kind] ?? "none";
        const Icon = STATE_ICON[state];

        return (
          <li key={kind}>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-sm border font-medium",
                size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
                STATE_STYLE[state],
              )}
              // Meaning must never be carried by colour alone.
              title={`${label}: ${STATE_WORD[state]}. ${proves}.`}
            >
              <Icon
                className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
                aria-hidden
                strokeWidth={2.5}
              />
              {showLabels && <span>{label}</span>}
              <span className="sr-only">
                {label}: {STATE_WORD[state]}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const TIER_COPY: Record<number, { name: string; blurb: string }> = {
  0: { name: "New", blurb: "Just joined" },
  1: { name: "Verified", blurb: "Identity confirmed" },
  2: { name: "Verified", blurb: "Identity confirmed" },
  3: { name: "Trusted", blurb: "Clean transaction history" },
  4: { name: "Pro", blurb: "Deposit-free, instant booking" },
};

/** Headline tier chip. Always paired with the strip, never shown alone. */
export function TierBadge({
  tier,
  className,
}: {
  tier: number;
  className?: string;
}) {
  const t = TIER_COPY[Math.max(0, Math.min(4, tier))]!;
  const strong = tier >= 3;

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-sm border px-2 py-1",
        strong
          ? "border-verified/30 bg-verified-soft text-verified-edge"
          : "border-line bg-sand text-ink-muted",
        className,
      )}
      title={t.blurb}
    >
      <span className="text-sm font-semibold">{t.name}</span>
      <span className="numeric text-xs opacity-70">{tier} of 4</span>
    </span>
  );
}
