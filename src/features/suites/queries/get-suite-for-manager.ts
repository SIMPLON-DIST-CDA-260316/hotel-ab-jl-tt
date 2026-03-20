import { db } from "@/lib/db";
import { suite, establishment } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export type ManagerSuiteDetail = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  mainImage: string;
  capacity: number;
  area: string | null;
  establishmentId: string;
};

export async function getSuiteForManager(
  suiteId: string,
  managerId: string,
): Promise<ManagerSuiteDetail | null> {
  const [result] = await db
    .select({
      id: suite.id,
      title: suite.title,
      description: suite.description,
      price: suite.price,
      mainImage: suite.mainImage,
      capacity: suite.capacity,
      area: suite.area,
      establishmentId: suite.establishmentId,
    })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(
      and(
        eq(suite.id, suiteId),
        eq(establishment.managerId, managerId),
        isNull(suite.deletedAt),
        isNull(establishment.deletedAt),
      ),
    )
    .limit(1);

  return result ?? null;
}
