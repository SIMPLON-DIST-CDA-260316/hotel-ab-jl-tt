import { db } from "@/lib/db";
import { suite, establishment } from "@/lib/db/schema/domain";
import { eq, and, isNull } from "drizzle-orm";

export async function getSuiteWithEstablishment(suiteId: string) {
  const [foundSuite] = await db
    .select({
      id: suite.id,
      title: suite.title,
      price: suite.price,
      capacity: suite.capacity,
      mainImage: suite.mainImage,
      establishment: {
        id: establishment.id,
        name: establishment.name,
        city: establishment.city,
      },
    })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(and(eq(suite.id, suiteId), isNull(suite.deletedAt)));

  return foundSuite ?? null;
}
