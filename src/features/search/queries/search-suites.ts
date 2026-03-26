import { db } from "@/lib/db";
import { suite, establishment } from "@/lib/db/schema/domain";
import { and, asc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import type { ValidatedSearchParams } from "@/features/search/lib/search-params-schema";
import type { SuiteSearchResult } from "@/features/search/types/search.types";

const MAX_RESULTS = 50;

function buildAccessibilityCondition(amenityIds: string[]) {
  // Each amenity must appear in suiteAmenity OR establishmentAmenity for the suite.
  // AND logic: all amenity IDs must match (one EXISTS subquery per amenity).
  return amenityIds.map((amenityId) =>
    or(
      sql`EXISTS (
        SELECT 1 FROM suite_amenity sa
        WHERE sa.suite_id = ${suite.id}
          AND sa.amenity_id = ${amenityId}
      )`,
      sql`EXISTS (
        SELECT 1 FROM establishment_amenity ea
        WHERE ea.establishment_id = ${suite.establishmentId}
          AND ea.amenity_id = ${amenityId}
      )`,
    ),
  );
}

export async function searchSuites(
  params: ValidatedSearchParams,
): Promise<SuiteSearchResult[]> {
  const { locations, priceMin, priceMax, guests, accessibility } = params;

  const conditions = [
    isNull(suite.deletedAt),
    isNull(establishment.deletedAt),
  ];

  if (locations && locations.length > 0) {
    // Match any of the selected cities (case-insensitive)
    const cityConditions = locations.map((city) =>
      ilike(establishment.city, `%${city}%`),
    );
    conditions.push(or(...cityConditions)!);
  }

  if (priceMin !== undefined) {
    conditions.push(gte(sql`CAST(${suite.price} AS numeric)`, priceMin));
  }

  if (priceMax !== undefined) {
    conditions.push(lte(sql`CAST(${suite.price} AS numeric)`, priceMax));
  }

  if (guests !== undefined) {
    conditions.push(gte(suite.capacity, guests));
  }

  if (accessibility && accessibility.length > 0) {
    const accessibilityConditions = buildAccessibilityCondition(accessibility);
    conditions.push(...accessibilityConditions);
  }

  const matchingSuites = await db
    .select({
      id: suite.id,
      title: suite.title,
      description: suite.description,
      price: suite.price,
      capacity: suite.capacity,
      mainImage: suite.mainImage,
      establishmentName: establishment.name,
      city: establishment.city,
    })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(and(...conditions))
    .orderBy(asc(sql`CAST(${suite.price} AS numeric)`))
    .limit(MAX_RESULTS);

  return matchingSuites;
}
