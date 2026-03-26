"use server";

import { redirect } from "next/navigation";

import { eq, and, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { establishment } from "@/lib/db/schema/domain";
import { requireAdmin } from "@/lib/auth-guards";

import { updateManagerSchema } from "../lib/manager-schema";

import type { ActionResult } from "@/types/action.types";

export async function updateManager(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    establishmentId: formData.get("establishmentId"),
  };

  const parsed = updateManagerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, establishmentId } = parsed.data;

  // Check email uniqueness (excluding current user)
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.email, email), ne(user.id, id)))
    .limit(1);

  if (existingUser) {
    return {
      success: false,
      errors: { email: ["Cette adresse email est déjà utilisée"] },
    };
  }

  const managerName = `${firstName} ${lastName}`;

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({ name: managerName, email })
        .where(eq(user.id, id));

      // Assign to new establishment if provided ("none" = no selection)
      // Does NOT unassign from old — managerId is NOT NULL
      if (establishmentId && establishmentId !== "none") {
        await tx
          .update(establishment)
          .set({ managerId: id })
          .where(eq(establishment.id, establishmentId));
      }
    });
  } catch (error: unknown) {
    console.error("Failed to update manager:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la modification"] },
    };
  }

  redirect("/admin/managers");
}
