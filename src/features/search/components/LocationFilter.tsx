"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface LocationFilterProps {
  cities: string[]
  selectedCities: string[]
  onChange: (selectedCities: string[]) => void
}

export function LocationFilter({
  cities,
  selectedCities,
  onChange,
}: LocationFilterProps): React.JSX.Element {
  function handleCityToggle(city: string, checked: boolean): void {
    const updatedCities = checked
      ? [...selectedCities, city]
      : selectedCities.filter((selectedCity) => selectedCity !== city)
    onChange(updatedCities)
  }

  return (
    <div className="flex flex-col gap-3">
      {cities.map((city) => (
        <label key={city} className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            id={`city-${city}`}
            checked={selectedCities.includes(city)}
            onCheckedChange={(checked) =>
              handleCityToggle(city, checked === true)
            }
          />
          <span className="text-sm">{city}</span>
        </label>
      ))}
      <p className="text-xs text-muted-foreground mt-1">
        Autres départements à venir
      </p>
    </div>
  )
}
