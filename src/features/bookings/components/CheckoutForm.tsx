"use client";

import { useActionState, useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MILLISECONDS_PER_DAY, currencyFormatter } from "@/lib/formatters";
import { createPendingBooking } from "../actions/create-pending-booking";
import { computeOptionQuantity } from "../lib/pricing-models";
import { CheckoutHeroSection } from "./CheckoutHeroSection";
import { CheckoutOptionsSection } from "./CheckoutOptionsSection";
import { CheckoutPricingSummary } from "./CheckoutPricingSummary";
import { PendingBookingAlert } from "./PendingBookingAlert";
import type { BookingActionResult } from "../types/booking.types";
import type { SelectedOption } from "../types/booking.types";
import type { EstablishmentOption } from "../queries/get-establishment-options";

type CheckoutFormProps = {
  suiteId: string;
  suiteTitle: string;
  suiteImage: string | null;
  establishmentName: string;
  pricePerNight: number;
  capacity: number;
  options: EstablishmentOption[];
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuestCount: number;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "long",
});

export function CheckoutForm({
  suiteId,
  suiteTitle,
  suiteImage,
  establishmentName,
  pricePerNight,
  capacity,
  options,
  initialCheckIn,
  initialCheckOut,
  initialGuestCount,
}: CheckoutFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [shouldReplace, setShouldReplace] = useState(false);
  const [pendingAlert, setPendingAlert] = useState<{
    suiteName: string;
    reference: string;
  } | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>(
    () =>
      options
        .filter((establishmentOption) => establishmentOption.included)
        .map((establishmentOption) => ({
          optionId: establishmentOption.optionId,
          quantity: 1,
        })),
  );

  const todayISO = new Date().toISOString().split("T")[0];

  const nightCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) return 0;
    return Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / MILLISECONDS_PER_DAY,
    );
  }, [checkIn, checkOut]);

  const accommodationTotal = nightCount * pricePerNight;

  const optionsTotal = useMemo(() => {
    return selectedOptions.reduce((total, selectedOption) => {
      const optionDef = options.find(
        (establishmentOption) =>
          establishmentOption.optionId === selectedOption.optionId,
      );
      if (!optionDef) return total;

      const effectiveQuantity = computeOptionQuantity(
        optionDef.pricingModel,
        nightCount,
        guestCount,
        selectedOption.quantity,
      );
      return total + effectiveQuantity * Number(optionDef.price);
    }, 0);
  }, [selectedOptions, options, nightCount, guestCount]);

  const grandTotal = accommodationTotal + optionsTotal;
  const hasDates = nightCount > 0;

  function toggleOption(optionId: string) {
    setSelectedOptions((previous) => {
      const exists = previous.find(
        (selectedOption) => selectedOption.optionId === optionId,
      );
      if (exists) {
        return previous.filter(
          (selectedOption) => selectedOption.optionId !== optionId,
        );
      }
      return [...previous, { optionId, quantity: 1 }];
    });
  }

  function updateOptionQuantity(optionId: string, quantity: number) {
    setSelectedOptions((previous) =>
      previous.map((selectedOption) =>
        selectedOption.optionId === optionId
          ? { ...selectedOption, quantity: Math.max(1, quantity) }
          : selectedOption,
      ),
    );
  }

  const [state, formAction, isPending] = useActionState(
    async (
      _prev: BookingActionResult | null,
      formData: FormData,
    ): Promise<BookingActionResult | null> => {
      formData.set("suiteId", suiteId);
      formData.set("checkIn", checkIn);
      formData.set("checkOut", checkOut);
      formData.set("guestCount", String(guestCount));
      formData.set("options", JSON.stringify(selectedOptions));
      if (shouldReplace) {
        formData.set("confirmReplace", "true");
        setShouldReplace(false);
      }
      const actionResult = await createPendingBooking(formData);
      if (actionResult.success) {
        router.push(`/bookings/${actionResult.bookingId}/checkout`);
        return null;
      }
      if ("existingPending" in actionResult && actionResult.existingPending) {
        setPendingAlert({
          suiteName: actionResult.suiteName,
          reference: actionResult.reference,
        });
        return null;
      }
      return actionResult;
    },
    null,
  );

  useEffect(() => {
    if (shouldReplace && formRef.current) {
      formRef.current.requestSubmit();
    }
  }, [shouldReplace]);

  function handleConfirmReplace() {
    setPendingAlert(null);
    setShouldReplace(true);
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href={`/suites/${suiteId}`}>
          <ArrowLeft className="mr-1 size-4" />
          Retour à la suite
        </Link>
      </Button>

      <Card className="gap-0 overflow-hidden py-0">
        <CheckoutHeroSection
          suiteTitle={suiteTitle}
          suiteImage={suiteImage}
          establishmentName={establishmentName}
          pricePerNight={pricePerNight}
        />

        <CardContent className="space-y-6 p-6">
          <Separator />

          {/* Dates & guests */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="size-3.5 text-primary" aria-hidden />
              Séjour
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="checkout-checkIn">Arrivée</Label>
                <Input
                  id="checkout-checkIn"
                  type="date"
                  min={todayISO}
                  value={checkIn}
                  onChange={(event) => setCheckIn(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="checkout-checkOut">Départ</Label>
                <Input
                  id="checkout-checkOut"
                  type="date"
                  min={checkIn || todayISO}
                  value={checkOut}
                  onChange={(event) => setCheckOut(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="checkout-guestCount">Voyageurs</Label>
                <Input
                  id="checkout-guestCount"
                  type="number"
                  min={1}
                  max={capacity}
                  value={guestCount}
                  onChange={(event) =>
                    setGuestCount(Number(event.target.value))
                  }
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {capacity} max.
                </p>
              </div>
            </div>

            {hasDates && (
              <p className="text-sm text-muted-foreground">
                <span className="capitalize">
                  {dateFormatter.format(new Date(checkIn))}
                </span>{" "}
                →{" "}
                <span className="capitalize">
                  {dateFormatter.format(new Date(checkOut))}
                </span>{" "}
                · {nightCount} nuit{nightCount > 1 ? "s" : ""}
              </p>
            )}
          </section>

          <CheckoutOptionsSection
            options={options}
            selectedOptions={selectedOptions}
            nightCount={nightCount}
            guestCount={guestCount}
            hasDates={hasDates}
            onToggleOption={toggleOption}
            onUpdateQuantity={updateOptionQuantity}
          />

          <Separator />

          <CheckoutPricingSummary
            nightCount={nightCount}
            pricePerNight={pricePerNight}
            accommodationTotal={accommodationTotal}
            options={options}
            selectedOptions={selectedOptions}
            guestCount={guestCount}
            grandTotal={grandTotal}
          />

          {/* Errors */}
          {state?.success === false && "errors" in state && state.errors._form && (
            <p className="text-sm text-destructive">{state.errors._form[0]}</p>
          )}
          {state?.success === false && "errors" in state && state.errors.checkIn && (
            <p className="text-sm text-destructive">
              {state.errors.checkIn[0]}
            </p>
          )}
          {state?.success === false && "errors" in state && state.errors.checkOut && (
            <p className="text-sm text-destructive">
              {state.errors.checkOut[0]}
            </p>
          )}
          {state?.success === false && "errors" in state && state.errors.guestCount && (
            <p className="text-sm text-destructive">
              {state.errors.guestCount[0]}
            </p>
          )}

          {/* Submit */}
          <form ref={formRef}>
            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base font-semibold"
              disabled={!hasDates || isPending}
              formAction={formAction}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Réservation en cours...
                </>
              ) : (
                <>
                  Réserver
                  {hasDates &&
                    ` · ${currencyFormatter.format(grandTotal)}`}
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Vous ne serez pas débité maintenant. La réservation sera confirmée
            après validation.
          </p>
        </CardContent>
      </Card>

      <PendingBookingAlert
        open={pendingAlert !== null}
        suiteName={pendingAlert?.suiteName ?? ""}
        reference={pendingAlert?.reference ?? ""}
        onConfirm={handleConfirmReplace}
        onCancel={() => setPendingAlert(null)}
      />
    </div>
  );
}
