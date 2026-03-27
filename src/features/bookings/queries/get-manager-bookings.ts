import { eq, desc, and, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { booking, suite, establishment } from "@/lib/db/schema/domain";
import { user } from "@/lib/db/schema/auth";

export async function getManagerBookings(managerId: string) {
  return db
    .select({
      id: booking.id,
      reference: booking.reference,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestCount: booking.guestCount,
      totalPrice: booking.totalPrice,
      status: booking.status,
      expiresAt: booking.expiresAt,
      createdAt: booking.createdAt,
      client: {
        name: user.name,
        email: user.email,
      },
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
    .innerJoin(user, eq(booking.clientId, user.id))
    .where(
      and(eq(establishment.managerId, managerId), isNull(establishment.deletedAt)),
    )
    .orderBy(desc(booking.checkIn));
}

export type ManagerBooking = Awaited<
  ReturnType<typeof getManagerBookings>
>[number];
