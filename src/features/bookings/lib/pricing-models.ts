export const PRICING_MODELS = {
  PER_PERSON_PER_NIGHT: "per_person_per_night",
  PER_PERSON_PER_STAY: "per_person_per_stay",
  PER_NIGHT: "per_night",
  PER_STAY: "per_stay",
  PER_UNIT: "per_unit",
} as const;

export type PricingModel = (typeof PRICING_MODELS)[keyof typeof PRICING_MODELS];

export function computeOptionQuantity(
  pricingModel: string,
  nightCount: number,
  guestCount: number,
  userQuantity: number,
): number {
  switch (pricingModel) {
  case PRICING_MODELS.PER_PERSON_PER_NIGHT:
    return guestCount * nightCount;
  case PRICING_MODELS.PER_PERSON_PER_STAY:
    return guestCount;
  case PRICING_MODELS.PER_NIGHT:
    return nightCount;
  case PRICING_MODELS.PER_STAY:
    return 1;
  case PRICING_MODELS.PER_UNIT:
    return userQuantity;
  default:
    return userQuantity;
  }
}

export function formatPricingModel(pricingModel: string): string {
  switch (pricingModel) {
  case PRICING_MODELS.PER_PERSON_PER_NIGHT:
    return "/ pers. / nuit";
  case PRICING_MODELS.PER_PERSON_PER_STAY:
    return "/ pers.";
  case PRICING_MODELS.PER_NIGHT:
    return "/ nuit";
  case PRICING_MODELS.PER_STAY:
    return "/ séjour";
  case PRICING_MODELS.PER_UNIT:
    return "/ unité";
  default:
    return "";
  }
}
