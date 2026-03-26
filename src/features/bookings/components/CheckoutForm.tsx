"use client";

import { useActionState, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MILLISECONDS_PER_DAY } from "@/lib/formatters";
import { createPendingBooking } from "../actions/create-pending-booking";
import { computeOptionQuantity, formatPricingModel, PRICING_MODELS } from "../lib/pricing-models";
import type { BookingActionResult } from "../types/booking.types";
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

type SelectedOption = {
  optionId: string;
  quantity: number;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

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
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestCount, setGuestCount] = useState(initialGuestCount);
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
      const actionResult = await createPendingBooking(formData);
      if (actionResult.success) {
        router.push(`/bookings/${actionResult.bookingId}/checkout`);
        return null;
      }
      return actionResult;
    },
    null,
  );

  const hasImage = suiteImage && !suiteImage.includes("placeholder");
  const hasDates = nightCount > 0;

  const includedOptions = options.filter(
    (establishmentOption) => establishmentOption.included,
  );
  const selectableOptions = options.filter(
    (establishmentOption) => !establishmentOption.included,
  );

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
        {/* Hero recap */}
        <div className="relative">
          <AspectRatio ratio={16 / 5}>
            {hasImage ? (
              <Image
                src={suiteImage}
                alt={suiteTitle}
                fill
                className="object-cover"
                sizes="(min-width: 672px) 672px, 100vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-4xl font-bold text-primary/20">
                  {suiteTitle.charAt(0)}
                </span>
              </div>
            )}
          </AspectRatio>
        </div>

        <CardContent className="space-y-6 p-6">
          {/* Suite info */}
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">{suiteTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {establishmentName} ·{" "}
              {currencyFormatter.format(pricePerNight)} / nuit
            </p>
          </div>

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

          {/* Options */}
          {options.length > 0 && (
            <>
              <Separator />
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Options
                </h2>

                {/* Included options */}
                {includedOptions.length > 0 && (
                  <div className="space-y-2">
                    {includedOptions.map((includedOption) => (
                      <div
                        key={includedOption.optionId}
                        className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50/50 px-4 py-3 dark:border-green-800 dark:bg-green-950/30"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="size-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium">
                            {includedOption.name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300"
                        >
                          Inclus
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selectable options */}
                {selectableOptions.length > 0 && (
                  <div className="space-y-2">
                    {selectableOptions.map((selectableOption) => {
                      const isSelected = selectedOptions.some(
                        (selectedOption) =>
                          selectedOption.optionId ===
                          selectableOption.optionId,
                      );
                      const selectedEntry = selectedOptions.find(
                        (selectedOption) =>
                          selectedOption.optionId ===
                          selectableOption.optionId,
                      );
                      const isPerUnit =
                        selectableOption.pricingModel === PRICING_MODELS.PER_UNIT;
                      const effectiveQuantity = isSelected
                        ? computeOptionQuantity(
                          selectableOption.pricingModel,
                          nightCount,
                          guestCount,
                          selectedEntry?.quantity ?? 1,
                        )
                        : 0;
                      const lineTotal =
                        effectiveQuantity * Number(selectableOption.price);

                      return (
                        <div
                          key={selectableOption.optionId}
                          className={`rounded-lg border px-4 py-3 transition-colors ${
                            isSelected
                              ? "border-primary/30 bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              className="flex items-center gap-3 text-left"
                              onClick={() =>
                                toggleOption(selectableOption.optionId)
                              }
                            >
                              <div
                                className={`flex size-5 items-center justify-center rounded border transition-colors ${
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground/30"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="size-3" />
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-medium">
                                  {selectableOption.name}
                                </span>
                                {selectableOption.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {selectableOption.description}
                                  </p>
                                )}
                              </div>
                            </button>
                            <div className="text-right text-sm">
                              <span className="font-medium">
                                {currencyFormatter.format(
                                  Number(selectableOption.price),
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {" "}
                                {formatPricingModel(
                                  selectableOption.pricingModel,
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Quantity selector for per_unit */}
                          {isSelected && isPerUnit && (
                            <div className="mt-2 flex items-center gap-2 pl-8">
                              <Label
                                htmlFor={`qty-${selectableOption.optionId}`}
                                className="text-xs"
                              >
                                Quantité
                              </Label>
                              <Input
                                id={`qty-${selectableOption.optionId}`}
                                type="number"
                                min={1}
                                value={selectedEntry?.quantity ?? 1}
                                onChange={(event) =>
                                  updateOptionQuantity(
                                    selectableOption.optionId,
                                    Number(event.target.value),
                                  )
                                }
                                className="h-8 w-20 text-sm"
                              />
                            </div>
                          )}

                          {/* Line total */}
                          {isSelected && hasDates && lineTotal > 0 && (
                            <p className="mt-1 pl-8 text-xs text-muted-foreground">
                              Sous-total :{" "}
                              {currencyFormatter.format(lineTotal)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          <Separator />

          {/* Price breakdown */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Récapitulatif
            </h2>

            {hasDates ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {nightCount} nuit{nightCount > 1 ? "s" : ""} ×{" "}
                    {currencyFormatter.format(pricePerNight)}
                  </span>
                  <span className="font-medium">
                    {currencyFormatter.format(accommodationTotal)}
                  </span>
                </div>

                {selectedOptions
                  .filter((selectedOption) => {
                    const optionDef = options.find(
                      (establishmentOption) =>
                        establishmentOption.optionId ===
                        selectedOption.optionId,
                    );
                    return optionDef && !optionDef.included;
                  })
                  .map((selectedOption) => {
                    const optionDef = options.find(
                      (establishmentOption) =>
                        establishmentOption.optionId ===
                        selectedOption.optionId,
                    );
                    if (!optionDef) return null;
                    const effectiveQuantity = computeOptionQuantity(
                      optionDef.pricingModel,
                      nightCount,
                      guestCount,
                      selectedOption.quantity,
                    );
                    const lineTotal =
                      effectiveQuantity * Number(optionDef.price);

                    return (
                      <div
                        key={selectedOption.optionId}
                        className="flex justify-between"
                      >
                        <span className="text-muted-foreground">
                          {optionDef.name}
                        </span>
                        <span className="font-medium">
                          {currencyFormatter.format(lineTotal)}
                        </span>
                      </div>
                    );
                  })}

                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{currencyFormatter.format(grandTotal)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sélectionnez vos dates pour voir le récapitulatif.
              </p>
            )}
          </section>

          {/* Errors */}
          {state?.success === false && state.errors?._form && (
            <p className="text-sm text-destructive">{state.errors._form[0]}</p>
          )}
          {state?.success === false && state.errors?.checkIn && (
            <p className="text-sm text-destructive">
              {state.errors.checkIn[0]}
            </p>
          )}
          {state?.success === false && state.errors?.checkOut && (
            <p className="text-sm text-destructive">
              {state.errors.checkOut[0]}
            </p>
          )}
          {state?.success === false && state.errors?.guestCount && (
            <p className="text-sm text-destructive">
              {state.errors.guestCount[0]}
            </p>
          )}

          {/* Submit */}
          <form>
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
    </div>
  );
}
