import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema";
import { hashPassword } from "better-auth/crypto";
import { ROLES } from "@/config/roles";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@clairdulune.fr";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Administrateur";

if (!ADMIN_PASSWORD) {
  console.error("[seed] SEED_ADMIN_PASSWORD is required");
  process.exit(1);
}

async function seedAdmin(): Promise<void> {
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[seed] Admin already exists (${ADMIN_EMAIL}), skipping.`);
    return;
  }

  const userId = crypto.randomUUID();
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: ROLES.ADMIN,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(account).values({
      id: crypto.randomUUID(),
      accountId: ADMIN_EMAIL,
      providerId: "credential",
      userId,
      password: await hashPassword(ADMIN_PASSWORD!),
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(`[seed] Admin account created: ${ADMIN_EMAIL}`);
}

seedAdmin()
  .catch((error: unknown) => {
    console.error("[seed] Error:", error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
