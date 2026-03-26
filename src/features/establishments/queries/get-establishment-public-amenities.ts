import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { amenity, establishmentAmenity } from "@/lib/db/schema/domain";

export type PublicEstablishmentAmenity = {
  id: string;
  name: string;
  icon: string | null;
  category: string;
};

export async function getEstablishmentPublicAmenities(
  establishmentId: string,
): Promise<PublicEstablishmentAmenity[]> {
  return db
    .select({
      id: amenity.id,
      name: amenity.name,
      icon: amenity.icon,
      category: amenity.category,
    })
    .from(establishmentAmenity)
    .innerJoin(amenity, eq(establishmentAmenity.amenityId, amenity.id))
    .where(eq(establishmentAmenity.establishmentId, establishmentId));
}
