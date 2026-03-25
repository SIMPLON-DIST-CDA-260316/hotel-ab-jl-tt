import { db } from "@/lib/db";
import { booking, suite, establishment } from "@/lib/db/schema/domain";
import { eq } from "drizzle-orm";

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
    .where(eq(booking.id, bookingId));

  return bookingData ?? null;
}
