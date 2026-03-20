import { db } from "@/lib/db";
import { suite, establishment } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export type SuiteListItem = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  mainImage: string;
  capacity: number;
};

export async function getSuitesByManager(
  managerId: string,
): Promise<SuiteListItem[]> {
  return db
    .select({
      id: suite.id,
      title: suite.title,
      description: suite.description,
      price: suite.price,
      mainImage: suite.mainImage,
      capacity: suite.capacity,
    })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(
      and(
        eq(establishment.managerId, managerId),
        isNull(suite.deletedAt),
        isNull(establishment.deletedAt),
      ),
    );
}
