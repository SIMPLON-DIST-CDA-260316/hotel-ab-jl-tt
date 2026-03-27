"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActionResult } from "@/types/action.types";
import { EstablishmentOptionsField } from "./EstablishmentOptionsField";
import type { EstablishmentAmenity } from "../queries/get-amenities-for-establishments";
import type {
  EstablishmentOptionAvailable,
  EstablishmentOptionConfig,
} from "../queries/get-options-for-establishments";

type FormState = ActionResult | null;

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
    amenityIds?: string[];
    optionConfigs?: EstablishmentOptionConfig[];
  };
  availableAmenities?: EstablishmentAmenity[];
  availableOptions?: EstablishmentOptionAvailable[];
  submitLabel?: string;
};

export function EstablishmentForm({
  action,
  defaultValues,
  availableAmenities = [],
  availableOptions = [],
  submitLabel = "Créer",
}: EstablishmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: FormState, formData: FormData) => action(formData),
    null,
  );

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [address, setAddress] = useState(defaultValues?.address ?? "");
  const [postalCode, setPostalCode] = useState(defaultValues?.postalCode ?? "");
  const [city, setCity] = useState(defaultValues?.city ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [phone, setPhone] = useState(defaultValues?.phone ?? "");
  const [emailValue, setEmailValue] = useState(defaultValues?.email ?? "");
  const [checkInTime, setCheckInTime] = useState(defaultValues?.checkInTime ?? "15:00");
  const [checkOutTime, setCheckOutTime] = useState(defaultValues?.checkOutTime ?? "11:00");

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
              value={name}
              onChange={(event) => setName(event.target.value)}
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
              value={address}
              onChange={(event) => setAddress(event.target.value)}
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
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
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
                value={city}
                onChange={(event) => setCity(event.target.value)}
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
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
                value={checkInTime}
                onChange={(event) => setCheckInTime(event.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">Check-out *</Label>
              <Input
                id="checkOutTime"
                name="checkOutTime"
                type="time"
                value={checkOutTime}
                onChange={(event) => setCheckOutTime(event.target.value)}
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
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={emailValue}
                onChange={(event) => setEmailValue(event.target.value)}
              />
            </div>
          </div>

          {availableAmenities.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Aménités</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableAmenities.map((amenityItem) => {
                  const isChecked =
                    defaultValues?.amenityIds?.includes(amenityItem.id) ??
                    false;
                  return (
                    <div
                      key={amenityItem.id}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={`amenity-${amenityItem.id}`}
                        name="amenityIds"
                        value={amenityItem.id}
                        defaultChecked={isChecked}
                      />
                      <Label
                        htmlFor={`amenity-${amenityItem.id}`}
                        className="font-normal"
                      >
                        {amenityItem.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <EstablishmentOptionsField
            availableOptions={availableOptions}
            defaultOptionConfigs={defaultValues?.optionConfigs}
          />

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
