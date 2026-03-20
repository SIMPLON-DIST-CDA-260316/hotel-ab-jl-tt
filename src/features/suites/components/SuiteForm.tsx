"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ActionError } from "../types/action.types";

const MAX_TOTAL_IMAGES_SIZE_BYTES = 4 * 1024 * 1024;

type Establishment = { id: string; name: string };

type FormState = ActionError | null;

interface SuiteFormDefaultValues {
  title?: string;
  description?: string | null;
  price?: string;
  capacity?: number;
  area?: string | null;
  mainImageUrl?: string;
  establishmentId?: string;
}

interface SuiteFormProps {
  action: (formData: FormData) => Promise<FormState>;
  establishments?: Establishment[];
  defaultValues?: SuiteFormDefaultValues;
  submitLabel?: string;
}

export function SuiteForm({
  action,
  establishments = [],
  defaultValues,
  submitLabel,
}: SuiteFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: FormState, formData: FormData) => action(formData),
    null,
  );

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [totalSizeError, setTotalSizeError] = useState<string | null>(null);

  function checkTotalSize() {
    const mainSize = mainImageRef.current?.files?.[0]?.size ?? 0;
    const gallerySize = Array.from(galleryRef.current?.files ?? []).reduce(
      (sum, file) => sum + file.size,
      0,
    );
    if (mainSize + gallerySize > MAX_TOTAL_IMAGES_SIZE_BYTES) {
      setTotalSizeError("Le total des images ne doit pas dépasser 4 Mo");
    } else {
      setTotalSizeError(null);
    }
  }

  const isEditMode = defaultValues !== undefined;
  const defaultEstablishmentId =
    defaultValues?.establishmentId ??
    (establishments.length === 1 ? establishments[0].id : undefined);

  const resolvedSubmitLabel =
    submitLabel ?? (isEditMode ? "Enregistrer les modifications" : "Créer la suite");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Modifier la suite" : "Nouvelle suite"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          encType="multipart/form-data"
          className="space-y-4"
        >
          {!isEditMode && establishments.length > 1 && (
            <div>
              <Label htmlFor="establishmentId">Établissement *</Label>
              <Select
                name="establishmentId"
                required
                defaultValue={defaultEstablishmentId}
              >
                <SelectTrigger
                  id="establishmentId"
                  aria-describedby={
                    state?.errors?.establishmentId
                      ? "establishmentId-error"
                      : undefined
                  }
                >
                  <SelectValue placeholder="Choisir un établissement" />
                </SelectTrigger>
                <SelectContent>
                  {establishments.map((est) => (
                    <SelectItem key={est.id} value={est.id}>
                      {est.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state?.errors?.establishmentId && (
                <p
                  id="establishmentId-error"
                  className="text-sm text-destructive"
                >
                  {state.errors.establishmentId[0]}
                </p>
              )}
            </div>
          )}

          {defaultEstablishmentId && (
            <input
              type="hidden"
              name="establishmentId"
              value={defaultEstablishmentId}
            />
          )}

          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={defaultValues?.title ?? ""}
              aria-describedby={
                state?.errors?.title ? "title-error" : undefined
              }
            />
            {state?.errors?.title && (
              <p id="title-error" className="text-sm text-destructive">
                {state.errors.title[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={defaultValues?.description ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">Prix / nuit (€) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={defaultValues?.price ?? ""}
                aria-describedby={
                  state?.errors?.price ? "price-error" : undefined
                }
              />
              {state?.errors?.price && (
                <p id="price-error" className="text-sm text-destructive">
                  {state.errors.price[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="capacity">Capacité *</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                step="1"
                required
                defaultValue={defaultValues?.capacity ?? ""}
                aria-describedby={
                  state?.errors?.capacity ? "capacity-error" : undefined
                }
              />
              {state?.errors?.capacity && (
                <p id="capacity-error" className="text-sm text-destructive">
                  {state.errors.capacity[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="area">Superficie (m²)</Label>
              <Input
                id="area"
                name="area"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={defaultValues?.area ?? ""}
                aria-describedby={
                  state?.errors?.area ? "area-error" : undefined
                }
              />
              {state?.errors?.area && (
                <p id="area-error" className="text-sm text-destructive">
                  {state.errors.area[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="mainImage">
              Image principale {isEditMode ? "(laisser vide pour conserver)" : "*"}
            </Label>
            {isEditMode && defaultValues?.mainImageUrl && (
              <div className="mb-2">
                <Image
                  src={defaultValues.mainImageUrl}
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
              aria-describedby={
                state?.errors?.mainImage ? "mainImage-error" : undefined
              }
            />
            {state?.errors?.mainImage && (
              <p id="mainImage-error" className="text-sm text-destructive">
                {state.errors.mainImage[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="galleryImages">
              {isEditMode ? "Ajouter des images à la galerie" : "Galerie d'images"}
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
                  state?.errors?.galleryImages ? "galleryImages-error" : null,
                  totalSizeError ? "total-size-error" : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Formats acceptés : jpg, png, webp — 4 Mo max au total
            </p>
            {state?.errors?.galleryImages && (
              <p id="galleryImages-error" className="text-sm text-destructive">
                {state.errors.galleryImages[0]}
              </p>
            )}
            {totalSizeError && (
              <p id="total-size-error" role="alert" className="text-sm text-destructive">
                {totalSizeError}
              </p>
            )}
          </div>

          {state?.errors?._form && (
            <p role="alert" className="text-sm text-destructive">
              {state.errors._form[0]}
            </p>
          )}

          <Button type="submit" disabled={isPending || totalSizeError !== null}>
            {isPending ? "En cours..." : resolvedSubmitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
