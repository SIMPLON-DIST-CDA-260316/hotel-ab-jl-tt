import { db } from "@/lib/db";
import { suite } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export type SuiteListItem = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  mainImage: string;
  capacity: number;
};

export async function getSuitesByEstablishment(
  establishmentId: string,
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
    .where(
      and(
        eq(suite.establishmentId, establishmentId),
        isNull(suite.deletedAt),
      ),
    );
}
