import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { establishment } from "@/lib/db/schema/domain";
import { eq, isNull } from "drizzle-orm";

export interface EstablishmentSelectOption {
  id: string;
  name: string;
  city: string;
  currentManagerId: string;
  currentManagerName: string | null;
}

export async function getEstablishmentsForSelect(): Promise<EstablishmentSelectOption[]> {
  return db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
      currentManagerId: establishment.managerId,
      currentManagerName: user.name,
    })
    .from(establishment)
    .leftJoin(user, eq(establishment.managerId, user.id))
    .where(isNull(establishment.deletedAt));
}
