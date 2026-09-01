/* eslint-disable no-restricted-properties */

/**
 * The one place public environment variables are read.
 *
 * `no-restricted-properties` bans `process.env` everywhere else so that the
 * service-role key cannot be reached by accident from a component; it lives in
 * src/lib/supabase/admin.ts alone and is deliberately absent from this module.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so each one has to be
 * referenced by its full literal name — destructuring `process.env` does not
 * work.
 *
 * The Supabase values are exposed as FUNCTIONS, not constants, and that is
 * load-bearing. Every page inherits the root layout, the root layout imports
 * this module, and a constant that throws on a missing key would therefore
 * throw while Next collects page data — failing the whole build on a host that
 * has not been given Supabase credentials yet. Next reports that as a bare
 * `Cannot find module for page`, which points nowhere near the real cause.
 *
 * The public site reads from src/lib/content/catalogue.ts and never touches
 * Supabase, so it must build without these. Deferring the check to the moment
 * a client is actually constructed keeps the failure where it belongs: on the
 * request that genuinely needs a database.
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

/** Throws only when a Supabase client is actually built. */
export function supabaseUrl(): string {
  return required(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  );
}

/** Throws only when a Supabase client is actually built. */
export function supabaseAnonKey(): string {
  return required(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

/** Safe at module load: both of these have defaults. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const LAUNCH_CITY = process.env.NEXT_PUBLIC_LAUNCH_CITY ?? "Pune";
