"use server";

import { redirect } from "next/navigation";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { suite, establishment, image, suiteAmenity } from "@/lib/db/schema/domain";
import { requireManager } from "@/lib/auth-guards";
import { getInheritedAmenityIds } from "../queries/get-amenities-for-suite";

import { suiteSchema } from "../lib/suite-schema";
import {
  saveUploadedFile,
  validateImageFile,
  deleteUploadedFile,
} from "../lib/image-upload";

import type { ActionError } from "../types/action.types";


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
    amenityIds: formData.getAll("amenityIds"),
  };

  const parsed = suiteSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const [existingSuite] = await db
    .select({ id: suite.id, mainImage: suite.mainImage, establishmentId: suite.establishmentId })
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
    const inheritedIds = await getInheritedAmenityIds(existingSuite.establishmentId);
    const inheritedSet = new Set(inheritedIds);
    const extraAmenityIds = parsed.data.amenityIds.filter(
      (amenityId) => !inheritedSet.has(amenityId),
    );

    const mainImageUrl = hasNewMainImage
      ? await saveUploadedFile(newMainImageFile)
      : existingSuite.mainImage;

    if (hasNewMainImage) {
      await deleteUploadedFile(existingSuite.mainImage);
    }

    // Pre-save gallery files before the transaction — file IO cannot be rolled back
    const galleryInserts = galleryFiles.length > 0
      ? await (async () => {
          const existingImages = await db
            .select({ position: image.position })
            .from(image)
            .where(eq(image.suiteId, suiteId));

          const nextPosition =
            existingImages.length > 0
              ? Math.max(...existingImages.map((img) => img.position)) + 1
              : 1;

          return Promise.all(
            galleryFiles.map(async (file, index) => {
              const url = await saveUploadedFile(file);
              return { url, alt: null, position: nextPosition + index, suiteId };
            }),
          );
        })()
      : [];

    await db.transaction(async (tx) => {
      await tx
        .update(suite)
        .set({
          title: parsed.data.title,
          description: parsed.data.description || null,
          price: parsed.data.price.replace(",", "."),
          mainImage: mainImageUrl,
          capacity: Number(parsed.data.capacity),
          area: parsed.data.area ? parsed.data.area.replace(",", ".") : null,
        })
        .where(and(eq(suite.id, suiteId), isNull(suite.deletedAt)));

      if (galleryInserts.length > 0) {
        await tx.insert(image).values(galleryInserts);
      }

      // Replace suite-specific amenity links (inherited amenities are excluded)
      await tx.delete(suiteAmenity).where(eq(suiteAmenity.suiteId, suiteId));

      if (extraAmenityIds.length > 0) {
        await tx.insert(suiteAmenity).values(
          extraAmenityIds.map((amenityId) => ({ suiteId, amenityId })),
        );
      }
    });
  } catch (error: unknown) {
    console.error("Failed to update suite:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la modification"] },
    };
  }

  redirect("/manager/suites");
}
