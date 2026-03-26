"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { booking } from "@/lib/db/schema/domain";
import { requireSession } from "@/lib/auth-guards";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

import { CANCELLATION_DELAY_DAYS } from "../lib/booking-constants";

import type { ActionErrors } from "@/types/action.types";

type CancelBookingResult =
  | { success: true }
  | { success: false; errors: ActionErrors };

export async function cancelBooking(
  bookingId: string,
): Promise<CancelBookingResult> {
  const session = await requireSession();

  const [foundBooking] = await db
    .select({
      id: booking.id,
      clientId: booking.clientId,
      status: booking.status,
      checkIn: booking.checkIn,
    })
    .from(booking)
    .where(eq(booking.id, bookingId));

  if (!foundBooking) {
    return { success: false, errors: { _form: ["Réservation introuvable"] } };
  }

  if (foundBooking.clientId !== session.user.id) {
    return {
      success: false,
      errors: {
        _form: ["Vous ne pouvez annuler que vos propres réservations"],
      },
    };
  }

  if (foundBooking.status !== BOOKING_STATUSES.CONFIRMED) {
    return {
      success: false,
      errors: {
        _form: ["Seule une réservation confirmée peut être annulée"],
      },
    };
  }

  const now = new Date();
  const checkInDate = new Date(foundBooking.checkIn);
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilCheckIn <= CANCELLATION_DELAY_DAYS) {
    return {
      success: false,
      errors: {
        _form: [
          `L'annulation n'est possible que ${CANCELLATION_DELAY_DAYS} jours avant la date d'arrivée`,
        ],
      },
    };
  }

  await db
    .update(booking)
    .set({
      status: BOOKING_STATUSES.CANCELLED,
      cancelledAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  revalidatePath("/bookings");

  return { success: true };
}
