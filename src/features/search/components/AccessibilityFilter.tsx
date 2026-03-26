"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface Amenity {
  id: string
  name: string
}

interface AccessibilityFilterProps {
  amenities: Amenity[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
}

export function AccessibilityFilter({
  amenities,
  selectedIds,
  onChange,
}: AccessibilityFilterProps): React.JSX.Element {
  function handleAmenityToggle(amenityId: string, checked: boolean): void {
    const updatedIds = checked
      ? [...selectedIds, amenityId]
      : selectedIds.filter((selectedId) => selectedId !== amenityId)
    onChange(updatedIds)
  }

  return (
    <div className="flex flex-col gap-3">
      {amenities.map((amenity) => (
        <label
          key={amenity.id}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Checkbox
            id={`amenity-${amenity.id}`}
            checked={selectedIds.includes(amenity.id)}
            onCheckedChange={(checked) =>
              handleAmenityToggle(amenity.id, checked === true)
            }
          />
          <span className="text-sm">{amenity.name}</span>
        </label>
      ))}
      <p className="text-xs text-muted-foreground mt-1">
        Autres options à venir
      </p>
    </div>
  )
}
