"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  EstablishmentOptionAvailable,
  EstablishmentOptionConfig,
} from "../queries/get-options-for-establishments";

interface EstablishmentOptionsFieldProps {
  availableOptions: EstablishmentOptionAvailable[];
  defaultOptionConfigs?: EstablishmentOptionConfig[];
}

export function EstablishmentOptionsField({
  availableOptions,
  defaultOptionConfigs,
}: EstablishmentOptionsFieldProps) {
  const initialEnabledOptions = new Set(
    defaultOptionConfigs?.map((config) => config.optionId) ?? [],
  );
  const [enabledOptionIds, setEnabledOptionIds] =
    useState<Set<string>>(initialEnabledOptions);

  function toggleOption(optionId: string, checked: boolean) {
    setEnabledOptionIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(optionId);
      } else {
        next.delete(optionId);
      }
      return next;
    });
  }

  if (availableOptions.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Options proposées</p>
      <div className="space-y-3">
        {availableOptions.map((optionItem) => {
          const existingConfig = defaultOptionConfigs?.find(
            (config) => config.optionId === optionItem.id,
          );
          const isEnabled = enabledOptionIds.has(optionItem.id);

          return (
            <div key={optionItem.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`option-${optionItem.id}`}
                  name="optionIds"
                  value={optionItem.id}
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    toggleOption(optionItem.id, checked === true)
                  }
                />
                <Label
                  htmlFor={`option-${optionItem.id}`}
                  className="font-normal"
                >
                  {optionItem.name}
                </Label>
              </div>

              {isEnabled && (
                <div className="ml-6 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label
                      htmlFor={`option_price_${optionItem.id}`}
                      className="text-xs"
                    >
                      Prix (€) *
                    </Label>
                    <Input
                      id={`option_price_${optionItem.id}`}
                      name={`option_price_${optionItem.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      defaultValue={
                        existingConfig?.price ?? optionItem.defaultPrice
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <Checkbox
                      id={`option_included_${optionItem.id}`}
                      name={`option_included_${optionItem.id}`}
                      defaultChecked={existingConfig?.included ?? false}
                    />
                    <Label
                      htmlFor={`option_included_${optionItem.id}`}
                      className="font-normal"
                    >
                      Incluse automatiquement
                    </Label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
