"use server";

import { db } from "@/lib/db";
import {
  booking,
  bookingOption,
  suite,
  establishmentOption,
  option,
} from "@/lib/db/schema/domain";
import { eq, and, sql, isNull } from "drizzle-orm";
import { requireSession } from "@/lib/auth-guards";
import { bookingSchema } from "../lib/booking-schema";
import { generateBookingReference } from "../lib/generate-booking-reference";
import { activeBookingOverlap } from "../lib/availability-filter";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { PENDING_EXPIRY_MINUTES } from "../lib/booking-constants";
import type { BookingActionResult } from "../types/booking.types";

type SelectedOption = {
  optionId: string;
  quantity: number;
};

function computeOptionQuantity(
  pricingModel: string,
  nightCount: number,
  guestCount: number,
  userQuantity: number,
): number {
  switch (pricingModel) {
  case "per_person_per_night":
    return guestCount * nightCount;
  case "per_person_per_stay":
    return guestCount;
  case "per_night":
    return nightCount;
  case "per_stay":
    return 1;
  case "per_unit":
    return userQuantity;
  default:
    return userQuantity;
  }
}

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

  // Parse selected options
  const optionsRaw = formData.get("options");
  let selectedOptions: SelectedOption[] = [];
  if (typeof optionsRaw === "string" && optionsRaw.length > 0) {
    try {
      selectedOptions = JSON.parse(optionsRaw);
    } catch {
      // Ignore malformed options — proceed without them
    }
  }

  // Fetch suite for price snapshot + capacity check
  const [foundSuite] = await db
    .select({
      price: suite.price,
      capacity: suite.capacity,
      establishmentId: suite.establishmentId,
    })
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
  const accommodationTotal = nightCount * pricePerNight;

  // Fetch establishment option prices for validation (server-side truth)
  const establishmentOptions =
    selectedOptions.length > 0
      ? await db
        .select({
          optionId: establishmentOption.optionId,
          price: establishmentOption.price,
          included: establishmentOption.included,
        })
        .from(establishmentOption)
        .where(
          eq(
            establishmentOption.establishmentId,
            foundSuite.establishmentId,
          ),
        )
      : [];

  const optionPriceMap = new Map(
    establishmentOptions.map((establishmentOpt) => [
      establishmentOpt.optionId,
      establishmentOpt,
    ]),
  );

  // Also need pricing models for quantity calculation
  const optionModels =
    selectedOptions.length > 0
      ? await db
        .select({ id: option.id, pricingModel: option.pricingModel })
        .from(option)
      : [];

  const optionModelMap = new Map(
    optionModels.map((optionModel) => [optionModel.id, optionModel]),
  );

  // Calculate options total and prepare booking_option rows
  let optionsTotal = 0;
  const bookingOptionRows: {
    bookingId: string;
    optionId: string;
    quantity: number;
    unitPrice: string;
  }[] = [];

  for (const selectedOption of selectedOptions) {
    const estOption = optionPriceMap.get(selectedOption.optionId);
    if (!estOption) continue; // Skip unknown options

    const model = optionModelMap.get(selectedOption.optionId);
    const pricingModel = model?.pricingModel ?? "per_unit";

    const unitPrice = estOption.included ? "0.00" : estOption.price;
    const effectiveQuantity = computeOptionQuantity(
      pricingModel,
      nightCount,
      guestCount,
      selectedOption.quantity,
    );

    optionsTotal += effectiveQuantity * Number(unitPrice);

    // Placeholder bookingId — will be set after insert
    bookingOptionRows.push({
      bookingId: "", // Set below
      optionId: selectedOption.optionId,
      quantity: effectiveQuantity,
      unitPrice,
    });
  }

  const totalPrice = accommodationTotal + optionsTotal;
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

  // Insert booking options
  if (bookingOptionRows.length > 0) {
    await db.insert(bookingOption).values(
      bookingOptionRows.map((row) => ({
        ...row,
        bookingId: createdBooking.id,
      })),
    );
  }

  return {
    success: true,
    bookingId: createdBooking.id,
    bookingReference: reference,
  };
}
