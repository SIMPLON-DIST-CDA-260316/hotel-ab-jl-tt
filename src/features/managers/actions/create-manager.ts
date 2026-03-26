"use server";

import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema/auth";
import { establishment } from "@/lib/db/schema/domain";
import { requireAdmin } from "@/lib/auth-guards";
import { ROLES } from "@/config/roles";

import { createManagerSchema } from "../lib/manager-schema";

import type { ActionResult } from "@/types/action.types";

export async function createManager(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    establishmentId: formData.get("establishmentId"),
  };

  const parsed = createManagerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, password, establishmentId } = parsed.data;

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    return {
      success: false,
      errors: { email: ["Cette adresse email est déjà utilisée"] },
    };
  }

  const userId = crypto.randomUUID();
  const now = new Date();
  const managerName = `${firstName} ${lastName}`;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: userId,
        name: managerName,
        email,
        emailVerified: true,
        role: ROLES.MANAGER,
        createdAt: now,
        updatedAt: now,
      });

      await tx.insert(account).values({
        id: crypto.randomUUID(),
        accountId: email,
        providerId: "credential",
        userId,
        password: await hashPassword(password),
        createdAt: now,
        updatedAt: now,
      });

      await tx
        .update(establishment)
        .set({ managerId: userId })
        .where(eq(establishment.id, establishmentId));
    });
  } catch (error: unknown) {
    console.error("Failed to create manager:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la création"] },
    };
  }

  redirect("/admin/managers");
}
