import { eq, and, gt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { booking, suite } from "@/lib/db/schema/domain";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

export async function getActivePendingBooking(clientId: string) {
  const [pendingBooking] = await db
    .select({
      id: booking.id,
      reference: booking.reference,
      expiresAt: booking.expiresAt,
      suite: {
        title: suite.title,
      },
    })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .where(
      and(
        eq(booking.clientId, clientId),
        eq(booking.status, BOOKING_STATUSES.PENDING),
        gt(booking.expiresAt, sql`now()`),
      ),
    )
    .limit(1);

  return pendingBooking ?? null;
}
