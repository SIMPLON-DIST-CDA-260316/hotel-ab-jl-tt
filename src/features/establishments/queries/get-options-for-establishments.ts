import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { option, establishmentOption } from "@/lib/db/schema/domain";

export type EstablishmentOptionAvailable = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  defaultPrice: string;
};

export type EstablishmentOptionConfig = {
  optionId: string;
  price: string;
  included: boolean;
};

export async function getAllOptions(): Promise<EstablishmentOptionAvailable[]> {
  return db
    .select({
      id: option.id,
      name: option.name,
      description: option.description,
      icon: option.icon,
      defaultPrice: option.defaultPrice,
    })
    .from(option);
}

export async function getEstablishmentOptions(
  establishmentId: string,
): Promise<EstablishmentOptionConfig[]> {
  const rows = await db
    .select({
      optionId: establishmentOption.optionId,
      price: establishmentOption.price,
      included: establishmentOption.included,
    })
    .from(establishmentOption)
    .where(eq(establishmentOption.establishmentId, establishmentId));

  return rows;
}
