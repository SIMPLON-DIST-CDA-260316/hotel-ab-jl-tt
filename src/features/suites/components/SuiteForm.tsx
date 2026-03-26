"use client";

import { useActionState, useState } from "react";

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
import { SuiteAmenitiesField } from "./SuiteAmenitiesField";
import { SuiteImageFields } from "./SuiteImageFields";
import type { ActionError } from "../types/action.types";
import type { SuiteAmenityOption } from "../queries/get-amenities-for-suite";

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
  selectedAmenityIds?: string[];
}

interface SuiteFormProps {
  action: (formData: FormData) => Promise<FormState>;
  establishments?: Establishment[];
  defaultValues?: SuiteFormDefaultValues;
  availableAmenities?: SuiteAmenityOption[];
  inheritedAmenityIds?: string[];
  submitLabel?: string;
}

export function SuiteForm({
  action,
  establishments = [],
  defaultValues,
  availableAmenities = [],
  inheritedAmenityIds = [],
  submitLabel,
}: SuiteFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: FormState, formData: FormData) => action(formData),
    null,
  );

  const [hasSizeError, setHasSizeError] = useState(false);

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

          <SuiteImageFields
            isEditMode={isEditMode}
            mainImageUrl={defaultValues?.mainImageUrl}
            mainImageError={state?.errors?.mainImage?.[0]}
            galleryError={state?.errors?.galleryImages?.[0]}
            onSizeError={setHasSizeError}
          />

          <SuiteAmenitiesField
            availableAmenities={availableAmenities}
            inheritedAmenityIds={inheritedAmenityIds}
            selectedAmenityIds={defaultValues?.selectedAmenityIds}
          />

          {state?.errors?._form && (
            <p role="alert" className="text-sm text-destructive">
              {state.errors._form[0]}
            </p>
          )}

          <Button type="submit" disabled={isPending || hasSizeError}>
            {isPending ? "En cours..." : resolvedSubmitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
