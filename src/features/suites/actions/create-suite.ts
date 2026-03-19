"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { suite, image, establishment } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
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

export async function createSuite(
  formData: FormData,
): Promise<ActionResult> {
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
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
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
    const suiteId = crypto.randomUUID();

    await db.insert(suite).values({
      id: suiteId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price.replace(",", "."),
      mainImage: mainImageUrl,
      capacity: parseInt(parsed.data.capacity),
      area: parsed.data.area ? parsed.data.area.replace(",", ".") : null,
      establishmentId: managerEstablishment.id,
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
  } catch (error) {
    console.error("Failed to create suite:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la création"] },
    };
  }

  redirect("/manager/suites");
}
