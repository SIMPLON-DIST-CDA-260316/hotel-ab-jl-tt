import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

export async function getEtablissements() {
  return db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
      address: establishment.address,
      description: establishment.description,
      image: establishment.image,
    })
    .from(establishment)
    .where(isNull(establishment.deletedAt));
}
