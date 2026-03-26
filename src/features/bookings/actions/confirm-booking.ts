"use server";

import { revalidatePath } from "next/cache";

import { eq, and, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { booking } from "@/lib/db/schema/domain";
import { requireSession } from "@/lib/auth-guards";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

import { activeBookingOverlap } from "../lib/availability-filter";

import type { ActionErrors } from "@/types/action.types";

type ConfirmResult =
  | { success: true }
  | { success: false; errors: ActionErrors };

export async function confirmBooking(
  bookingId: string,
): Promise<ConfirmResult> {
  const session = await requireSession();

  const [foundBooking] = await db
    .select({
      id: booking.id,
      clientId: booking.clientId,
      status: booking.status,
      expiresAt: booking.expiresAt,
      suiteId: booking.suiteId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    })
    .from(booking)
    .where(eq(booking.id, bookingId));

  if (!foundBooking) {
    return { success: false, errors: { _form: ["Réservation introuvable"] } };
  }

  if (foundBooking.clientId !== session.user.id) {
    return { success: false, errors: { _form: ["Accès non autorisé"] } };
  }

  if (foundBooking.status !== BOOKING_STATUSES.PENDING) {
    return {
      success: false,
      errors: {
        _form: ["Cette réservation n'est plus en attente de paiement"],
      },
    };
  }

  if (foundBooking.expiresAt && foundBooking.expiresAt < new Date()) {
    return {
      success: false,
      errors: {
        _form: [
          "Le délai de réservation a expiré. Veuillez recommencer.",
        ],
      },
    };
  }

  // Atomic overlap check + confirmation in a transaction
  const result = await db.transaction(async (tx) => {
    // Lock overlapping bookings to prevent concurrent confirmations
    const [overlap] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(booking)
      .where(
        and(
          activeBookingOverlap(
            foundBooking.suiteId,
            foundBooking.checkIn,
            foundBooking.checkOut,
          ),
          sql`${booking.id} != ${bookingId}`,
        ),
      );

    if (overlap.count > 0) {
      await tx
        .update(booking)
        .set({
          status: BOOKING_STATUSES.CANCELLED,
          cancelledAt: new Date(),
        })
        .where(eq(booking.id, bookingId));

      return {
        success: false as const,
        errors: {
          _form: [
            "La suite n'est plus disponible sur ces dates. Votre réservation a été annulée.",
          ],
        },
      };
    }

    await tx
      .update(booking)
      .set({
        status: BOOKING_STATUSES.CONFIRMED,
        expiresAt: null,
      })
      .where(eq(booking.id, bookingId));

    return { success: true as const };
  });

  if (result.success) {
    revalidatePath("/bookings");
  }

  return result;
}
