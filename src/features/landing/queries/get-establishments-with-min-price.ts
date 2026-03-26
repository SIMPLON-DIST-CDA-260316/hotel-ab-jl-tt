import { db } from "@/lib/db";
import { establishment, suite } from "@/lib/db/schema/domain";
import { eq, isNull, min, count } from "drizzle-orm";

export interface EstablishmentWithMinPrice {
  id: string;
  name: string;
  city: string;
  description: string | null;
  image: string | null;
  minPrice: string | null;
  suiteCount: number;
}

export async function getEstablishmentsWithMinPrice(): Promise<
  EstablishmentWithMinPrice[]
> {
  const rows = await db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
      description: establishment.description,
      image: establishment.image,
      minPrice: min(suite.price),
      suiteCount: count(suite.id),
    })
    .from(establishment)
    .leftJoin(suite, eq(suite.establishmentId, establishment.id))
    .where(isNull(establishment.deletedAt))
    .groupBy(
      establishment.id,
      establishment.name,
      establishment.city,
      establishment.description,
      establishment.image
    )
    .orderBy(establishment.name);

  return rows.map((row) => ({
    ...row,
    suiteCount: Number(row.suiteCount),
  }));
}
