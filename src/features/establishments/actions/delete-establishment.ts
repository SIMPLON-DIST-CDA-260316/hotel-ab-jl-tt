"use server";

import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hasActiveBookings } from "../queries/has-active-bookings";

type DeleteEstablishmentResult =
  | { success: true; error?: undefined }
  | { success: false; error: string };

export async function deleteEstablishment(
  id: string,
): Promise<DeleteEstablishmentResult> {
  // TODO: vérifier rôle admin (auth #10)

  const hasBookings = await hasActiveBookings(id);

  if (hasBookings) {
    return {
      success: false as const,
      error:
        "Impossible de supprimer : des réservations futures existent pour cet établissement.",
    };
  }

  const result = await db
    .update(establishment)
    .set({ deletedAt: new Date() })
    .where(and(eq(establishment.id, id), isNull(establishment.deletedAt)));

  if (result.rowCount === 0) {
    return {
      success: false as const,
      error: "Établissement introuvable ou déjà supprimé.",
    };
  }

  revalidatePath("/admin/establishments");
  return { success: true as const };
}
