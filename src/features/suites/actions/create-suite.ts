"use server";

import { db } from "@/lib/db";
import { suite, image, establishment } from "@/lib/db/schema/domain";
import { eq, and, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireManager } from "@/lib/auth-guards";
import { suiteSchema } from "../lib/suite-schema";
import type { ActionError } from "../types/action.types";
import {
  saveUploadedFile,
  validateImageFile,
} from "../lib/image-upload";

async function insertSuiteWithGallery(
  data: {
    title: string;
    description?: string;
    price: string;
    capacity: string;
    area?: string;
  },
  establishmentId: string,
  mainImageUrl: string,
  galleryFiles: File[],
): Promise<void> {
  const suiteId = crypto.randomUUID();

  await db.insert(suite).values({
    id: suiteId,
    title: data.title,
    description: data.description || null,
    price: data.price.replace(",", "."),
    mainImage: mainImageUrl,
    capacity: Number(data.capacity),
    area: data.area ? data.area.replace(",", ".") : null,
    establishmentId,
  });

  if (galleryFiles.length > 0) {
    const galleryInserts = await Promise.all(
      galleryFiles.map(async (file, index) => {
        const url = await saveUploadedFile(file);
        return { url, alt: null, position: index + 1, suiteId };
      }),
    );

    await db.insert(image).values(galleryInserts);
  }
}

export async function createSuite(
  formData: FormData,
): Promise<ActionError> {
  const session = await requireManager();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    capacity: formData.get("capacity"),
    area: formData.get("area"),
    establishmentId: formData.get("establishmentId"),
  };

  const parsed = suiteSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const [managerEstablishment] = await db
    .select({ id: establishment.id })
    .from(establishment)
    .where(
      and(
        eq(establishment.id, parsed.data.establishmentId),
        eq(establishment.managerId, session.user.id),
        isNull(establishment.deletedAt),
      ),
    )
    .limit(1);

  if (!managerEstablishment) {
    return {
      success: false,
      errors: { _form: ["Cet établissement ne vous appartient pas"] },
    };
  }

  const mainImageFile = formData.get("mainImage");

  if (!(mainImageFile instanceof File) || mainImageFile.size === 0) {
    return {
      success: false,
      errors: { mainImage: ["L'image principale est obligatoire"] },
    };
  }

  const mainImageError = validateImageFile(mainImageFile, "mainImage");
  if (mainImageError) return mainImageError;

  const galleryFiles = formData
    .getAll("galleryImages")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  for (const file of galleryFiles) {
    const galleryError = validateImageFile(file, "galleryImages");
    if (galleryError) return galleryError;
  }

  try {
    const mainImageUrl = await saveUploadedFile(mainImageFile);
    await insertSuiteWithGallery(
      parsed.data,
      managerEstablishment.id,
      mainImageUrl,
      galleryFiles,
    );
  } catch (error: unknown) {
    console.error("Failed to create suite:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la création"] },
    };
  }

  redirect("/manager/suites");
}
