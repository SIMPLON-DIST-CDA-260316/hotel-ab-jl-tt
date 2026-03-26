"use server";

import { revalidatePath } from "next/cache";

import { eq, and, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema/domain";
import { requireAdmin } from "@/lib/auth-guards";

import { hasActiveBookings } from "../queries/has-active-bookings";

type DeleteEstablishmentResult =
  | { success: true; error?: undefined }
  | { success: false; error: string };

export async function deleteEstablishment(
  id: string,
): Promise<DeleteEstablishmentResult> {
  await requireAdmin();

  const hasBookings = await hasActiveBookings(id);

  if (hasBookings) {
    return {
      success: false as const,
      error:
        "Impossible de supprimer : des réservations futures existent pour cet établissement.",
    };
  }

  const softDeleteResult = await db
    .update(establishment)
    .set({ deletedAt: new Date() })
    .where(and(eq(establishment.id, id), isNull(establishment.deletedAt)));

  const isEstablishmentNotFound = softDeleteResult.rowCount === 0;
  if (isEstablishmentNotFound) {
    return {
      success: false as const,
      error: "Établissement introuvable ou déjà supprimé.",
    };
  }

  revalidatePath("/admin/establishments");
  return { success: true as const };
}
