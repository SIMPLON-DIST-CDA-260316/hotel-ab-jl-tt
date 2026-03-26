import { Separator } from "@/components/ui/separator";
import { currencyFormatter } from "@/lib/formatters";
import { computeOptionQuantity } from "../lib/pricing-models";
import type { EstablishmentOption } from "../queries/get-establishment-options";
import type { SelectedOption } from "../types/booking.types";

type CheckoutPricingSummaryProps = {
  nightCount: number;
  pricePerNight: number;
  accommodationTotal: number;
  options: EstablishmentOption[];
  selectedOptions: SelectedOption[];
  guestCount: number;
  grandTotal: number;
};

export function CheckoutPricingSummary({
  nightCount,
  pricePerNight,
  accommodationTotal,
  options,
  selectedOptions,
  guestCount,
  grandTotal,
}: CheckoutPricingSummaryProps) {
  const hasDates = nightCount > 0;

  return (
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
                  establishmentOption.optionId === selectedOption.optionId,
              );
              return optionDef && !optionDef.included;
            })
            .map((selectedOption) => {
              const optionDef = options.find(
                (establishmentOption) =>
                  establishmentOption.optionId === selectedOption.optionId,
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
  );
}
