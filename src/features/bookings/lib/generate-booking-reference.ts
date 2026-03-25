import { db } from "@/lib/db";
import { booking } from "@/lib/db/schema/domain";
import { sql } from "drizzle-orm";

const REFERENCE_PREFIX = "CDL";
const REFERENCE_NUMBER_LENGTH = 4;
const MAX_REFERENCE_RETRIES = 3;

export async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${REFERENCE_PREFIX}-${year}-`;

  for (let attempt = 0; attempt < MAX_REFERENCE_RETRIES; attempt++) {
    const [lastBooking] = await db
      .select({
        lastRef: sql<string>`max(${booking.reference})`,
      })
      .from(booking)
      .where(sql`${booking.reference} LIKE ${prefix + "%"}`);

    const lastNumber = lastBooking?.lastRef
      ? parseInt(lastBooking.lastRef.replace(prefix, ""), 10)
      : 0;

    const nextNumber = String(lastNumber + 1 + attempt).padStart(
      REFERENCE_NUMBER_LENGTH,
      "0",
    );
    const candidate = `${prefix}${nextNumber}`;

    try {
      // Validate uniqueness via a conditional insert guard
      const [existing] = await db
        .select({ reference: booking.reference })
        .from(booking)
        .where(sql`${booking.reference} = ${candidate}`);

      if (!existing) {
        return candidate;
      }
      // Collision — retry with incremented number
    } catch {
      // DB error — retry
    }
  }

  throw new Error("Failed to generate unique booking reference after retries");
}
