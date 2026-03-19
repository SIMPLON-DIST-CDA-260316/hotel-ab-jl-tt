import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export async function getEstablishmentById(id: string) {
  const [result] = await db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
      address: establishment.address,
      postalCode: establishment.postalCode,
      description: establishment.description,
      image: establishment.image,
      phone: establishment.phone,
      email: establishment.email,
      checkInTime: establishment.checkInTime,
      checkOutTime: establishment.checkOutTime,
    })
    .from(establishment)
    .where(and(eq(establishment.id, id), isNull(establishment.deletedAt)));

  return result ?? null;
}
