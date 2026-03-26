"use server";

import { redirect } from "next/navigation";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { establishment, establishmentAmenity } from "@/lib/db/schema/domain";
import { requireAdmin } from "@/lib/auth-guards";

import { establishmentSchema } from "../lib/establishment-schema";

import type { ActionResult } from "@/types/action.types";

export async function updateEstablishment(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    ...Object.fromEntries(formData),
    amenityIds: formData.getAll("amenityIds"),
  };
  const parsed = establishmentSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const { amenityIds, ...establishmentData } = parsed.data;

    await db
      .update(establishment)
      .set({
        ...establishmentData,
        description: establishmentData.description || null,
        phone: establishmentData.phone || null,
        email: establishmentData.email || null,
      })
      .where(and(eq(establishment.id, id), isNull(establishment.deletedAt)));

    // Replace amenity links: delete existing, insert new selection
    await db
      .delete(establishmentAmenity)
      .where(eq(establishmentAmenity.establishmentId, id));

    if (amenityIds.length > 0) {
      await db.insert(establishmentAmenity).values(
        amenityIds.map((amenityId) => ({ establishmentId: id, amenityId })),
      );
    }
  } catch (error) {
    console.error("Failed to update establishment:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la modification"] },
    };
  }

  // redirect throws internally — must be outside try/catch
  redirect("/admin/establishments");
}
