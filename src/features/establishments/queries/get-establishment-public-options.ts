import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { option, establishmentOption } from "@/lib/db/schema/domain";

export type PublicEstablishmentOption = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  price: string;
  included: boolean;
};

export async function getEstablishmentPublicOptions(
  establishmentId: string,
): Promise<PublicEstablishmentOption[]> {
  return db
    .select({
      id: option.id,
      name: option.name,
      description: option.description,
      icon: option.icon,
      price: establishmentOption.price,
      included: establishmentOption.included,
    })
    .from(establishmentOption)
    .innerJoin(option, eq(establishmentOption.optionId, option.id))
    .where(eq(establishmentOption.establishmentId, establishmentId));
}
