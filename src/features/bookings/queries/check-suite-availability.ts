import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { booking, suite } from "@/lib/db/schema/domain";

import { MILLISECONDS_PER_DAY } from "@/lib/formatters";

import { activeBookingOverlap } from "../lib/availability-filter";

import type { AvailabilityResult } from "@/types/availability.types";

export async function checkSuiteAvailability(
  suiteId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<AvailabilityResult | null> {
  const [foundSuite] = await db
    .select({ price: suite.price })
    .from(suite)
    .where(and(eq(suite.id, suiteId), isNull(suite.deletedAt)));

  if (!foundSuite) return null;

  const [overlap] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .where(activeBookingOverlap(suiteId, checkIn, checkOut));

  const nightCount = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / MILLISECONDS_PER_DAY,
  );
  const pricePerNight = Number(foundSuite.price);
  const totalPrice = nightCount * pricePerNight;
  const isAvailable = overlap.count === 0;

  return {
    available: isAvailable,
    nightCount,
    pricePerNight,
    totalPrice,
  };
}
