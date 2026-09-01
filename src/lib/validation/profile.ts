import { z } from "zod";

/**
 * Server-side validation. Every Server Action parses through these before
 * touching the database. Client-side validation is a convenience; this is
 * the actual boundary.
 *
 * Note what is absent: no field here can set verification_tier,
 * credibility_*, role, or any money column. Those are server-derived and
 * are additionally blocked by column grants and a trigger.
 */

export const RESERVED_HINT =
  "Usernames are 3–30 characters: lowercase letters, numbers, hyphens and underscores.";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, RESERVED_HINT)
  .max(30, RESERVED_HINT)
  .regex(/^[a-z0-9][a-z0-9_-]{2,29}$/, RESERVED_HINT);

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine(
    (v) => /^(\+91)?[6-9]\d{9}$/.test(v),
    "Enter a 10-digit Indian mobile number",
  )
  .transform((v) => (v.startsWith("+91") ? v : `+91${v}`));

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

/** Controlled vocabulary. Free text here would break discovery. */
export const CREATOR_ROLES = [
  "photographer",
  "videographer",
  "filmmaker",
  "editor",
  "colourist",
  "sound",
  "drone-pilot",
  "producer",
  "student",
] as const;

export const roleSchema = z.enum(CREATOR_ROLES);

export const onboardingIntentSchema = z.object({
  primaryRole: roleSchema,
  wantsToRent: z.boolean().default(false),
  wantsToList: z.boolean().default(false),
});

export const onboardingLocationSchema = z.object({
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60).optional(),
  serviceRadiusKm: z.coerce.number().int().min(1).max(200).default(25),
});

export const onboardingSkillsSchema = z.object({
  skillIds: z
    .array(z.string().uuid())
    .min(1, "Pick at least one skill")
    .max(5, "Pick up to five — you can add more later"),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Add your name").max(80),
  headline: z
    .string()
    .trim()
    .max(90, "Keep the headline under 90 characters")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(1200).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  languages: z.array(z.string().trim().min(2).max(40)).max(6).default([]),
  isAvailable: z.boolean().default(true),
  availabilityNote: z.string().trim().max(140).optional().or(z.literal("")),
  dayRateMinor: z.coerce
    .number()
    .int()
    .min(0)
    .max(100_000_00, "That looks too high — enter your day rate in rupees")
    .nullable()
    .optional(),
  showRate: z.boolean().default(false),
});

export const usernameChangeSchema = z.object({ username: usernameSchema });

export const privacySchema = z.object({
  visProfile: z.enum(["public", "authenticated", "connections", "private"]),
  visPortfolio: z.enum(["public", "authenticated", "connections", "private"]),
  visRentalHistory: z.enum([
    "public",
    "authenticated",
    "connections",
    "private",
  ]),
  discoverableOnRadar: z.boolean(),
  allowMessagesFrom: z.enum(["anyone", "verified", "connections"]),
  /** 1km / 3km / 10km / city-only. Never finer than 1km. */
  locationRadiusM: z.union([
    z.literal(1000),
    z.literal(3000),
    z.literal(10000),
    z.literal(50000),
  ]),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type PrivacyInput = z.infer<typeof privacySchema>;
