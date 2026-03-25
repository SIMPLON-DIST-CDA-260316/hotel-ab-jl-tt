import { db } from "@/lib/db";
import { suite, image, suiteAmenity, amenity, establishment } from "@/lib/db/schema/domain";
import { and, asc, eq, isNull } from "drizzle-orm";

export type SuiteImage = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
};

export type SuiteAmenity = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category: string;
};

export type SuiteWithDetails = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  mainImage: string;
  capacity: number;
  area: string | null;
  establishmentId: string;
  establishment: { id: string; name: string };
  images: SuiteImage[];
  amenities: SuiteAmenity[];
};

export async function getSuiteWithDetails(
  id: string,
): Promise<SuiteWithDetails | null> {
  const [suiteRow] = await db
    .select({
      id: suite.id,
      title: suite.title,
      description: suite.description,
      price: suite.price,
      mainImage: suite.mainImage,
      capacity: suite.capacity,
      area: suite.area,
      establishmentId: suite.establishmentId,
      establishmentName: establishment.name,
    })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(and(eq(suite.id, id), isNull(suite.deletedAt), isNull(establishment.deletedAt)))
    .limit(1);

  if (!suiteRow) return null;

  const [images, amenities] = await Promise.all([
    db
      .select({
        id: image.id,
        url: image.url,
        alt: image.alt,
        position: image.position,
      })
      .from(image)
      .where(eq(image.suiteId, id))
      .orderBy(asc(image.position)),
    db
      .select({
        id: amenity.id,
        name: amenity.name,
        slug: amenity.slug,
        icon: amenity.icon,
        category: amenity.category,
      })
      .from(suiteAmenity)
      .innerJoin(amenity, eq(suiteAmenity.amenityId, amenity.id))
      .where(eq(suiteAmenity.suiteId, id)),
  ]);

  return {
    id: suiteRow.id,
    title: suiteRow.title,
    description: suiteRow.description,
    price: suiteRow.price,
    mainImage: suiteRow.mainImage,
    capacity: suiteRow.capacity,
    area: suiteRow.area,
    establishmentId: suiteRow.establishmentId,
    establishment: { id: suiteRow.establishmentId, name: suiteRow.establishmentName },
    images,
    amenities,
  };
}
