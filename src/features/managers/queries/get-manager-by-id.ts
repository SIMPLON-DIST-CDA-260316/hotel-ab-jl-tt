import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { establishment } from "@/lib/db/schema/domain";
import { eq, and, isNull } from "drizzle-orm";
import { ROLES } from "@/config/roles";

interface ManagerDetail {
  id: string;
  name: string;
  email: string;
  establishmentId: string | null;
}

export async function getManagerById(id: string): Promise<ManagerDetail | null> {
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
