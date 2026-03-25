"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPendingBooking } from "../actions/create-pending-booking";
import type {
  BookingActionResult,
  AvailabilityResult,
} from "../types/booking.types";

type BookingFormProps = {
  suiteId: string;
  suiteTitle: string;
  establishmentName: string;
  pricePerNight: number;
  capacity: number;
};

export function BookingForm({
  suiteId,
  suiteTitle,
  establishmentName,
  pricePerNight,
  capacity,
}: BookingFormProps) {
  const router = useRouter();
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      _prev: BookingActionResult | null,
      formData: FormData,
    ): Promise<BookingActionResult | null> => {
      formData.set("suiteId", suiteId);
      const actionResult = await createPendingBooking(formData);
      if (actionResult.success) {
        router.push(`/bookings/${actionResult.bookingId}/checkout`);
        return null;
      }
      return actionResult;
    },
    null,
  );

  async function handleCheckAvailability(formData: FormData) {
    setIsChecking(true);
    try {
      const checkIn = formData.get("checkIn") as string;
      const checkOut = formData.get("checkOut") as string;

      if (!checkIn || !checkOut) {
        setAvailability(null);
        return;
      }

      const response = await fetch(
        `/api/bookings/availability?suiteId=${suiteId}&checkIn=${checkIn}&checkOut=${checkOut}`,
      );

      if (!response.ok) {
        setAvailability(null);
        return;
      }

      const availabilityData: AvailabilityResult = await response.json();
      setAvailability(availabilityData);
    } finally {
      setIsChecking(false);
    }
  }

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réserver {suiteTitle}</CardTitle>
        <CardDescription>
          {establishmentName} —{" "}
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
          }).format(pricePerNight)}{" "}
          / nuit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <input type="hidden" name="suiteId" value={suiteId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="checkIn">Date d&apos;arrivée *</Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="date"
                min={todayISO}
                required
                onChange={() => setAvailability(null)}
                aria-describedby={
                  state?.success === false && state.errors?.checkIn
                    ? "checkIn-error"
                    : undefined
                }
              />
              {state?.success === false && state.errors?.checkIn && (
                <p id="checkIn-error" className="text-sm text-destructive">
                  {state.errors.checkIn[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="checkOut">Date de départ *</Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="date"
                min={todayISO}
                required
                onChange={() => setAvailability(null)}
                aria-describedby={
                  state?.success === false && state.errors?.checkOut
                    ? "checkOut-error"
                    : undefined
                }
              />
              {state?.success === false && state.errors?.checkOut && (
                <p id="checkOut-error" className="text-sm text-destructive">
                  {state.errors.checkOut[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="guestCount">Nombre de voyageurs *</Label>
            <Input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              max={capacity}
              defaultValue={1}
              required
              aria-describedby={
                state?.success === false && state.errors?.guestCount
                  ? "guestCount-error"
                  : undefined
              }
            />
            <p className="text-sm text-muted-foreground">
              Capacité maximale : {capacity}
            </p>
            {state?.success === false && state.errors?.guestCount && (
              <p id="guestCount-error" className="text-sm text-destructive">
                {state.errors.guestCount[0]}
              </p>
            )}
          </div>

          {state?.success === false && state.errors?._form && (
            <p className="text-sm text-destructive">
              {state.errors._form[0]}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="outline"
              disabled={isChecking}
              formAction={handleCheckAvailability}
            >
              {isChecking ? "Vérification..." : "Vérifier la disponibilité"}
            </Button>

            {availability?.available && (
              <Button type="submit" disabled={isPending} formAction={formAction}>
                {isPending ? "Réservation..." : "Réserver"}
              </Button>
            )}
          </div>

          {availability && (
            <div
              className={`rounded-lg border p-4 ${availability.available ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"}`}
            >
              {availability.available ? (
                <>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Suite disponible !
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {availability.nightCount} nuit(s) ×{" "}
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(availability.pricePerNight)}{" "}
                    ={" "}
                    <strong>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(availability.totalPrice)}
                    </strong>
                  </p>
                </>
              ) : (
                <p className="font-medium text-red-800 dark:text-red-200">
                  Suite non disponible sur ces dates.
                </p>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
