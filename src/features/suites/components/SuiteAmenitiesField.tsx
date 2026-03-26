"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SuiteAmenityOption } from "../queries/get-amenities-for-suite";

interface SuiteAmenitiesFieldProps {
  availableAmenities: SuiteAmenityOption[];
  inheritedAmenityIds: string[];
  selectedAmenityIds?: string[];
}

export function SuiteAmenitiesField({
  availableAmenities,
  inheritedAmenityIds,
  selectedAmenityIds,
}: SuiteAmenitiesFieldProps) {
  if (availableAmenities.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Aménités</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {availableAmenities.map((amenityItem) => {
          const isInherited = inheritedAmenityIds.includes(amenityItem.id);
          const isChecked =
            isInherited ||
            (selectedAmenityIds?.includes(amenityItem.id) ?? false);
          return (
            <div key={amenityItem.id} className="flex items-center gap-2">
              <Checkbox
                id={`amenity-${amenityItem.id}`}
                name="amenityIds"
                value={amenityItem.id}
                defaultChecked={isChecked}
                disabled={isInherited}
                aria-label={
                  isInherited
                    ? `${amenityItem.name} (hérité de l'établissement)`
                    : undefined
                }
              />
              <Label
                htmlFor={`amenity-${amenityItem.id}`}
                className={
                  isInherited ? "font-normal text-muted-foreground" : "font-normal"
                }
              >
                {amenityItem.name}
                {isInherited && (
                  <span className="ml-1 text-xs">(établissement)</span>
                )}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
