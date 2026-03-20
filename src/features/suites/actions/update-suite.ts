"use server";

import { db } from "@/lib/db";
import { suite, establishment, image } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireManager } from "@/features/auth/lib/auth-guards";
import { suiteSchema } from "../lib/suite-schema";
import type { ActionError } from "../types/action.types";
import {
  saveUploadedFile,
  validateImageFile,
  deleteUploadedFile,
} from "../lib/image-upload";

async function applyUpdateWithGallery(
  suiteId: string,
  data: {
    title: string;
    description?: string;
    price: string;
    capacity: string;
    area?: string;
  },
  mainImageUrl: string,
  galleryFiles: File[],
): Promise<void> {
  await db
    .update(suite)
    .set({
      title: data.title,
      description: data.description || null,
      price: data.price.replace(",", "."),
      mainImage: mainImageUrl,
      capacity: Number(data.capacity),
      area: data.area ? data.area.replace(",", ".") : null,
    })
    .where(and(eq(suite.id, suiteId), isNull(suite.deletedAt)));

  if (galleryFiles.length > 0) {
    const existingImages = await db
      .select({ position: image.position })
      .from(image)
      .where(eq(image.suiteId, suiteId));

    const nextPosition =
      existingImages.length > 0
        ? Math.max(...existingImages.map((img) => img.position)) + 1
        : 1;

    const galleryInserts = await Promise.all(
      galleryFiles.map(async (file, index) => {
        const url = await saveUploadedFile(file);
        return { url, alt: null, position: nextPosition + index, suiteId };
      }),
    );

    await db.insert(image).values(galleryInserts);
  }
}

export async function updateSuite(
  suiteId: string,
  formData: FormData,
): Promise<ActionError> {
  const session = await requireManager();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    capacity: formData.get("capacity"),
    area: formData.get("area"),
    // establishmentId is fixed in edit mode — injected from hidden input
    establishmentId: formData.get("establishmentId"),
  };

  const parsed = suiteSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const [existingSuite] = await db
    .select({ id: suite.id, mainImage: suite.mainImage })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(
      and(
        eq(suite.id, suiteId),
        eq(establishment.managerId, session.user.id),
        isNull(suite.deletedAt),
        isNull(establishment.deletedAt),
      ),
    )
    .limit(1);

  if (!existingSuite) {
    return {
      success: false,
      errors: { _form: ["Suite introuvable ou accès non autorisé"] },
    };
  }

  const newMainImageFile = formData.get("mainImage");
  const hasNewMainImage =
    newMainImageFile instanceof File && newMainImageFile.size > 0;

  if (hasNewMainImage) {
    const imageError = validateImageFile(newMainImageFile, "mainImage");
    if (imageError) return imageError;
  }

  const galleryFiles = formData
    .getAll("galleryImages")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  for (const file of galleryFiles) {
    const galleryError = validateImageFile(file, "galleryImages");
    if (galleryError) return galleryError;
  }

  try {
    const mainImageUrl = hasNewMainImage
      ? await saveUploadedFile(newMainImageFile)
      : existingSuite.mainImage;

    if (hasNewMainImage) {
      await deleteUploadedFile(existingSuite.mainImage);
    }

    await applyUpdateWithGallery(suiteId, parsed.data, mainImageUrl, galleryFiles);
  } catch (error: unknown) {
    console.error("Failed to update suite:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la modification"] },
    };
  }

  redirect("/manager/suites");
}
