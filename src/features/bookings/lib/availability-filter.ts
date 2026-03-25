import { and, eq, ne, lt, gt, sql, not, isNotNull } from "drizzle-orm";
import { booking } from "@/lib/db/schema/domain";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

/**
 * Returns a SQL condition matching bookings that actively block a suite
 * for the given date range. Excludes cancelled bookings and expired pendings.
 */
export function activeBookingOverlap(
  suiteId: string,
  checkIn: Date,
  checkOut: Date,
) {
  return and(
    eq(booking.suiteId, suiteId),
    ne(booking.status, BOOKING_STATUSES.CANCELLED),
    not(
      and(
        eq(booking.status, BOOKING_STATUSES.PENDING),
        isNotNull(booking.expiresAt),
        lt(booking.expiresAt, sql`now()`),
      )!,
    ),
    lt(booking.checkIn, checkOut),
    gt(booking.checkOut, checkIn),
  );
}
