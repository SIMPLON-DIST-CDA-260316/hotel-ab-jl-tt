"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { suite, establishment, image } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireManager } from "@/features/auth/lib/auth-guards";
import { suiteSchema } from "../lib/suite-schema";
import type { ActionResult } from "../types/action.types";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

async function saveUploadedFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${crypto.randomUUID()}.${extension}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "suites");

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);

  return `/uploads/suites/${filename}`;
}

function validateImageFile(
  file: File,
  fieldName: string,
): ActionResult | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      errors: { [fieldName]: ["Format accepté : jpg, png, webp"] },
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      errors: { [fieldName]: ["Taille maximale : 5 Mo"] },
    };
  }
  return null;
}

export async function updateSuite(
  suiteId: string,
  formData: FormData,
): Promise<ActionResult> {
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
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
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

    await db
      .update(suite)
      .set({
        title: parsed.data.title,
        description: parsed.data.description || null,
        price: parsed.data.price.replace(",", "."),
        mainImage: mainImageUrl,
        capacity: parseInt(parsed.data.capacity),
        area: parsed.data.area ? parsed.data.area.replace(",", ".") : null,
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
  } catch (error) {
    console.error("Failed to update suite:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la modification"] },
    };
  }

  redirect("/manager/suites");
}
