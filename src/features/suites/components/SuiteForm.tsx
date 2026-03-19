"use client";

import Image from "next/image";
import { useActionState } from "react";
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
import type { ActionResult } from "../types/action.types";

type Establishment = { id: string; name: string };

type FormState = ActionResult | null;

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
              <select
                id="establishmentId"
                name="establishmentId"
                required
                aria-describedby={
                  state?.errors?.establishmentId
                    ? "establishmentId-error"
                    : undefined
                }
                className="border-input bg-background text-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Choisir un établissement</option>
                {establishments.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name}
                  </option>
                ))}
              </select>
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
              id="mainImage"
              name="mainImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!isEditMode}
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
              id="galleryImages"
              name="galleryImages"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              aria-describedby={
                state?.errors?.galleryImages ? "galleryImages-error" : undefined
              }
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Formats acceptés : jpg, png, webp — 5 Mo max par fichier
            </p>
            {state?.errors?.galleryImages && (
              <p id="galleryImages-error" className="text-sm text-destructive">
                {state.errors.galleryImages[0]}
              </p>
            )}
          </div>

          {state?.errors?._form && (
            <p role="alert" className="text-sm text-destructive">
              {state.errors._form[0]}
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "En cours..." : resolvedSubmitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
