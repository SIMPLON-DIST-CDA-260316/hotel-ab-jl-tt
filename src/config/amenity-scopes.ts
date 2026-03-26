export const AMENITY_SCOPES = {
  PROPERTY: "property",
  ROOM: "room",
  BOTH: "both",
} as const;

export type AmenityScope = (typeof AMENITY_SCOPES)[keyof typeof AMENITY_SCOPES];

export const ESTABLISHMENT_ELIGIBLE_SCOPES: AmenityScope[] = [
  AMENITY_SCOPES.PROPERTY,
  AMENITY_SCOPES.BOTH,
];