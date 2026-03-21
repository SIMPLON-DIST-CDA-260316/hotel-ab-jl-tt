/**
 * Admin bootstrap — creates the initial admin account from environment variables.
 *
 * Idempotent: skips silently if an account with the same email already exists.
 * Safe to run in any environment, including production (no test data inserted).
 *
 * Required env vars: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME
 * Password is hashed via Better Auth's own implementation (better-auth/crypto)
 * to ensure compatibility with the auth layer.
 */
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema/auth";

export async function seedAdmin(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Administrateur";

  if (!adminEmail || !adminPassword) {
    console.error("[seed-admin] SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required.");
    process.exit(1);
  }

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, adminEmail))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[seed-admin] Admin already exists (${adminEmail}), skipping.`);
    return;
  }

  const userId = crypto.randomUUID();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: adminName,
      email: adminEmail,
      emailVerified: true,
      role: "admin",
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(account).values({
      id: crypto.randomUUID(),
      accountId: adminEmail,
      providerId: "credential",
      userId,
      password: await hashPassword(adminPassword),
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(`[seed-admin] Admin account created: ${adminEmail}`);
}

if (import.meta.main) {
  seedAdmin()
    .catch((error: unknown) => {
      console.error("[seed-admin] Failed:", error);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}
