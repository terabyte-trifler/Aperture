#!/usr/bin/env node
/**
 * Fails the build if any table in `public` lacks an RLS enable statement,
 * or if any policy uses `USING (true)` outside the catalogue allowlist.
 *
 * A table shipped with RLS disabled is silently world-readable through
 * PostgREST. That is the failure mode this exists to prevent — it is
 * quiet, it looks fine in development, and it leaks everything.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "supabase/migrations";
const PUBLIC_READ_OK = new Set([
  "skills", "gear_categories", "gear_brands", "gear_models",
  "gear_model_attributes", "gear_adapters", "reserved_usernames",
  "exposure_limits", "deposit_rules",
  // A creator's skills and roles are public by design — they are what
  // discovery filters on. Nothing sensitive lives in these tables.
  "creator_skills", "creator_roles",
]);

const sql = readdirSync(DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(DIR, f), "utf8"))
  .join("\n");

const created = new Set();
for (const m of sql.matchAll(/create table (?:if not exists )?public\.(\w+)/gi)) {
  created.add(m[1]);
}

// Enabled explicitly, or via the bulk loop over pg_tables.
const bulkEnable = /for\s+t\s+in[\s\S]{0,200}?pg_tables[\s\S]{0,300}?enable row level security/i.test(sql);
const enabled = new Set(
  [...sql.matchAll(/alter table public\.(\w+)\s+enable row level security/gi)]
    .map((m) => m[1]),
);

const missing = bulkEnable ? [] : [...created].filter((t) => !enabled.has(t));

const permissive = [...sql.matchAll(
  /create policy (\w+) on public\.(\w+)((?:(?!create policy)[\s\S]){0,300}?)using \(\s*true\s*\)/gi,
)]
  .filter((m) => !PUBLIC_READ_OK.has(m[2]))
  .map((m) => `${m[2]}.${m[1]}`);

let bad = false;

if (missing.length) {
  console.error("✗ RLS not enabled on:", missing.join(", "));
  bad = true;
}
if (permissive.length) {
  console.error("✗ USING (true) outside catalogue allowlist:", permissive.join(", "));
  bad = true;
}

if (bad) process.exit(1);
console.log(`✓ RLS: ${created.size} tables, ${bulkEnable ? "bulk-enabled" : enabled.size + " enabled"}, no unsafe permissive policies`);
