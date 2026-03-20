import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

export async function getEstablishmentsForSelect() {
  return db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
    })
    .from(establishment)
    .where(isNull(establishment.deletedAt));
}
