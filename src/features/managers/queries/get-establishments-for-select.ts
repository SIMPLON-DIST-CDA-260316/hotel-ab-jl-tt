import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema/domain";
import { isNull } from "drizzle-orm";

interface EstablishmentSelectOption {
  id: string;
  name: string;
  city: string;
}

export async function getEstablishmentsForSelect(): Promise<EstablishmentSelectOption[]> {
  return db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
    })
    .from(establishment)
    .where(isNull(establishment.deletedAt));
}
