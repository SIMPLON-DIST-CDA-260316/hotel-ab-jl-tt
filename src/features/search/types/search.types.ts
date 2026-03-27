export interface SearchParams {
  destination?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  locations?: string[]
  priceMin?: number
  priceMax?: number
  accessibility?: string[]
}

export interface SuiteSearchResult {
  id: string
  title: string
  description: string | null
  price: string // numeric → string from Drizzle, parse with Number() for display
  capacity: number
  mainImage: string
  establishmentName: string
  city: string
}

export interface FilterOptions {
  cities: string[]
  priceRange: { min: number; max: number }
  accessibilityAmenities: { id: string; name: string }[]
}
