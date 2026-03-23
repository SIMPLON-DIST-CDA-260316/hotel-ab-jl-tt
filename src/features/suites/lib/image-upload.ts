import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import type { ActionError } from "../types/action.types";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const UPLOAD_URL_PREFIX = "/uploads/suites/";

// Extension derived from validated MIME type — never from user-supplied filename
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function saveUploadedFile(file: File): Promise<string> {
  const extension = MIME_TO_EXTENSION[file.type] ?? "jpg";
  const filename = `${crypto.randomUUID()}.${extension}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "suites");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);
  return `${UPLOAD_URL_PREFIX}${filename}`;
}

export function validateImageFile(
  file: File,
  fieldName: string,
): ActionError | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      errors: { [fieldName]: ["Format accepté : jpg, png, webp"] },
    };
  }
  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return {
      success: false,
      errors: { [fieldName]: ["Taille maximale : 5 Mo"] },
    };
  }
  return null;
}

export async function deleteUploadedFile(url: string): Promise<void> {
  if (!url.startsWith(UPLOAD_URL_PREFIX)) return;
  try {
    await unlink(join(process.cwd(), "public", url));
  } catch (error: unknown) {
    console.error(`Failed to delete uploaded file ${url}:`, error);
  }
}
