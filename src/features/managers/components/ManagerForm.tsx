"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { ActionResult } from "@/types/action.types";

type FormState = ActionResult | null;

type Establishment = {
  id: string;
  name: string;
  city: string;
};

interface ManagerFormProps {
  action: (formData: FormData) => Promise<FormState>;
  establishments: Establishment[];
  defaultValues?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    establishmentId?: string | null;
  };
  showPassword?: boolean;
  submitLabel?: string;
}

export function ManagerForm({
  action,
  establishments,
  defaultValues,
  showPassword = true,
  submitLabel = "Créer",
}: ManagerFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: FormState, formData: FormData) => action(formData),
    null,
  );

  const isEditMode = defaultValues !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode ? "Modifier le gérant" : "Nouveau gérant"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                defaultValue={defaultValues?.firstName ?? ""}
                aria-describedby={
                  state?.errors?.firstName ? "firstName-error" : undefined
                }
                required
              />
              {state?.errors?.firstName && (
                <p id="firstName-error" className="text-sm text-destructive">
                  {state.errors.firstName[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                defaultValue={defaultValues?.lastName ?? ""}
                aria-describedby={
                  state?.errors?.lastName ? "lastName-error" : undefined
                }
                required
              />
              {state?.errors?.lastName && (
                <p id="lastName-error" className="text-sm text-destructive">
                  {state.errors.lastName[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaultValues?.email ?? ""}
              aria-describedby={
                state?.errors?.email ? "email-error" : undefined
              }
              required
            />
            {state?.errors?.email && (
              <p id="email-error" className="text-sm text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {showPassword && (
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-describedby={
                  state?.errors?.password
                    ? "password-error"
                    : "password-hint"
                }
                required
              />
              {state?.errors?.password ? (
                <p id="password-error" className="text-sm text-destructive">
                  {state.errors.password[0]}
                </p>
              ) : (
                <p id="password-hint" className="text-sm text-muted-foreground">
                  Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="establishmentId">Établissement</Label>
            <Select
              name="establishmentId"
              defaultValue={defaultValues?.establishmentId ?? ""}
            >
              <SelectTrigger
                id="establishmentId"
                aria-describedby={
                  state?.errors?.establishmentId
                    ? "establishmentId-error"
                    : undefined
                }
              >
                <SelectValue placeholder="Sélectionner un établissement" />
              </SelectTrigger>
              <SelectContent>
                {isEditMode && (
                  <SelectItem value="">Aucun</SelectItem>
                )}
                {establishments.map((establishment) => (
                  <SelectItem key={establishment.id} value={establishment.id}>
                    {establishment.name} — {establishment.city}
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
