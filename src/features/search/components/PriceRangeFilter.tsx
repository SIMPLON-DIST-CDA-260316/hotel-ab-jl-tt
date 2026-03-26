"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"

interface PriceRangeFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
}: PriceRangeFilterProps): React.JSX.Element {
  function handleSliderChange(newValue: number[]): void {
    if (newValue.length === 2) {
      onChange([newValue[0], newValue[1]])
    }
  }

  const [currentMin, currentMax] = value

  return (
    <div className="flex flex-col gap-4">
      <Slider
        min={min}
        max={max}
        value={value}
        onValueChange={handleSliderChange}
        step={10}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{min} €</span>
        <span>{max} €</span>
      </div>
      <p className="text-sm text-center">
        {currentMin} € — {currentMax} €
      </p>
    </div>
  )
}
