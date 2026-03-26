import { db } from "@/lib/db";
import { booking, suite, establishment } from "@/lib/db/schema/domain";
import { eq, and, isNull } from "drizzle-orm";

export async function getBookingForCheckout(bookingId: string) {
  const [bookingData] = await db
    .select({
      id: booking.id,
      reference: booking.reference,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestCount: booking.guestCount,
      pricePerNight: booking.pricePerNight,
      totalPrice: booking.totalPrice,
      status: booking.status,
      clientId: booking.clientId,
      expiresAt: booking.expiresAt,
      suite: {
        title: suite.title,
      },
      establishment: {
        name: establishment.name,
      },
    })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(and(eq(booking.id, bookingId), isNull(establishment.deletedAt)));

  return bookingData ?? null;
}
