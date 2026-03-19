import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export async function getEstablishmentsByManager(managerId: string) {
  return db
    .select({ id: establishment.id, name: establishment.name })
    .from(establishment)
    .where(
      and(
        eq(establishment.managerId, managerId),
        isNull(establishment.deletedAt),
      ),
    );
}
