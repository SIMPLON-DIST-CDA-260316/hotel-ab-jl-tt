import { db } from "@/lib/db";
import { suite } from "@/lib/db/schema/domain";
import { and, eq, isNull } from "drizzle-orm";

export async function getSuiteById(
  id: string,
): Promise<typeof suite.$inferSelect | null> {
  const [result] = await db
    .select()
    .from(suite)
    .where(and(eq(suite.id, id), isNull(suite.deletedAt)))
    .limit(1);

  return result ?? null;
}
