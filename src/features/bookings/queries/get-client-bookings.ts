import { eq, desc, and, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { booking, suite, establishment } from "@/lib/db/schema/domain";

export async function getClientBookings(clientId: string) {
  return db
    .select({
      id: booking.id,
      reference: booking.reference,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestCount: booking.guestCount,
      pricePerNight: booking.pricePerNight,
      totalPrice: booking.totalPrice,
      status: booking.status,
      suiteId: booking.suiteId,
      expiresAt: booking.expiresAt,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      suite: {
        title: suite.title,
        mainImage: suite.mainImage,
      },
      establishment: {
        name: establishment.name,
        city: establishment.city,
      },
    })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(and(eq(booking.clientId, clientId), isNull(establishment.deletedAt)))
    .orderBy(desc(booking.checkIn));
}

export type ClientBooking = Awaited<
  ReturnType<typeof getClientBookings>
>[number];
