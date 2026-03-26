"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_TOTAL_IMAGES_SIZE_BYTES = 4 * 1024 * 1024;

interface SuiteImageFieldsProps {
  isEditMode: boolean;
  mainImageUrl?: string | null;
  mainImageError?: string;
  galleryError?: string;
  onSizeError: (hasError: boolean) => void;
}

export function SuiteImageFields({
  isEditMode,
  mainImageUrl,
  mainImageError,
  galleryError,
  onSizeError,
}: SuiteImageFieldsProps) {
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [totalSizeError, setTotalSizeError] = useState<string | null>(null);

  function checkTotalSize() {
    const mainSize = mainImageRef.current?.files?.[0]?.size ?? 0;
    const gallerySize = Array.from(galleryRef.current?.files ?? []).reduce(
      (sum, file) => sum + file.size,
      0,
    );
    const hasError = mainSize + gallerySize > MAX_TOTAL_IMAGES_SIZE_BYTES;
    setTotalSizeError(
      hasError ? "Le total des images ne doit pas dépasser 4 Mo" : null,
    );
    onSizeError(hasError);
  }

  return (
    <>
      <div>
        <Label htmlFor="mainImage">
          Image principale{" "}
          {isEditMode ? "(laisser vide pour conserver)" : "*"}
        </Label>
        {isEditMode && mainImageUrl && (
          <div className="mb-2">
            <Image
              src={mainImageUrl}
              alt="Image principale actuelle"
              width={160}
              height={100}
              className="h-24 w-40 rounded-md object-cover"
            />
          </div>
        )}
        <Input
          ref={mainImageRef}
          id="mainImage"
          name="mainImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!isEditMode}
          onChange={checkTotalSize}
          aria-describedby={mainImageError ? "mainImage-error" : undefined}
        />
        {mainImageError && (
          <p id="mainImage-error" className="text-sm text-destructive">
            {mainImageError}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="galleryImages">
          {isEditMode
            ? "Ajouter des images à la galerie"
            : "Galerie d'images"}
        </Label>
        <Input
          ref={galleryRef}
          id="galleryImages"
          name="galleryImages"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={checkTotalSize}
          aria-describedby={
            [
              galleryError ? "galleryImages-error" : null,
              totalSizeError ? "total-size-error" : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        <p className="text-muted-foreground mt-1 text-xs">
          Formats acceptés : jpg, png, webp — 4 Mo max au total
        </p>
        {galleryError && (
          <p id="galleryImages-error" className="text-sm text-destructive">
            {galleryError}
          </p>
        )}
        {totalSizeError && (
          <p
            id="total-size-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {totalSizeError}
          </p>
        )}
      </div>
    </>
  );
}
