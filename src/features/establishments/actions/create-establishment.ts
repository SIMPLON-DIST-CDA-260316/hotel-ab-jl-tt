"use server";

import { db } from "@/lib/db";
import { establishment, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { establishmentSchema } from "../lib/establishment-schema";

type ActionErrors = Partial<Record<string, string[]>> & { _form?: string[] };

type ActionResult = {
  success: false;
  errors: ActionErrors;
};

export async function createEstablishment(
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

  // TODO: managerId dynamique quand l'auth sera en place
  const [manager] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "manager"))
    .limit(1);

  if (!manager) {
    return {
      success: false,
      errors: { _form: ["Aucun gérant disponible"] },
    };
  }

  try {
    await db.insert(establishment).values({
      ...parsed.data,
      description: parsed.data.description || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      managerId: manager.id,
    });
  } catch (error) {
    console.error("Failed to create establishment:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la création"] },
    };
  }

  redirect("/admin/establishments");
}
