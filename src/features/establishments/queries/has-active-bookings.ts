import { db } from "@/lib/db";
import { booking, suite } from "@/lib/db/schema";
import { eq, and, gte, ne } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function hasActiveBookings(
  establishmentId: string,
): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .where(
      and(
        eq(suite.establishmentId, establishmentId),
        gte(booking.checkOut, sql`CURRENT_DATE`),
        ne(booking.status, "cancelled"),
      ),
    );

  return (result[0]?.count ?? 0) > 0;
}
