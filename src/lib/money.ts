/**
 * Money is always integer minor units (paise) plus a currency code.
 * Never float. Never a bare number. This module is the only place that
 * knows how to render it.
 */

export type Money = { amountMinor: number; currency: string };

const FORMATTERS = new Map<string, Intl.NumberFormat>();

function formatter(currency: string, decimals: boolean) {
  const key = `${currency}:${decimals}`;
  let f = FORMATTERS.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: decimals ? 2 : 0,
    });
    FORMATTERS.set(key, f);
  }
  return f;
}

/** ₹1,200 — drops paise when the amount is whole, which it usually is. */
export function formatMoney(
  amountMinor: number | null | undefined,
  currency = "INR",
): string {
  if (amountMinor == null) return "—";
  const whole = amountMinor % 100 === 0;
  return formatter(currency, !whole).format(amountMinor / 100);
}

/** "₹1,200/day" */
export function formatRate(amountMinor: number | null, currency = "INR") {
  if (amountMinor == null) return "—";
  return `${formatMoney(amountMinor, currency)}/day`;
}

export const toMinor = (major: number) => Math.round(major * 100);
