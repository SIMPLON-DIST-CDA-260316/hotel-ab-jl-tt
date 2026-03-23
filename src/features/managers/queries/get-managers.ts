import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { establishment } from "@/lib/db/schema/domain";
import { eq, isNull, and } from "drizzle-orm";
import { ROLES } from "@/config/roles";

interface ManagerRow {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  establishmentName: string | null;
  establishmentId: string | null;
}

interface ManagerListItem {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  establishments: Array<{ id: string; name: string }>;
}

export async function getManagers(): Promise<ManagerListItem[]> {
  const rows: ManagerRow[] = await db
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

  const managersById = new Map<string, ManagerListItem>();

  for (const row of rows) {
    const existing = managersById.get(row.id);

    if (existing) {
      if (row.establishmentId && row.establishmentName) {
        existing.establishments.push({
          id: row.establishmentId,
          name: row.establishmentName,
        });
      }
    } else {
      const establishments: ManagerListItem["establishments"] = [];
      if (row.establishmentId && row.establishmentName) {
        establishments.push({
          id: row.establishmentId,
          name: row.establishmentName,
        });
      }

      managersById.set(row.id, {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.createdAt,
        establishments,
      });
    }
  }

  return Array.from(managersById.values());
}
