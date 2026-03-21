import { scryptSync, randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema/auth";

// Must match Better Auth's internal hash format: hex(salt):hex(key)
// Parameters: N=16384, r=16, p=1, keylen=64  (see better-auth/src/utils/hash.ts)
function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, { N: 16384, r: 16, p: 1, maxmem: 64 * 1024 * 1024 });
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function seedAdmin(): Promise<void> {
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
      password: hashPassword(adminPassword),
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(`[seed-admin] Admin account created: ${adminEmail}`);
}

seedAdmin()
  .catch((error: unknown) => {
    console.error("[seed-admin] Failed:", error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
