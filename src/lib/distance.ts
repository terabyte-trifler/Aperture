/**
 * Distance is exposed to clients ONLY as a bucket.
 *
 * A numeric distance from three query points trilaterates to an exact
 * address. This is threat T-19 in the SRS and it is a physical-safety
 * issue, not a privacy nicety. The database RPCs already return buckets;
 * this type exists so nothing downstream can widen it back to a number.
 */
export type DistanceBucket = "under 2 km" | "2–5 km" | "5–10 km" | "10+ km";

export function isDistanceBucket(v: unknown): v is DistanceBucket {
  return (
    v === "under 2 km" || v === "2–5 km" || v === "5–10 km" || v === "10+ km"
  );
}
