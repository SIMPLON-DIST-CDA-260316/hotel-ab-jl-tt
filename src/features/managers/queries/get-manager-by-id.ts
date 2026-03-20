import { db } from "@/lib/db";
import { user, establishment } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { ROLES } from "@/config/roles";

export async function getManagerById(id: string) {
  const [manager] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      establishmentId: establishment.id,
    })
    .from(user)
    .leftJoin(
      establishment,
      and(
        eq(establishment.managerId, user.id),
        isNull(establishment.deletedAt),
      ),
    )
    .where(
      and(
        eq(user.id, id),
        eq(user.role, ROLES.MANAGER),
        isNull(user.deletedAt),
      ),
    )
    .limit(1);

  return manager ?? null;
}
