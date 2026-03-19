import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/lib/db/schema";

/**
 * Creates an in-memory PGlite database with the full Drizzle schema applied
 * from the migration file. Single source of truth — no manual SQL to maintain.
 *
 * @example
 * ```ts
 * import { createTestDb } from "@/test/db";
 *
 * let db: Awaited<ReturnType<typeof createTestDb>>["db"];
 * let client: Awaited<ReturnType<typeof createTestDb>>["client"];
 *
 * beforeEach(async () => {
 *   ({ db, client } = await createTestDb());
 * });
 *
 * afterEach(async () => {
 *   await client.close();
 * });
 * ```
 */
export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle({ client, schema });

  const migrationPath = resolve(
    import.meta.dirname,
    "../../drizzle/0000_orange_justice.sql",
  );
  const migrationSql = readFileSync(migrationPath, "utf-8");

  // Strip Drizzle-kit statement breakpoints and execute
  const cleanSql = migrationSql.replaceAll("--> statement-breakpoint", "");
  await client.exec(cleanSql);

  return { db, client };
}
