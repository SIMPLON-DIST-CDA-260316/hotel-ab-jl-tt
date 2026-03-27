import { Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SuiteAmenity } from "../queries/get-suite-with-details";

type SuiteAmenitiesProps = {
  amenities: SuiteAmenity[];
};

export function SuiteAmenities({ amenities }: SuiteAmenitiesProps) {
  if (amenities.length === 0) return null;

  return (
    <section className="mb-10 border-b border-border pb-10" aria-labelledby="amenities-heading">
      <h2 id="amenities-heading" className="mb-6 text-2xl font-semibold text-foreground">
        Équipements
      </h2>
      <ul className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {amenities.map((item) => (
          <li key={item.id} className="flex items-center gap-3 text-sm font-light text-muted-foreground">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
              {item.icon ? (
                <span aria-hidden className="text-base">{item.icon}</span>
              ) : (
                <Circle className="size-4" aria-hidden />
              )}
            </span>
            {item.name}
          </li>
        ))}
      </ul>
      <Button variant="outline" className="rounded-xl">
        Voir tous les équipements ({amenities.length})
      </Button>
    </section>
  );
}
