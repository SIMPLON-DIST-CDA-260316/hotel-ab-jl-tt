"use server";

import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { establishmentSchema } from "../lib/establishment-schema";
import type { ActionResult } from "../types/action.types";

export async function updateEstablishment(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  // TODO: vérifier rôle admin (auth #10)

  const raw = Object.fromEntries(formData);
  const parsed = establishmentSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await db
      .update(establishment)
      .set({
        ...parsed.data,
        description: parsed.data.description || null,
        phone: parsed.data.phone || null,
        email: parsed.data.email || null,
      })
      .where(and(eq(establishment.id, id), isNull(establishment.deletedAt)));
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
