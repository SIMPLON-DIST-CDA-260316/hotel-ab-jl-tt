import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  amenity,
  establishmentAmenity,
  suiteAmenity,
} from "@/lib/db/schema/domain";
import { SUITE_ELIGIBLE_SCOPES } from "@/config/amenity-scopes";

export type SuiteAmenityOption = {
  id: string;
  name: string;
  category: string;
  icon: string | null;
};

export async function getAmenitiesForSuite(): Promise<SuiteAmenityOption[]> {
  return db
    .select({
      id: amenity.id,
      name: amenity.name,
      category: amenity.category,
      icon: amenity.icon,
    })
    .from(amenity)
    .where(inArray(amenity.scope, SUITE_ELIGIBLE_SCOPES));
}

export async function getSuiteAmenityIds(suiteId: string): Promise<string[]> {
  const rows = await db
    .select({ amenityId: suiteAmenity.amenityId })
    .from(suiteAmenity)
    .where(eq(suiteAmenity.suiteId, suiteId));

  return rows.map((row) => row.amenityId);
}

export async function getInheritedAmenityIds(
  establishmentId: string,
): Promise<string[]> {
  const rows = await db
    .select({ amenityId: establishmentAmenity.amenityId })
    .from(establishmentAmenity)
    .where(eq(establishmentAmenity.establishmentId, establishmentId));

  return rows.map((row) => row.amenityId);
}
