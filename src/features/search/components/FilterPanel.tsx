"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { FilterOptions } from "@/features/search/types/search.types"
import { FilterSection } from "@/features/search/components/FilterSection"
import { LocationFilter } from "@/features/search/components/LocationFilter"
import { PriceRangeFilter } from "@/features/search/components/PriceRangeFilter"
import { AccessibilityFilter } from "@/features/search/components/AccessibilityFilter"

interface FilterPanelProps {
  filterOptions: FilterOptions
}

export function FilterPanel({
  filterOptions,
}: FilterPanelProps): React.JSX.Element {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedCities = searchParams.getAll("locations")
  const selectedAccessibilityIds = searchParams.getAll("accessibility")

  const priceMinParam = searchParams.get("priceMin")
  const priceMaxParam = searchParams.get("priceMax")
  const currentPriceMin = priceMinParam
    ? Number(priceMinParam)
    : filterOptions.priceRange.min
  const currentPriceMax = priceMaxParam
    ? Number(priceMaxParam)
    : filterOptions.priceRange.max

  function updateParams(updates: Record<string, string | string[]>): void {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(updates)) {
      params.delete(key)
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, item))
      } else if (value !== "") {
        params.set(key, value)
      }
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  function handleLocationsChange(cities: string[]): void {
    updateParams({ locations: cities })
  }

  function handlePriceRangeChange(priceRange: [number, number]): void {
    const [newMin, newMax] = priceRange
    updateParams({
      priceMin: String(newMin),
      priceMax: String(newMax),
    })
  }

  function handleAccessibilityChange(amenityIds: string[]): void {
    updateParams({ accessibility: amenityIds })
  }

  return (
    <div className="flex flex-col divide-y">
      <FilterSection title="Localisation">
        <LocationFilter
          cities={filterOptions.cities}
          selectedCities={selectedCities}
          onChange={handleLocationsChange}
        />
      </FilterSection>

      <FilterSection title="Prix par nuit">
        <PriceRangeFilter
          min={filterOptions.priceRange.min}
          max={filterOptions.priceRange.max}
          value={[currentPriceMin, currentPriceMax]}
          onChange={handlePriceRangeChange}
        />
      </FilterSection>

      <FilterSection title="Accessibilité">
        <AccessibilityFilter
          amenities={filterOptions.accessibilityAmenities}
          selectedIds={selectedAccessibilityIds}
          onChange={handleAccessibilityChange}
        />
      </FilterSection>
    </div>
  )
}
