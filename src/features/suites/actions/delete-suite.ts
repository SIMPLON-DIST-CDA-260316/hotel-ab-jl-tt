"use server";

import { unlink } from "fs/promises";
import { join } from "path";
import { db } from "@/lib/db";
import { suite, establishment, image } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireManager } from "@/features/auth/lib/auth-guards";
import { hasFutureBookingsForSuite } from "../queries/has-future-bookings-for-suite";

const UPLOAD_URL_PREFIX = "/uploads/suites/";

type DeleteSuiteResult =
  | { success: true; error?: undefined }
  | { success: false; error: string };

async function deleteUploadedFile(url: string): Promise<void> {
  if (!url.startsWith(UPLOAD_URL_PREFIX)) return;
  try {
    await unlink(join(process.cwd(), "public", url));
  } catch (error) {
    console.error(`Failed to delete uploaded file ${url}:`, error);
  }
}

export async function deleteSuite(id: string): Promise<DeleteSuiteResult> {
  const session = await requireManager();

  const [owned] = await db
    .select({ id: suite.id, mainImage: suite.mainImage })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(
      and(
        eq(suite.id, id),
        eq(establishment.managerId, session.user.id),
        isNull(suite.deletedAt),
        isNull(establishment.deletedAt),
      ),
    )
    .limit(1);

  if (!owned) {
    return {
      success: false as const,
      error: "Suite introuvable ou accès non autorisé.",
    };
  }

  const hasBookings = await hasFutureBookingsForSuite(id);

  if (hasBookings) {
    return {
      success: false as const,
      error:
        "Impossible de supprimer : des réservations futures existent pour cette suite.",
    };
  }

  const galleryImages = await db
    .select({ url: image.url })
    .from(image)
    .where(eq(image.suiteId, id));

  await db
    .update(suite)
    .set({ deletedAt: new Date() })
    .where(and(eq(suite.id, id), isNull(suite.deletedAt)));

  await deleteUploadedFile(owned.mainImage);
  await Promise.all(galleryImages.map((img) => deleteUploadedFile(img.url)));

  revalidatePath("/manager/suites");
  return { success: true as const };
}
