import { z } from "zod/v4";

const searchParamsSchema = z.object({
  destination: z.string().optional(),
  checkIn: z.iso.date().optional(),
  checkOut: z.iso.date().optional(),
  guests: z.coerce.number().int().positive().optional(),
  locations: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().positive().optional(),
  accessibility: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional(),
});

export type ValidatedSearchParams = z.infer<typeof searchParamsSchema>;

export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
): ValidatedSearchParams {
  const result = searchParamsSchema.safeParse(raw);
  if (!result.success) {
    return {}; // invalid params → no filters (fail gracefully)
  }
  const { priceMin, priceMax, ...rest } = result.data;
  // Ignore price range if min > max — incoherent constraint
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
    return rest;
  }
  return result.data;
}
