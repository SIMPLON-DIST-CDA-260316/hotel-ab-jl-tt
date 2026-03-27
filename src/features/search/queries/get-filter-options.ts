import { db } from "@/lib/db";
import { suite, establishment, amenity } from "@/lib/db/schema/domain";
import { asc, eq, inArray, isNull, min, max, sql } from "drizzle-orm";
import type { FilterOptions } from "@/features/search/types/search.types";

export async function getFilterOptions(): Promise<FilterOptions> {
  const [cities, priceStats, accessibilityAmenities] = await Promise.all([
    db
      .selectDistinct({ city: establishment.city })
      .from(establishment)
      .where(isNull(establishment.deletedAt))
      .orderBy(asc(establishment.city)),

    db
      .select({
        min: min(sql<string>`CAST(${suite.price} AS numeric)`),
        max: max(sql<string>`CAST(${suite.price} AS numeric)`),
      })
      .from(suite)
      .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
      .where(isNull(suite.deletedAt)),

    db
      .select({ id: amenity.id, name: amenity.name })
      .from(amenity)
      .where(inArray(amenity.scope, ["property", "both"]))
      .orderBy(asc(amenity.name)),
  ]);

  const rawMin = priceStats[0]?.min;
  const rawMax = priceStats[0]?.max;

  return {
    cities: cities.map(({ city }) => city),
    priceRange: {
      min: rawMin !== null && rawMin !== undefined ? Number(rawMin) : 0,
      max: rawMax !== null && rawMax !== undefined ? Number(rawMax) : 0,
    },
    accessibilityAmenities,
  };
}
