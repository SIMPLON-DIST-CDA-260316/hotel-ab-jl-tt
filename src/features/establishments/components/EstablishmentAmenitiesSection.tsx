import type { PublicEstablishmentAmenity } from "../queries/get-establishment-public-amenities";

type EstablishmentAmenitiesSectionProps = {
  amenities: PublicEstablishmentAmenity[];
};

export function EstablishmentAmenitiesSection({
  amenities,
}: EstablishmentAmenitiesSectionProps) {
  if (amenities.length === 0) return null;

  const byCategory = amenities.reduce<Record<string, PublicEstablishmentAmenity[]>>(
    (acc, item) => {
      const list = acc[item.category] ?? [];
      return { ...acc, [item.category]: [...list, item] };
    },
    {},
  );

  return (
    <section aria-labelledby="establishment-amenities-heading" className="mb-8">
      <h2
        id="establishment-amenities-heading"
        className="mb-4 text-lg font-semibold"
      >
        Équipements
      </h2>
      <div className="space-y-4">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <p className="mb-2 text-sm font-medium capitalize text-muted-foreground">
              {category}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-sm">
                  {item.icon && (
                    <span aria-hidden className="text-base">
                      {item.icon}
                    </span>
                  )}
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
