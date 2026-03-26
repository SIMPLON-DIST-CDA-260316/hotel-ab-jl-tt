import { db } from "@/lib/db";
import {
  suite,
  establishmentOption,
  option,
} from "@/lib/db/schema/domain";
import { eq } from "drizzle-orm";

export async function getEstablishmentOptionsBySuiteId(suiteId: string) {
  const availableOptions = await db
    .select({
      optionId: option.id,
      name: option.name,
      slug: option.slug,
      description: option.description,
      icon: option.icon,
      pricingModel: option.pricingModel,
      price: establishmentOption.price,
      included: establishmentOption.included,
    })
    .from(suite)
    .innerJoin(
      establishmentOption,
      eq(suite.establishmentId, establishmentOption.establishmentId),
    )
    .innerJoin(option, eq(establishmentOption.optionId, option.id))
    .where(eq(suite.id, suiteId));

  return availableOptions;
}

export type EstablishmentOption = Awaited<
  ReturnType<typeof getEstablishmentOptionsBySuiteId>
>[number];
