import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "@/lib/db/schema";

/**
 * Creates an in-memory PGlite database with the Drizzle schema applied.
 * Use in test files for real PostgreSQL behavior without Docker.
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

  // Apply schema — create all tables
  await client.exec(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "email" text NOT NULL UNIQUE,
      "email_verified" boolean NOT NULL DEFAULT false,
      "image" text,
      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY,
      "expires_at" timestamp NOT NULL,
      "token" text NOT NULL UNIQUE,
      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL,
      "ip_address" text,
      "user_agent" text,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("user_id");

    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY,
      "account_id" text NOT NULL,
      "provider_id" text NOT NULL,
      "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "access_token" text,
      "refresh_token" text,
      "id_token" text,
      "access_token_expires_at" timestamp,
      "refresh_token_expires_at" timestamp,
      "scope" text,
      "password" text,
      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("user_id");

    CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expires_at" timestamp NOT NULL,
      "created_at" timestamp NOT NULL,
      "updated_at" timestamp NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");
  `);

  return { db, client };
}
