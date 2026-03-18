"use client";

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

type FieldErrors = Partial<Record<string, string[]>>;

type FormState = {
  success: false;
  errors: FieldErrors;
} | null;

type EstablishmentFormProps = {
  action: (formData: FormData) => Promise<FormState>;
  defaultValues?: {
    name?: string | null;
    city?: string | null;
    address?: string | null;
    postalCode?: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    checkInTime?: string | null;
    checkOutTime?: string | null;
  };
  submitLabel?: string;
};

export function EstablishmentForm({
  action,
  defaultValues,
  submitLabel = "Créer",
}: EstablishmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: FormState, formData: FormData) => action(formData),
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {defaultValues ? "Modifier l'établissement" : "Nouvel établissement"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              name="name"
              autoComplete="organization"
              defaultValue={defaultValues?.name ?? ""}
              aria-describedby={state?.errors?.name ? "name-error" : undefined}
              required
            />
            {state?.errors?.name && (
              <p id="name-error" className="text-sm text-destructive">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              name="address"
              autoComplete="street-address"
              defaultValue={defaultValues?.address ?? ""}
              aria-describedby={
                state?.errors?.address ? "address-error" : undefined
              }
              required
            />
            {state?.errors?.address && (
              <p id="address-error" className="text-sm text-destructive">
                {state.errors.address[0]}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                name="postalCode"
                autoComplete="postal-code"
                defaultValue={defaultValues?.postalCode ?? ""}
                aria-describedby={
                  state?.errors?.postalCode ? "postalCode-error" : undefined
                }
                required
              />
              {state?.errors?.postalCode && (
                <p id="postalCode-error" className="text-sm text-destructive">
                  {state.errors.postalCode[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                name="city"
                autoComplete="address-level2"
                defaultValue={defaultValues?.city ?? ""}
                aria-describedby={
                  state?.errors?.city ? "city-error" : undefined
                }
                required
              />
              {state?.errors?.city && (
                <p id="city-error" className="text-sm text-destructive">
                  {state.errors.city[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="checkInTime">Check-in *</Label>
              <Input
                id="checkInTime"
                name="checkInTime"
                type="time"
                defaultValue={defaultValues?.checkInTime ?? "15:00"}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">Check-out *</Label>
              <Input
                id="checkOutTime"
                name="checkOutTime"
                type="time"
                defaultValue={defaultValues?.checkOutTime ?? "11:00"}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={defaultValues?.phone ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={defaultValues?.email ?? ""}
              />
            </div>
          </div>

          {state?.errors?._form && (
            <p role="alert" className="text-sm text-destructive">
              {state.errors._form[0]}
            </p>
          )}

          <Button type="submit" disabled={isPending}>
            {isPending ? "En cours..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
