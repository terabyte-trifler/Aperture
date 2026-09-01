/**
 * PLACEHOLDER. Replace with generated types:
 *   npm run db:types
 *
 * Committed so the project typechecks before Supabase is running
 * locally. The row shapes are deliberately permissive: supabase-js
 * resolves `.from(table)` through this map, and a narrow index
 * signature here collapses every query result to `never`, which is
 * worse than no typing at all. Generated types replace this wholesale.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

/**
 * Untyped until `npm run db:types` runs against a live database.
 *
 * A structural placeholder does not work here: supabase-js resolves a
 * `.select("col")` string against the row's known keys, and an index
 * signature has none, so every result collapses to `never` and the
 * build fails. `any` keeps the call sites compiling until the real
 * 79-table definition is generated.
 */
export type Database = any;
