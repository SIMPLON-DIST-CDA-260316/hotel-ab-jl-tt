import { eq, and, gte, ne, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { booking, suite } from "@/lib/db/schema/domain";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

export async function hasActiveBookings(
  establishmentId: string,
): Promise<boolean> {
  const activeBookingCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .where(
      and(
        eq(suite.establishmentId, establishmentId),
        gte(booking.checkOut, sql`CURRENT_DATE`),
        ne(booking.status, BOOKING_STATUSES.CANCELLED),
      ),
    );

  const hasAtLeastOne = (activeBookingCount[0]?.count ?? 0) > 0;
  return hasAtLeastOne;
}
