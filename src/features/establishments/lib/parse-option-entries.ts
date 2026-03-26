type OptionEntry = {
  optionId: string;
  price: string;
  included: boolean;
};

/**
 * Extracts option configuration from FormData.
 * Expects: optionIds[], option_price_{id}, option_included_{id} (checkbox "on").
 * Only returns entries for selected option IDs with a valid positive price.
 */
export function parseOptionEntries(formData: FormData): OptionEntry[] {
  const selectedIds = formData.getAll("optionIds") as string[];

  return selectedIds.flatMap((optionId) => {
    const rawPrice = formData.get(`option_price_${optionId}`);
    const price = typeof rawPrice === "string" ? rawPrice.replace(",", ".") : "";
    const parsedPrice = parseFloat(price);

    if (!price || isNaN(parsedPrice) || parsedPrice < 0) return [];

    const included = formData.get(`option_included_${optionId}`) === "on";

    return [{ optionId, price: parsedPrice.toFixed(2), included }];
  });
}
