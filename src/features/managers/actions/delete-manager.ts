"use server";

import { revalidatePath } from "next/cache";

import { eq, isNull, and } from "drizzle-orm";

import { db } from "@/lib/db";
import { user, session } from "@/lib/db/schema/auth";
import { establishment } from "@/lib/db/schema/domain";
import { requireAdmin } from "@/lib/auth-guards";

type DeleteManagerResult =
  | { success: true; error?: undefined }
  | { success: false; error: string };

export async function deleteManager(
  id: string,
): Promise<DeleteManagerResult> {
  await requireAdmin();

  // Prevent deletion while the manager still owns an active establishment
  const [activeEstablishment] = await db
    .select({ id: establishment.id, name: establishment.name })
    .from(establishment)
    .where(
      and(
        eq(establishment.managerId, id),
        isNull(establishment.deletedAt),
      ),
    )
    .limit(1);

  if (activeEstablishment) {
    return {
      success: false,
      error: `Impossible de supprimer : ce gérant gère encore l'établissement « ${activeEstablishment.name} ». Réassignez-le d'abord.`,
    };
  }

  try {
    const softDeleteResult = await db.transaction(async (tx) => {
      // Soft delete with isNull guard to prevent double-delete
      const result = await tx
        .update(user)
        .set({ deletedAt: new Date() })
        .where(and(eq(user.id, id), isNull(user.deletedAt)));

      // Invalidate all active sessions to prevent further login
      await tx.delete(session).where(eq(session.userId, id));

      return result;
    });

    const isManagerNotFound = softDeleteResult.rowCount === 0;
    if (isManagerNotFound) {
      return {
        success: false,
        error: "Gérant introuvable ou déjà supprimé.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to delete manager:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression.",
    };
  }

  revalidatePath("/admin/managers");
  return { success: true };
}
