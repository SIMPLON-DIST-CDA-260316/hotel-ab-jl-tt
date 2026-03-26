import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { currencyFormatter } from "@/lib/formatters";
import { computeOptionQuantity, formatPricingModel, PRICING_MODELS } from "../lib/pricing-models";
import type { EstablishmentOption } from "../queries/get-establishment-options";
import type { SelectedOption } from "../types/booking.types";

type CheckoutOptionsSectionProps = {
  options: EstablishmentOption[];
  selectedOptions: SelectedOption[];
  nightCount: number;
  guestCount: number;
  hasDates: boolean;
  onToggleOption: (optionId: string) => void;
  onUpdateQuantity: (optionId: string, quantity: number) => void;
};

export function CheckoutOptionsSection({
  options,
  selectedOptions,
  nightCount,
  guestCount,
  hasDates,
  onToggleOption,
  onUpdateQuantity,
}: CheckoutOptionsSectionProps) {
  const includedOptions = options.filter(
    (establishmentOption) => establishmentOption.included,
  );
  const selectableOptions = options.filter(
    (establishmentOption) => !establishmentOption.included,
  );

  if (options.length === 0) return null;

  return (
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
                  selectedOption.optionId === selectableOption.optionId,
              );
              const selectedEntry = selectedOptions.find(
                (selectedOption) =>
                  selectedOption.optionId === selectableOption.optionId,
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
                        onToggleOption(selectableOption.optionId)
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
                          onUpdateQuantity(
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
  );
}
