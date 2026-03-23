import { db } from "@/lib/db";
import { booking } from "@/lib/db/schema/domain";
import { eq, and, gte, ne } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function hasFutureBookingsForSuite(
  suiteId: string,
): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .where(
      and(
        eq(booking.suiteId, suiteId),
        gte(booking.checkOut, sql`CURRENT_DATE`),
        ne(booking.status, "cancelled"),
      ),
    );

  return (result[0]?.count ?? 0) > 0;
}
