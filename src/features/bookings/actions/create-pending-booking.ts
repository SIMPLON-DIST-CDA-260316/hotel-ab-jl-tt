"use server";

import { db } from "@/lib/db";
import { booking, suite } from "@/lib/db/schema/domain";
import { eq, and, sql, isNull } from "drizzle-orm";
import { requireSession } from "@/lib/auth-guards";
import { bookingSchema } from "../lib/booking-schema";
import { generateBookingReference } from "../lib/generate-booking-reference";
import { activeBookingOverlap } from "../lib/availability-filter";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { PENDING_EXPIRY_MINUTES } from "../lib/booking-constants";
import type { BookingActionResult } from "../types/booking.types";

export async function createPendingBooking(
  formData: FormData,
): Promise<BookingActionResult> {
  const session = await requireSession();

  const raw = {
    suiteId: formData.get("suiteId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guestCount: formData.get("guestCount"),
  };

  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { suiteId, checkIn, checkOut, guestCount } = parsed.data;

  // Fetch suite for price snapshot + capacity check
  const [foundSuite] = await db
    .select({ price: suite.price, capacity: suite.capacity })
    .from(suite)
    .where(and(eq(suite.id, suiteId), isNull(suite.deletedAt)));

  if (!foundSuite) {
    return { success: false, errors: { _form: ["Suite introuvable"] } };
  }

  if (guestCount > foundSuite.capacity) {
    return {
      success: false,
      errors: {
        guestCount: [`Capacité maximale : ${foundSuite.capacity} voyageurs`],
      },
    };
  }

  // Cancel any existing pending booking for this user
  await db
    .update(booking)
    .set({
      status: BOOKING_STATUSES.CANCELLED,
      cancelledAt: new Date(),
    })
    .where(
      and(
        eq(booking.clientId, session.user.id),
        eq(booking.status, BOOKING_STATUSES.PENDING),
      ),
    );

  // Re-check availability (race condition protection)
  const [overlap] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .where(activeBookingOverlap(suiteId, checkIn, checkOut));

  if (overlap.count > 0) {
    return {
      success: false,
      errors: {
        _form: ["Cette suite n'est plus disponible sur les dates choisies"],
      },
    };
  }

  const nightCount = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
  const pricePerNight = Number(foundSuite.price);
  const totalPrice = nightCount * pricePerNight;

  const reference = await generateBookingReference();

  const expiresAt = new Date(
    Date.now() + PENDING_EXPIRY_MINUTES * 60 * 1000,
  );

  const [createdBooking] = await db
    .insert(booking)
    .values({
      reference,
      checkIn,
      checkOut,
      guestCount,
      pricePerNight: foundSuite.price,
      totalPrice: totalPrice.toFixed(2),
      status: BOOKING_STATUSES.PENDING,
      clientId: session.user.id,
      suiteId,
      expiresAt,
    })
    .returning({ id: booking.id });

  return {
    success: true,
    bookingId: createdBooking.id,
    bookingReference: reference,
  };
}
