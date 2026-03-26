"use server";

import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { establishment, establishmentAmenity } from "@/lib/db/schema/domain";
import { requireAdmin } from "@/lib/auth-guards";
import { ROLES } from "@/config/roles";

import { establishmentSchema } from "../lib/establishment-schema";

import type { ActionResult } from "@/types/action.types";

export async function createEstablishment(
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

  // TODO: dynamic managerId once auth is in place
  const [manager] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, ROLES.MANAGER))
    .limit(1);

  if (!manager) {
    return {
      success: false,
      errors: { _form: ["Aucun gérant disponible"] },
    };
  }

  try {
    const { amenityIds, ...establishmentData } = parsed.data;

    const [created] = await db
      .insert(establishment)
      .values({
        ...establishmentData,
        description: establishmentData.description || null,
        phone: establishmentData.phone || null,
        email: establishmentData.email || null,
        managerId: manager.id,
      })
      .returning({ id: establishment.id });

    if (amenityIds.length > 0) {
      await db.insert(establishmentAmenity).values(
        amenityIds.map((amenityId) => ({
          establishmentId: created.id,
          amenityId,
        })),
      );
    }
  } catch (error) {
    console.error("Failed to create establishment:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la création"] },
    };
  }

  redirect("/admin/establishments");
}
