import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * SERVICE ROLE CLIENT — RLS IS BYPASSED ENTIRELY.
 *
 * Every caller must have independently verified the actor's identity and
 * authorisation before reaching this. RLS is not protecting you here; that
 * is the whole point of the service role, and the whole risk.
 *
 * Permitted callers:
 *   - Signature-verified provider webhooks
 *   - Cron / Edge Functions
 *   - Admin route handlers that have already checked `is_staff()` server-side
 *
 * Never: a Server Component, a Server Action reachable by a normal user,
 * or anything imported into a client bundle.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
