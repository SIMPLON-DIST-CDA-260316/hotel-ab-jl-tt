"use server";

import { db } from "@/lib/db";
import { suite, establishment } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireManager } from "@/features/auth/lib/auth-guards";
import { hasFutureBookingsForSuite } from "../queries/has-future-bookings-for-suite";

type DeleteSuiteResult =
  | { success: true; error?: undefined }
  | { success: false; error: string };

export async function deleteSuite(id: string): Promise<DeleteSuiteResult> {
  const session = await requireManager();

  const [owned] = await db
    .select({ id: suite.id })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(
      and(
        eq(suite.id, id),
        eq(establishment.managerId, session.user.id),
        isNull(suite.deletedAt),
        isNull(establishment.deletedAt),
      ),
    )
    .limit(1);

  if (!owned) {
    return {
      success: false as const,
      error: "Suite introuvable ou accès non autorisé.",
    };
  }

  const hasBookings = await hasFutureBookingsForSuite(id);

  if (hasBookings) {
    return {
      success: false as const,
      error:
        "Impossible de supprimer : des réservations futures existent pour cette suite.",
    };
  }

  await db
    .update(suite)
    .set({ deletedAt: new Date() })
    .where(and(eq(suite.id, id), isNull(suite.deletedAt)));

  revalidatePath("/manager/suites");
  return { success: true as const };
}
