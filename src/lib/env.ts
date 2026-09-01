/* eslint-disable no-restricted-properties */

/**
 * The one place public environment variables are read.
 *
 * `no-restricted-properties` bans `process.env` everywhere else so that
 * the service-role key cannot be reached by accident from a component;
 * it lives in src/lib/supabase/admin.ts alone and is deliberately absent
 * from this module.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so each one has to be
 * referenced by its full literal name — destructuring `process.env` does
 * not work.
 */

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);

export const SUPABASE_ANON_KEY = required(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const LAUNCH_CITY = process.env.NEXT_PUBLIC_LAUNCH_CITY ?? "Pune";
