import { db } from "@/lib/db";
import { user, establishment } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { ROLES } from "@/config/roles";

export async function getManagers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      establishmentName: establishment.name,
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
        eq(user.role, ROLES.MANAGER),
        isNull(user.deletedAt),
      ),
    );
}
