import { eq, and, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  booking,
  suite,
  establishment,
  bookingOption,
  option,
} from "@/lib/db/schema/domain";

export async function getBookingDetail(bookingId: string) {
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
      suiteId: booking.suiteId,
      expiresAt: booking.expiresAt,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      suite: {
        title: suite.title,
        mainImage: suite.mainImage,
        capacity: suite.capacity,
        area: suite.area,
      },
      establishment: {
        name: establishment.name,
        city: establishment.city,
        address: establishment.address,
        postalCode: establishment.postalCode,
        checkInTime: establishment.checkInTime,
        checkOutTime: establishment.checkOutTime,
      },
    })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(and(eq(booking.id, bookingId), isNull(establishment.deletedAt)));

  if (!bookingData) return null;

  const bookingOptions = await db
    .select({
      name: option.name,
      icon: option.icon,
      quantity: bookingOption.quantity,
      unitPrice: bookingOption.unitPrice,
    })
    .from(bookingOption)
    .innerJoin(option, eq(bookingOption.optionId, option.id))
    .where(eq(bookingOption.bookingId, bookingId));

  return { ...bookingData, options: bookingOptions };
}

export type BookingDetail = NonNullable<
  Awaited<ReturnType<typeof getBookingDetail>>
>;
