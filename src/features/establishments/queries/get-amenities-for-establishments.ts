import { eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { amenity, establishmentAmenity } from "@/lib/db/schema/domain";
import { ESTABLISHMENT_ELIGIBLE_SCOPES } from "@/config/amenity-scopes";

export type EstablishmentAmenity = {
  id: string;
  name: string;
  category: string;
  icon: string | null;
};

export async function getAmenitiesForEstablishments(): Promise<
  EstablishmentAmenity[]
> {
  return db
    .select({
      id: amenity.id,
      name: amenity.name,
      category: amenity.category,
      icon: amenity.icon,
    })
    .from(amenity)
    .where(inArray(amenity.scope, ESTABLISHMENT_ELIGIBLE_SCOPES));
}

export async function getEstablishmentAmenityIds(
  establishmentId: string,
): Promise<string[]> {
  const rows = await db
    .select({ amenityId: establishmentAmenity.amenityId })
    .from(establishmentAmenity)
    .where(eq(establishmentAmenity.establishmentId, establishmentId));

  return rows.map((row) => row.amenityId);
}
