#!/usr/bin/env node
/**
 * Fails the build if the service-role key can reach a client bundle,
 * or if banned APIs appear anywhere in src/.
 *
 * Threat T-1 (service-role leakage) is the single highest-severity
 * vulnerability in the system. Discipline does not scale; a grep does.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ALLOW_SERVICE_ROLE = [
  "src/lib/supabase/admin.ts",
  "supabase/functions",
  "scripts/check-secrets.mjs",
];

const BANNED = [
  { re: /NEXT_PUBLIC_[A-Z_]*SERVICE/, msg: "service-role key exposed via NEXT_PUBLIC_" },
  { re: /dangerouslySetInnerHTML/, msg: "dangerouslySetInnerHTML (threat T-8, stored XSS)" },
  { re: /\blocalStorage\.setItem\(\s*['"](?:token|jwt|session)/i, msg: "auth material in localStorage" },
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === ".next" || e === ".git") continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e)) out.push(p);
  }
  return out;
}

const problems = [];

const SELF = "scripts/check-secrets.mjs";

for (const file of walk("src").concat(walk("scripts"))) {
  const rel = relative(process.cwd(), file);
  if (rel === SELF) continue; // this file necessarily contains the patterns
  const text = readFileSync(file, "utf8");

  if (/SERVICE_ROLE/.test(text) && !ALLOW_SERVICE_ROLE.some((a) => rel.startsWith(a))) {
    problems.push(`${rel}: references SERVICE_ROLE outside the allowlist`);
  }

  for (const { re, msg } of BANNED) {
    if (re.test(text)) problems.push(`${rel}: ${msg}`);
  }

  // A module that builds an admin client must be server-only.
  if (/createAdminClient|SUPABASE_SERVICE_ROLE_KEY/.test(text) &&
      !/^import ["']server-only["']/m.test(text) &&
      !rel.startsWith("scripts/")) {
    problems.push(`${rel}: uses the admin client without \`import "server-only"\``);
  }
}

if (problems.length) {
  console.error("✗ Secret / safety check failed:");
  problems.forEach((p) => console.error("   " + p));
  process.exit(1);
}
console.log("✓ Secrets: service-role confined, no banned APIs");
